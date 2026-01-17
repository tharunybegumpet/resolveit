# 🗑️ Database Reset - Complete Guide

## 🎯 OBJECTIVE
Clear all existing data (users, complaints, staff applications) from the ResolveIT database to start fresh with the staff application system.

## ⚠️ WHAT WILL BE DELETED
- **All user accounts** (admin, staff, regular users)
- **All complaints** and their history
- **All staff applications**
- **All escalations**
- **All uploaded files**
- **All complaint status history**

## 📋 RESET METHODS

### Method 1: Manual SQL Execution (RECOMMENDED)

#### Step 1: Open MySQL Workbench or Command Line
- Open MySQL Workbench
- Connect to your local MySQL server (localhost:3306)
- Username: `root`
- Password: `Begumpet.Tharuny@2005`

#### Step 2: Execute Reset Script
Copy and paste this SQL script:

```sql
-- ResolveIT Database Reset Script
USE resolveit;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from tables
DELETE FROM escalations;
DELETE FROM complaint_status_history;
DELETE FROM complaint_files;
DELETE FROM staff_applications;
DELETE FROM complaints;
DELETE FROM users;
DELETE FROM complaint_status;

-- Reset auto-increment counters
ALTER TABLE escalations AUTO_INCREMENT = 1;
ALTER TABLE complaint_status_history AUTO_INCREMENT = 1;
ALTER TABLE complaint_files AUTO_INCREMENT = 1;
ALTER TABLE staff_applications AUTO_INCREMENT = 1;
ALTER TABLE complaints AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE complaint_status AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Re-insert essential complaint status codes
INSERT INTO complaint_status (code, display, description) VALUES
('NEW', 'New', 'Newly submitted complaint'),
('IN_PROGRESS', 'In Progress', 'Complaint is being worked on'),
('RESOLVED', 'Resolved', 'Complaint has been resolved'),
('CLOSED', 'Closed', 'Complaint is closed'),
('ESCALATED', 'Escalated', 'Complaint has been escalated');

-- Verify reset
SELECT 'RESET COMPLETE' as status;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Complaints:', COUNT(*) FROM complaints
UNION ALL
SELECT 'Staff Applications:', COUNT(*) FROM staff_applications
UNION ALL
SELECT 'Status Codes:', COUNT(*) FROM complaint_status;
```

### Method 2: Using HTML Reset Tool
1. Open `execute_database_reset.html` in your browser
2. Click "Copy SQL Script to Clipboard"
3. Paste and execute in MySQL Workbench

## ✅ VERIFICATION

After executing the reset script, you should see:
- **Users**: 0
- **Complaints**: 0  
- **Staff Applications**: 0
- **Status Codes**: 5

## 🚀 AFTER RESET - TESTING WORKFLOW

### 1. Start Services (if not running)
```bash
# Backend
cd resolveit-backend
mvn spring-boot:run

# Frontend  
cd resolveit-frontend
npm start
```

### 2. Test the Complete Staff Application System

#### Step 1: Register New User
1. Go to http://localhost:3000
2. Click "Register"
3. Select "User Registration"
4. Fill form:
   - **Name**: Test User
   - **Email**: user@test.com
   - **Password**: password123

#### Step 2: Apply to Become Staff
1. Login as the user
2. Go to User Dashboard
3. Click "Apply to Become Staff"
4. Fill out qualification form:
   - **Categories**: Select multiple (e.g., Technical Issues, Billing Problems)
   - **Experience**: Select level (e.g., 1-3 years)
   - **Skills**: Enter skills (e.g., Problem-solving, Communication)
   - **Availability**: Select option (e.g., Part-time)
   - **Motivation**: Write motivation paragraph
   - **Previous Experience**: Optional details
5. Submit application

#### Step 3: Register Admin Account
1. Logout from user account
2. Go to registration page
3. Select "Admin Registration"
4. Fill form:
   - **Name**: System Admin
   - **Email**: admin@test.com
   - **Password**: admin123

#### Step 4: Review Staff Application
1. Login as admin
2. Go to Admin Dashboard
3. See "Pending Staff Applications" section
4. Click "Review Details" on the application
5. Review all qualification answers
6. Click "Approve Application" or "Reject Application"
7. Verify user role is updated to STAFF (if approved)

## 🎯 SUCCESS CRITERIA

The reset is successful when:
- ✅ Database shows 0 users, 0 complaints, 0 staff applications
- ✅ Only 5 status codes remain
- ✅ New user registration works
- ✅ Staff application form works
- ✅ Admin can review applications
- ✅ Approve/reject functionality works
- ✅ User role updates correctly

## 📁 FILES CREATED FOR RESET

1. **clear_all_data.sql** - SQL script for database reset
2. **execute_database_reset.html** - HTML tool with copy-paste functionality
3. **database_reset_tool.html** - Interactive web-based reset tool
4. **reset_database.ps1** - PowerShell script (has syntax issues)
5. **DatabaseResetController.java** - Backend API endpoint (has issues)

## 🔧 TROUBLESHOOTING

### If Reset Doesn't Work:
1. Check MySQL connection
2. Ensure you're connected to the correct database (`resolveit`)
3. Run each DELETE statement individually
4. Check for foreign key constraint errors

### If Backend Won't Start:
1. Check port 8080 is not in use
2. Verify MySQL is running
3. Check database connection in application.properties

### If Frontend Won't Start:
1. Check port 3000 is not in use
2. Run `npm install` if needed
3. Check for compilation errors

## 🎉 FINAL RESULT

After successful reset and testing:
- Fresh database with no existing data
- Working staff application system
- Admin can review applications based on qualification answers
- User roles update correctly upon approval
- Complete end-to-end workflow functional

**The system is ready for clean demonstration of the staff application feature!**