import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics for better monitoring
const errorRate = new Rate('errors');

const maxRate = 600

export const options = {
  // Gradual ramp-up to prevent overwhelming the server
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '30s', target: 250 },  // Increase to 250 users
    { duration: '30s', target: maxRate },  // Reach 1500 users
    { duration: '2m', target: 500 },   // Stay at 500 users for 2 minutes
    { duration: '30s', target: 0 },    // Ramp down
  ],

  // Performance thresholds - test will fail if exceeded
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
    http_req_failed: ['rate<0.1'],     // Error rate should be less than 10%
    errors: ['rate<0.15'],             // Custom error rate should be less than 15%
  },

  // Optimize for high load
  discardResponseBodies: true, // Save memory
  noConnectionReuse: false,    // Reuse connections
  maxRedirects: 0,            // Don't follow redirects
  userAgent: 'k6-load-test/500users',
};

const IS_PROD = false ; //process.env.NODE_ENV === 'production';
const BASE_URL_PROD = 'https://app.pen2class/api/health';
const BASE_URL = IS_PROD ? BASE_URL_PROD : 'http://localhost:3333/api/health';

export default function () {
  const endpoints = [
    //'',
    '/alive',
    '/ready',
    '/db',
    //'/external',
    //'/custom',
    //'/full',
  ];

  // Add realistic user behavior - not every user hits every endpoint
  const endpointsToTest = Math.random() < 0.7
    ? endpoints.slice(0, 3)  // 70% of users test only first 3 endpoints
    : endpoints;             // 30% test all endpoints

  for (const endpoint of endpointsToTest) {
    const res = http.get(`${BASE_URL}${endpoint}`, {
      timeout: '30s', // Increase timeout for high load scenarios
    });

    const result = check(res, {
      [`GET ${endpoint} status is 200`]: (r) => r.status === 200,
      [`GET ${endpoint} response time < 500ms`]: (r) => r.timings.duration < 500,
      [`GET ${endpoint} response time < 1000ms`]: (r) => r.timings.duration < 1000,
      [`GET ${endpoint} response time < 2000ms`]: (r) => r.timings.duration < 2000,
    });

    // Track custom error metrics
    errorRate.add(!result);

    // Log failures for debugging (but not too verbose to avoid spam)
    if (res.status !== 200 && Math.random() < 0.1) { // Only log 10% of failures
      console.log(`❌ ${endpoint} failed: ${res.status} - ${res.error || 'No error details'}`);
    }

    // Variable sleep time to simulate real user behavior
    sleep(Math.random() * 1 + 0.2); // Sleep between 0.2-1.2 seconds
  }

  // Think time between user sessions
  sleep(Math.random() * 2 + 0.5); // Sleep 0.5-2.5 seconds between iterations
}

// Pre-test verification
export function setup() {
  console.log('🚀 Starting '+maxRate+' user load test...');
  console.log('📊 Test will ramp up gradually over 90 seconds');
  console.log('🎯 Performance targets:');
  console.log('   - 95% of requests < 1000ms');
  console.log('   - Error rate < 10%');
  console.log('   - Total duration: ~4 minutes');

  // Verify the service is accessible before starting
  console.log('🔍 Checking service availability...');
  const response = http.get(BASE_URL+'/alive', { timeout: '10s' });

  if (response.status !== 200) {
    console.error(`❌ Service check failed! Status: ${response.status}`);
    console.error(`   Error: ${response.error || 'Unknown error'}`);
    throw new Error('Service not ready for load testing');
  }

  console.log('✅ Service is ready - starting load test!');
  return { serviceReady: true, baseUrl: BASE_URL };
}

// Post-test summary
export function teardown(data) {
  console.log('🏁 500 user load test completed!');
  console.log('📈 Check the HTML report for detailed results');
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return {
    [`tests/health-check-500users.${IS_PROD ? 'prod' :'local'}.${maxRate}.html`]: htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
