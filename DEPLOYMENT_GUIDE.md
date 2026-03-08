# 🚀 ResolveIT - Deployment & Sharing Guide

## 📋 Overview

This guide will help you deploy your ResolveIT Grievance Management System and create shareable links for demonstration or production use.

---

## 🎯 Deployment Options

### Option 1: Local Network Sharing (Quick Demo)
**Best for**: Presentations, local demos, team testing

### Option 2: Cloud Deployment (Production)
**Best for**: Live production, remote access, permanent hosting

### Option 3: GitHub Pages (Frontend Only)
**Best for**: Portfolio showcase, static demo

---

## 🌐 Option 1: Local Network Sharing

### Step 1: Get Your Local IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

### Step 2: Start Backend
```cmd
cd projects\resolveit_option_c_full\resolveit-backend
mvn spring-boot:run
```
Backend runs on: `http://YOUR_IP:8080`

### Step 3: Update Frontend Configuration
Edit `resolveit-frontend/src/config.js` (create if doesn't exist):
```javascript
export const API_BASE_URL = 'http://YOUR_IP:8080/api';
```

### Step 4: Start Frontend
```cmd
cd projects\resolveit_option_c_full\resolveit-frontend
npm start
```
Frontend runs on: `http://YOUR_IP:3000`

### Step 5: Share Links
- **Frontend**: `http://YOUR_IP:3000`
- **Backend API**: `http://YOUR_IP:8080`

**Note**: Others on your network can access using your IP address!

---

## ☁️ Option 2: Cloud Deployment (Recommended)

### A. Deploy Backend (Heroku - Free Tier)

#### 1. Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

#### 2. Login to Heroku
```cmd
heroku login
```

#### 3. Create Heroku App
```cmd
cd projects\resolveit_option_c_full\resolveit-backend
heroku create resolveit-backend
```

#### 4. Add MySQL Database
```cmd
heroku addons:create jawsdb:kitefin
```

#### 5. Configure Environment Variables
```cmd
heroku config:set SPRING_DATASOURCE_URL=jdbc:mysql://[JAWSDB_URL]
heroku config:set SPRING_MAIL_USERNAME=your_email@gmail.com
heroku config:set SPRING_MAIL_PASSWORD=your_app_password
```

#### 6. Deploy
```cmd
git init
git add .
git commit -m "Deploy ResolveIT backend"
heroku git:remote -a resolveit-backend
git push heroku main
```

**Your Backend URL**: `https://resolveit-backend.herokuapp.com`

---

### B. Deploy Frontend (Vercel - Free)

#### 1. Install Vercel CLI
```cmd
npm install -g vercel
```

#### 2. Login to Vercel
```cmd
vercel login
```

#### 3. Update API URL
Edit `resolveit-frontend/src/config.js`:
```javascript
export const API_BASE_URL = 'https://resolveit-backend.herokuapp.com/api';
```

#### 4. Deploy
```cmd
cd projects\resolveit_option_c_full\resolveit-frontend
vercel
```

Follow prompts and deploy!

**Your Frontend URL**: `https://resolveit.vercel.app`

---

### C. Alternative: Deploy Both on Render.com

#### 1. Create Account
Go to: https://render.com

#### 2. Deploy Backend
- Click "New +" → "Web Service"
- Connect GitHub repository
- Build Command: `mvn clean package`
- Start Command: `java -jar target/resolveit-0.0.1-SNAPSHOT.jar`
- Add environment variables

#### 3. Deploy Frontend
- Click "New +" → "Static Site"
- Connect GitHub repository
- Build Command: `npm run build`
- Publish Directory: `build`

---

## 📦 Option 3: Create Shareable Package

### Create ZIP for Sharing

#### 1. Create Deployment Package
```cmd
cd projects\resolveit_option_c_full
```

#### 2. Create README for Recipients
Create `SETUP_INSTRUCTIONS.txt`:
```
ResolveIT Grievance Management System
======================================

REQUIREMENTS:
- Java 17+
- Node.js 16+
- MySQL 8.0+

SETUP:
1. Import database: mysql -u root -p < resolveit-db.sql
2. Start backend: cd resolveit-backend && mvn spring-boot:run
3. Start frontend: cd resolveit-frontend && npm install && npm start

ACCESS:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Admin Login: tharuny.begumpet@gmail.com / admin123

FEATURES:
✅ Email notifications
✅ File uploads (PDF/Video admin-only)
✅ Interactive charts
✅ Staff management
✅ Escalation system
✅ Reports & analytics
```

#### 3. Create ZIP
```cmd
# Exclude node_modules and target folders
tar -czf resolveit-deployment.zip resolveit-backend resolveit-frontend *.md *.sql --exclude=node_modules --exclude=target
```

---

## 🔗 Create Demo Video/Screenshots

### For Portfolio/Presentation

#### 1. Record Demo Video
Use OBS Studio or Windows Game Bar:
- Press **Windows + G** to start recording
- Show all features:
  - Login/Registration
  - Submit complaint
  - Admin dashboard
  - File uploads
  - Email notifications
  - Charts and reports

#### 2. Take Screenshots
- Homepage
- Admin Dashboard
- Complaint Form
- Reports Page
- Email notifications

#### 3. Upload to YouTube/Drive
Share the link!

---

## 🌍 Quick Deploy with Ngrok (Instant Public URL)

### For Immediate Sharing

#### 1. Install Ngrok
Download from: https://ngrok.com/download

#### 2. Start Your Services
```cmd
# Terminal 1: Backend
cd projects\resolveit_option_c_full\resolveit-backend
mvn spring-boot:run

# Terminal 2: Frontend  
cd projects\resolveit_option_c_full\resolveit-frontend
npm start
```

#### 3. Create Public URLs
```cmd
# Terminal 3: Expose Backend
ngrok http 8080

# Terminal 4: Expose Frontend
ngrok http 3000
```

#### 4. Share Links
Ngrok will give you public URLs like:
- Backend: `https://abc123.ngrok.io`
- Frontend: `https://xyz789.ngrok.io`

**Note**: Update frontend to use ngrok backend URL!

---

## 📊 Your ResolveIT Features to Highlight

### ✅ Core Features
- **User Management**: Registration, Login, Role-based access
- **Complaint Management**: Submit, track, resolve complaints
- **File Uploads**: Images, PDFs, videos (admin-only for sensitive files)
- **Email Notifications**: Automatic emails for status changes
- **Staff Assignment**: Dynamic staff allocation
- **Escalation System**: Automatic escalation for pending complaints

### ✅ Advanced Features
- **Interactive Charts**: Pie, doughnut, line, bar charts
- **Reports & Analytics**: Generate and export reports
- **Staff Applications**: Apply to become staff member
- **Database Management**: Reset and manage data
- **Responsive Design**: Works on mobile and desktop

### ✅ Technical Stack
- **Backend**: Java Spring Boot, MySQL, JWT Authentication
- **Frontend**: React 18, Chart.js, Bootstrap
- **Email**: Gmail SMTP integration
- **Security**: BCrypt password hashing, JWT tokens

---

## 🎯 Recommended Deployment Strategy

### For Presentation/Demo:
1. **Use Ngrok** for instant public URLs
2. **Record a video** showing all features
3. **Prepare screenshots** of key pages

### For Portfolio:
1. **Deploy frontend** on Vercel (free)
2. **Deploy backend** on Render.com (free)
3. **Add to GitHub** with good README
4. **Create demo video** on YouTube

### For Production:
1. **Use AWS/Azure** for scalability
2. **Set up proper domain** (e.g., resolveit.com)
3. **Configure SSL** certificates
4. **Set up monitoring** and backups

---

## 📝 Checklist Before Sharing

- [ ] Backend compiles and runs
- [ ] Frontend builds successfully
- [ ] Database is set up with sample data
- [ ] Email configuration is working
- [ ] All features tested
- [ ] Admin credentials documented
- [ ] README file created
- [ ] Screenshots/video prepared
- [ ] Deployment tested

---

## 🆘 Quick Links

### Your Project URLs (Local):
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8080
- **Database**: localhost:3306/resolveit

### Admin Credentials:
- **Email**: tharuny.begumpet@gmail.com
- **Password**: admin123

### Documentation Files:
- `README.md` - Project overview
- `SYSTEM_READY_SUMMARY.md` - Feature list
- `EMAIL_INTEGRATION_COMPLETE.md` - Email setup
- `CHARTS_INSTALLATION_GUIDE.md` - Charts setup
- `ENDPOINT_STATUS_CHECK.html` - API testing

---

## 🎉 You're Ready to Share!

Your ResolveIT system is production-ready with:
- ✅ Complete grievance management
- ✅ Email notifications
- ✅ File uploads with security
- ✅ Interactive analytics
- ✅ Professional UI/UX
- ✅ Comprehensive documentation

**Choose your deployment method and share your amazing project!** 🚀