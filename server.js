const express = require('express');
const promClient = require('prom-client');
const crypto = require('crypto');

function uuidv4() {
  return crypto.randomUUID();
}

const app = express();

// Métrica de ejemplo con Prometheus
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const counter = new promClient.Counter({
  name: 'valeria_requests_total',
  help: 'Total de peticiones recibidas por Valeria',
});
register.registerMetric(counter);

// Endpoint raíz
app.get('/', (req, res) => {
  counter.inc();
  res.send(`Hello from Valeria! Request ID: ${uuidv4()}`);
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Puerto dinámico para Cloud Run
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Valeria app running on port ${port}`);
});
