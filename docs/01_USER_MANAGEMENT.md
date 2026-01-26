# Feature 1: User Management & Access Control

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 1.1 Multi-Role System

### 1.1.1 Role Definitions
- **Super Admin**
  - Has access to all features across all branches
  - Can create and manage other admins
  - Can configure system-wide settings
  - Can access all financial and sensitive data
  - Cannot be deleted or deactivated by other users

- **Branch Admin**
  - Full access to their assigned branch(es) only
  - Can manage teachers, students, and parents within their branch
  - Can view and manage billing for their branch
  - Can generate reports for their branch
  - Cannot access other branches' data
  - Cannot modify system-wide settings

- **Teacher**
  - Can view their assigned classes and students
  - Can mark attendance for their classes
  - Can create and grade assignments/tests
  - Can view student performance in their subjects
  - Can communicate with students and parents
  - Cannot access billing information
  - Cannot view other teachers' classes unless specified
  - Can submit leave requests

- **Student**
  - Can view their own class schedules
  - Can view and submit assignments
  - Can view their grades and attendance
  - Can access learning materials for enrolled courses
  - Can communicate with their teachers
  - Can view their billing/payment status (read-only)
  - Cannot access other students' information

- **Parent**
  - Can view all information related to their linked children
  - Can view attendance, grades, and schedules for their children
  - Can communicate with teachers
  - Can make payments for their children's fees
  - Can view billing history
  - Can update emergency contact information
  - Cannot modify academic records

### 1.1.2 Role Assignment Rules
- A user can only have ONE primary role
- A teacher can also be a parent (separate account linking)
- Role changes must be logged with timestamp and admin who made the change
- Role changes take effect immediately upon saving
- Deactivated users retain their role but cannot log in

## 1.2 User Registration and Authentication

### 1.2.1 Registration Process

**Admin/Teacher Registration:**
- Can only be created by Super Admin or Branch Admin
- Required fields:
  - Full Name (First Name, Last Name)
  - Email Address (must be unique, validated format)
  - Phone Number (must be unique, 10-15 digits)
  - Date of Birth
  - Gender (Male/Female/Other)
  - Address (Street, City, State, Postal Code, Country)
  - Role selection
  - Branch assignment (for Branch Admin and Teachers)
  - Employment Start Date
  - Employee ID (auto-generated or manual)
- Optional fields:
  - Profile Photo (max 5MB, jpg/png)
  - Alternative Phone Number
  - Emergency Contact Name
  - Emergency Contact Number
- System auto-generates temporary password
- Welcome email sent with login credentials and password reset link
- User must change password on first login

**Student Registration:**
- Can be created by Super Admin, Branch Admin, or during enrollment process
- Required fields:
  - Full Name (First Name, Last Name)
  - Email Address (optional for young students, required for age 13+)
  - Phone Number (student's own or parent's)
  - Date of Birth
  - Gender (Male/Female/Other)
  - Grade/Level
  - School Name
  - Parent/Guardian Information (linked or new parent account created)
  - Branch assignment
  - Student ID (auto-generated: format YYYY-BRANCH-XXXX)
  - Enrollment Date
- Optional fields:
  - Profile Photo (max 5MB)
  - Medical Information
  - Special Needs/Requirements
  - Previous Tuition Centre (if any)
  - Referral Source
- Parent account automatically linked
- Login credentials sent to parent's email
- Student gets separate login if age 13+ or if parent requests

**Parent Registration:**
- Created automatically when registering a student OR
- Can self-register and later link to student after verification
- Required fields:
  - Full Name (First Name, Last Name)
  - Email Address (must be unique)
  - Phone Number (must be unique)
  - Relationship to Student (Father/Mother/Guardian/Other)
  - Address (same as student or different)
- Optional fields:
  - Occupation
  - Office Phone Number
  - Preferred Contact Method (Email/SMS/Phone/WhatsApp)
- Receives login credentials via email
- Can link multiple children to one parent account

### 1.2.2 Authentication Methods

