# ResolveIT - Complete Complaint Management System

A full-stack complaint management system built with **Spring Boot** (Backend) and **React** (Frontend).

## 🚀 Features

### Core Features
- **User Registration & Authentication** - JWT-based secure authentication
- **Complaint Management** - Submit, track, and manage complaints
- **File Upload System** - Support for images, PDFs, documents, and videos
- **Admin-Only File Access** - PDFs and videos restricted to admin viewing
- **Email Notifications** - Automatic email alerts for status changes
- **Role-Based Access Control** - User, Staff, Admin roles
- **Escalation System** - Escalate complaints to higher authorities
- **Reports & Analytics** - Comprehensive reporting dashboard

### Advanced Features
- **Staff Application System** - Apply to become staff members
- **Assignment System** - Assign complaints to staff members
- **Status Tracking** - Real-time complaint status updates
- **Database Reset Tools** - Admin tools for database management
- **Responsive Design** - Mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.x**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with MySQL
- **Maven** for dependency management
- **Email Integration** with Gmail SMTP

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **Bootstrap 5** for styling
- **Axios** for API calls
- **Context API** for state management

### Database
- **MySQL 8.0** for production
- **H2** for testing (optional)

## 📋 Prerequisites

- **Java 17+**
- **Node.js 16+**
- **MySQL 8.0+**
- **Maven 3.6+**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd resolveit_option_c_full
```

### 2. Database Setup
```sql
CREATE DATABASE resolveit;
```

### 3. Backend Setup
```bash
cd resolveit-backend
mvn clean install
mvn spring-boot:run
```
Backend will run on: http://localhost:8080

### 4. Frontend Setup
```bash
cd resolveit-frontend
npm install
npm start
```
Frontend will run on: http://localhost:3000

## 📧 Email Configuration

Update `resolveit-backend/src/main/resources/application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## 👥 Default Users

### Admin User
- **Email**: admin@resolveit.com
- **Password**: admin123

### Test User
- **Email**: user1@resolveit.com
- **Password**: password123

## 📁 Project Structure

```
resolveit_option_c_full/
├── resolveit-backend/          # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/resolveit/
│   │       ├── controller/     # REST controllers
│   │       ├── service/        # Business logic
│   │       ├── model/          # JPA entities
│   │       ├── repository/     # Data access layer
│   │       └── security/       # Security configuration
│   └── src/main/resources/
│       └── application.properties
├── resolveit-frontend/         # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Context providers
│   │   └── services/           # API services
│   └── public/
├── *.sql                       # Database scripts
├── *.html                      # Testing tools
└── *.md                        # Documentation
```

## 🔧 Testing Tools

The project includes several HTML testing tools:
- `test_file_upload_system.html` - Test file upload functionality
- `test_email_system.html` - Test email notifications
- `create_admin_user.html` - Create admin users
- `create_staff_members.html` - Create staff members

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/{id}` - Get complaint details
- `PUT /api/complaints/{id}/status` - Update status
- `PUT /api/complaints/{id}/assign` - Assign to staff

### File Management
- `POST /api/complaints/with-files` - Submit complaint with files
- `GET /api/complaints/{id}/files` - Get complaint files
- `GET /api/complaints/files/{fileId}/download` - Download file

## 🎯 Key Features Implemented

### File Upload System
- **Multi-file support** with drag & drop
- **Admin-only restrictions** for sensitive files (PDFs, videos)
- **File type validation** and size limits
- **Secure file storage** with unique naming

### Email Notifications
- **Status change alerts** to complaint submitters
- **Assignment notifications** to staff members
- **Resolution confirmations** with details
- **Escalation alerts** to managers

### Admin Dashboard
- **Real-time statistics** and metrics
- **Complaint management** with bulk actions
- **Staff assignment** capabilities
- **File access controls**

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Role-based authorization** (User, Staff, Admin)
- **File access restrictions** based on user roles
- **SQL injection prevention** with JPA
- **XSS protection** with input validation

## 📱 Responsive Design

- **Mobile-first approach** with Bootstrap 5
- **Adaptive layouts** for all screen sizes
- **Touch-friendly interfaces** for mobile devices
- **Progressive enhancement** for better UX

## 🚀 Deployment Ready

- **Production configurations** included
- **Environment-specific settings** supported
- **Docker support** (can be added)
- **CI/CD ready** with Maven and npm scripts

## 👨‍💻 Developer

**Your Name**  
**Email**: your.email@example.com  
**GitHub**: https://github.com/yourusername

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact your mentor or create an issue in the repository.

---

**Built with ❤️ for complaint management and resolution**