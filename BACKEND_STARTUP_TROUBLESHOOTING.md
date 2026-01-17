# Backend Startup Troubleshooting Guide

## 🔍 **Most Common Issues & Solutions:**

### 1. **MySQL Server Not Running** (Most Likely)
**Check if MySQL is running:**
```bash
# Windows - Check MySQL service
net start mysql
# or
services.msc  # Look for MySQL service

# If MySQL is not running, start it:
net start mysql80  # or mysql57, mysql
```

**Alternative: Start MySQL manually:**
- Open **XAMPP Control Panel**
- Click **Start** next to MySQL
- Or use **MySQL Workbench** → Start Server

### 2. **Database Connection Issues**
**Test database connection:**
```bash
# Try connecting to MySQL
mysql -u root -p
# Enter password: Begumpet.Tharuny@2005

# Check if database exists
SHOW DATABASES;
# If 'resolveit' database doesn't exist:
CREATE DATABASE resolveit;
```

### 3. **Port 8080 Already in Use**
**Check what's using port 8080:**
```bash
netstat -ano | findstr :8080
# If something is using it, kill the process:
taskkill /PID [PID_NUMBER] /F
```

### 4. **Java Version Issues**
**Check Java version:**
```bash
java -version
# Should show Java 17 or higher
```

## 🚀 **Quick Fix Steps:**

### **Step 1: Start MySQL**
```bash
# Option A: Windows Service
net start mysql80

# Option B: XAMPP
# Open XAMPP → Start MySQL

# Option C: MySQL Workbench
# Open Workbench → Start Server Instance
```

### **Step 2: Verify Database**
```sql
-- Connect to MySQL and run:
CREATE DATABASE IF NOT EXISTS resolveit;
USE resolveit;
SHOW TABLES;
```

### **Step 3: Try Starting Backend**
```bash
cd resolveit-backend
mvn clean compile
mvn spring-boot:run
```

### **Step 4: Alternative Startup Methods**
```bash
# Method 1: Maven
mvn spring-boot:run

# Method 2: Java JAR
mvn clean package
java -jar target/resolveit-backend-0.0.1-SNAPSHOT.jar

# Method 3: Your batch file
START_BACKEND.bat
```

## 🔧 **If Still Failing:**

### **Check Logs for Specific Error**
Look for these error patterns:
- `Connection refused` → MySQL not running
- `Access denied` → Wrong password
- `Unknown database` → Database doesn't exist
- `Port already in use` → Port 8080 busy

### **Temporary Database Fix**
If MySQL issues persist, temporarily use H2 (in-memory database):

**Add to application.properties:**
```properties
# Temporary H2 Database (comment out MySQL)
# spring.datasource.url=jdbc:mysql://localhost:3306/resolveit?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
# spring.datasource.username=root
# spring.datasource.password=Begumpet.Tharuny@2005

# H2 Database (temporary)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.h2.console.enabled=true
```

## 📋 **Startup Checklist:**

- [ ] MySQL server is running
- [ ] Database 'resolveit' exists
- [ ] Port 8080 is free
- [ ] Java 17+ is installed
- [ ] Maven dependencies are downloaded
- [ ] No other Spring Boot app running

## 🎯 **For Presentation:**

If backend won't start:
1. **Use H2 database** (temporary fix above)
2. **Show frontend only** (static demo)
3. **Use screenshots** of working features
4. **Explain the issue** ("Database server needs to be running")

## ⚡ **Quick Commands:**

```bash
# Check MySQL status
net start mysql80

# Start backend
cd resolveit-backend
mvn spring-boot:run

# Check if running
curl http://localhost:8080/api/complaints
```

**Most likely fix: Start MySQL server!** 🚀