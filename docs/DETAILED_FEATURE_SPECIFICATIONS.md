# Tuition Centre SAAS - Detailed Feature Specifications

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 1. USER MANAGEMENT & ACCESS CONTROL

### 1.1 Multi-Role System

#### 1.1.1 Role Definitions
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

#### 1.1.2 Role Assignment Rules
- A user can only have ONE primary role
- A teacher can also be a parent (separate account linking)
- Role changes must be logged with timestamp and admin who made the change
- Role changes take effect immediately upon saving
- Deactivated users retain their role but cannot log in

### 1.2 User Registration and Authentication

#### 1.2.1 Registration Process

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

#### 1.2.2 Authentication Methods

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

#### 1.2.3 Account Security

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

### 1.3 Role-Based Permissions

#### 1.3.1 Permission Categories

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

#### 1.3.2 Custom Permission Sets
- Admins can create custom permission templates
- Templates can be assigned to specific teachers (e.g., Head Teacher with additional permissions)
- Custom permissions cannot exceed the base role permissions
- All permission changes are logged with timestamp and admin who made the change

### 1.4 Parent-Student Account Linking

#### 1.4.1 Linking Process

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

#### 1.4.2 Unlinking Process
- Only Branch Admin or Super Admin can unlink parent-student relationship
- Requires reason for unlinking (logged)
- Both parent and student receive notification
- Unlinked parent loses access immediately
- Billing history remains intact for records

### 1.5 Staff Profiles

#### 1.5.1 Teacher Profile Information

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

#### 1.5.2 Profile Visibility
- Teachers can view and edit their own basic and professional information
- Teachers cannot edit employment details or salary information
- Admins can view and edit all teacher profile information
- Students and parents can view limited teacher info (name, photo, subjects, qualifications)

#### 1.5.3 Teacher Availability
- Teachers can set their available days and time slots
- Availability calendar integration
- Leave request system:
  - Teacher submits leave request with dates and reason
  - Admin approves or rejects
  - Affected classes are flagged for substitute teacher assignment
  - Students/parents notified of teacher absence

