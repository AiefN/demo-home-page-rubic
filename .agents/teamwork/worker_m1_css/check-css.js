const fs = require('fs');
const files = ['css/style.css', 'css/animations.css', 'css/responsive.css'];

let hasError = false;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`Checking ${f} (Length: ${content.length} bytes)...`);
  
  let openBraces = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let line = 1;
  let col = 1;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1] || '';

    if (char === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }

    if (inComment) {
      if (char === '*' && nextChar === '/') {
        inComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      if (char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      }
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inComment = true;
      i++;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === '{') {
      openBraces++;
    } else if (char === '}') {
      openBraces--;
      if (openBraces < 0) {
        console.error(`ERROR in ${f}: Extra closing brace at line ${line}, col ${col}`);
        hasError = true;
        break;
      }
    }
  }

  if (openBraces !== 0) {
    console.error(`ERROR in ${f}: Unbalanced braces! Remaining open braces: ${openBraces}`);
    hasError = true;
  }
  if (inComment) {
    console.error(`ERROR in ${f}: Unclosed comment detected!`);
    hasError = true;
  }
  if (inString) {
    console.error(`ERROR in ${f}: Unclosed string literal detected!`);
    hasError = true;
  }

  if (!hasError) {
    console.log(`PASS: ${f} has perfectly balanced braces, strings, and comments.`);
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('ALL CSS FILES PASSED VALIDATION!');
}
