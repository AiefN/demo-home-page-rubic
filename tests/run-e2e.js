#!/usr/bin/env node

/**
 * Rubicweb Redesign E2E Test Runner
 * Orchestrates local static HTTP server, headless browser CDP driver,
 * and executes the 4-tier E2E test suites per TEST_INFRA.md.
 */

const fs = require('fs');
const path = require('path');
const StaticServer = require('./helpers/static-server');
const BrowserDriver = require('./helpers/browser-driver');
const { runSuites, clearSuites } = require('./helpers/test-harness');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    tiers: [1, 2, 3, 4],
    filter: null,
    bail: false,
    json: false,
    browser: null
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.tiers = arg
        .slice(7)
        .split(',')
        .map((t) => parseInt(t.trim(), 10))
        .filter((n) => !isNaN(n));
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.slice(9).trim();
    } else if (arg === '--bail') {
      options.bail = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--browser=')) {
      options.browser = arg.slice(10).trim();
    }
  }

  return options;
}

function getTestFilesForTier(tierNum) {
  const tierDirs = {
    1: 'tier1-features',
    2: 'tier2-boundaries',
    3: 'tier3-combinations',
    4: 'tier4-scenarios'
  };

  const dirName = tierDirs[tierNum];
  if (!dirName) return [];

  const fullDir = path.join(__dirname, dirName);
  if (!fs.existsSync(fullDir)) return [];

  return fs
    .readdirSync(fullDir)
    .filter((f) => f.endsWith('.test.js'))
    .sort()
    .map((f) => path.join(fullDir, f));
}

async function main() {
  const options = parseArgs();
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  RUBICWEB REDESIGN — E2E TEST RUNNER              ${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.dim}Tiers selected: ${options.tiers.join(', ')} | Bail: ${options.bail}${options.filter ? ` | Filter: "${options.filter}"` : ''}${colors.reset}\n`);

  const server = new StaticServer({
    rootDir: path.resolve(__dirname, '..')
  });

  let serverInfo;
  try {
    serverInfo = await server.start();
    console.log(`${colors.green}✓${colors.reset} Static server listening at: ${colors.bold}${serverInfo.url}${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}✗ Failed to start static HTTP server:${colors.reset}`, err);
    process.exit(1);
  }

  let driver = null;
  try {
    driver = new BrowserDriver();
    await driver.launch();
    console.log(`${colors.green}✓${colors.reset} Headless browser launched (${driver.browserPath.split('\\').pop()})\n`);
  } catch (err) {
    console.error(`${colors.red}✗ Failed to launch headless browser:${colors.reset}`, err);
    await server.stop();
    process.exit(1);
  }

  const context = {
    server,
    driver,
    baseUrl: serverInfo.url
  };

  clearSuites();

  // Load test files according to selected tiers
  const tierFileMap = new Map();
  for (const tier of options.tiers) {
    const files = getTestFilesForTier(tier);
    tierFileMap.set(tier, files);
    for (const file of files) {
      try {
        require(file);
      } catch (loadErr) {
        console.error(`${colors.red}✗ Error loading test file ${file}:${colors.reset}`, loadErr);
      }
    }
  }

  let currentSuiteName = '';
  const runnerResults = await runSuites(context, {
    bail: options.bail,
    filter: options.filter,
    onSuiteStart: (suite) => {
      currentSuiteName = suite.name;
      console.log(`\n${colors.bold}${colors.magenta}▶ Suite: ${suite.name}${colors.reset}`);
    },
    onTestEnd: (testRes) => {
      const duration = `${testRes.durationMs}ms`;
      if (testRes.status === 'passed') {
        console.log(`  ${colors.green}✓${colors.reset} ${testRes.name} ${colors.dim}(${duration})${colors.reset}`);
      } else {
        console.log(`  ${colors.red}✗${colors.reset} ${testRes.name} ${colors.dim}(${duration})${colors.reset}`);
        if (testRes.error) {
          const lines = String(testRes.error).split('\n');
          for (const line of lines.slice(0, 5)) {
            console.log(`    ${colors.red}${line}${colors.reset}`);
          }
        }
      }
    }
  });

  // Summary Report
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}E2E TEST EXECUTION SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}`);
  console.log(`Total Suites : ${runnerResults.totalSuites}`);
  console.log(`Total Tests  : ${runnerResults.totalTests}`);
  console.log(`Passed       : ${colors.green}${runnerResults.passed}${colors.reset}`);
  console.log(`Failed       : ${runnerResults.failed > 0 ? colors.red : colors.dim}${runnerResults.failed}${colors.reset}`);
  console.log(`Duration     : ${(runnerResults.durationMs / 1000).toFixed(2)}s\n`);

  // Save report to tests/e2e-report.json
  const reportPath = path.join(__dirname, 'e2e-report.json');
  try {
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          options,
          summary: {
            totalSuites: runnerResults.totalSuites,
            totalTests: runnerResults.totalTests,
            passed: runnerResults.passed,
            failed: runnerResults.failed,
            durationMs: runnerResults.durationMs
          },
          suites: runnerResults.suites
        },
        null,
        2
      )
    );
    console.log(`${colors.dim}Detailed JSON report saved to: ${reportPath}${colors.reset}\n`);
  } catch (err) {
    console.error('Failed to write report JSON:', err);
  }

  // Graceful Teardown
  try {
    await driver.close();
    await server.stop();
  } catch (cleanupErr) {
    console.error('Teardown error:', cleanupErr);
  }

  if (runnerResults.failed > 0) {
    console.log(`${colors.red}${colors.bold}E2E RUN FAILED with ${runnerResults.failed} failing tests.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}E2E RUN PASSED: 100% test success!${colors.reset}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
