# Manager Role Implementation Guide

## Overview
Added MANAGER role to create a proper escalation hierarchy in the complaint management system.

## Role Hierarchy
```
USER → STAFF → MANAGER → ADMIN
```

- **USER**: Submits complaints
- **STAFF**: Handles assigned complaints
- **MANAGER**: Handles escalated complaints from staff
- **ADMIN**: Overall system management

## Creating a Manager Account

### Method 1: SQL Script
Run the SQL file: `create_manager_user.sql`

```sql
-- This creates a default manager account
Email: manager@resolveit.com
Password: manager123
Role: MANAGER
```

### Method 2: Manual SQL
```sql
INSERT INTO users (full_name, name, username, email, password_hash, role) 
VALUES (
    'Staff Manager',
    'Staff Manager',
    'manager',
    'manager@resolveit.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'MANAGER'
);
```

### Method 3: Promote Existing User
```sql
-- Promote a staff member to manager
UPDATE users 
SET role = 'MANAGER' 
WHERE email = 'staff@example.com';
```

## Manager Dashboard
- Managers use the same dashboard as staff (`/manager` route)
- Can view and handle escalated complaints
- Can escalate further to admin if needed

## Escalation Flow

### Level 1: Staff Assignment
- Admin assigns complaint to staff member
- Staff works on resolving the complaint

### Level 2: Escalate to Manager
- If staff cannot resolve, they escalate to manager
- Manager reviews and attempts resolution
- Manager has more authority and experience

### Level 3: Escalate to Admin
- If manager cannot resolve, escalate to admin
- Admin makes final decision
- Admin can involve external resources

## Login Credentials

### Default Accounts
1. **Admin**
   - Email: tharuny.begumpet@gmail.com
   - Password: admin123
   - Access: Full system control

2. **Manager**
   - Email: manager@resolveit.com
   - Password: manager123
   - Access: Escalated complaints

3. **Staff** (created via application)
   - Apply through user dashboard
   - Admin approves application
   - Access: Assigned complaints

4. **User**
   - Email: user1@yopmail.com
   - Password: password123
   - Access: Submit and track complaints

## Features

### For Managers:
- ✅ View escalated complaints
- ✅ Assign complaints to staff
- ✅ Resolve complaints
- ✅ Escalate to admin if needed
- ✅ Add notes and replies
- ✅ Track resolution metrics

### Escalation Triggers:
- Complaint unresolved for > 7 days
- Staff manually escalates
- High priority complaints
- Customer dissatisfaction
- Complex technical issues

## Testing the Manager Role

1. **Create Manager Account**
   ```sql
   -- Run create_manager_user.sql
   ```

2. **Login as Manager**
   - Go to http://localhost:3000/login
   - Email: manager@resolveit.com
   - Password: manager123

3. **Test Escalation Flow**
   - Login as user, submit complaint
   - Login as admin, assign to staff
   - Login as staff, escalate complaint
   - Login as manager, handle escalated complaint

## Benefits
✅ Clear escalation hierarchy  
✅ Better complaint resolution  
✅ Proper authority levels  
✅ Improved accountability  
✅ Faster resolution for complex issues  
✅ Better resource utilization  

## Database Changes
- Updated User.Role enum to include MANAGER
- No database migration needed (VARCHAR column supports it)
- Existing data remains intact
