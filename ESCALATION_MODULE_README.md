# 🔺 Escalation Module - ResolveIT System

## Overview

The Escalation Module is a comprehensive complaint escalation system that automatically and manually escalates unresolved complaints to higher authorities. This module implements the requirements from **Milestone 4: Weeks 6-7** of the ResolveIT project.

## Features

### ✅ Core Functionality
- **Manual Escalation**: Staff and admins can manually escalate complaints to higher authorities
- **Automatic Escalation**: System automatically escalates complaints that remain unresolved beyond a set time threshold (3 days)
- **Notification System**: Sends notifications to relevant parties when escalations occur
- **Escalation History**: Track complete escalation history for each complaint
- **Authority Management**: Manage and assign escalations to appropriate authorities (Admin users)

### ✅ Key Components

#### Backend Components
1. **Escalation Model** (`Escalation.java`)
   - Tracks escalation records with type, reason, timestamps
   - Links complaints to escalated authorities
   - Supports MANUAL, AUTOMATIC, and PRIORITY escalation types

2. **Escalation Service** (`EscalationService.java`)
   - Core business logic for escalation operations
   - Auto-escalation algorithm for unresolved complaints
   - Notification coordination

3. **Escalation Controller** (`EscalationController.java`)
   - REST API endpoints for escalation management
   - Authentication and authorization handling
   - CRUD operations for escalations

4. **Notification Service** (`NotificationService.java`)
   - Handles all escalation-related notifications
   - Supports email/SMS notifications (logging implementation)
   - Bulk notification capabilities

5. **Scheduled Task Service** (`ScheduledTaskService.java`)
   - Automated daily escalation processes
   - Reminder notifications for pending escalations
   - Configurable scheduling via cron expressions

#### Frontend Components
1. **Escalation Page** (`EscalationPage.js`)
   - Complete escalation management interface
   - Manual escalation form with authority selection
   - View and manage assigned escalations
   - Admin controls for auto-escalation and reminders

2. **Enhanced Admin Dashboard**
   - Quick escalation buttons on complaint cards
   - Integration with escalation workflow
   - Direct navigation to escalation management

#### Database Components
1. **Escalations Table**
   - Stores all escalation records
   - Foreign key relationships to complaints and users
   - Indexes for optimal query performance

## Installation & Setup

### 1. Database Setup
```sql
-- Run the escalation table creation script
mysql -u your_username -p your_database < add_escalation_table.sql
```

### 2. Backend Configuration
The escalation module is automatically configured when you start the Spring Boot application. Key configurations:

- **Auto-escalation threshold**: 3 days (configurable in `EscalationService.java`)
- **Reminder threshold**: 2 days (configurable in `EscalationService.java`)
- **Scheduled tasks**: Daily at 9:00 AM (auto-escalation) and 10:00 AM (reminders)

### 3. Frontend Integration
The escalation routes are automatically available:
- `/escalations` - Main escalation management page (Admin only)
- Admin dashboard includes escalation buttons and navigation

## API Endpoints

### Escalation Management
```
POST   /api/escalations/escalate           - Manually escalate a complaint
GET    /api/escalations/authorities        - Get available authorities for escalation
GET    /api/escalations/my-escalations     - Get escalations assigned to current user
GET    /api/escalations/complaint/{id}/history - Get escalation history for a complaint
PUT    /api/escalations/{id}/resolve       - Resolve an escalation
POST   /api/escalations/auto-escalate      - Trigger auto-escalation process (Admin only)
POST   /api/escalations/send-reminders     - Send escalation reminders (Admin only)
```

### Request/Response Examples

#### Manual Escalation
```json
POST /api/escalations/escalate
{
  "complaintId": 1,
  "escalatedToId": 2,
  "reason": "Complaint requires immediate attention from higher authority"
}

Response:
{
  "success": true,
  "message": "Complaint escalated successfully",
  "escalation": {
    "id": 1,
    "escalationType": "MANUAL",
    "escalationReason": "Complaint requires immediate attention...",
    "createdAt": "2025-01-07T10:30:00",
    "isActive": true,
    "complaint": {...},
    "escalatedBy": {...},
    "escalatedTo": {...}
  }
}
```

## Testing

### 1. Manual Testing
Use the provided test file:
```
Open: test_escalation_module.html
```

This comprehensive test suite includes:
- Authentication testing
- Manual escalation workflow
- Auto-escalation triggers
- Notification testing
- Escalation history viewing
- Resolution workflows

### 2. Test Scenarios

