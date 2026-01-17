# 🚀 Quick Start - Email System

## ⚡ 3 Steps to Get Emails Working

### 1️⃣ Get Gmail App Password (2 minutes)
```
1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail" → "ResolveIT"
3. Copy the 16-character password
```

### 2️⃣ Update Configuration (30 seconds)
```
File: resolveit-backend/src/main/resources/application.properties

Change this line:
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE

To:
spring.mail.password=your16charpassword
```

### 3️⃣ Restart Backend (1 minute)
```bash
cd resolveit-backend
mvn spring-boot:run
```

---

## ✅ Test It Works

### Quick Test:
1. Open: `test_email_system.html` in browser
2. Click: "Test Assignment Email"
3. Click: "Check user1 Inbox" 
4. See email in yopmail! ✉️

---

## 📬 Check Emails

### User Emails:
https://yopmail.com/en/?login=user1

### Manager Emails:
https://yopmail.com/en/?login=manager2

**No password needed!** Just enter username and check inbox.

---

## 🎯 When Emails Are Sent

| Action | Email To |
|--------|----------|
| Assign complaint | Staff + User |
| Update status | User |
| Resolve complaint | User |

**All emails sent FROM:** tharuny.begumpet@gmail.com  
**All emails sent TO:** yopmail accounts

---

## 🔍 Check If Working

Look for this in backend console:
```
✅ Assignment email sent to: user1@yopmail.com
✅ Status update email sent to: user1@yopmail.com
```

---

## 📞 Problems?

**Emails not sending?**
- Check Gmail app password is correct
- Check backend console for errors
- Make sure 2-Step Verification is enabled on Gmail

**Emails not in yopmail?**
- Wait 30 seconds and refresh
- Check backend console shows "✅ Email sent"
- Try different yopmail account

---

## 🎓 Demo Ready!

1. Open yopmail tabs before demo
2. Assign complaint in admin dashboard
3. Switch to yopmail tab
4. Refresh - email appears!
5. Show email content

**That's it! Your email system is ready! 🎉**
