# Feature 3: Class & Schedule Management

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 3.1 Course/Subject Catalog

### 3.1.1 Course Creation

**Course Master Data:**
- Course/Subject Name (e.g., "Mathematics", "English Language", "Science")
- Course Code (unique identifier, e.g., "MATH-P5", "ENG-SEC3")
- Course Category:
  - Academic (Math, Science, Languages, etc.)
  - Enrichment (Art, Music, Coding, etc.)
  - Exam Preparation (PSLE, SPM, IGCSE, etc.)
  - Language (English, Mandarin, Malay, Tamil, etc.)
  - Special Programs (Gifted, Remedial, Competition Prep)
- Course Description (detailed overview, max 1000 characters)
- Course Objectives/Learning Outcomes
- Prerequisites (if any, select from other courses)
- Recommended Grade Levels (multiple selection):
  - Can specify minimum and maximum grade level
  - e.g., "Primary 4 to Primary 6"
- Age Range (min and max age)
- Course Duration:
  - Per session (30 min / 45 min / 60 min / 90 min / 120 min)
  - Total weeks/months (if fixed-term course)
  - Or "Ongoing" for continuous courses
- Difficulty Level (Beginner / Intermediate / Advanced / Mixed)
- Maximum Class Size (default capacity for this course)
- Minimum Class Size (minimum students to run the class)

**Course Materials:**
- Textbook/Workbook list:
  - Title
  - Publisher
  - ISBN
  - Edition
  - Required/Optional
  - Purchase method (Centre provides / Student purchases / Included in fees)
  - Cost (if applicable)
- Additional materials needed (stationery, equipment, etc.)
- Digital resources URL/links

**Course Fee Structure:**
- Base fee per session
- Base fee per month
- Base fee per term/semester
- Material fee (one-time or recurring)
- Registration fee (one-time)
- Trial session fee (if applicable)
- Different pricing tiers by:
  - Grade level (e.g., Primary vs Secondary)
  - Class size (Individual / Small group / Regular class)
  - Session duration
  - Branch location

**Course Availability:**
- Active/Inactive status
- Available branches (select multiple)
- Available terms/semesters
- Enrollment open/closed
- Waitlist enabled (Yes/No)
- Public visibility (shown on website/parent portal)

**Course Documentation:**
- Curriculum/Syllabus document upload (PDF, max 10MB)
- Sample lesson plans
- Assessment criteria
- Grading rubric
- Course brochure/flyer (for marketing)

### 3.1.2 Course Management

**Bulk Course Operations:**
- Duplicate existing course (to create similar courses)
- Archive old courses (retain for records but hide from selection)
- Activate/deactivate multiple courses
- Update fees across multiple courses
- Assign courses to branches in bulk

**Course Versioning:**
- Track course changes over time
- Version history with change log
- Ability to revert to previous version
- Compare versions side-by-side

**Course Templates:**
- Create course templates for common subjects
- Templates include all standard fields pre-filled
- Quick course creation from templates
- Custom templates per branch

## 3.2 Class Creation and Management

### 3.2.1 Class Setup

**Creating a New Class:**
- Select Course/Subject from catalog
- Class Name/Code:
  - Auto-generated based on rules (e.g., "MATH-P5-A-2026")
  - Or manual entry
  - Format: [SUBJECT]-[LEVEL]-[SECTION]-[YEAR]
- Class Type:
  - Regular Group Class
  - Small Group (3-8 students)
  - One-on-One / Private
  - Online Class
  - Hybrid (In-person + Online)
  - Intensive/Crash Course
  - Workshop/Seminar
- Branch Assignment
- Academic Term/Semester:
  - Term 1, 2, 3, 4 (or custom terms)
  - Start date and end date
  - Number of weeks
  - Holiday breaks (auto-calculated or manual)
- Class Level/Grade (must match course requirements)
- Maximum Capacity (default from course or custom)
- Minimum Enrollment (minimum students to run)

**Teacher Assignment:**
- Primary Teacher (required)
  - Select from available teachers
  - Filter by subject specialization
  - Filter by availability
  - Show teacher's current load (number of classes)
- Assistant/Co-Teacher (optional)
- Substitute Teacher Pool (select backup teachers)
- Teacher availability check (prevent double-booking)

**Classroom Assignment:**
- Select classroom/room from branch's available rooms
- Room capacity check (must fit maximum class capacity)
- Equipment requirements matching
- Accessibility requirements (if students with special needs)
- For online classes: Virtual classroom link/platform

**Class Materials:**
- Inherit from course catalog OR customize
- Additional materials specific to this class
- Digital resources shared folder link

