const express = require('express');
const client = require('prom-client');
const {MetricServiceClient} = require('@google-cloud/monitoring');

const app = express();
const monitoringClient = new MetricServiceClient();
const projectId = 'valeria-pro';

// Prometheus metric
const counter = new client.Counter({
  name: 'valeria_requests_total',
  help: 'Total requests handled by Valeria app'
});

// Cloud Monitoring metric
async function sendMetricToCloudMonitoring() {
  const now = Math.floor(Date.now() / 1000);

  const dataPoint = {
    interval: {
      startTime: {seconds: now},
      endTime: {seconds: now},
    },
    value: {int64Value: 1},
  };

  const timeSeriesData = {
    metric: {type: 'custom.googleapis.com/valeria/request_count'},
    resource: {type: 'global'},
    metricKind: 'DELTA',
    valueType: 'INT64',
    points: [dataPoint],
  };

  try {
    await monitoringClient.createTimeSeries({
      name: monitoringClient.projectPath(projectId),
      timeSeries: [timeSeriesData],
    });
    console.log('Metric sent to Cloud Monitoring');
  } catch (err) {
    console.error('Error sending metric:', err);
  }
}

// Main endpoint
app.get('/', async (req, res) => {
  counter.inc(); // Prometheus
  await sendMetricToCloudMonitoring(); // Cloud Monitoring
  res.send('Hello from Valeria!');
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Valeria app running on port ${port}`));