#### 1.5.4 Teacher Performance Tracking
- Total classes taught (auto-calculated)
- Total students taught (auto-calculated)
- Average student performance in their classes
- Attendance rate (teacher's own attendance)
- Parent/student feedback ratings (if feedback system enabled)
- Notes from admin (performance reviews, warnings, commendations)

---

## 2. STUDENT MANAGEMENT

### 2.1 Student Enrollment and Registration

#### 2.1.1 Enrollment Process

**New Student Enrollment:**
- Can be initiated by Super Admin or Branch Admin
- Enrollment wizard with 4 steps:
  1. Student Personal Information
  2. Parent/Guardian Information
  3. Course Selection
  4. Fee Structure and Payment

**Step 1: Student Personal Information**

Required Fields:
- First Name (alphabets only, max 50 characters)
- Last Name (alphabets only, max 50 characters)
- Date of Birth (must be between 3-25 years old)
- Gender (Male/Female/Other/Prefer not to say)
- Nationality
- Identity Card/Passport Number (unique across system)
- Current Grade/Level (Pre-school/Primary 1-6/Secondary 1-5/Form 6/Others)
- Current School Name
- School Contact Number
- Enrollment Date (defaults to today, can be future-dated)
- Branch Assignment

Optional Fields:
- Middle Name
- Preferred Name/Nickname
- Profile Photo (max 5MB, jpg/png/jpeg only)
- Home Address (Street, Unit Number, Postal Code, City, State, Country)
- Student's Personal Phone Number
- Student's Personal Email (for age 13+)
- Blood Type (A+/A-/B+/B-/AB+/AB-/O+/O-/Unknown)
- Allergies (free text, max 500 characters)
- Medical Conditions (free text, max 500 characters)
- Special Educational Needs (Yes/No, with description if yes)
- Dietary Restrictions (Vegetarian/Vegan/Halal/Kosher/None/Others)
- Emergency Medical Information
- Previous Tuition Centre Name and Duration
- Reason for Leaving Previous Centre
- Referral Source (Walk-in/Online/Friend/Advertisement/School/Other)
- Referral Code (if referred by existing student/parent)

**Step 2: Parent/Guardian Information**

Primary Parent/Guardian (Required):
- Relationship (Father/Mother/Legal Guardian/Grandfather/Grandmother/Uncle/Aunt/Sibling/Other)
- First Name and Last Name
- Identity Card/Passport Number
- Phone Number (must be unique)
- Email Address (must be unique, validated format)
- Occupation
- Office Phone Number (optional)
- Home Address (same as student OR different)
- Preferred Contact Method (Email/SMS/Phone Call/WhatsApp)
- Preferred Language (English/Mandarin/Malay/Tamil/Others)

Secondary Parent/Guardian (Optional):
- Same fields as Primary Parent
- Can add up to 3 additional guardians

Emergency Contact (Required if different from parents):
- Name
- Relationship
- Phone Number
- Alternative Phone Number

**Step 3: Course Selection**

Course Enrollment:
- Select subjects/courses (can select multiple)
- For each subject:
  - Subject Name (from available courses)
  - Class Selection (based on available slots, grade level, and schedule)
  - Start Date (can be immediate or future-dated)
  - Number of sessions per week
  - Session duration
  - Preferred day(s) and time slots
- System shows:
  - Available class slots with teacher name
  - Current class capacity and available slots
  - Class schedule (day, time, location)
  - Fee per subject

Validation Rules:
- Must enroll in at least 1 subject
- Cannot enroll in same subject twice
- Check for schedule conflicts (if enrolling multiple subjects)
- Verify class capacity availability
- Verify student age matches course requirements

**Step 4: Fee Structure and Payment**

Fee Calculation:
- Shows breakdown of fees:
  - Registration Fee (one-time, if applicable)
  - Deposit (if required, refundable)
  - Tuition Fee per subject (monthly/per session)
  - Material Fee (if applicable)
  - Total fees
- Payment schedule options:
  - Pay per session
  - Monthly payment
  - Quarterly payment
  - Full upfront (with discount if applicable)
- Sibling discount application (automatic if applicable)
- Early bird discount (if enrolling before specified date)
- Referral discount application
- Scholarship/Financial aid (requires approval)

Initial Payment:
- Registration fee (mandatory if applicable)
- First month's fee OR deposit
- Payment method selection:
  - Cash
  - Bank Transfer
  - Credit/Debit Card
  - Online Banking
  - E-Wallet
- If payment is deferred:
  - Must provide reason
  - Admin approval required
  - Due date must be set

Post-Enrollment:
- Student ID auto-generated (format: YYYY-[BRANCH_CODE]-[SEQUENTIAL_NUMBER])
- Enrollment confirmation email sent to parent
- Welcome SMS sent to parent
- Login credentials emailed to parent
- Student and parent accounts activated
- Student added to selected classes
- Teachers notified of new student in their classes
- Invoice generated for first payment cycle

#### 2.1.2 Enrollment Status Tracking

Student can have following enrollment statuses:
- **Prospective**: Inquiry made but not enrolled yet
- **Enrolled**: Active student attending classes
- **On Hold**: Temporarily not attending (medical/travel reasons)
  - Requires start and end date
  - Billing paused during hold period
  - Cannot exceed 3 months
- **Transferred**: Moved to another branch
  - Requires destination branch
  - All academic records transferred
  - Billing continues at new branch
- **Withdrawn**: No longer a student
  - Requires withdrawal date and reason
  - Final billing settlement
  - Account deactivated (can be reactivated)
  - Cannot access classes or materials
- **Graduated**: Completed all courses
  - Certificate generated
  - Account remains active for 1 year (read-only)
- **Expelled**: Removed due to disciplinary reasons
  - Requires detailed reason
  - Logged for future reference
  - Account immediately deactivated

Status Change Rules:
- Only admins can change student status
- All status changes logged with timestamp, admin name, and reason
- Parents receive email notification for any status change
- Refund processing triggered for withdrawals (if applicable)

### 2.2 Student Profiles

#### 2.2.1 Profile Information Structure

**Personal Information Tab:**
- Full Name (First, Middle, Last)
- Student ID (read-only)
- Profile Photo
- Date of Birth (Age auto-calculated)
- Gender
- Nationality
- Identity Card/Passport Number
- Contact Information (Phone, Email, Address)
- Current enrollment status with status badge

**Academic Information Tab:**
- Current Grade/Level
- Current School Name and Contact
- Previous Academic Performance (if provided):
  - Previous school grades/GPA
  - Strengths
  - Areas for improvement
- Enrolled Courses:
  - List of all current courses with:
    - Subject name
    - Class name
    - Teacher name
    - Schedule (days and times)
    - Enrollment date
    - Current grade/performance
    - Attendance rate
- Course History:
  - Previously completed courses
  - Withdrawn courses (with dates and reasons)

**Medical & Special Needs Tab:**
- Blood Type
- Known Allergies
- Medical Conditions
- Current Medications (if any)
- Special Educational Needs (SEN):
  - Type of SEN (Dyslexia/ADHD/Autism/Visual Impairment/Hearing Impairment/Others)
  - Severity (Mild/Moderate/Severe)
  - Recommended accommodations
  - IEP (Individual Education Plan) document upload
- Dietary Restrictions
- Emergency Medical Instructions
- Last Medical Checkup Date

**Family Information Tab:**
- Primary Guardian Details (with "Primary" badge)
- Secondary Guardian(s) Details
- Emergency Contacts
- Sibling Information:
  - Siblings enrolled in same centre (auto-linked)
  - Siblings in other schools (manually added)
- Family Income Bracket (for scholarship assessment, optional)
- Family Status (for fee structure consideration)

**Documents Tab:**
- Identity Card/Passport Copy (PDF/JPG, max 5MB)
- Birth Certificate (optional)
- School Report Cards (can upload multiple)
- Medical Reports (if applicable)
- SEN Assessment Reports (if applicable)
- Transfer Certificate (from previous tuition centre)
- Photo Release Consent Form
- Terms & Conditions Signed Document
- Document version tracking (can upload new versions)
- Document expiry alerts (for passports, medical certificates)

**Performance & Progress Tab:**
- Overall Performance Summary:
  - Overall GPA/Average
  - Attendance rate
  - Submission rate (assignments)
  - Improvement trend graph
- Per-Subject Performance:
  - Subject name
  - Current grade
  - Trend (improving/stable/declining)
  - Last test score
  - Attendance in that subject
- Strengths & Weaknesses Analysis (auto-generated based on grades)
- Teacher Comments & Feedback
- Goal Setting & Tracking
- Awards & Achievements

**Attendance History Tab:**
- Calendar view of attendance
- Filter by:
  - Date range
  - Subject
  - Status (Present/Absent/Late/Excused)
- Attendance statistics:
  - Total classes scheduled
  - Total attended
  - Total absent
  - Total late
  - Attendance percentage
- Attendance alerts (if below threshold)
- Absence patterns (e.g., frequently absent on Mondays)

**Billing & Payment Tab:**
- Current balance (outstanding amount)
- Payment history:
  - Invoice date
  - Invoice number
  - Amount
  - Payment status (Paid/Partial/Pending/Overdue)
  - Payment date
  - Payment method
  - Receipt download link
- Upcoming payments
- Applied discounts
- Refund history
- Payment plan details

**Communication History Tab:**
- All announcements received
- Direct messages with teachers
- Email history
- SMS history
- Notification preferences
- Parent-teacher meeting logs

**Notes & Remarks Tab:**
- Admin can add internal notes (not visible to parents/students)
- Teacher can add notes (visible to admins only)
- Behavior incidents log
- Disciplinary actions log
- Counseling session notes
- Special instructions for teachers

#### 2.2.2 Profile Access & Editing Rights

**View Rights:**
- Super Admin: All students across all branches
- Branch Admin: All students in their branch
- Teacher: Only students in their assigned classes (limited fields)
- Student: Own profile only (limited fields)
- Parent: Own children's profiles

**Edit Rights:**
- Super Admin: Can edit all fields
- Branch Admin: Can edit all fields for their branch students
- Teacher: Can only add notes and update academic performance
- Student: Can edit contact phone/email only (requires parent approval if under 18)
- Parent: Can edit contact information, medical information, emergency contacts

**Special Rules:**
- Student ID cannot be edited after creation
- Enrollment date can only be edited within 7 days of creation
- Identity Card/Passport number requires admin approval to change
- Parent information changes trigger verification email
- Medical information updates are logged for audit trail

### 2.3 Student Grouping by Grade/Level

#### 2.3.1 Grade Level Structure

**Predefined Grade Levels:**
- Pre-school (3-6 years)
- Primary 1 (7 years)
- Primary 2 (8 years)
- Primary 3 (9 years)
- Primary 4 (10 years)
- Primary 5 (11 years)
- Primary 6 (12 years)
- Secondary 1 / Form 1 (13 years)
- Secondary 2 / Form 2 (14 years)
- Secondary 3 / Form 3 (15 years)
- Secondary 4 / Form 4 (16 years)
- Secondary 5 / Form 5 (17 years)
- Form 6 Lower (18 years)
- Form 6 Upper (19 years)
- Foundation / Pre-University (18-19 years)
- Adult Learners (20+ years)

**Custom Grade Levels:**
- Admins can create custom grade levels
- Useful for special programs or different education systems
- Each custom level requires:
  - Name
  - Description
  - Age range
  - Associated curriculum

#### 2.3.2 Grouping Functionality

**Automatic Grouping:**
- Students automatically grouped by enrolled grade level
- System suggests appropriate classes based on grade level
- Dashboard filters can show students by grade level
- Reports can be generated per grade level

**Custom Groups:**
- Admins can create custom student groups beyond grade levels:
  - By performance level (Beginner/Intermediate/Advanced)
  - By learning pace (Fast-track/Regular/Remedial)
  - By special programs (Scholarship/Competition Prep/Exam Intensive)
  - By behavioral/social grouping
- Custom group attributes:
  - Group name
  - Group description
  - Group type (Academic/Administrative/Social)
  - Start and end date (if temporary)
  - Assigned students (multiple selection)
  - Assigned teachers/coordinators
- Students can belong to multiple custom groups

**Group Management:**
- Bulk actions on groups:
  - Send group announcements
  - Generate group reports
  - Schedule group sessions
  - Apply group discounts
  - Mass enrollment in courses
- Group comparison analytics
- Move students between groups
- Archive old groups

#### 2.3.3 Grade Progression

**Annual Progression:**
- Option to auto-promote students to next grade level
- Promotion rules:
  - Based on age
  - Based on completion of current grade curriculum
  - Based on performance
- Promotion date (typically January or July)
- Bulk promotion tool:
  - Select grade level to promote
  - Preview list of affected students
  - Confirm and execute
  - Automatic notification to parents

**Manual Progression:**
- Admin can manually promote or demote student
- Requires reason for manual change
- Logged for audit trail
- Parent notification sent

**Hold Back:**
- Student can repeat a grade level
- Requires admin approval and documented reason
- Parent consultation logged
- Academic intervention plan created

### 2.4 Student Performance Analytics

#### 2.4.1 Performance Metrics

**Individual Performance Metrics:**
- Overall GPA/Average Score (across all subjects)
- Per-Subject Grades:
  - Current grade
  - Assignment average
  - Test/quiz average
  - Final exam score (if applicable)
- Attendance Rate (percentage)
- Assignment Submission Rate (percentage)
- Participation Rate (based on teacher input)
- Improvement Rate (compared to previous term/month)

**Performance Indicators:**
- Color-coded status:
  - Green: Excellent (>85%)
  - Blue: Good (70-85%)
  - Yellow: Satisfactory (50-69%)
  - Red: Needs Attention (<50%)
- Trend arrows:
  - ↑ Improving
  - → Stable
  - ↓ Declining
- Alert badges:
  - "At Risk" for students with declining performance
  - "Star Performer" for consistent high achievers
  - "Most Improved" for significant progress

#### 2.4.2 Performance Tracking

**Time-based Tracking:**
- Weekly performance summary
- Monthly progress reports
- Quarterly report cards
- Annual performance review
- Historical data retention (all previous terms)

**Comparative Analytics:**
- Compare student's performance:
  - Against class average
  - Against grade level average
  - Against own previous performance
  - Against set learning objectives
- Percentile ranking in class (optional, configurable)
- Grade distribution visualization

**Predictive Analytics:**
- Performance trend prediction
- "At risk of failing" early warning system:
  - Triggered by:
    - 3 consecutive declining scores
    - Attendance below 75%
    - Multiple missing assignments
    - Teacher flagging
  - Alerts sent to admin, teacher, and parent
  - Intervention plan recommended

**Performance Dashboard:**
- Visual charts and graphs:
  - Line graph: Grade trend over time
  - Bar chart: Performance by subject
  - Pie chart: Attendance breakdown
  - Radar chart: Skills assessment
- Filterable by date range, subject, class
- Exportable to PDF

#### 2.4.3 Performance Reporting

**Automated Reports:**
- Weekly summary email to parents
- Monthly progress report (PDF)
  - Student information
  - Attendance summary
  - Grade breakdown by subject
  - Teacher comments
  - Areas of strength
  - Areas for improvement
  - Recommended actions
- Term report card (formal)
  - Official grades
  - Teacher signatures
  - Admin approval stamp
  - Downloadable and printable

**Custom Reports:**
- Admins can create custom report templates
- Select which metrics to include
- Choose report frequency
- Set recipients
- Schedule automatic sending

**Parent-Teacher Communication:**
- Parents can request explanation on grades
- Teachers can add detailed comments
- In-app messaging about performance
- Scheduled parent-teacher meetings for underperforming students

### 2.5 Transfer and Withdrawal Management

#### 2.5.1 Student Transfer (Between Branches)

**Transfer Request Process:**
- Can be initiated by:
  - Parent request
  - Admin decision (due to class availability, location, etc.)
- Transfer request form includes:
  - Current branch
  - Destination branch
  - Reason for transfer
  - Requested transfer date
  - Subject continuity (same subjects or different)
  - Teacher preference (if any)

**Transfer Approval Workflow:**
1. Parent or Admin initiates transfer request
2. Current branch admin receives notification
3. Destination branch admin receives notification
4. Destination branch verifies:
   - Class availability
   - Teacher availability
   - Schedule compatibility
5. Both branch admins must approve
6. Transfer date is confirmed
7. Parent receives confirmation

**Transfer Execution:**
- On transfer date:
  - Student status at old branch: Changed to "Transferred Out"
  - Student status at new branch: Changed to "Enrolled" with "Transferred In" tag
  - All academic records transferred:
    - Grades and performance data
    - Attendance history
    - Assignment submission history
    - Teacher comments
    - Medical and special needs information
  - Billing:
    - Final billing at old branch (pro-rated if mid-month)
    - New billing started at destination branch
    - Outstanding fees must be settled before transfer
  - Class enrollment:
    - Removed from old classes
    - Enrolled in new classes (auto or manual)
  - Communication:
    - Parent receives transfer completion email
    - Old teachers notified
    - New teachers notified
    - Student receives new class schedule

**Post-Transfer:**
- Transfer history logged in student profile
- Performance comparison between branches (for analysis)
- Follow-up check after 1 month (admin task)

#### 2.5.2 Student Withdrawal

**Withdrawal Request Process:**
- Can be initiated by:
  - Parent request
  - Admin decision (disciplinary, non-payment, etc.)
- Withdrawal request form includes:
  - Reason for withdrawal (dropdown + free text):
    - Relocating/Moving away
    - Financial reasons
    - Unsatisfied with teaching
    - Switching to another tuition centre
    - No longer needs tuition
    - Scheduling conflicts
    - Health/Medical reasons
    - Behavioral/Disciplinary issues
    - Other (specify)
  - Last day of attendance (must be future date or today)
  - Request feedback survey (optional)
  - Request exit interview (optional)

**Withdrawal Approval Workflow:**
1. Parent submits withdrawal request OR Admin initiates withdrawal
2. Branch Admin reviews request
3. Admin checks:
   - Outstanding fees (must be settled)
   - Unreturned materials/books (if any)
   - Refund eligibility (based on payment plan and withdrawal date)
4. Admin can:
   - Approve immediately
   - Request parent meeting before approval (to address concerns)
   - Reject (rare, usually for unsettled fees)
5. Final decision communicated to parent

**Withdrawal Execution:**
- On last day of attendance:
  - Student status changed to "Withdrawn"
  - Student account deactivated (cannot login)
  - Removed from all classes
  - Teachers notified
  - Final billing calculation:
    - Pro-rated fees if mid-month
    - Outstanding fees flagged
    - Refund calculation (if prepaid and eligible)
    - Deposit refund processing
  - Final invoice and receipt generated
  - Billing cleared status (Yes/No)

**Post-Withdrawal:**
- Exit survey sent to parent (if agreed):
  - Satisfaction rating
  - Reason for leaving
  - Likelihood to return
  - Likelihood to recommend
  - Suggestions for improvement
- Withdrawal data logged for analytics:
  - Withdrawal reason statistics
  - Withdrawal rate by branch
  - Withdrawal rate by subject
  - Seasonal withdrawal patterns
- Student marked as "Alumnus"
- Option to re-enroll in future:
  - Simplified re-enrollment process
  - Waived registration fee (within 1 year)
  - Historical records retained

**Withdrawal Types:**
- **Voluntary Withdrawal**: Parent-initiated
- **Administrative Withdrawal**: Centre-initiated
- **Automatic Withdrawal**: System-triggered (e.g., non-payment after 60 days)
- **Temporary Withdrawal**: On-hold status that becomes permanent

**Special Cases:**
- Withdrawal due to non-payment:
  - Debt collection process initiated
  - Account marked for collections
  - Cannot re-enroll until cleared
- Withdrawal due to disciplinary issues:
  - Detailed incident report required
  - May affect re-enrollment eligibility
  - Flagged in system
- Mid-contract withdrawal:
  - Contract terms applied
  - Penalty fees if applicable
  - Refund calculation based on terms

#### 2.5.3 Refund Management (Related to Withdrawal)

**Refund Policy Configuration:**
- Admins can set refund policies:
  - Full refund if withdrawal within X days of enrollment
  - Partial refund (percentage) based on withdrawal timing
  - No refund after X sessions attended
  - Deposit refund policy
  - Material fee refund (if materials not used)

**Refund Calculation:**
- System auto-calculates based on:
  - Total fees paid
  - Number of sessions attended
  - Withdrawal date
  - Applied refund policy
  - Deductions (if any):
    - Registration fee (usually non-refundable)
    - Proportionate material costs
    - Administrative processing fee
- Refund amount displayed to admin for approval

**Refund Processing:**
1. Refund amount calculated
2. Admin reviews and approves
3. Refund method selection:
   - Bank transfer
   - Cheque
   - Credit back to credit card
   - Cash
   - Credit note (for future re-enrollment)
4. Refund processing time: 7-14 business days
5. Refund receipt generated and emailed
6. Refund status tracking:
   - Pending
   - Processing
   - Completed
   - Failed (with reason)

**Refund Reporting:**
- Monthly refund summary
- Refund by reason
- Total refund amount per branch
- Impact on revenue

---

