# 🔐 Manual Admin Creation Guide

## Overview
Since admin and staff registration has been removed from the frontend, admin users must be created manually in the database. This guide provides multiple methods to create admin accounts.

## 🎯 Why Manual Admin Creation?
- **Security**: Prevents unauthorized admin account creation
- **Control**: System administrators have full control over who gets admin access
- **Clean UI**: Users only see user registration option
- **Staff Process**: Staff members are created through the application process (user applies → admin approves)

## 📋 Methods to Create Admin Users

### Method 1: Using MySQL Workbench (RECOMMENDED)

#### Step 1: Open MySQL Workbench
- Connect to your MySQL server (localhost:3306)
- Username: `root`
- Password: `Begumpet.Tharuny@2005`
- Database: `resolveit`

#### Step 2: Execute Admin Creation SQL
```sql
-- Create admin user with hashed password
INSERT INTO users (full_name, username, email, password_hash, role) 
VALUES (
    'System Administrator',
    'admin',
    'admin@resolveit.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'ADMIN'
);

-- Verify the admin was created
SELECT id, full_name, username, email, role FROM users WHERE role = 'ADMIN';
```

#### Step 3: Test Login
- Go to http://localhost:3000/login
- Email: `admin@resolveit.com`
- Password: `admin123`

### Method 2: Using Database Reset API + Manual Insert

#### Step 1: Reset Database (if needed)
```bash
# Call the reset API
curl -X GET http://localhost:8080/api/database/reset
```

#### Step 2: Insert Admin User
```sql
INSERT INTO users (full_name, username, email, password_hash, role) 
VALUES (
    'Main Administrator',
    'mainadmin',
    'mainadmin@resolveit.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'ADMIN'
);
```

### Method 3: Create Multiple Admin Users

```sql
-- Create multiple admin users at once
INSERT INTO users (full_name, username, email, password_hash, role) VALUES
('System Administrator', 'admin', 'admin@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('John Admin', 'johnadmin', 'john.admin@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Jane Manager', 'janemanager', 'jane.manager@resolveit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Verify all admins were created
SELECT id, full_name, username, email, role FROM users WHERE role = 'ADMIN';
```

## 🔑 Password Information

### Default Password
- **Password**: `admin123`
- **Hashed**: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`
- **Algorithm**: BCrypt with strength 10

### Creating Custom Passwords
If you want to use a different password, you need to generate a BCrypt hash:

#### Option 1: Online BCrypt Generator
1. Go to https://bcrypt-generator.com/
2. Enter your desired password
3. Use rounds: 10
4. Copy the generated hash
5. Use it in the SQL INSERT statement

#### Option 2: Using Java (if you have development environment)
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "your_password_here";
        String hashedPassword = encoder.encode(password);
        System.out.println("Hashed password: " + hashedPassword);
    }
}
```

## 📊 User Roles in the System

### USER (Default Registration)
- Can submit complaints
- Can track complaint status
- Can apply to become staff
- Access: User Dashboard

### STAFF (Through Application Process)
- Can work on assigned complaints
- Can update complaint status
- Can resolve complaints
- Access: Staff Dashboard
- **Created by**: Admin approval of user applications

### ADMIN (Manual Creation Only)
- Can manage all complaints
- Can assign complaints to staff
- Can review staff applications
- Can approve/reject staff applications
- Can access escalation management
- Access: Admin Dashboard
- **Created by**: Manual database insertion only

## 🚀 Complete Setup Workflow

### 1. Fresh System Setup
```sql
-- Step 1: Reset database (if needed)
-- Use the reset API: GET http://localhost:8080/api/database/reset

-- Step 2: Create initial admin
INSERT INTO users (full_name, username, email, password_hash, role) 
VALUES (
    'System Administrator',
    'admin',
    'admin@resolveit.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN'
);

-- Step 3: Verify setup
SELECT 'Database Setup Complete' as status;
SELECT COUNT(*) as admin_count FROM users WHERE role = 'ADMIN';
SELECT COUNT(*) as total_users FROM users;
```

### 2. Test the Complete Flow
1. **Create Admin** (manual SQL)
2. **Register User** (http://localhost:3000/register)
3. **User Applies for Staff** (User Dashboard → Apply to Become Staff)
4. **Admin Reviews Application** (Admin Dashboard → Review Staff Applications)
5. **Admin Approves** (User becomes STAFF automatically)

## 🔧 Troubleshooting

### Admin Can't Login
```sql
-- Check if admin exists
SELECT * FROM users WHERE email = 'admin@resolveit.com';

-- Check password hash
SELECT password_hash FROM users WHERE email = 'admin@resolveit.com';
-- Should be: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

### Reset Admin Password
```sql
-- Reset admin password to 'admin123'
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@resolveit.com';
```

### Check User Roles
```sql
-- See all users and their roles
SELECT id, full_name, email, role, username FROM users ORDER BY role, id;
```

## 📝 Quick Reference

### Default Admin Credentials
- **Email**: admin@resolveit.com
- **Password**: admin123
- **Role**: ADMIN

### SQL Template for New Admin
```sql
INSERT INTO users (full_name, username, email, password_hash, role) 
VALUES (
    'Your Name Here',
    'yourusername',
    'your.email@domain.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'ADMIN'
);
```

### Verification Query
```sql
SELECT id, full_name, email, role FROM users WHERE role = 'ADMIN';
```

## 🎉 Success Criteria

After creating admin users, you should be able to:
- ✅ Login with admin credentials
- ✅ Access Admin Dashboard
- ✅ See pending staff applications
- ✅ Review and approve/reject applications
- ✅ Manage complaints and assignments
- ✅ Access escalation management

The system is now secure with manual admin creation and automatic staff promotion through the application process!