**Class Fee (Per Student):**
- Inherit from course OR customize
- Different rates for different students (if applicable)
- Package deals (e.g., 2 subjects discount)
- Trial session pricing

**Class Status:**
- Draft (not visible to students yet)
- Open for Enrollment
- Full (capacity reached, can enable waitlist)
- In Progress (term has started)
- Completed
- Cancelled
- On Hold

### 3.2.2 Class Enrollment Management

**Student Enrollment:**
- Manual enrollment by admin:
  - Search and select student
  - Select class from available options
  - Check schedule conflicts
  - Confirm enrollment
  - Generate invoice automatically
- Self-enrollment by parents (if enabled):
  - Parent browses available classes
  - Request enrollment
  - Admin approval required
  - Payment before confirmation
- Bulk enrollment:
  - Upload CSV with student IDs and class codes
  - System validates and enrolls
  - Error report for failed enrollments

**Enrollment Validation:**
- Check student grade level matches class level
- Check age requirements
- Check prerequisite courses completed
- Check schedule conflicts with student's other classes
- Check class capacity
- Check payment status

**Waitlist Management:**
- Automatically add to waitlist when class is full
- Waitlist position number
- Estimated wait time
- Auto-notify when spot becomes available
- Option to accept or decline within timeframe (e.g., 48 hours)
- Auto-move next student if declined
- Waitlist reports (number of students, by class)

**Class Roster:**
- List of all enrolled students
- Student profile quick view
- Attendance record
- Performance summary
- Contact information
- Special needs/notes
- Export roster to Excel/PDF
- Print class list
- Group students for activities

**Enrollment Changes:**
- Drop student from class:
  - Reason required
  - Refund calculation
  - Notify parent and teacher
  - Update class capacity
- Transfer student to different class:
  - Same subject or different
  - Check availability and conflicts
  - Pro-rated fee adjustment
  - Transfer date
  - Both teachers notified
- Temporary leave/absence:
  - Medical/emergency leave
  - Duration specified
  - Make-up session options
  - Billing adjustment

### 3.2.3 Class Details and Settings

**Class Information Page:**
- Class name and code
- Subject/course
- Teacher(s) with photos
- Schedule (all sessions)
- Classroom location
- Current enrollment vs capacity
- Class description
- Learning objectives
- Grading policy
- Attendance policy
- Materials required
- Important dates (exams, assessments)

**Class Settings:**
- Allow late enrollment (Yes/No, cutoff date)
- Allow mid-term withdrawal (Yes/No)
- Attendance tracking enabled
- Grading enabled
- Assignment submission enabled
- Parent observation allowed
- Class maximum and minimum size
- Auto-cancel if minimum not met by X days before start
- Recording enabled (for online classes)
- Class chat/discussion board enabled

**Class Communication:**
- Class announcement board
- Direct message to all students/parents
- Share class materials
- Event/reminder notifications

## 3.3 Timetable/Schedule Builder

### 3.3.1 Creating Class Schedule

**Schedule Configuration:**
- Class session pattern:
  - Once per week
  - Twice per week
  - Three times per week
  - Custom (select specific days)
  - Intensive daily (e.g., holiday programs)
- For each session:
  - Day of week (Monday-Sunday)
  - Start time (format: HH:MM AM/PM)
  - End time (format: HH:MM AM/PM)
  - Duration (auto-calculated)
  - Break time (if applicable)
  - Session type (Regular / Lab / Practical / Exam)

**Recurring Schedule:**
- Weekly recurrence (every week)
- Bi-weekly recurrence
- Custom recurrence pattern
- Exclude specific dates (holidays, centre closed)
- Special schedule for specific weeks (e.g., exam week)
- End date:
  - After X sessions
  - By specific date
  - Ongoing (no end date)

**Schedule Templates:**
- Save common schedules as templates
- e.g., "Monday & Wednesday 4-6PM"
- Apply template to new classes
- Branch-specific templates

**Exception Dates:**
- Public holidays (auto-populate or manual)
- School holidays
- Centre closed days
- Teacher unavailable dates
- Make-up sessions for cancelled classes:
  - Propose alternative date/time
  - Notify students/parents
  - Mark as "make-up" session

### 3.3.2 Schedule Conflict Detection

**Real-time Conflict Checking:**
- Teacher double-booking check:
  - Alert if teacher assigned to overlapping classes
  - Consider travel time between branches
  - Consider teacher's blocked time/personal schedule
- Classroom double-booking check:
  - Alert if same room assigned to overlapping classes
  - Buffer time between classes (cleaning, setup)
