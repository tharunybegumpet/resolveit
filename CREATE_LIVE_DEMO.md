# 🌐 Create Live Demo Link for ResolveIT

## 🎯 Quick Setup - Get Public URL in 5 Minutes!

### Step 1: Download Ngrok (Free)

1. Go to: **https://ngrok.com/download**
2. Download for Windows
3. Extract the `ngrok.exe` file to: `C:\ngrok\`
4. Sign up for free account at: **https://dashboard.ngrok.com/signup**
5. Get your auth token from: **https://dashboard.ngrok.com/get-started/your-authtoken**

### Step 2: Setup Ngrok

Open Command Prompt and run:
```cmd
cd C:\ngrok
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Start Your Project

**Terminal 1 - Start Backend:**
```cmd
cd C:\Users\tharuny\Downloads\projects resolve (1)\projects resolve\projects\resolveit_option_c_full\resolveit-backend
mvn spring-boot:run
```
Wait until you see: "Started ResolveItApplication"

**Terminal 2 - Start Frontend:**
```cmd
cd C:\Users\tharuny\Downloads\projects resolve (1)\projects resolve\projects\resolveit_option_c_full\resolveit-frontend
npm start
```
Wait until browser opens at localhost:3000

### Step 4: Create Public URLs

**Terminal 3 - Expose Backend:**
```cmd
cd C:\ngrok
ngrok http 8080
```
You'll see something like:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:8080
```
**COPY THIS URL!** (Example: https://abc123.ngrok-free.app)

**Terminal 4 - Expose Frontend:**
```cmd
cd C:\ngrok
ngrok http 3000
```
You'll see:
```
Forwarding: https://xyz789.ngrok-free.app -> http://localhost:3000
```
**COPY THIS URL!** (Example: https://xyz789.ngrok-free.app)

### Step 5: Update Frontend to Use Public Backend

1. Open: `resolveit-frontend/src/App.js`
2. Find the line with `http://localhost:8080`
3. Replace with your ngrok backend URL (from Terminal 3)
4. Save the file
5. Frontend will auto-reload

### Step 6: Share Your Links! 🎉

**Your Live Demo URL (Frontend):**
```
https://xyz789.ngrok-free.app
```

**Your API URL (Backend):**
```
https://abc123.ngrok-free.app
```

**Demo Credentials:**
- Admin: tharuny.begumpet@gmail.com / admin123
- User: user1@resolveit.com / password123

---

## 📱 Share These Links:

✅ Add to LinkedIn Projects
✅ Add to Resume
✅ Send to Recruiters
✅ Share with Friends
✅ Use in Interviews

---

## ⚠️ Important Notes:

1. **Keep terminals running** - Don't close them while demo is active
2. **Free tier limits** - Ngrok free URLs expire after 2 hours of inactivity
3. **New URLs each time** - You'll get different URLs when you restart ngrok
4. **Warning page** - First-time visitors see ngrok warning, click "Visit Site"

---

## 🔄 Alternative: Deploy to Cloud (Permanent Link)

For a permanent link that doesn't expire, see:
- `DEPLOYMENT_GUIDE.md` - Deploy to Vercel + Render (Free)
- Takes 30 minutes but link never expires

---

## 🆘 Troubleshooting:

**Problem: Frontend can't connect to backend**
- Make sure you updated the backend URL in App.js
- Check that backend ngrok is still running

**Problem: "Invalid Host Header"**
- This is normal for React, just refresh the page

**Problem: Ngrok URL expired**
- Restart ngrok to get new URLs
- Update frontend with new backend URL

---

## 📊 What People Will See:

When someone visits your ngrok URL, they'll see:
1. Full ResolveIT application
2. Can register and login
3. Can submit complaints
4. Can upload files
5. Admin can manage everything
6. All features working live!

---

## 🎥 Pro Tip:

Record a video showing:
1. Your ngrok public URL
2. Someone accessing it from another computer
3. Full demo of features
4. Upload to YouTube
5. Add video link to resume!

---

**Your project is ready to go live! Follow the steps above.** 🚀
