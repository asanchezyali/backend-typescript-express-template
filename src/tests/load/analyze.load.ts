import autocannon, { printResult } from 'autocannon';
import { join } from 'node:path';

// Set up environment variables before importing app
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-api-key';
process.env.NODE_ENV = 'test';

const PORT = 3456;
const URL = `http://localhost:${String(PORT)}/api/analyze`;

// Sample content for testing
const sampleContent = [
  {
    content: 'Companies need effective growth strategies to expand market share and increase revenue.',
    title: 'Growth Strategies',
  },
  {
    content: 'Data-driven marketing decisions lead to better customer engagement and ROI.',
    title: 'Marketing Insights',
  },
  {
    content: 'Building strategic partnerships can accelerate business growth and open new markets.',
    title: 'Business Development',
  },
];

// ES modules equivalent of require.main === module
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Only start the server if this file is run directly
if (isMainModule) {
  // Dynamic import to avoid hoisting issues with environment variables
  void import('../../app.js').then(({ default: app }) => {
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${String(PORT)} for load testing`);

      // Run the load test
      void runLoadTest().then(() => {
        // Close the server when done
        server.close();
      });
    });
  });
}

/**
 * Run load test on the analyze endpoint
 */
async function runLoadTest(connections = 10, duration = 10, pipelining = 1, timeout = 20): Promise<void> {
  console.log(`Starting load test with ${String(connections)} concurrent connections for ${String(duration)} seconds`);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const instance = autocannon({
    connections,
    duration,
    headers: {
      'Content-Type': 'application/json',
    },
    pipelining,
    requests: [
      {
        body: JSON.stringify(sampleContent[0]),
        method: 'POST',
        onResponse: (status: number, body: string) => {
          if (status !== 200) {
            console.error(`Error response: ${String(status)}, ${String(body)}`);
          }
        },
        path: '/api/analyze',
      },
      {
        body: JSON.stringify(sampleContent[1]),
        method: 'POST',
        path: '/api/analyze',
      },
      {
        body: JSON.stringify(sampleContent[2]),
        method: 'POST',
        path: '/api/analyze',
      },
    ],
    timeout,
    url: URL,
  }, (err, result) => {
    if (err) {
      console.error('Autocannon error:', err);
    } else {
      printResult(result as any);
    }
  });

  // Remove .track and .on usage
  // Return a resolved promise immediately
  return Promise.resolve();
}

export { runLoadTest };
