# Valeria Project

Valeria is a minimal Node.js application designed to demonstrate how to expose custom metrics for observability using **Prometheus** and visualize them with **Grafana**. The project will be deployed on **Google Cloud Run** and later integrated with **Google Cloud Managed Service for Prometheus** to enable persistence, scalability, and monitoring.

## 🚀 Goals

- Build a simple Node.js app that exposes metrics at `/metrics` using [prom-client](https://github.com/siimon/prom-client).
- Deploy the app to **Google Cloud Run** under the project `valeria-pro`.
- Enable **Managed Prometheus** in GCP to scrape and store metrics automatically.
- Connect **Grafana** to Google Cloud Monitoring to visualize metrics in real time.
- Stress test the app to validate metric variations and confirm observability setup.

## 📂 Project Structure
valeria/ ├── server.js        
# Express app with Prometheus metrics ├── package.json    
# Node.js dependencies ├── Dockerfile      
# Container definition for Cloud Run └── .gitignore       
# Ignore node_modules and logs



## ⚙️ Endpoints

- `/` → Returns a simple "Hello from Valeria!" message and increments a request counter.
- `/metrics` → Exposes Prometheus metrics in text format.

## 🛠️ Local Development

## bash

npm install
npm start


⚙️ Endpoints
- Visit http://localhost:8080/ → Hello message
- Visit http://localhost:8080/metrics → Prometheus metrics


☁️ Deployment to Cloud Run

gcloud config set project valeria-pro
gcloud builds submit --tag gcr.io/valeria-pro/valeria
gcloud run deploy valeria \
  --image gcr.io/valeria-pro/valeria \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated


📊 Next Steps
- Enable Managed Service for Prometheus in GCP.
- Configure scraping of the /metrics endpoint.
- Add Grafana and connect it to Cloud Monitoring.
- Perform stress tests to validate metrics and dashboards.

Valeria is not intended as a production app, but as a learning project to explore observability
workflows with Prometheus and Grafana in Google Cloud.





