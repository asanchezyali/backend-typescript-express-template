import autocannon, { printResult } from 'autocannon';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';

// Set up environment variables for testing
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-api-key';
process.env.NODE_ENV = 'test';

// Test configurations for different scenarios
const testConfigurations = [
  { connections: 5, duration: 10, name: 'light-load', pipelining: 1 },
  { connections: 25, duration: 15, name: 'medium-load', pipelining: 2 },
  { connections: 50, duration: 20, name: 'heavy-load', pipelining: 5 },
];

// Parse command line arguments
const args = process.argv.slice(2);
const testToRun = args[0] || 'light-load';
const selectedConfig = testConfigurations.find((config) => config.name === testToRun) ?? testConfigurations[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateHTMLReport(results: any, testConfig: (typeof testConfigurations)[0]): Promise<string> {
  const resultsFolder = join(process.cwd(), 'results');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const htmlFilePath = join(resultsFolder, `load-test-report-${testConfig.name}-${timestamp}.html`);

  // Create a simple HTML report
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - ${testConfig.name}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
      .container { max-width: 1000px; margin: 0 auto; }
      h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
      .metric { margin-bottom: 20px; }
      .metric h3 { margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
      th, td { text-align: left; padding: 8px; }
      th { background-color: #f2f2f2; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .chart { margin-bottom: 30px; height: 300px; }
      .footer { margin-top: 50px; color: #7f8c8d; font-size: 0.9em; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Load Test Report</h1>
      
      <div class="summary">
        <h2>Test Configuration</h2>
        <p><strong>Scenario:</strong> ${testConfig.name}</p>
        <p><strong>Connections:</strong> ${String(testConfig.connections)}</p>
        <p><strong>Duration:</strong> ${String(testConfig.duration)} seconds</p>
        <p><strong>Pipelining:</strong> ${String(testConfig.pipelining)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <div class="metric">
        <h2>Performance Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Average Requests/sec</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results.requests?.average ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Average Latency (ms)</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
            <td>${String(results.latency?.average?.toFixed(2) ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Max Latency (ms)</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results.latency?.max ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Min Latency (ms)</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results.latency?.min ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Total Requests</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results.requests?.total ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Successful Responses (2xx)</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results['2xx'] ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>Error Responses (non-2xx)</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
            <td>${String(results.non2xx ?? 'N/A')}</td>
          </tr>
        </table>
      </div>

      <div class="metric">
        <h2>Latency Distribution</h2>
        <table>
          <tr>
            <th>Percentile</th>
            <th>Value (ms)</th>
          </tr>
          <tr>
            <td>50%</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
            <td>${String(results.latency?.p50?.toFixed(2) ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>75%</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
            <td>${String(results.latency?.p75?.toFixed(2) ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>90%</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
            <td>${String(results.latency?.p90?.toFixed(2) ?? 'N/A')}</td>
          </tr>
          <tr>
            <td>99%</td>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint.no-unsafe-call */}
            <td>${String(results.latency?.p99?.toFixed(2) ?? 'N/A')}</td>
          </tr>
        </table>
      </div>

      <div class="footer">
        <p>Report generated on ${new Date().toISOString()} • GrowthX App</p>
      </div>
    </div>
  </body>
  </html>
  `;

  await mkdir(resultsFolder, { recursive: true });
  await writeFile(htmlFilePath, htmlContent);

  return htmlFilePath;
}

// Main function to run the load tests
async function runTests(): Promise<void> {
  console.log(`Running load test scenario: ${selectedConfig.name}`);
  console.log(
    `Configuration: ${String(selectedConfig.connections)} connections, ${String(selectedConfig.duration)}s duration, pipelining: ${String(selectedConfig.pipelining)}`,
  );

  // Import the app dynamically to ensure environment variables are set first
  const { default: app } = await import('../../app.js');

  // Start the server on a test port
  const PORT = 3456;
  const server = app.listen(PORT, () => {
    void (async () => {
      console.log(`Test server started on port ${String(PORT)}`);

      try {
        // Run the load test with the selected configuration

        const results = await new Promise((resolve) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const test = autocannon({
            body: JSON.stringify({
              content:
                'This is a sample content for load testing the analyze endpoint. It needs to be long enough to be meaningful for analysis.',
              title: 'Load Test Content',
            }),
            connections: selectedConfig.connections,
            duration: selectedConfig.duration,
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            pipelining: selectedConfig.pipelining,
            timeout: 30,
            url: `http://localhost:${String(PORT)}/api/analyze`,
          });

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint.no-unsafe-call
          if (test && typeof test.track === 'function') {
            test.track(test, { renderProgressBar: true });
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint.no-unsafe-call
          if (test && typeof test.on === 'function') {
            test.on('done', (result) => {
              resolve(result);
            });
          }
        });

        // Print results to console
        // eslint-disable-next-line @typescript-eslint.no-unsafe-argument
        printResult(results);

        // Generate HTML report
        const reportPath = await generateHTMLReport(results, selectedConfig);
        console.log(`HTML report generated: ${reportPath}`);

        // Create a simple server to view the report
        const reportServer = createServer((req, res) => {
          void (async () => {
            const { readFile } = await import('node:fs/promises');
            try {
              const reportContent = await readFile(reportPath, 'utf-8');
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(reportContent);
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              console.error(`Error serving report: ${errorMessage}`);
              res.writeHead(500);
              res.end('Error loading report');
            }
          })();
        });

        const REPORT_PORT = 8888;
        reportServer.listen(REPORT_PORT, () => {
          console.log(`Report server started on http://localhost:${String(REPORT_PORT)}`);
          console.log(`Press Ctrl+C to exit...`);
        });
      } catch (error) {
        console.error('Error during load test:', error);
      } finally {
        // Close the test server
        server.close();
      }
    })();
  });
}

// ES modules equivalent of require.main === module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Run the tests if this file is executed directly
if (isMainModule) {
  void runTests();
}

export { generateHTMLReport, runTests };
