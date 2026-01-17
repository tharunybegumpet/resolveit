# Presentation Troubleshooting Guide

## Issue: Escalation Not Working During Presentation

### Common Causes & Solutions

#### 1. Backend Not Running ⚠️
**Symptom:** "Network Error" or "Failed to fetch" when trying to escalate

**Solution:**
```bash
cd resolveit-backend
mvn spring-boot:run
```
Wait 30-40 seconds for "Started ResolveItApplication" message

#### 2. Not Logged In as Correct Role
**Symptom:** Escalation button not visible or disabled

**Requirements:**
- Only STAFF or ADMIN can escalate complaints
- USER role cannot escalate

**Test Accounts:**
- Admin: `admin@yopmail.com` / `admin123`
- Staff: `user3@yopmail.com` / `password123`

#### 3. Manager Not Showing in Dropdown
**Symptom:** Manager option not appearing in "Select Authority" dropdown

**Verification:**
```sql
-- Check if manager exists
SELECT * FROM users WHERE role = 'MANAGER';
```

**Expected Result:**
- Email: `manager@yopmail.com`
- Password: `manager123`
- Role: MANAGER

**Code Fix (Already Applied):**
File: `EscalationController.java` - Line 60-75
```java
// Get all manager and admin users
List<Map<String, Object>> authorities = userRepository.findAll().stream()
    .filter(user -> user.getRole() == User.Role.MANAGER || user.getRole() == User.Role.ADMIN)
    .map(user -> {
        Map<String, Object> authorityMap = new HashMap<>();
        authorityMap.put("id", user.getId());
        authorityMap.put("name", user.getFullName());
        authorityMap.put("email", user.getEmail());
        authorityMap.put("role", user.getRole().name());
        return authorityMap;
    })
    .collect(Collectors.toList());
```

#### 4. Complaint Already Escalated
**Symptom:** Error message "Complaint is already escalated"

**Solution:**
- Each complaint can only have ONE active escalation at a time
- Resolve the existing escalation first, or choose a different complaint

#### 5. Browser Cache Issues
**Symptom:** Old data showing, buttons not responding

**Solution:**
```
1. Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
2. Clear browser cache
3. Close and reopen browser
```

---

## Email Service Code Explanation

### Overview
The EmailService uses Spring Boot's JavaMailSender to send automatic email notifications from the admin Gmail account to yopmail accounts.

