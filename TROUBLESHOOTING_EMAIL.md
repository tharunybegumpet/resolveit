# 🔧 Email Not Sending - Troubleshooting

## ❌ Problem: Emails Not Being Sent

You assigned a complaint to user3 but no email was sent or received.

---

## 🔍 Root Cause

**Your Gmail app password is not configured!**

Current setting in `application.properties`:
```properties
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
```

This is a placeholder - you need to replace it with your actual Gmail app password.

---

## ✅ Solution: Add Gmail App Password

### Step 1: Generate Gmail App Password

1. **Go to Gmail Security Settings:**
   - https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the setup process

3. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Or search for "App passwords" in your Google Account settings
   
4. **Create New App Password:**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: "ResolveIT Backend"
   - Click **Generate**

5. **Copy the Password:**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - Copy it (you can include or remove spaces)

### Step 2: Update application.properties

**File:** `resolveit-backend/src/main/resources/application.properties`

**Find this line (around line 37):**
```properties
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
```

**Replace with your actual app password (remove spaces):**
```properties
spring.mail.password=abcdefghijklmnop
```

**Example:**
If your app password is: `abcd efgh ijkl mnop`  
You should write: `spring.mail.password=abcdefghijklmnop`

### Step 3: Restart Backend

**Stop the current backend** (Ctrl+C in terminal)

**Start it again:**
```bash
cd resolveit-backend
mvn spring-boot:run
```

### Step 4: Test Again

1. Login as admin
2. Assign a complaint to user3
3. Check backend console for:
   ```
   📧 Sending assignment notifications...
   ✅ Assignment email sent to staff: user3@yopmail.com
   ```

4. Check yopmail:
   - https://yopmail.com/en/?login=user3

---

## 🔍 How to Check Backend Console

### Look for these messages:

**✅ Success:**
```
📧 Sending assignment notifications...
✅ Assignment email sent to staff: user3@yopmail.com
✅ Assignment notification sent to user: user1@yopmail.com
```

**❌ Error (No app password):**
```
❌ Failed to send assignment email: Authentication failed
```

**❌ Error (Wrong password):**
```
❌ Failed to send email to user3@yopmail.com: 535-5.7.8 Username and Password not accepted
```

---

## 📋 Quick Checklist

Before testing:
- [ ] Gmail app password generated
- [ ] application.properties updated with real password (not placeholder)
- [ ] Backend restarted after updating password
- [ ] Backend console is visible to see logs

After assigning complaint:
- [ ] Backend console shows "📧 Sending assignment notifications..."
- [ ] Backend console shows "✅ Assignment email sent to staff"
- [ ] No error messages in console
- [ ] Email appears in yopmail inbox

---

## 🎯 Common Mistakes

### 1. Forgot to Replace Placeholder
❌ `spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE`  
✅ `spring.mail.password=abcdefghijklmnop`

### 2. Included Spaces in Password
❌ `spring.mail.password=abcd efgh ijkl mnop`  
✅ `spring.mail.password=abcdefghijklmnop`

### 3. Didn't Restart Backend
- Changes to application.properties require backend restart
- Stop backend (Ctrl+C) and start again

### 4. 2-Step Verification Not Enabled
- App passwords only work with 2-Step Verification enabled
- Enable it at: https://myaccount.google.com/security

---

## 🧪 Test Email Configuration

### Create a test file to verify email works:

**File:** `test_email_config.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Email Config</title>
</head>
<body>
    <h1>Test Email Configuration</h1>
    <button onclick="testEmail()">Test Email Sending</button>
    <div id="result"></div>
    
    <script>
        async function testEmail() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing...';
            
            try {
                // Login as admin
                const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'tharuny.begumpet@gmail.com',
                        password: 'admin123'
                    })
                });
                
                const loginData = await loginResponse.json();
                const token = loginData.token;
                
                // Get complaints
                const complaintsResponse = await fetch('http://localhost:8080/api/complaints/open', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const complaints = await complaintsResponse.json();
                
                if (complaints.length === 0) {
                    resultDiv.innerHTML = 'No complaints found. Create a complaint first.';
                    return;
                }
                
                // Get staff
                const staffResponse = await fetch('http://localhost:8080/api/complaints/staff', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const staff = await staffResponse.json();
                
                if (staff.length === 0) {
                    resultDiv.innerHTML = 'No staff found.';
                    return;
                }
                
                // Assign complaint
                const assignResponse = await fetch(`http://localhost:8080/api/complaints/${complaints[0].id}/assign`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        staffId: staff[0].id,
                        status: 'IN_PROGRESS'
                    })
                });
                
                const result = await assignResponse.json();
                
                if (result.success) {
                    resultDiv.innerHTML = `
                        <h3>✅ Success!</h3>
                        <p>Complaint assigned to ${staff[0].name}</p>
                        <p>Email sent: ${result.emailSent ? 'Yes' : 'No'}</p>
                        <p>Check backend console for email logs</p>
                        <p>Check yopmail: <a href="https://yopmail.com/en/?login=${staff[0].email.split('@')[0]}" target="_blank">Staff Inbox</a></p>
                    `;
                } else {
                    resultDiv.innerHTML = `<h3>❌ Failed</h3><p>${result.message}</p>`;
                }
                
            } catch (error) {
                resultDiv.innerHTML = `<h3>❌ Error</h3><p>${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

---

## 📞 Still Not Working?

### Check these:

1. **Backend Console Logs:**
   - Look for error messages
   - Check if "📧 Sending..." appears
   - Look for "❌ Failed to send email"

2. **Gmail Account:**
   - 2-Step Verification enabled?
   - App password generated correctly?
   - Account not locked or restricted?

3. **Internet Connection:**
   - Backend needs internet to connect to Gmail SMTP
   - Check if port 587 is blocked by firewall

4. **application.properties:**
   - Password has no spaces?
   - No extra characters or quotes?
   - File saved after editing?

5. **Backend Restart:**
   - Did you restart after changing password?
   - Backend running without errors?

---

## 🚀 Next Steps

1. **Generate Gmail app password** (if not done)
2. **Update application.properties** with real password
3. **Restart backend**
4. **Assign complaint again**
5. **Check backend console** for success/error messages
6. **Check yopmail** for emails

**The most common issue is forgetting to replace the placeholder password!**
