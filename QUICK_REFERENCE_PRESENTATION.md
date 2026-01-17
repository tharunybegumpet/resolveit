# Quick Reference - Presentation

## 🚀 Startup Commands

### Backend (Terminal 1)
```bash
cd resolveit-backend
mvn spring-boot:run
```
**Wait for:** "Started ResolveItApplication" (30-40 seconds)

### Frontend (Terminal 2)
```bash
cd resolveit-frontend
npm start
```

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@yopmail.com | admin123 |
| **Manager** | manager@yopmail.com | manager123 |
| **Staff** | user3@yopmail.com | password123 |
| **User** | user1@yopmail.com | password123 |

---

## 📧 Email System - Quick Explanation

### What We Built
Automatic email notifications from admin Gmail to yopmail accounts

### Key Code Components

#### 1. Configuration (application.properties)
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tharuny.begumpet@gmail.com
spring.mail.password=admin123
```

#### 2. Email Service (EmailService.java)
```java
@Autowired
private JavaMailSender mailSender;  // Spring Boot's email sender

public void sendComplaintStatusMail(String toEmail, String title, String status) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom("tharuny.begumpet@gmail.com");  // Admin Gmail
    message.setTo(toEmail);                          // User's yopmail
    message.setSubject("Complaint Status Updated");
    message.setText("Your complaint: " + title + "\nStatus: " + status);
    mailSender.send(message);  // Send via Gmail SMTP
}
```

#### 3. Integration (ComplaintController.java)
```java
// When admin assigns complaint to staff
emailService.sendAssignmentNotification(complaint, staffMember);
// Sends email to BOTH staff AND user automatically

// When status is updated
emailService.sendComplaintStatusMail(user.getEmail(), title, status);
// Sends email to user