### Configuration (application.properties)
```properties
# Gmail SMTP Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tharuny.begumpet@gmail.com
spring.mail.password=admin123
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Key Components

#### 1. JavaMailSender (Spring Framework)
```java
@Autowired
private JavaMailSender mailSender;
```
- Provided by Spring Boot Mail Starter
- Handles SMTP connection to Gmail
- Manages email sending operations

#### 2. SimpleMailMessage (Email Template)
```java
SimpleMailMessage message = new SimpleMailMessage();
message.setFrom("tharuny.begumpet@gmail.com");
message.setTo(toEmail);
message.setSubject("Subject Here");
message.setText("Email body here");
mailSender.send(message);
```

### Email Methods Explained

#### Method 1: sendComplaintStatusMail()
**Purpose:** Notify user when complaint status changes

**Trigger:** When admin or staff updates complaint status

**Code Flow:**
```java
public void sendComplaintStatusMail(String toEmail, String complaintTitle, String status) {
    // 1. Create email message
    SimpleMailMessage message = new SimpleMailMessage();
    
    // 2. Set sender (admin Gmail)
    message.setFrom("tharuny.begumpet@gmail.com");
    
    // 3. Set recipient (user's yopmail)
    message.setTo(toEmail);
    
    // 4. Set subject
    message.setSubject("Complaint Status Updated - ResolveIT");
    
    // 5. Set email body with complaint details
    message.setText("Hello,\n\n" +
        "The status of your complaint has been updated.\n\n" +
        "Complaint: " + complaintTitle + "\n" +
        "Current Status: " + status + "\n\n" +
        "You can track your complaint at: http://localhost:3000/track\n\n" +
        "Regards,\n" +
        "ResolveIT Support Team");
    
    // 6. Send email via Gmail SMTP
    mailSender.send(message);
    
    // 7. Log success
    System.out.println("✅ Status update email sent to: " + toEmail);
}
```

**Integration in ComplaintController:**
```java
// Line 265 - When status is updated
emailService.sendComplaintStatusMail(
    complaint.getUser().getEmail(),
    complaint.getTitle(),
    statusCode
);
```

#### Method 2: sendAssignmentNotification()
**Purpose:** Notify staff AND user when complaint is assigned

**Trigger:** When admin assigns complaint to staff member

**Code Flow:**
```java
public void sendAssignmentNotification(Complaint complaint, User staff) {
    // EMAIL 1: To Staff Member
    SimpleMailMessage staffMessage = new SimpleMailMessage();
    staffMessage.setFrom("tharuny.begumpet@gmail.com");
    staffMessage.setTo(staff.getEmail());
    staffMessage.setSubject("New Complaint Assigned - ResolveIT");
    staffMessage.setText("Hello " + staff.getFullName() + ",\n\n" +
        "A new complaint has been assigned to you.\n\n" +
        "Complaint ID: " + complaint.getId() + "\n" +
        "Title: " + complaint.getTitle() + "\n" +
        "Category: " + complaint.getCategory() + "\n\n" +
        "Please login to your dashboard to view and handle this complaint.\n" +
        "Dashboard: http://localhost:3000/staff\n\n" +
        "Regards,\n" +
        "ResolveIT Support Team");
    
    mailSender.send(staffMessage);
    
    // EMAIL 2: To User (if not anonymous)
    if (!complaint.isAnonymous() && complaint.getUser() != null) {
        SimpleMailMessage userMessage = new SimpleMailMessage();
        userMessage.setFrom("tharuny.begumpet@gmail.com");
        userMessage.setTo(complaint.getUser().getEmail());
        userMessage.setSubject("Your Complaint Has Been Assigned - ResolveIT");
        userMessage.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
            "Your complaint has been assigned to our staff member for resolution.\n\n" +
            "Complaint ID: " + complaint.getId() + "\n" +
            "Title: " + complaint.getTitle() + "\n" +
            "Assigned to: " + staff.getFullName() + "\n\n" +
            "You will receive updates as your complaint is being processed.\n\n" +
            "Regards,\n" +
            "ResolveIT Support Team");
        
        mailSender.send(userMessage);
    }
}
```

**Integration in ComplaintController:**
```java
// Line 485 - When complaint is assigned
emailService.sendAssignmentNotification(complaint, staffMember);
```

#### Method 3: sendEscalationNotification()
**Purpose:** Notify manager, staff, AND user when complaint is escalated

**Trigger:** When staff/admin escalates complaint to manager

**Code Flow:**
```java
public void sendEscalationNotification(Complaint complaint, User manager, String reason) {
    // EMAIL 1: To Manager
    SimpleMailMessage managerMessage = new SimpleMailMessage();
    managerMessage.setFrom("tharuny.begumpet@gmail.com");
    managerMessage.setTo(manager.getEmail());
    managerMessage.setSubject("Complaint Escalated - Requires Attention - ResolveIT");
    managerMessage.setText("Hello " + manager.getFullName() + ",\n\n" +
        "A complaint has been escalated to you for resolution.\n\n" +
        "Complaint ID: " + complaint.getId() + "\n" +
        "Title: " + complaint.getTitle() + "\n" +
        "Category: " + complaint.getCategory() + "\n" +
        "Escalation Reason: " + reason + "\n\n" +
        "This complaint requires your immediate attention.\n" +
        "Dashboard: http://localhost:3000/manager\n\n" +
        "Regards,\n" +
        "ResolveIT Support Team");
    
    mailSender.send(managerMessage);
    
    // EMAIL 2: To Assigned Staff (if exists)
    if (complaint.getAssignedTo() != null) {
        SimpleMailMessage staffMessage = new SimpleMailMessage();
        staffMessage.setFrom("tharuny.begumpet@gmail.com");
        staffMessage.setTo(complaint.getAssignedTo().getEmail());
        staffMessage.setSubject("Complaint Escalated to Manager - ResolveIT");
        staffMessage.setText("Hello " + complaint.getAssignedTo().getFullName() + ",\n\n" +
            "The complaint assigned to you has been escalated to manager.\n\n" +
            "Complaint ID: " + complaint.getId() + "\n" +
            "Title: " + complaint.getTitle() + "\n" +
            "Escalated to: " + manager.getFullName() + "\n" +
            "Reason: " + reason + "\n\n" +
            "Regards,\n" +
            "ResolveIT Support Team");
        
        mailSender.send(staffMessage);
    }
    
    // EMAIL 3: To User (if not anonymous)
    if (!complaint.isAnonymous() && complaint.getUser() != null) {
        SimpleMailMessage userMessage = new SimpleMailMessage();
        userMessage.setFrom("tharuny.begumpet@gmail.com");
        userMessage.setTo(complaint.getUser().getEmail());
        userMessage.setSubject("Your Complaint Has Been Escalated - ResolveIT");
        userMessage.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
            "Your complaint has been escalated to our manager for priority resolution.\n\n" +
            "Complaint ID: " + complaint.getId() + "\n" +
            "Title: " + complaint.getTitle() + "\n" +
            "Escalated to: " + manager.getFullName() + "\n\n" +
            "We are working to resolve your issue as quickly as possible.\n\n" +
            "Regards,\n" +
            "ResolveIT Support Team");
        
        mailSender.send(userMessage);
    }
}
```

**Integration in EscalationService:**
```java
// Line 95 - Manual escalation
emailService.sendEscalationNotification(complaint, escalatedTo, reason);

