# 📧 Email Notification System Setup Guide

## Overview
The ResolveIT system sends automatic email notifications from **tharuny.begumpet@gmail.com** to users, staff, and managers when complaint actions occur.

## 🎯 Email Triggers

### 1. **Complaint Assignment**
When admin assigns a complaint to staff:
- ✉️ Email sent to **Staff Member** (assigned person)
- ✉️ Email sent to **User** (complaint creator, if not anonymous)

### 2. **Status Update**
When staff or admin updates complaint status:
- ✉️ Email sent to **User** (complaint creator, if not anonymous)

### 3. **Complaint Resolution**
When complaint is marked as RESOLVED or CLOSED:
- ✉️ Email sent to **User** (complaint creator, if not anonymous)

### 4. **Complaint Escalation** (Future)
When complaint is escalated to manager:
- ✉️ Email sent to **Manager**
- ✉️ Email sent to **Staff** (original assignee)
- ✉️ Email sent to **User** (complaint creator, if not anonymous)

---

## 🔧 Setup Instructions

### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **App passwords**
5. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Type "ResolveIT Backend"
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Update application.properties

Open: `resolveit-backend/src/main/resources/application.properties`

Replace this line:
```properties
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
```

With your actual app password (remove spaces):
```properties
spring.mail.password=xxxxxxxxxxxxxxxx
```

### Step 3: Restart Backend Server

```bash
cd resolveit-backend
mvn spring-boot:run
```

---

## 📬 Test Email Accounts (Yopmail)

All test accounts use **yopmail.com** - a temporary email service where you can check emails without passwords.

| Role | Email | Password | Check Inbox |
|------|-------|----------|-------------|
| **Admin** | tharuny.begumpet@gmail.com | admin123 | Your Gmail |
| **User** | user1@yopmail.com | password123 | https://yopmail.com/en/?login=user1 |
| **Manager** | manager2@yopmail.com | manager123 | https://yopmail.com/en/?login=manager2 |

### How to Check Yopmail Inbox:

1. Go to https://yopmail.com
2. Enter the email username (e.g., `user1` or `manager2`)
3. Click "Check Inbox"
4. No password needed - emails appear instantly!

---

## 🧪 Testing the Email System

### Test 1: Complaint Assignment Email

1. Login as **Admin** (tharuny.begumpet@gmail.com)
2. Go to Admin Dashboard
3. Find an open complaint
4. Click "Assign" and select a staff member
5. **Check emails:**
   - Staff member's yopmail inbox should receive assignment email
   - User's yopmail inbox should receive notification (if not anonymous)

### Test 2: Status Update Email

1. Login as **Staff** (create staff account or use existing)
2. Go to Staff Dashboard
3. Update a complaint status to "IN_PROGRESS"
4. **Check email:**
   - User's yopmail inbox should receive status update email

### Test 3: Resolution Email

1. Login as **Admin** or **Staff**
2. Mark a complaint as "RESOLVED"
3. **Check email:**
   - User's yopmail inbox should receive resolution email

---

## 📋 Current Email Templates

### Assignment Email (to Staff)
```
Subject: New Complaint Assigned - ResolveIT

Hello [Staff Name],

A new complaint has been assigned to you.

Complaint ID: [ID]
Title: [Title]
Category: [Category]

Please login to your dashboard to view and handle this complaint.
Dashboard: http://localhost:3000/staff

Regards,
ResolveIT Support Team
```

### Assignment Email (to User)
```
Subject: Your Complaint Has Been Assigned - ResolveIT

Hello [User Name],

Your complaint has been assigned to our staff member for resolution.

Complaint ID: [ID]
Title: [Title]
Assigned to: [Staff Name]

You will receive updates as your complaint is being processed.

Regards,
ResolveIT Support Team
```

### Status Update Email
```
Subject: Complaint Status Updated - ResolveIT

Hello,

The status of your complaint has been updated.

Complaint: [Title]
Current Status: [Status]

You can track your complaint at: http://localhost:3000/track

Regards,
ResolveIT Support Team
```

### Resolution Email
```
Subject: Complaint Resolved - ResolveIT

Hello [User Name],

Great news! Your complaint has been resolved.

Complaint ID: [ID]
Title: [Title]
Status: Resolved

Thank you for using ResolveIT. If you have any further concerns, 
please don't hesitate to submit a new complaint.

Regards,
ResolveIT Support Team
```

---

## 🔍 Troubleshooting

### Emails Not Sending?

1. **Check Console Logs:**
   - Look for `✅ Email sent to: [email]` (success)
   - Look for `❌ Failed to send email` (error)

2. **Verify Gmail App Password:**
   - Make sure you copied it correctly (no spaces)
   - Try generating a new app password

3. **Check Gmail Settings:**
   - 2-Step Verification must be enabled
   - "Less secure app access" is NOT needed (we use app passwords)

4. **Check Internet Connection:**
   - Backend needs internet to connect to Gmail SMTP

5. **Check application.properties:**
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=tharuny.begumpet@gmail.com
   spring.mail.password=[YOUR_APP_PASSWORD]
   spring.mail.properties.mail.smtp.auth=true
   spring.mail.properties.mail.smtp.starttls.enable=true
   ```

### Emails Going to Spam?

- Check the spam folder in yopmail
- Gmail might mark first few emails as spam
- After a few successful sends, they should go to inbox

---

## 📊 Email Sending Status

The backend logs show email status:

```
📧 Sending assignment notifications...
✅ Assignment email sent to staff: staff1@yopmail.com
✅ Assignment notification sent to user: user1@yopmail.com
```

Or if there's an error:
```
❌ Failed to send email to user1@yopmail.com: Authentication failed
```

---

## 🎓 For Presentation/Demo

1. **Before Demo:**
   - Set up Gmail app password
   - Test sending one email to verify it works
   - Open yopmail tabs for user1 and manager2

2. **During Demo:**
   - Show admin assigning complaint
   - Immediately switch to yopmail tab
   - Refresh to show email received
   - Show email content

3. **Talking Points:**
   - "Emails are sent automatically from admin account"
   - "All stakeholders are notified instantly"
   - "Users can track their complaints via email"
   - "Staff get immediate notification of assignments"

---

## ✅ Checklist

- [ ] Gmail App Password generated
- [ ] application.properties updated with app password
- [ ] Backend restarted
- [ ] Test email sent successfully
- [ ] Yopmail inboxes accessible
- [ ] All email triggers tested

---

## 📞 Support

If emails still don't work:
1. Check backend console for error messages
2. Verify Gmail account settings
3. Try with a different Gmail account
4. Check firewall/antivirus blocking SMTP port 587