**Primary Authentication:**
- Email + Password
- Password requirements:
  - Minimum 8 characters
  - Must contain at least 1 uppercase letter
  - Must contain at least 1 lowercase letter
  - Must contain at least 1 number
  - Must contain at least 1 special character (!@#$%^&*)
  - Cannot be same as previous 5 passwords
  - Expires every 90 days (optional, configurable)

**Two-Factor Authentication (2FA):**
- Optional for all users
- Mandatory for Super Admin and Branch Admin
- Methods:
  - SMS OTP (6-digit code, valid for 5 minutes)
  - Email OTP (6-digit code, valid for 5 minutes)
  - Authenticator App (Google Authenticator, Microsoft Authenticator)
- Backup codes provided (10 single-use codes)
- Trusted device option (remember for 30 days)

**Session Management:**
- Session timeout: 30 minutes of inactivity
- Concurrent login limit: 3 devices per user
- Force logout option for admins (remotely terminate user sessions)
- Login history tracked (IP address, device, timestamp, location)

**Password Recovery:**
- "Forgot Password" link on login page
- Email verification required
- Password reset link valid for 1 hour
- Link is single-use only
- Security question option (optional feature)
- Admin can manually reset user password (logged in audit trail)

### 1.2.3 Account Security

**Account Lockout:**
- Lock account after 5 consecutive failed login attempts
- Lockout duration: 30 minutes OR until admin unlocks
- Email/SMS notification sent to user when locked
- Admin receives notification of locked accounts

**Login Notifications:**
- Email notification on successful login from new device
- Alert on login from new location/IP address
- Weekly login summary email (optional)

**Security Audit Log:**
- Track all login attempts (successful and failed)
- Track password changes
- Track role changes
- Track permission modifications
- Track account activations/deactivations
- Log retention: minimum 1 year
- Export audit logs to CSV/PDF

## 1.3 Role-Based Permissions

### 1.3.1 Permission Categories

**Dashboard Access:**
- Super Admin: Full system dashboard with all branches
- Branch Admin: Branch-specific dashboard
- Teacher: Teacher dashboard with their classes
- Student: Student dashboard with personal info
- Parent: Parent dashboard with children's info

**User Management Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| Create Admin | Yes | No | No | No | No |
| Create Teacher | Yes | Yes (own branch) | No | No | No |
| Create Student | Yes | Yes (own branch) | No | No | No |
| Create Parent | Yes | Yes (own branch) | No | No | No |
| Edit Admin | Yes | No | No | No | No |
| Edit Teacher | Yes | Yes (own branch) | No | No | No |
| Edit Student | Yes | Yes (own branch) | No | No | No |
| Edit Parent | Yes | Yes (own branch) | No | No | Limited (own info) |
| Delete Users | Yes | Yes (own branch, non-admin) | No | No | No |
| View All Users | Yes | Yes (own branch) | No | No | No |
| Deactivate Users | Yes | Yes (own branch, non-admin) | No | No | No |

**Student Management Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| Enroll Student | Yes | Yes (own branch) | No | No | No |
| Transfer Student | Yes | Yes (own branch) | No | No | No |
| Withdraw Student | Yes | Yes (own branch) | No | No | No |
| View Student Details | Yes | Yes (own branch) | Yes (assigned students) | Yes (self only) | Yes (own children) |
| Edit Student Profile | Yes | Yes (own branch) | No | Limited (contact info) | Limited (emergency contacts) |
| View Student Performance | Yes | Yes (own branch) | Yes (assigned students) | Yes (self only) | Yes (own children) |

**Class Management Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| Create Class | Yes | Yes (own branch) | No | No | No |
| Edit Class | Yes | Yes (own branch) | No | No | No |
| Delete Class | Yes | Yes (own branch) | No | No | No |
| Assign Teacher | Yes | Yes (own branch) | No | No | No |
| View Class Details | Yes | Yes (own branch) | Yes (assigned classes) | Yes (enrolled classes) | Yes (children's classes) |
| Manage Schedule | Yes | Yes (own branch) | No | No | No |

**Billing Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| Create Invoice | Yes | Yes (own branch) | No | No | No |
| Edit Invoice | Yes | Yes (own branch) | No | No | No |
| Delete Invoice | Yes | Yes (own branch) | No | No | No |
| Record Payment | Yes | Yes (own branch) | No | No | No |
| Issue Refund | Yes | Yes (own branch) | No | No | No |
| View Billing | Yes | Yes (own branch) | No | Yes (self only) | Yes (own children) |
| Generate Receipt | Yes | Yes (own branch) | No | No | Yes (own payments) |
| Apply Discount | Yes | Yes (own branch) | No | No | No |
| View Revenue Reports | Yes | Yes (own branch) | No | No | No |

**Communication Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| Send Announcements | Yes | Yes (own branch) | Yes (own students) | No | No |
| Send SMS/Email | Yes | Yes (own branch) | Yes (own students) | No | No |
| In-app Messaging | Yes | Yes (own branch) | Yes (with students/parents) | Yes (with teachers) | Yes (with teachers) |
| View Message History | Yes | Yes (own branch) | Yes (own conversations) | Yes (own conversations) | Yes (own conversations) |

**Reports & Analytics Permissions:**
| Action | Super Admin | Branch Admin | Teacher | Student | Parent |
|--------|-------------|--------------|---------|---------|--------|
| View System Reports | Yes | No | No | No | No |
| View Branch Reports | Yes | Yes (own branch) | No | No | No |
| View Class Reports | Yes | Yes (own branch) | Yes (own classes) | No | No |
| View Student Reports | Yes | Yes (own branch) | Yes (assigned students) | Yes (self only) | Yes (own children) |
| View Financial Reports | Yes | Yes (own branch) | No | No | No |
| Export Reports | Yes | Yes (own branch) | Yes (own classes) | Yes (self only) | Yes (own children) |

### 1.3.2 Custom Permission Sets
- Admins can create custom permission templates
- Templates can be assigned to specific teachers (e.g., Head Teacher with additional permissions)
- Custom permissions cannot exceed the base role permissions
- All permission changes are logged with timestamp and admin who made the change

## 1.4 Parent-Student Account Linking

### 1.4.1 Linking Process

**Automatic Linking:**
- When a student is registered, parent account is automatically created and linked
- Parent receives email with login credentials and link to their child's profile
- One parent account can be linked to multiple students (siblings)

**Manual Linking:**
- Parent can request linking by providing Student ID
- Request must be approved by Branch Admin
- Verification steps:
  - Parent must provide student's full name, date of birth, and student ID
  - Admin verifies relationship before approving
  - Student receives notification of new parent link
  - Parent receives confirmation email once approved

**Link Management:**
- Students can have multiple parents linked (divorced/separated parents)
- Each parent has separate login and can set different notification preferences
- Primary parent designation (receives important notices first)
- Secondary parents can be set as read-only (cannot make payments or update info)

### 1.4.2 Unlinking Process
- Only Branch Admin or Super Admin can unlink parent-student relationship
- Requires reason for unlinking (logged)
- Both parent and student receive notification
- Unlinked parent loses access immediately
- Billing history remains intact for records

## 1.5 Staff Profiles

### 1.5.1 Teacher Profile Information

**Basic Information:**
- Full Name (cannot be changed by teacher)
- Employee ID (auto-generated, unique)
- Email (can be updated with admin approval)
- Phone Number (can be updated by teacher)
- Date of Birth
- Gender
- Address (can be updated by teacher)
- Profile Photo

**Professional Information:**
- Highest Qualification (High School/Diploma/Bachelor's/Master's/PhD)
- Degree/Certificate Name
- University/Institution Name
- Year of Graduation
- Teaching Certifications (can add multiple)
- Years of Teaching Experience
- Previous Employment History (can add multiple entries)

**Subject Specialization:**
- Primary Subject(s) - select from predefined list
- Secondary Subject(s) - select from predefined list
- Grade Levels Qualified to Teach (multiple selection)
- Language Proficiency (English/Mandarin/Malay/Tamil/Others)

**Employment Details:**
- Branch Assignment (can be assigned to multiple branches)
- Employment Type (Full-time/Part-time/Contract/Freelance)
- Employment Start Date
- Contract End Date (if applicable)
- Work Schedule (days and hours available)
- Hourly Rate / Salary (visible to admins only)
- Bank Account Details (for payroll)

**Documents:**
- Resume/CV (PDF, max 10MB)
- Educational Certificates (PDF/JPG, max 5MB each)
- Identity Card/Passport Copy
- Police Clearance Certificate (if required)
- Teaching Certifications
- Document expiry tracking (alerts before expiration)

### 1.5.2 Profile Visibility
- Teachers can view and edit their own basic and professional information
- Teachers cannot edit employment details or salary information
- Admins can view and edit all teacher profile information
- Students and parents can view limited teacher info (name, photo, subjects, qualifications)

### 1.5.3 Teacher Availability
- Teachers can set their available days and time slots
- Availability calendar integration
- Leave request system:
  - Teacher submits leave request with dates and reason
  - Admin approves or rejects
  - Affected classes are flagged for substitute teacher assignment
  - Students/parents notified of teacher absence

### 1.5.4 Teacher Performance Tracking
- Total classes taught (auto-calculated)
- Total students taught (auto-calculated)
- Average student performance in their classes
- Attendance rate (teacher's own attendance)
- Parent/student feedback ratings (if feedback system enabled)
- Notes from admin (performance reviews, warnings, commendations)

---