// Line 185 - Auto escalation
emailService.sendEscalationNotification(
    complaint, 
    escalatedTo, 
    "Automatically escalated due to " + AUTO_ESCALATION_DAYS + " days without resolution"
);
```

#### Method 4: sendResolutionNotification()
**Purpose:** Notify user when complaint is resolved

**Trigger:** When complaint status is set to RESOLVED or CLOSED

**Code Flow:**
```java
public void sendResolutionNotification(Complaint complaint) {
    if (!complaint.isAnonymous() && complaint.getUser() != null) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("tharuny.begumpet@gmail.com");
        message.setTo(complaint.getUser().getEmail());
        message.setSubject("Complaint Resolved - ResolveIT");
        message.setText("Hello " + complaint.getUser().getFullName() + ",\n\n" +
            "Great news! Your complaint has been resolved.\n\n" +
            "Complaint ID: " + complaint.getId() + "\n" +
            "Title: " + complaint.getTitle() + "\n" +
            "Status: Resolved\n\n" +
            "Thank you for using ResolveIT. If you have any further concerns, please don't hesitate to submit a new complaint.\n\n" +
            "Regards,\n" +
            "ResolveIT Support Team");
        
        mailSender.send(message);
    }
}
```

**Integration in ComplaintController:**
```java
// Line 210 - When complaint is resolved
emailService.sendResolutionNotification(complaint);