#### Scenario 1: Manual Escalation
1. Login as admin/staff
2. Select an open complaint
3. Choose higher authority
4. Provide escalation reason
5. Submit escalation
6. Verify notifications sent
7. Check escalation appears in target user's dashboard

#### Scenario 2: Auto-Escalation
1. Create complaints with older timestamps
2. Trigger auto-escalation process
3. Verify complaints are escalated to available admins
4. Check notification logs
5. Verify complaint status updated to "ESCALATED"

#### Scenario 3: Escalation Resolution
1. Login as escalated authority
2. View assigned escalations
3. Work on complaint resolution
4. Mark escalation as resolved
5. Verify escalation status updated

## Configuration

### Time Thresholds
Modify in `EscalationService.java`:
```java
private static final int AUTO_ESCALATION_DAYS = 3; // Auto-escalate after 3 days
private static final int REMINDER_DAYS = 2; // Send reminder after 2 days
```

### Scheduled Tasks
Modify in `ScheduledTaskService.java`:
```java
@Scheduled(cron = "0 0 9 * * ?") // 9:00 AM daily
public void autoEscalateUnresolvedComplaints() { ... }

@Scheduled(cron = "0 0 10 * * ?") // 10:00 AM daily  
public void sendEscalationReminders() { ... }
```

### Notification Configuration
Extend `NotificationService.java` to implement actual email/SMS sending:
```java
// TODO: Implement actual email/SMS sending
// emailService.sendEscalationEmail(escalatedTo.getEmail(), complaint, escalation);
```

## Security & Permissions

### Access Control
- **Manual Escalation**: Available to STAFF and ADMIN users
- **Auto-Escalation**: ADMIN only
- **View Escalations**: Users can only view escalations assigned to them
- **Resolve Escalations**: Only the assigned authority can resolve

### Authentication
All escalation endpoints require valid JWT authentication:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Monitoring & Logging

### Application Logs
The module provides comprehensive logging:
```
🔄 Manual escalation requested for complaint ID: 1
✅ Complaint 1 escalated to John Admin successfully
🔔 ESCALATION NOTIFICATION sent to admin@resolveit.com
🤖 Auto-escalation process found 3 eligible complaints
```

### Database Monitoring
Monitor escalation metrics:
```sql
-- Active escalations count
SELECT COUNT(*) FROM escalations WHERE is_active = true;

-- Escalations by type
SELECT escalation_type, COUNT(*) FROM escalations GROUP BY escalation_type;

-- Average escalation resolution time
SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours 
FROM escalations WHERE resolved_at IS NOT NULL;
```

## Troubleshooting

### Common Issues

#### 1. "No admin users available for auto-escalation"
**Solution**: Ensure at least one user has ADMIN role in the database
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@resolveit.com';
```

#### 2. "Complaint is already escalated"
**Solution**: Check for existing active escalations
```sql
SELECT * FROM escalations WHERE complaint_id = 1 AND is_active = true;
```

#### 3. Scheduled tasks not running
**Solution**: Verify `@EnableScheduling` is present in main application class

#### 4. Notifications not working
**Solution**: Check application logs for notification service errors

### Debug Mode
Enable debug logging in `application.properties`:
```properties
logging.level.com.resolveit.service.EscalationService=DEBUG
logging.level.com.resolveit.service.NotificationService=DEBUG
```

## Future Enhancements

### Planned Features
1. **Email Integration**: Implement actual email notifications using Spring Mail
2. **SMS Notifications**: Add SMS capability using Twilio or similar service
3. **Escalation Templates**: Pre-defined escalation reasons and workflows
4. **Priority-based Escalation**: Automatic escalation based on complaint priority
5. **Load Balancing**: Distribute auto-escalations among available authorities
6. **Escalation Analytics**: Dashboard with escalation metrics and trends
7. **Custom Escalation Rules**: Configurable business rules for escalation triggers

### Integration Points
- **Reporting Module**: Escalation metrics in system reports
- **Audit Module**: Track all escalation activities
- **Mobile App**: Push notifications for escalations
- **External Systems**: Integration with ticketing systems

## Support

For issues or questions regarding the escalation module:
1. Check the test suite (`test_escalation_module.html`)
2. Review application logs for error details
3. Verify database schema matches requirements
4. Ensure proper authentication and permissions

## Version History

- **v1.0.0** - Initial escalation module implementation
  - Manual and automatic escalation
  - Notification system
  - Scheduled tasks
  - Complete frontend integration
  - Comprehensive test suite