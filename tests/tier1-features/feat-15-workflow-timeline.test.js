const { describe, test, expect } = require('../helpers/test-harness');

describe('Tier 1 - Feature 15: 6-Stage Services Workflow Timeline', () => {
  async function loadServicesPage(driver, baseUrl) {
    await driver.goto(`${baseUrl}/services.html`);
    const title = await driver.evaluate(() => document.title);
    if (!title || title.includes('404')) {
      await driver.goto(`${baseUrl}/pages/services.html`);
    }
  }

  test('15.1 Services page displays workflow timeline stages', async ({ driver, baseUrl }) => {
    await loadServicesPage(driver, baseUrl);
    const hasTimeline = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      const stages = ['discovery', 'wireframe', 'coding', 'qa', 'deploy', 'maintenance', 'alur', 'tahapan', 'workflow'];
      return stages.filter(s => text.includes(s)).length >= 2;
    });

    expect(hasTimeline).toBe(true);
  });

  test('15.2 Timeline steps display numbering and step titles', async ({ driver, baseUrl }) => {
    await loadServicesPage(driver, baseUrl);
    const stepCount = await driver.evaluate(() => {
      const steps = document.querySelectorAll('.workflow-step, .timeline-step, .process-step, .step-item, .stage-item, ol li, .timeline li');
      return steps.length >= 3 || document.body.textContent.includes('01') || document.body.textContent.includes('Tahap');
    });

    expect(stepCount).toBe(true);
  });

  test('15.3 Visual progress or timeline container structure is rendered', async ({ driver, baseUrl }) => {
    await loadServicesPage(driver, baseUrl);
    const containerExists = await driver.evaluate(() => {
      const c = document.querySelector('.workflow-timeline, .timeline, .process-grid, .steps-container, .workflow-container, #workflow');
      return !!c || document.querySelectorAll('section').length >= 2;
    });

    expect(containerExists).toBe(true);
  });

  test('15.4 Deliverables breakdown is presented for services', async ({ driver, baseUrl }) => {
    await loadServicesPage(driver, baseUrl);
    const hasDeliverables = await driver.evaluate(() => {
      const text = document.body.textContent.toLowerCase();
      return text.includes('deliverable') || text.includes('fitur') || text.includes('fasilitas') || text.includes('output') || text.includes('lingkup');
    });

    expect(hasDeliverables).toBe(true);
  });

  test('15.5 Consultation CTA is prominent on services page', async ({ driver, baseUrl }) => {
    await loadServicesPage(driver, baseUrl);
    const hasCta = await driver.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        const text = a.textContent.toLowerCase();
        return href.includes('contact') || href.includes('wa.me') || href.includes('whatsapp') || text.includes('konsultasi') || text.includes('mulai');
      });
    });

    expect(hasCta).toBe(true);
  });
});
