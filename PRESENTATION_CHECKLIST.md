# ResolveIT Presentation Checklist

## Before Starting Presentation

### 1. Start Backend (CRITICAL!)
```bash
cd resolveit-backend
mvn spring-boot:run
```
OR double-click: `START_BACKEND.bat`

**Wait for:** "Started ResolveItApplication" message (30-40 seconds)

### 2. Start Frontend
```bash
cd resolveit-frontend
npm start
```

### 3. Verify Services Running
- Backend: http://localhost:8080
- Frontend: http://localhost:3000

---

## Test Accounts

### Admin Account
- Email: `admin@yopmail.com`
- Password: `admin123`
- Can: Assign complaints, escalate, view reports

### Manager Account
- Email: `manager@yopmail.com`
- Password: `manager123`
- Can: Handle escalated complaints

### Staff Account
- Email: `user3@yopmail.com`
- Password: `password123`
- Can: Handle assigned complaints

### User Account
- Email: `user1@yopmail.com`
- Password: `password123`
- Can: Submit complaints

---

## Demo Flow

### 1. User Submits Complaint
- Login as user1
- Submit complaint with category
- Logout

### 2. Admin Assigns to Staff
- Login as admin
- View complaint in dashboard
- Select staff member
- Click "Assign"
- Email sent automatically ✅

### 3. Staff Works on Complaint
- Login as staff (user3)
- View assigned complaint
- Update status to "In Progress"
- Add notes

### 4. Escalate to Manager
- As staff or admin
- Click "Escalate" button
- Select manager from dropdown
- Add reason
- Click "Escalate Now"
- Email sent to manager ✅

### 5. Manager Handles Escalation
- Login as manager
- View escalated complaints
- Resolve or reassign

### 6. View Reports
- Login as admin
- Click "Reports" button
- Select date range
- Generate report
- Export as CSV or PDF

---

## Common Issues & Quick Fixes

### Backend Not Running
**Symptom:** "Network Error" or "Failed to load"
**Fix:** 
```bash
cd resolveit-backend
mvn spring-boot:run
```
Wait 30-40 seconds

### Escalation Not Working
**Check:**
1. Backend running? ✓
2. Manager exists in database? ✓
3. Logged in as STAFF or ADMIN? ✓

**Quick Fix:**
```sql
-- Verify manager exists
SELECT * FROM users WHERE role = 'MANAGER';
```

### Email Not Sending
**Check:**
- Gmail credentials in `application.properties`
- Internet connection
- Gmail "Less secure apps" enabled

### PDF Export Not Working
**Wait:** Backend needs to download iText library first time (1-2 minutes)

---

## Emergency Commands

### Kill Backend Process
```bash
netstat -ano | findstr :8080
taskkill /F /PID [PID_NUMBER]
```

### Restart Everything
```bash
# Terminal 1 - Backend
cd resolveit-backend
mvn clean spring-boot:run

# Terminal 2 - Frontend  
cd resolveit-frontend
npm start
```

### Check Backend Status
Open browser: http://localhost:8080/api/complaints/stats

---

## Key Features to Highlight

✅ **Automatic Email Notifications**
- Complaint assignment → Staff + User
- Status updates → User
- Escalation → Manager + Staff + User
- Resolution → User

✅ **Role-Based Access**
- USER: Submit complaints
- STAFF: Handle assigned complaints
- MANAGER: Handle escalations
- ADMIN: Full system control

✅ **Escalation System**
- Manual escalation by staff/admin
- Auto-escalation after 3 days
- Email notifications to all parties
- Escalation history tracking

✅ **Reports & Analytics**
- Date range filtering
- Category breakdown
- Status distribution
- CSV and PDF export

✅ **Modern UI**
- Responsive design
- Real-time updates
- Clean, professional interface
- Custom CSS styling

---

## Backup Plan

If something breaks during presentation:
1. Show the working screenshots
2. Explain the feature verbally
3. Show the code implementation
4. Demonstrate email notifications in yopmail

**Remember:** The system works! Just ensure backend is running before starting.
