const express = require('express');
const client = require('prom-client');
const app = express();

// Definimos un contador de peticiones
const counter = new client.Counter({
  name: 'valeria_requests_total',
  help: 'Total requests handled by Valeria app'
});

// Endpoint principal
app.get('/', (req, res) => {
  counter.inc();
  res.send('Hello from Valeria!');
});

// Endpoint de métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(8080, () => console.log('Valeria app running on port 8080'));