- Student schedule conflict check:
  - Alert parent if enrolling in overlapping classes
  - Show student's full timetable
  - Suggest alternative class times

**Conflict Resolution:**
- Highlight conflicts in red
- Suggest alternative times/teachers/rooms
- Allow override with reason (logged)
- Batch conflict resolution tool

### 3.3.3 Visual Timetable Views

**Weekly Timetable View:**
- Grid layout (Time vs Days)
- Color-coded by:
  - Subject
  - Grade level
  - Teacher
  - Classroom
  - Branch
- Filter by:
  - Branch
  - Teacher
  - Student
  - Grade level
  - Classroom
  - Date range
- Click on time slot to see class details
- Drag-and-drop to reschedule (if permitted)

**Monthly Calendar View:**
- Calendar layout showing all sessions
- Color-coded class blocks
- Holiday markers
- Click on date to see all classes that day
- Filter options same as weekly view

**Teacher's Personal Timetable:**
- Shows only teacher's assigned classes
- Shows blocked/unavailable time
- Shows leave requests
- Export to personal calendar (iCal, Google Calendar)
- Print version

**Student's Personal Timetable:**
- Shows only student's enrolled classes
- Shows all subjects
- Color-coded by subject
- Printable version for student/parent
- Sync to mobile app

**Classroom Schedule:**
- Shows all classes in specific room
- Room utilization rate
- Available time slots
- Booking for non-class activities (meetings, events)

**Master Timetable:**
- Shows all classes across all branches
- Filter and sort options
- Export to Excel
- Print full schedule

## 3.4 Classroom Assignment

### 3.4.1 Classroom/Room Management

**Room Configuration:**
- Room Name/Number (e.g., "Room 101", "Lab A")
- Branch assignment
- Room Type:
  - Standard Classroom
  - Computer Lab
  - Science Lab
  - Art Studio
  - Music Room
  - Multi-purpose Hall
  - Library
  - Online (virtual room)
- Seating Capacity (maximum students)
- Size (square meters/feet)
- Floor/Building location
- Accessibility features:
  - Wheelchair accessible
  - Elevator access
  - Accessible washroom nearby

**Room Equipment:**
- Available equipment checklist:
  - Whiteboard/Blackboard
  - Projector
  - Computer/Laptop
  - TV/Display Screen
  - Sound system
  - Air conditioning
  - Ventilation
  - Individual desks
  - Group tables
  - Storage cabinets
  - Wifi availability
  - Power outlets
  - Specialized equipment (science lab, art supplies, etc.)
- Equipment condition tracking
- Maintenance schedule
- Request new equipment

**Room Photos:**
- Upload room photos
- Virtual tour (optional)
- Layout diagram

**Room Availability:**
- Available days and time blocks
- Blocked times (maintenance, cleaning)
- Special events blocking the room
- Regular bookings

**Room Status:**
- Active/In Use
- Under Maintenance
- Temporarily Unavailable
- Decommissioned

### 3.4.2 Room Assignment and Booking

**Assigning Room to Class:**
- Select from available rooms
- Filter by:
  - Capacity (minimum based on class size)
  - Equipment requirements
  - Accessibility needs
  - Availability during class time
- Show room utilization percentage
- Auto-suggest best fit rooms

**Room Booking:**
- Check availability calendar
- Book room for class
- Recurring booking for regular classes
- One-time booking for events/exams
- Priority booking for critical sessions
- Admin override if needed

**Room Change:**
- Reassign class to different room
- Reason for change (logged)
- Notify teacher and students
- Update class details
- Check for impacts

### 3.4.3 Capacity Management and Utilization

**Capacity Alerts:**
- Warning if class size exceeds room capacity
- Suggest larger rooms
- Split class suggestion if way over capacity

**Room Utilization Reports:**
- Percentage of time room is occupied
- Peak usage times
- Underutilized rooms
- Overboked rooms
- Revenue per room (if tracking)
- Utilization by branch
- Utilization trends over time

**Optimization Suggestions:**
- Suggest consolidating classes in fewer rooms
- Suggest splitting overcrowded classes
- Recommend additional rooms needed
- Identify rooms that can be repurposed

## 3.5 Class Capacity Management

### 3.5.1 Setting and Enforcing Capacity

**Maximum Capacity:**
- Set at course level (default) OR class level (custom)
- Based on:
  - Room capacity
  - Optimal teacher-student ratio
  - Course requirements (e.g., lab work needs smaller groups)
  - Regulatory requirements (if any)
- Hard limit (cannot exceed) vs Soft limit (can override with approval)

