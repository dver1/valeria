const express = require('express');
const promClient = require('prom-client');
const crypto = require('crypto');
const monitoring = require('@google-cloud/monitoring');

const client = new monitoring.MetricServiceClient();
const projectId = process.env.GOOGLE_CLOUD_PROJECT; // Cloud Run lo inyecta automáticamente

async function sendCustomMetric(value) {
  if (!projectId) {
    console.error('Project ID is missing! Cannot send metric.');
    return;
  }

  const request = {
    name: client.projectPath(projectId),
    timeSeries: [
      {
        metric: { type: 'custom.googleapis.com/valeria_requests' },
        resource: { type: 'global' },
        points: [
          {
            interval: { endTime: { seconds: Math.floor(Date.now() / 1000) } },
            value: { doubleValue: value },
          },
        ],
      },
    ],
  };

  try {
    await client.createTimeSeries(request);
    console.log(`✅ Metric sent to Cloud Monitoring: ${value}`);
  } catch (err) {
    console.error('❌ Error sending metric:', err.message);
  }
}

function uuidv4() {
  return crypto.randomUUID();
}

const app = express();

// Registro global de métricas Prometheus
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Métricas personalizadas
const counter = new promClient.Counter({
  name: 'valeria_requests_total',
  help: 'Total de peticiones recibidas por Valeria',
});
register.registerMetric(counter);

const memoryGauge = new promClient.Gauge({
  name: 'valeria_memory_bytes',
  help: 'Memoria usada por el proceso en bytes',
});
register.registerMetric(memoryGauge);

const requestDuration = new promClient.Histogram({
  name: 'valeria_request_duration_seconds',
  help: 'Latencia de las peticiones en segundos',
  labelNames: ['method', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
register.registerMetric(requestDuration);

const payloadSize = new promClient.Summary({
  name: 'valeria_payload_size_bytes',
  help: 'Tamaño de payloads recibidos en bytes',
  labelNames: ['method'],
});
register.registerMetric(payloadSize);

// Middleware para medir latencia y payload
app.use((req, res, next) => {
  const end = requestDuration.startTimer({ method: req.method });
  res.on('finish', async () => {
    counter.inc();
    end({ status: res.statusCode });
    payloadSize.observe({ method: req.method }, Number(req.headers['content-length'] || 0));

    // Enviar métrica personalizada a Cloud Monitoring
    await sendCustomMetric(1);
  });
  next();
});

// Endpoint raíz
app.get('/', (req, res) => {
  memoryGauge.set(process.memoryUsage().rss);
  res.send(`Hello from Valeria! Request ID: ${uuidv4()}`);
});

// Endpoint de métricas Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Puerto dinámico para Cloud Run
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Valeria app running on port ${port}, metrics at /metrics`);
});
