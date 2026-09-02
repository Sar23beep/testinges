# Google Cloud Run Deployment Guide — Sanjana Malhotra

Complete step-by-step instructions to deploy the website to **Google Cloud Run** with HTTPS, auto-scaling, and global CDN.

---

## 🔑 Required Environment Variables

When configuring Cloud Run, set these in **Variables & Secrets**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `8080` | Container port (default on Cloud Run) |
| `BASE_URL` | `https://your-domain.com` | Your live custom domain or Cloud Run service URL |
| `MONGODB_URI` | `mongodb+srv://brahmachatterofficial:brahmachatterofficial@cluster0.orn3gbu.mongodb.net/UpdateWebsite?appName=Cluster0` | MongoDB Atlas Connection String |
| `SESSION_SECRET` | `sanjana-malhotra-secure-production-session-key-32chars` | Minimum 32 characters secret key |
| `CLOUDINARY_CLOUD_NAME` | `ky6lrihf` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | `128765299755175` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | `CUFswZLjMmPRY_lRb6Gjv7Put94` | Cloudinary API Secret |
| `ADMIN_EMAIL` | `sharmaishwar1327@gmail.com` | Admin Login Email |
| `ADMIN_PASSWORD` | `Work@991991` | Admin Login Password |
| `WHATSAPP_NUMBER` | `6351615378` | Primary WhatsApp & Call Number |
| `DEFAULT_WHATSAPP_NUMBER`| `916351615378` | Universal WhatsApp Number |
| `GOOGLE_SITE_VERIFICATION`| *(optional)* | Google Search Console verification meta code |

---

## 🚀 Method 1: Deploy with Google Cloud CLI (`gcloud`)

If you have `gcloud` installed on your terminal:

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Select or create your GCP project
gcloud config set project YOUR_PROJECT_ID

# 3. Enable Cloud Run & Cloud Build APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Build and deploy directly from current folder
gcloud run deploy sanjana-malhotra \
  --source . \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --min-instances 1 \
  --max-instances 10 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars="NODE_ENV=production,PORT=8080,MONGODB_URI=mongodb+srv://brahmachatterofficial:brahmachatterofficial@cluster0.orn3gbu.mongodb.net/UpdateWebsite?appName=Cluster0,SESSION_SECRET=sanjana-malhotra-secure-production-session-key-32chars,CLOUDINARY_CLOUD_NAME=ky6lrihf,CLOUDINARY_API_KEY=128765299755175,CLOUDINARY_API_SECRET=CUFswZLjMmPRY_lRb6Gjv7Put94,ADMIN_EMAIL=sharmaishwar1327@gmail.com,ADMIN_PASSWORD=Work@991991,WHATSAPP_NUMBER=6351615378,DEFAULT_WHATSAPP_NUMBER=916351615378"
```

---

## 🌐 Method 2: Deploy via Google Cloud Console UI (Easiest)

1. Open **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Go to **Cloud Run** -> Click **"Create Service"**.
3. Choose **"Deploy from Source Repository"** (Connect your GitHub repo) OR **"Deploy one revision from an existing container image"**.
4. **Service settings:**
   - **Service Name:** `sanjana-malhotra`
   - **Region:** `asia-south1 (Mumbai)` or `asia-southeast1 (Singapore)`
   - **Authentication:** Check **"Allow unauthenticated invocations"** (Public website).
5. **Container configuration:**
   - **Container Port:** `8080`
   - **Memory:** `512 MiB`
   - **CPU:** `1`
   - **Min instances:** `1` (prevents cold starts)
6. **Environment variables:** Add the variables from the table above.
7. Click **"Create"** / **"Deploy"**.
8. Once deployment finishes, Google will provide your live HTTPS URL (e.g. `https://sanjana-malhotra-xyz-el.a.run.app`).

---

## 🏷️ Custom Domain Mapping (Connecting your Domain)

1. In Cloud Run, click on your service **`sanjana-malhotra`**.
2. Click **"Custom Domains"** tab -> **"Add Mapping"**.
3. Select your verified domain (e.g., `sanjanamalhotra.com` or `www.sanjanamalhotra.com`).
4. Google will give you **DNS Records** (A and AAAA records or CNAME).
5. Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
6. Google will automatically issue a free **SSL Certificate (HTTPS)** within 15-30 minutes.