// Line 270 - When status updated to RESOLVED/CLOSED
emailService.sendResolutionNotification(complaint);
```

---

## How Email System Works (Step-by-Step)

### Example: Complaint Assignment Flow

1. **Admin Action:** Admin clicks "Assign" button and selects staff member
2. **Frontend:** Sends POST request to `/api/complaints/{id}/assign`
3. **Backend (ComplaintController):**
   ```java
   // Line 485
   emailService.sendAssignmentNotification(complaint, staffMember);
   ```
4. **EmailService:**
   - Creates 2 email messages (staff + user)
   - Connects to Gmail SMTP server
   - Sends emails from `tharuny.begumpet@gmail.com`
5. **Gmail SMTP:** Delivers emails to yopmail accounts
6. **Recipients:** Staff and user receive emails instantly

### Example: Escalation Flow

1. **Staff/Admin Action:** Clicks "Escalate" button, selects manager, adds reason
2. **Frontend:** Sends POST request to `/api/escalations/escalate`
3. **Backend (EscalationService):**
   ```java
   // Line 95
   emailService.sendEscalationNotification(complaint, escalatedTo, reason);
   ```
4. **EmailService:**
   - Creates 3 email messages (manager + staff + user)
   - Sends all emails via Gmail SMTP
5. **Recipients:** Manager, staff, and user all receive notification emails

---

## Key Technologies Used

### 1. Spring Boot Mail Starter
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### 2. Gmail SMTP Server
- Host: `smtp.gmail.com`
- Port: `587` (TLS)
- Authentication: Required
- Credentials: Admin Gmail account

### 3. JavaMailSender Interface
- Spring's abstraction for sending emails
- Handles connection pooling
- Manages SMTP session

### 4. SimpleMailMessage Class
- Plain text email template
- Fields: from, to, subject, text
- No HTML support (keeps it simple)

---

## Automatic Email Triggers Summary

| Action | Trigger Point | Recipients | Email Method |
|--------|--------------|------------|--------------|
| **Complaint Assignment** | Admin assigns to staff | Staff + User | `sendAssignmentNotification()` |
| **Status Update** | Admin/Staff changes status | User | `sendComplaintStatusMail()` |
| **Complaint Resolution** | Status set to RESOLVED/CLOSED | User | `sendResolutionNotification()` |
| **Manual Escalation** | Staff/Admin escalates | Manager + Staff + User | `sendEscalationNotification()` |
| **Auto Escalation** | 3 days without resolution | Manager + Staff + User | `sendEscalationNotification()` |

---

## Testing Email System

### 1. Check Backend Logs
Look for these messages:
```
✅ Status update email sent to: user@yopmail.com
✅ Assignment email sent to staff: staff@yopmail.com
✅ Escalation email sent to manager: manager@yopmail.com
```

### 2. Check Yopmail Inbox
1. Go to https://yopmail.com
2. Enter email address (e.g., `user1@yopmail.com`)
3. Click "Check Inbox"
4. Look for emails from `tharuny.begumpet@gmail.com`

### 3. Verify Email Content
- Subject line matches action
- Complaint details included
- Links to dashboard work
- Professional formatting

---

## Common Email Issues

### Issue: Emails Not Sending
**Causes:**
1. Backend not running
2. Gmail credentials incorrect
3. Internet connection down
4. Gmail "Less secure apps" disabled

**Solution:**
```properties
# Verify in application.properties
spring.mail.username=tharuny.begumpet@gmail.com
spring.mail.password=admin123
```

### Issue: Emails Going to Spam
**Solution:**
- Check yopmail spam folder
- Gmail SMTP is trusted, should not go to spam

### Issue: Delayed Email Delivery
**Normal:** Emails typically arrive within 1-5 seconds
**If delayed:** Check internet connection and Gmail server status

---

## Presentation Tips

### Before Demo:
1. ✅ Start backend (wait for "Started" message)
2. ✅ Start frontend
3. ✅ Open yopmail.com in separate tab
4. ✅ Test one email to verify system working

### During Demo:
1. Perform action (assign, escalate, resolve)
2. Show backend logs (email sent confirmation)
3. Switch to yopmail tab
4. Refresh inbox
5. Show received email with details

### If Email Fails During Demo:
1. Show backend logs proving email was sent
2. Explain Gmail SMTP is reliable
3. Show code implementation
4. Move on to next feature

---

## Code Files Reference

### Email Service Implementation
- **File:** `resolveit-backend/src/main/java/com/resolveit/service/EmailService.java`
- **Lines:** 1-200
- **Methods:** 4 email notification methods

### Email Integration Points
- **ComplaintController.java**
  - Line 210: Resolution notification
  - Line 265: Status update notification
  - Line 270: Resolution notification (status change)
  - Line 485: Assignment notification

- **EscalationService.java**
  - Line 95: Manual escalation notification
  - Line 185: Auto escalation notification

### Configuration
- **File:** `resolveit-backend/src/main/resources/application.properties`
- **Lines:** Gmail SMTP configuration

---

## Success Indicators

✅ Backend logs show "✅ Email sent to..."
✅ No error messages in console
✅ Yopmail inbox receives emails within 5 seconds
✅ Email content matches action performed
✅ All recipients receive their respective emails

---

## Emergency Backup Plan

If emails completely fail during presentation:

1. **Show the Code:**
   - Open EmailService.java
   - Explain the implementation
   - Show integration points

2. **Show Backend Logs:**
   - Demonstrate email sending attempts
   - Show success messages

3. **Explain the Flow:**
   - Use this document as reference
   - Walk through the step-by-step process

4. **Show Configuration:**
   - Display application.properties
   - Explain Gmail SMTP setup

The system is fully implemented and working - technical issues during demo don't diminish the achievement!
