# OTAZYA — Wear Your Story 👗

OTAZYA is a bespoke fashion design and custom tailoring web platform built with a **Python Flask** REST API backend, **SQLite** database, and responsive Arabic (RTL) HTML5/CSS3/JavaScript frontend.

---

## 🌟 Features

- **Custom Tailoring & Design Catalog**: Showcase of past designs, pillars, and 4-step ordering process.
- **Interactive Size Guide**: Detailed measurement table with SVG visual body measurement diagrams.
- **Live Client Reviews**: Real-time review submission system backed by Flask & SQLite.
- **Direct Brand Channels**: Seamless integration with WhatsApp, Instagram, Facebook, and TikTok.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Python 3.9+ installed on your machine.

### 2. Set Up Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/macOS
# venv\Scripts\activate   # On Windows

# Install requirements
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
python app.py
# Or shortcut without activating venv:
# ./venv/bin/python app.py
```
The application (both Frontend & Backend API) will start at **http://localhost:8000**.

### 4. Stop the Server
Press `Ctrl + C` in your terminal.

---

## 🛠️ API Reference

### Get Reviews
- **URL**: `/api/reviews`
- **Method**: `GET`
- **Response**: `200 OK`
```json
{
  "reviews": [
    {
      "id": 1,
      "name": "سارة أحمد",
      "email": "sara@example.com",
      "review": "تصميم رائع جداً ومقاسات دقيقة!",
      "rating": 5,
      "created_at": "2026-10-06 20:00:00"
    }
  ]
}
```

### Submit Review
- **URL**: `/api/reviews`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "name": "سارة أحمد",
  "email": "sara@example.com",
  "text": "تصميم رائع جداً ومقاسات دقيقة!",
  "rating": 5
}
```

---

## 📦 Production Deployment Guides

### Option 1: Linux VPS Deployment (Nginx + Gunicorn + Systemd + SSL)

Follow these steps to deploy on an Ubuntu/Debian/Fedora VPS (e.g. DigitalOcean, Hetzner, AWS EC2, Linode):

#### Step 1: Install System Dependencies
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv nginx certbot python3-certbot-nginx
```

#### Step 2: Clone Code & Setup Virtual Environment
```bash
cd /var/www
sudo git clone https://github.com/SalahAzz/otazya-store.git
cd otazya-store

# Set permissions and setup virtual environment
sudo python3 -m venv venv
sudo ./venv/bin/pip install -r requirements.txt
```

#### Step 3: Create Systemd Service
Create a systemd service file to manage the Gunicorn background process:
```bash
sudo nano /etc/systemd/system/otazya.service
```
Paste the following configuration:
```ini
[Unit]
Description=OTAZYA Flask Application Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/otazya-store
Environment="PATH=/var/www/otazya-store/venv/bin"
Environment="FLASK_DEBUG=False"
Environment="SECRET_KEY=your-custom-production-secret-key"
ExecStart=/var/www/otazya-store/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:8000 app:app

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl start otazya
sudo systemctl enable otazya
```

#### Step 4: Configure Nginx Reverse Proxy
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/otazya
```
Paste the following configuration (replace `yourdomain.com` with your actual domain):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/otazya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 5: Enable Free HTTPS (SSL Certificate)
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option 2: Cloud PaaS Deployment (Render / Railway / Fly.io)

Follow these steps for easy 1-click cloud deployment without server administration:

#### Step 1: Push Code to GitHub
Push your latest project code to your GitHub repository:
```bash
git add .
git commit -m "Configure Flask backend and deployment setup"
git push origin main
```

#### Step 2: Create Web Service on Render / Railway
1. Sign in to [Render](https://render.com) or [Railway](https://railway.app).
2. Click **New Web Service** and connect your GitHub repository (`otazya-store`).
3. Select **Python 3** as the runtime environment.

#### Step 3: Configure Build & Start Commands
- **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  gunicorn app:app
  ```

#### Step 4: Add Environment Variables
In the platform's Environment settings, add:
- `FLASK_DEBUG` = `False`
- `SECRET_KEY` = `your-custom-production-secret-key`

Click **Deploy**. Your site will be live on an automatic `https://<your-app>.onrender.com` URL with SSL included automatically!

---

## 📁 Project Structure

```
otazya-store/
├── app.py                 # Main Flask app & REST API routes
├── config.py              # Application configurations
├── database.py            # SQLite connection manager & auto-migrations
├── requirements.txt       # Python dependencies (Flask, Gunicorn)
├── index.html             # Landing page
├── contact.html           # Contact & store location page
├── CSS/                   # Stylesheets
├── JS/                    # Frontend JavaScript
├── assets/                # Images, icons, and SVG illustrations
└── reviews.db             # SQLite database file (auto-generated)
```
