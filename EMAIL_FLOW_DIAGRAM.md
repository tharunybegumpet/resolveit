# 📧 Email Flow - Complete Diagram

## Scenario: Admin Assigns Complaint to Staff

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Action                                           │
│  Admin Dashboard → Click "Assign" → Select Staff → Click Assign │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Backend Processing                                     │
│  ComplaintController.assignComplaint() called                   │
│  - Save assignment to database                                  │
│  - complaint.setAssignedTo(staffMember)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: Email Service Called (AUTOMATIC)                       │
│  emailService.sendAssignmentNotification(complaint, staff)      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├──────────────────┬──────────────────────┐
                         ▼                  ▼                      ▼
              ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
              │  Email #1        │  │  Email #2        │  │  Console Log     │
              │  TO: Staff       │  │  TO: User        │  │  ✅ Sent to both │
              └────────┬─────────┘  └────────┬─────────┘  └──────────────────┘
                       │                     │
                       ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐
              │  Gmail SMTP      │  │  Gmail SMTP      │
              │  Sends email     │  │  Sends email     │
              └────────┬─────────┘  └────────┬─────────┘
                       │                     │
                       ▼                     ▼
              ┌──────────────────┐  ┌──────────────────┐
              │  staff1@yopmail  │  │  user1@yopmail   │
              │  📬 Inbox        │  │  📬 Inbox        │
              └──────────────────┘  └──────────────────┘
```

---

## Email #1: To Staff Member

**TO:** staff1@yopmail.com  
**FROM:** tharuny.begumpet@gmail.com  
**SUBJECT:** New Complaint Assigned - ResolveIT

```
Hello John Doe,

A new complaint has been assigned to you.

Complaint ID: 5
Title: Broken AC in Room 101
Category: Maintenance

Please login to your dashboard to view and handle this complaint.
Dashboard: http://localhost:3000/staff

Regards,
ResolveIT Support Team
```

---

## Email #2: To User (Complaint Creator)

**TO:** user1@yopmail.com  
**FROM:** tharuny.begumpet@gmail.com  
**SUBJECT:** Your Complaint Has Been Assigned - ResolveIT

```
Hello Jane Smith,

Your complaint has been assigned to our staff member for resolution.

Complaint ID: 5
Title: Broken AC in Room 101
Assigned to: John Doe

You will receive updates as your complaint is being processed.

Regards,
ResolveIT Support Team
```

---

## Backend Console Output

```
🔄 Assigning complaint ID: 5 to staff ID: 3
✅ Complaint assigned successfully
📧 Sending assignment notifications...
✅ Assignment email sent to staff: staff1@yopmail.com
✅ Assignment notification sent to user: user1@yopmail.com
```

---

## Code Flow

### 1. ComplaintController.java (Line ~380)
```java
@PutMapping("/{id}/assign")
public ResponseEntity<?> assignComplaint(...) {
    // ... assignment logic ...
    
    complaint.setAssignedTo(staffMember);
    complaint = complaintRepository.save(complaint);
    
    // 📧 SEND EMAIL NOTIFICATIONS (to staff and user)
    System.out.println("📧 Sending assignment notifications...");
    emailService.sendAssignmentNotification(complaint, staffMember);
    
    return ResponseEntity.ok(...);
}
```

### 2. EmailService.java (Line ~42)
```java
public void sendAssignmentNotification(Complaint complaint, User staff) {
    try {
        // Email to staff member
        SimpleMailMessage staffMessage = new SimpleMailMessage();
        staffMessage.setFrom("tharuny.begumpet@gmail.com");
        staffMessage.setTo(staff.getEmail());
        staffMessage.setSubject("New Complaint Assigned - ResolveIT");
        staffMessage.setText("Hello " + staff.getFullName() + "...");
        
        mailSender.send(staffMessage);
        System.out.println("✅ Assignment email sent to staff: " + staff.getEmail());
        
        // Email to user (if not anonymous)
        if (!complaint.isAnonymous() && complaint.getUser() != null) {
            SimpleMailMessage userMessage = new SimpleMailMessage();
            userMessage.setFrom("tharuny.begumpet@gmail.com");
            userMessage.setTo(complaint.getUser().getEmail());
            userMessage.setSubject("Your Complaint Has Been Assigned - ResolveIT");
            userMessage.setText("Hello " + complaint.getUser().getFullName() + "...");
            
            mailSender.send(userMessage);
            System.out.println("✅ Assignment notification sent to user: " + complaint.getUser().getEmail());
        }
    } catch (Exception e) {
        System.err.println("❌ Failed to send assignment email: " + e.getMessage());
    }
}
```

---

## Testing

### Step 1: Setup
1. Add Gmail app password to `application.properties`
2. Restart backend: `mvn spring-boot:run`

### Step 2: Create Test Accounts
Make sure you have:
- Admin: tharuny.begumpet@gmail.com
- Staff: staff1@yopmail.com (or any staff account)
- User: user1@yopmail.com

### Step 3: Test Assignment
1. Login as admin
2. Go to Admin Dashboard
3. Find an open complaint
4. Click "Assign"
5. Select a staff member
6. Click "Assign" button

### Step 4: Check Emails
1. Open: https://yopmail.com/en/?login=staff1
   - Should see: "New Complaint Assigned - ResolveIT"
   
2. Open: https://yopmail.com/en/?login=user1
   - Should see: "Your Complaint Has Been Assigned - ResolveIT"

### Step 5: Verify Backend Logs
Check backend console for:
```
📧 Sending assignment notifications...
✅ Assignment email sent to staff: staff1@yopmail.com
✅ Assignment notification sent to user: user1@yopmail.com
```

---

## Summary

✅ **Staff Email:** Sent automatically when complaint assigned  
✅ **User Email:** Sent automatically when complaint assigned  
✅ **Both emails:** Sent in single method call  
✅ **No manual action:** Completely automatic  
✅ **From:** tharuny.begumpet@gmail.com  
✅ **To:** Yopmail accounts (staff + user)  

**BOTH EMAILS ARE ALREADY WORKING!** 🎉