**Minimum Capacity:**
- Minimum students required to run class
- Grace period before auto-cancellation
- Notify admin if under minimum X days before start
- Option to:
  - Merge with another class
  - Cancel and refund students
  - Run anyway (admin decision)

**Capacity Tracking:**
- Real-time enrollment count
- Available spots displayed
- "Almost full" warning (e.g., <3 spots left)
- Visual capacity indicator (e.g., progress bar)

**Capacity Adjustments:**
- Admin can increase capacity:
  - Check room can accommodate
  - Reason required
  - Log change
- Admin can decrease capacity:
  - Cannot go below current enrollment
  - If reducing, handle overflow students:
    - Transfer to another class
    - Add to waitlist
    - Refund

### 3.5.2 Class Size Optimization

**Optimal Class Size Recommendations:**
- System suggests ideal class size based on:
  - Subject (e.g., language classes better with smaller groups)
  - Grade level
  - Student performance data
  - Teacher feedback
  - Revenue vs quality balance

**Class Splitting:**
- Auto-suggest when class hits capacity with large waitlist
- Option to create Section B with same schedule (different time)
- Clone class settings
- Assign students automatically or manually
- Distribute enrolled students if needed

**Class Merging:**
- Suggest merging under-enrolled classes of same subject/level
- Check teacher and room availability
- Notify all affected students/parents
- Handle schedule changes
- Refund differences if needed

## 3.6 Batch/Term Management

### 3.6.1 Academic Term Structure

**Term Configuration:**
- Term name (Term 1, Semester 1, Q1, January Intake, etc.)
- Academic year (e.g., 2026)
- Term type:
  - Regular Term (10-12 weeks)
  - Short Term (4-6 weeks)
  - Intensive (1-3 weeks)
  - Summer/Winter Program
  - Continuous (ongoing)
- Start date
- End date
- Number of teaching weeks
- Registration open date
- Registration close date
- Late registration allowed until (date)

**Term Breaks and Holidays:**
- Mid-term break:
  - Start date
  - End date
  - Classes held or suspended
- Public holidays within term (auto-populate)
- School holidays (customizable per region)
- Centre closure days
- Make-up policy for missed sessions during breaks

**Term Calendar:**
- Important dates:
  - Term start and end
  - Registration periods
  - Assessment/exam weeks
  - Report card distribution
  - Parent-teacher meeting dates
  - Fee payment due dates
- Publish calendar to parents/students
- Export calendar
- Print term planner

### 3.6.2 Term-based Class Management

**Creating Classes by Term:**
- Select term/semester
- Bulk create classes for the term
- Copy classes from previous term:
  - Same courses and teachers
  - Same schedule
  - Adjust dates automatically
  - Clear previous enrollment (fresh start)
  - Option to auto-enroll returning students

**Term Enrollment:**
- Mass enrollment for new term
- Re-enrollment of existing students:
  - Email invitation to re-enroll
  - Early bird discount for early re-enrollment
  - Auto-enroll if student on continuous enrollment plan
- Transfer students between terms (if overlapping)

**Term Reporting:**
- Enrollment numbers by term
- Revenue by term
- Class performance by term
- Term-over-term comparison
- Retention rate (students continuing to next term)

### 3.6.3 Batch Management

**Creating Student Batches:**
- Batch name (e.g., "2026 January Intake")
- Batch start date
- Group of students who enrolled together
- Assign multiple classes to a batch
- Track batch as a cohort
- Batch-specific announcements

**Batch Progression:**
- Move entire batch to next level/grade
- Batch promotion:
  - All students in batch promoted together
  - Same cohort moves through levels
  - Track from enrollment to graduation
- Batch performance analytics
- Batch retention tracking

**Batch Templates:**
- Create class packages for batches
- e.g., "Primary 5 Standard Package" includes:
  - English
  - Math
  - Science
- Apply template to batch enrollment
- Simplify enrollment for multiple subjects

## 3.7 Teacher Assignment to Classes

### 3.7.1 Teacher Assignment Process

**Assigning Teachers:**
- Select from teachers qualified to teach the subject:
  - Filter by subject specialization
  - Filter by grade level qualification
  - Filter by branch
  - Filter by availability
- Show teacher's current workload:
  - Number of classes teaching
  - Total teaching hours per week
  - Total number of students
  - Rating/performance score
- Check teacher availability for class schedule:
  - No conflicts with other classes
  - No conflicts with blocked time
  - No leave requests during term
- Assign as:
  - Primary Teacher (required)
  - Co-Teacher / Assistant
  - Substitute Teacher (backup)

