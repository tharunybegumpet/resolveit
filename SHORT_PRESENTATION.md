# ResolveIT - Short Presentation (10 Slides)

---

## **Slide 1: Title**
**ResolveIT - Complaint Management System**
*Full-Stack Web Application*

**By:** [Your Name]
**Tech Stack:** Spring Boot + React + MySQL

---

## **Slide 2: Problem & Solution**
**Problem:**
• Manual complaint tracking
• No automated escalation
• Poor communication

**Solution:**
• Web-based complaint management
• Automated workflows
• Real-time notifications

---

## **Slide 3: Key Features**
• **Multi-role system** (User, Staff, Admin, Manager)
• **File upload** with admin-only restrictions
• **Email notifications** for all actions
• **Auto-escalation** based on time
• **Reports & analytics** with CSV/PDF export

---

## **Slide 4: Technology Stack**
**Frontend:** React.js + Bootstrap
**Backend:** Spring Boot + JWT Auth
**Database:** MySQL + JPA/Hibernate
**Email:** Gmail SMTP Integration
**Tools:** Maven, Git, Postman

---

## **Slide 5: System Architecture**
```
React Frontend ←→ Spring Boot API ←→ MySQL Database
     ↓                   ↓                  ↓
User Interface    Business Logic     Data Storage
     ↓                   ↓                  ↓
Authentication    Email Service     File Storage
```

---

## **Slide 6: Core Implementation**
**JWT Authentication:**
```java
public String generateToken(UserDetails userDetails) {
    return Jwts.builder()
        .setSubject(userDetails.getUsername())
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
        .signWith(getSignInKey(), SignatureAlgorithm.HS256)
        .compact();
}
```

**Email Service:**
```java
public void sendComplaintStatusMail(String toEmail, String title, String status) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("Complaint Status Updated");
    message.setText("Complaint: " + title + "\nStatus: " + status);
    mailSender.send(message);
}
```

---

## **Slide 7: Project Timeline**
| Week | Module | Features |
|------|--------|----------|
| 1-2 | Authentication | Login, JWT, Registration |
| 3-4 | Complaint System | Submit, Track, Assign |
| 5 | Admin Dashboard | Management Interface |
| 6-7 | Escalation & Email | Auto-escalation, Notifications |
| 8 | Reports | Analytics, Export |

---

## **Slide 8: Challenges & Solutions**
• **Gmail SMTP configuration** → Multiple app password attempts
• **Database relationships** → Proper foreign key constraints
• **React state management** → Centralized state handling
• **File upload security** → Role-based access validation
• **Development resources** → Spring Boot optimization

---

## **Slide 9: Skills Acquired**
• **Full-stack development** with Spring Boot & React
• **Database design** and relationship management
• **Email service integration** with Gmail SMTP
• **File upload systems** with security validation
• **JWT authentication** and role-based access
• **Git version control** and project management

---

## **Slide 10: Demo & Conclusion**
**Live Demo:**
1. User login & complaint submission
2. Admin dashboard & staff assignment
3. Email notifications
4. Escalation workflow
5. Reports generation

**Conclusion:**
Successfully built a production-ready complaint management system with modern web technologies, automated workflows, and comprehensive user management.

**Thank You - Questions?**