// When complaint is resolved
emailService.sendResolutionNotification(complaint);
// Sends email to user
```

#### 4. Escalation (EscalationService.java)
```java
// When complaint is escalated
emailService.sendEscalationNotification(complaint, manager, reason);
// Sends email to manager, staff, AND user (3 emails)
```

### How It Works (Simple Explanation)
1. **User Action:** Admin clicks "Assign" button
2. **Backend:** Calls `emailService.sendAssignmentNotification()`
3. **Email Service:** Creates email message with complaint details
4. **Gmail SMTP:** Sends email from admin Gmail account
5. **Recipient:** Staff and user receive emails at their yopmail accounts
6. **Automatic:** No manual button clicking - happens automatically!

### Technologies Used
- **Spring Boot Mail Starter:** Email sending framework
- **JavaMailSender:** Spring's email interface
- **Gmail SMTP:** Email delivery service
- **SimpleMailMessage:** Email template class

---

## 🎯 Demo Flow

### 1. User Submits Complaint
- Login as user1@yopmail.com
- Submit complaint
- Logout

### 2. Admin Assigns to Staff
- Login as admin@yopmail.com
- View complaint
- Click "Assign" → Select staff
- **Email sent automatically** ✅
- Show yopmail inbox (staff + user received emails)

### 3. Staff Updates Status
- Login as user3@yopmail.com
- Update status to "In Progress"
- **Email sent to user automatically** ✅
- Show yopmail inbox

### 4. Escalate to Manager
- As staff or admin
- Click "Escalate"
- Select manager from dropdown
- Add reason
- Click "Escalate Now"
- **3 emails sent automatically** (manager + staff + user) ✅
- Show yopmail inbox for all 3

### 5. Manager Resolves
- Login as manager@yopmail.com
- View escalated complaint
- Resolve complaint
- **Email sent to user** ✅

### 6. View Reports
- Login as admin
- Click "Reports"
- Generate report
- Export as PDF

---

## ⚠️ Troubleshooting During Presentation

### Escalation Not Working?
**Check:**
1. Backend running? → Look for "Started ResolveItApplication"
2. Logged in as STAFF or ADMIN? → USER cannot escalate
3. Manager in dropdown? → Should show "Manager" option
4. Complaint already escalated? → Try different complaint

**Quick Fix:**
```bash
# Restart backend
cd resolveit-backend
mvn spring-boot:run
```

### Manager Not Showing?
**Verify:**
- Manager account exists: manager@yopmail.com
- Code fixed in EscalationController.java (line 60-75)
- Filter includes MANAGER role: `user.getRole() == User.Role.MANAGER`

### Email Not Sending?
**Check Backend Logs:**
```
✅ Assignment email sent to staff: user3@yopmail.com
✅ Escalation email sent to manager: manager@yopmail.com
```

**If logs show success but email not in yopmail:**
- Refresh yopmail inbox
- Check spam folder
- Wait 5 seconds and refresh again

---

## 💡 Key Points to Highlight

### 1. Automatic Email System
- **No manual buttons** - emails sent automatically on actions
- **Multiple recipients** - escalation sends to 3 people at once
- **Professional emails** - includes complaint details and links

### 2. Role-Based Access
- **USER:** Submit complaints
- **STAFF:** Handle assigned complaints, escalate
- **MANAGER:** Handle escalations
- **ADMIN:** Full system control

### 3. Escalation System
- **Manual:** Staff/Admin can escalate anytime
- **Automatic:** System auto-escalates after 3 days
- **Email notifications:** All parties notified instantly
- **Manager support:** Fixed to show MANAGER in dropdown

### 4. Reports Module
- **Visual dashboards** with statistics
- **Date range filtering**
- **Category breakdown** with charts
- **PDF export** using iText library
- **Full-width layout** for better visibility

### 5. Modern Tech Stack
- **Backend:** Spring Boot, MySQL, JavaMailSender
- **Frontend:** React, Custom CSS (no frameworks)
- **Email:** Gmail SMTP
- **PDF:** iText library

---

## 📝 Email Code Explanation (For Questions)

### "What code did you add for email service?"

**Answer:**
"We created an EmailService class with 4 methods:

1. **sendComplaintStatusMail()** - Notifies user of status changes
2. **sendAssignmentNotification()** - Notifies staff and user when assigned
3. **sendEscalationNotification()** - Notifies manager, staff, and user when escalated
4. **sendResolutionNotification()** - Notifies user when resolved

Each method uses Spring Boot's JavaMailSender to send emails via Gmail SMTP. We integrated these methods into ComplaintController and EscalationService so emails are sent automatically when actions occur - no manual button clicking needed."

### "How does the email system work?"

**Answer:**
"We use Spring Boot Mail Starter with Gmail SMTP. When an action happens (like assigning a complaint), the controller calls the EmailService method. The EmailService creates a SimpleMailMessage with the recipient, subject, and body, then uses JavaMailSender to send it through Gmail's SMTP server. The email goes from our admin Gmail account (tharuny.begumpet@gmail.com) to the user's yopmail account automatically."

### "Why did escalation fail?"

**Answer:**
"The escalation system requires:
1. Backend must be running
2. User must be logged in as STAFF or ADMIN
3. Manager account must exist in database
4. Complaint cannot already be escalated

We fixed the code to include MANAGER role in the authorities dropdown, so now managers appear correctly. The system is working - we just need to ensure backend is running before demo."

---

## 🎬 Presentation Script

### Opening
"We built ResolveIT, a complaint management system with automatic email notifications and role-based access control."

### Email System Demo
"When I assign this complaint to staff, watch what happens - the system automatically sends emails to both the staff member and the user. No manual button clicking. Let me show you the yopmail inbox... there's the email with all the complaint details."

### Escalation Demo
"Now the staff member can escalate this to a manager. When I click escalate and select the manager, the system sends 3 emails automatically - one to the manager, one to the staff, and one to the user. Everyone stays informed."

### Code Explanation
"The email system uses Spring Boot's JavaMailSender with Gmail SMTP. We created an EmailService class with methods for each notification type, then integrated them into our controllers so emails are sent automatically when actions occur."

### Reports Demo
"The reports module provides visual analytics with date filtering, category breakdown, and PDF export using the iText library. The full-width layout makes it easy to see all the data at once."

### Closing
"The system is fully functional with automatic email notifications, role-based access, escalation management, and comprehensive reporting. All features are working and ready for production use."

---

## 🔧 Emergency Backup

### If Demo Fails
1. **Show the code** - Open EmailService.java and explain
2. **Show backend logs** - Prove emails were sent
3. **Show configuration** - Display application.properties
4. **Explain the flow** - Use this document as reference

### Key Files to Show
- `EmailService.java` - Email implementation
- `ComplaintController.java` - Integration points
- `EscalationService.java` - Escalation emails
- `application.properties` - Gmail configuration

---

## ✅ Pre-Presentation Checklist

- [ ] Backend started and showing "Started ResolveItApplication"
- [ ] Frontend started and accessible at localhost:3000
- [ ] Test login with admin account works
- [ ] Manager appears in escalation dropdown
- [ ] Yopmail.com open in separate tab
- [ ] Test one email to verify system working
- [ ] This reference document open for quick lookup
- [ ] Backend logs visible for email confirmations

---

## 🎯 Success Indicators

✅ Backend logs show "✅ Email sent to..."
✅ Yopmail receives emails within 5 seconds
✅ Manager appears in escalation dropdown
✅ All features respond without errors
✅ Reports generate and export successfully

**You've got this! The system is fully working - just ensure backend is running before you start.** 🚀