**Multiple Teachers per Class:**
- Co-teaching model (two teachers share class)
- Define role split:
  - Primary responsibility
  - Specific topics/units assigned
  - Attendance marking rights
  - Grading rights
- Team teaching schedule

**Teacher Preferences:**
- Teachers can indicate preference for:
  - Subjects they prefer to teach
  - Grade levels they prefer
  - Days/times they prefer
  - Maximum classes they want
- System suggests matches based on preferences
- Admin has final assignment authority

### 3.7.2 Teacher Workload Management

**Workload Calculation:**
- Total teaching hours per week
- Number of classes assigned
- Number of students taught
- Preparation time (estimated per class)
- Grading time (estimated)
- Admin duties (if assigned)
- Total workload score

**Workload Limits:**
- Set maximum workload per teacher:
  - Full-time: X hours/week
  - Part-time: Y hours/week
- Alert if exceeding recommended limit
- Prevent assignment if over hard limit
- Workload distribution fairness check

**Workload Reports:**
- Teacher workload comparison (all teachers)
- Identify overloaded teachers
- Identify underutilized teachers
- Workload by subject
- Workload by branch
- Balance workload suggestions

### 3.7.3 Teacher Reassignment and Substitution

**Permanent Reassignment:**
- Remove teacher from class (reason required)
- Assign new teacher
- Notification to:
  - Old teacher (with reason)
  - New teacher (with class details)
  - All students and parents
  - Admin (logged)
- Transfer class materials, grades, notes to new teacher
- Handover meeting (optional)
- Impact on teacher's workload updated

**Temporary Substitution:**
- Teacher requests leave for specific dates
- Workflow:
  1. Teacher submits leave request
  2. Admin approves leave
  3. System identifies affected classes
  4. Assign substitute teacher:
     - Select from substitute pool
     - Check availability
     - Notify substitute
     - Confirm acceptance
  5. Notify students/parents of substitute
  6. Mark sessions as taught by substitute
  7. Payment adjustment for substitute (if applicable)

**Substitute Teacher Pool:**
- Maintain list of qualified substitute teachers
- Subject specialization
- Availability calendar
- Contact information
- Substitute history and ratings
- Preferred substitutes per subject
- Last-minute substitute contacts

**Emergency Coverage:**
- Teacher absent with no notice
- Emergency substitute assignment
- Send urgent notification
- Document reason for emergency
- Follow-up protocol

## 3.8 Substitute Teacher Management

### 3.8.1 Substitute Teacher Database

**Registering Substitute Teachers:**
- Same profile as regular teachers
- Mark as "Substitute Pool" status
- Subjects qualified to substitute
- Maximum hours willing to work
- Preferred branches
- Preferred days/times
- Notice required (e.g., 24 hours, same-day, emergency)
- Compensation rate (per hour/per session)

**Substitute Availability:**
- Calendar showing available dates/times
- Teachers update their availability
- Block unavailable periods
- Emergency contact for urgent requests

### 3.8.2 Substitute Assignment Process

**Requesting a Substitute:**
- Teacher submits leave request OR
- Admin marks teacher as unavailable
- System shows:
  - Classes needing substitute
  - Dates and times
  - Subject and grade level
  - Class size and room
- Automated matching:
  - Qualified substitutes
  - Available at required time
  - Ranked by:
    - Subject expertise
    - Familiarity with class (has subbed before)
    - Ratings
    - Proximity/branch preference
- Admin selects substitute and sends invitation
- Substitute accepts/declines
- If declined, offer to next substitute
- Confirmation sent when accepted

**Substitute Briefing:**
- Lesson plan access
- Class roster with student info
- Class materials
- Classroom location
- Special instructions from regular teacher
- Emergency procedures
- Admin contact

**Substitute Tracking:**
- Track all substitute sessions
- Attendance marked by substitute
- Notes/report submitted after session
- Parent feedback option
- Student feedback (optional)
- Payment tracking

### 3.8.3 Substitute Performance and Payments

**Substitute Performance Evaluation:**
- Admin rating after each session
- Regular teacher rating (after return)
- Parent/student feedback
- Issues or concerns logged
- Cumulative rating score
- Favorite substitutes flagged

**Substitute Payment:**
- Payment per session OR hourly rate
- Different rates by:
  - Subject complexity
  - Grade level
  - Notice period (emergency rate higher)
  - Session duration
- Payment scheduled (weekly/monthly)
- Payment history
- Invoice generation
- Tax documentation (if required)

**Substitute Statistics:**
- Total sessions covered
- Total hours worked
- Subjects covered
- Branches worked at
- Average rating
- Reliability score (acceptance rate, no-shows)
- Earnings report

---
