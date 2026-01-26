# Feature 4: Attendance System

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 4.1 Digital Attendance Marking

### 4.1.1 Attendance Marking Methods

**Manual Attendance (by Teacher):**
- Teacher logs into system
- Select class and session date
- Class roster displayed with all enrolled students
- Mark each student as:
  - Present (P)
  - Absent (A)
  - Late (L) - with time arrived
  - Excused Absence (EA) - with reason
  - Medical Leave (ML) - requires medical certificate
  - On Hold / Suspended (H)
- Bulk actions:
  - Mark all as present
  - Mark all as absent
  - Copy from previous session
- Add notes/remarks for specific students
- Submit attendance
- Late submission warning if not submitted within X hours after class

**QR Code Attendance:**
- System generates unique QR code for each class session
  - QR code displayed on teacher's device or printed
  - QR code changes for each session (security)
  - QR code valid only during class time +/- buffer (e.g., 15 min before, 30 min after)
- Student scans QR code using:
  - Mobile app
  - Dedicated tablet at entrance
- QR scan automatically marks as Present
- Record timestamp of scan
- If scanned late (after class start time + grace period):
  - Mark as Late (L)
  - Record exact time
- Photo capture on scan (optional, for verification)
- Teacher can review and adjust after QR scanning

**Biometric Integration (Optional):**
- Fingerprint scanner
- Face recognition
- RFID card tap
- Integration with third-party biometric devices
- API for biometric systems
- Real-time sync to attendance database
- Timestamps recorded
- Duplicate/fraud detection
- Manual override by teacher if biometric fails

**Self-Check-In (Student/Parent Portal):**
- Student or parent marks attendance online
- Available before and during class
- Requires verification (if not using QR/biometric)
- Teacher must confirm/approve
- Used for online classes primarily

**Attendance via Mobile App:**
- Teachers mark attendance on mobile device
- Students check-in via mobile app
- Real-time sync with server
- Offline mode (syncs when online)
- Push notifications for missed check-ins

### 4.1.2 Attendance Rules and Policies

**Grace Period:**
- Define grace period (e.g., 10 minutes after class start)
- Arrival within grace period = Present
- Arrival after grace period = Late
- Customizable per class or branch

**Late Arrival:**
- Number of minutes late recorded
- Excessive lateness policy:
  - X late arrivals = 1 absence
  - Parent notification trigger
  - Admin review trigger

**Excused Absence:**
- Reasons for excused absence:
  - Medical (requires certificate)
  - Family emergency
  - School event
  - Religious observance
  - Pre-approved absence
  - Others (with admin approval)
- Who can mark as excused:
  - Parent requests (admin approves)
  - Teacher marks (for valid reasons)
  - Admin marks
- Excused absences:
  - Do not count towards absence limit
  - OR count but with different weight
  - May qualify for make-up session

**Unexplained Absence:**
- Marked automatically if student doesn't show without notice
- Parent receives immediate notification
- Follow-up contact required
- Pattern detection (frequent unexplained absences)

**Attendance Submission Deadline:**
- Teacher must submit within X hours after class (e.g., 24 hours)
- Reminders sent if not submitted
- Escalation to admin if overdue
- Locked after deadline (requires admin unlock to edit)

### 4.1.3 Make-Up Sessions

**Make-Up Class Policy:**
- Students eligible for make-up if:
  - Excused absence (medical, emergency)
  - Class cancelled by centre
  - Teacher absent
  - Based on absence limit (e.g., allowed 2 make-ups per term)

**Scheduling Make-Up Sessions:**
- Parent requests make-up session
- Admin reviews and approves
- Options for make-up:
  - Join another class of same subject/level (different time)
  - Private make-up session with teacher (if available)
  - Group make-up session (multiple students who missed)
  - Online make-up session
  - Recorded lesson access
- Make-up session scheduled
- Notification sent to parent
- Mark attendance for make-up session
- Link to original missed session

**Make-Up Tracking:**
- Track number of make-ups used vs allowed
- Make-up balance per student
- Expiry date for make-up entitlement
- Report on make-up utilization

## 4.2 Attendance Reports and Alerts

### 4.2.1 Real-Time Attendance Reports

**Class Attendance Summary:**
- Today's attendance for all classes
- Filter by:
  - Branch
  - Teacher
  - Grade level
  - Time slot
- Show:
  - Class name
  - Total students
  - Present count
  - Absent count
  - Late count
  - Attendance percentage
  - Not yet marked (pending)
- Drill down to individual class roster

**Student Attendance Report:**
- Individual student's attendance history
- Date range filter
- Filter by subject/class
- Show:
  - Date
  - Class/Subject
  - Status (P/A/L/EA/ML)
  - Time (if late)
  - Remarks
  - Total classes attended
  - Total classes scheduled
  - Attendance percentage
- Visual attendance calendar (color-coded)
- Attendance trend graph
- Export to PDF/Excel

**Teacher Attendance Report:**
- Teacher's own attendance (as employee)
- Classes taught vs scheduled
- On-time arrival rate
- Leave taken
- Export report

**Class-wise Attendance:**
- Attendance summary per class
- Session-by-session breakdown
- Average attendance percentage
- Best and worst attended sessions
- Identify patterns (e.g., Monday sessions have lower attendance)

**Branch Attendance Report:**
- Overall attendance across branch
- Comparison between classes
- Comparison between grade levels
- Trend over time (daily/weekly/monthly)
- Attendance heatmap

### 4.2.2 Attendance Alerts and Notifications

**Real-Time Absence Alert:**
- Immediate notification to parent when student marked absent
- SMS and/or email and/or push notification
- Message includes:
  - Student name
  - Class/Subject
  - Date and time
  - Marked by (teacher)
- Option for parent to provide reason immediately

**Late Arrival Notification:**
- Notify parent when student marked late
- Include time of arrival
- If exceeds X late arrivals, escalate notification

**Consecutive Absence Alert:**
- Alert if student absent for X consecutive sessions (e.g., 2-3)
- Sent to:
  - Parent
  - Teacher
  - Admin
- Prompt for follow-up action:
  - Contact parent
  - Check on student welfare
  - Review enrollment status

**Low Attendance Warning:**
- Alert when student's attendance falls below threshold (e.g., 75%)
- Sent to:
  - Parent (first warning)
  - Admin (for monitoring)
- Escalating warnings at different thresholds:
  - 75%: Warning
  - 60%: Serious concern
  - 50%: Critical (may affect enrollment)
- Recommend intervention

**Teacher Not Submitted Reminder:**
- Reminder to teacher to submit attendance
- Sent if not submitted within timeframe
- Escalate to admin if overdue by 24+ hours

**Perfect Attendance Recognition:**
- Congratulatory message to student/parent
- When student achieves perfect attendance for:
  - 1 month
  - 1 term
  - 1 year
- Optional: Award certificate or badge

### 4.2.3 Attendance Analytics

**Attendance Trends:**
- Monthly attendance trend (line graph)
- Compare current term vs previous terms
- Seasonal patterns (e.g., lower in exam period, holidays)
- Day-of-week patterns (e.g., Fridays lower attendance)
- Time-of-day patterns (e.g., morning vs evening classes)

**Student Attendance Patterns:**
- Identify frequently absent students
- Identify perfect attendance students
- Absence reasons analysis (what's most common)
- Correlation between attendance and performance
- At-risk student identification

**Class Attendance Patterns:**
- Classes with consistently high attendance
- Classes with consistently low attendance
- Investigate causes:
  - Teacher effectiveness
  - Class timing
  - Subject difficulty
  - Class size
- Recommendations for improvement

**Attendance vs Performance:**
- Correlation analysis
- Do students with better attendance perform better?
- Threshold attendance for good performance
- Students with high attendance but low performance (need different intervention)

## 4.3 Late Arrival Tracking

### 4.3.1 Recording Late Arrivals

**Late Arrival Data:**
- Student name and ID
- Class and date
- Scheduled start time
- Actual arrival time
- Minutes late (auto-calculated)
- Reason (if provided):
  - Traffic
  - School activity ran late
  - Public transport delay
  - Family matter
  - No reason provided
- Marked by (teacher/system)

**Late Policy:**
- Grace period: X minutes (configurable)
- Within grace period: Marked Present
- After grace period: Marked Late
- Very late (e.g., >30 min): Option to mark as Partial Attendance
- Excessive lateness (e.g., >60 min or missed >50% class): Mark as Absent

**Late Arrival Accumulation:**
- Track total late arrivals per student
- Per class/subject
- Per term/year
- Late arrival policy:
  - 3 late arrivals = 1 absence (example)
  - OR deduct from attendance percentage differently
  - Penalties or consequences (if applicable)

### 4.3.2 Late Arrival Notifications

**Immediate Late Notification:**
- Notify parent when marked late
- Include:
  - Time student arrived
  - Minutes late
  - Class details
- Option to provide reason via reply

**Repeated Lateness Alert:**
- Alert when student late X times in Y period (e.g., 3 times in 2 weeks)
- Escalation to admin
- Request parent meeting
- Investigate underlying issues:
  - Transport problems
  - Home situation
  - Time management issues
  - Recommend solutions

**Late Arrival Report to Parents:**
- Weekly/monthly summary of late arrivals
- Include all instances with dates and times
- Encourage punctuality

### 4.3.3 Late Arrival Analysis

**Student Lateness Trends:**
- Which students are frequently late
- Patterns (e.g., always late for Monday classes)
- Time analysis (how late on average)
- Improvement or worsening over time

**Class Lateness Analysis:**
- Which classes have most late arrivals
- Timing issues (e.g., 8 AM class has more late arrivals)
- Suggest schedule changes
- External factors (traffic, public transport schedules)

**Interventions:**
- Counseling for chronically late students
- Adjust class timing if systemic issue
- Provide resources (e.g., carpooling, transport assistance)
- Parent education on importance of punctuality

## 4.4 Absence Notifications to Parents

### 4.4.1 Automated Absence Notifications

**Immediate Notification:**
- Sent as soon as attendance is marked
- Delivery methods:
  - SMS (primary, for immediate awareness)
  - Email (detailed information)
  - Push notification (mobile app)
  - WhatsApp (if integrated)
- Parent notification preferences respected:
  - Choose preferred method(s)
  - Set quiet hours (no notifications during these times)
  - Emergency contact escalation if no response

**Notification Content:**
- Student name
- Class/subject name
- Date and time of class
- Attendance status (Absent/Late)
- Teacher name
- Center/branch
- Call-to-action:
  - Provide reason for absence (if not already provided)
  - Contact teacher
  - Contact admin
  - Schedule make-up session

**Notification Templates:**
- Different templates for:
  - Absent without notice
  - Late arrival
  - Excused absence (confirmation)
  - Medical leave (reminder to submit certificate)
- Customizable by branch
- Multilingual templates

### 4.4.2 Parent Response and Communication

**Parent Response Options:**
- Quick response buttons:
  - "Student is sick" (auto-request medical leave)
  - "Family emergency"
  - "Transport issue"
  - "School event"
  - "Other" (free text)
- Response logged in student record
- Admin can review all responses
- Unresponsive parent tracking:
  - Flag parents who never respond to absence notifications
  - Follow-up call required

**Two-Way Communication:**
- Parent can reply to notification
- Teacher receives reply
- Conversation thread saved
- Parent can request make-up session directly
- Parent can inform of upcoming absence in advance (pre-absence notification)

### 4.4.3 Follow-Up and Escalation

**Absence Follow-Up Protocol:**
- Day 1: Automatic notification
- Day 2-3: If still absent, automated check-in message
- Day 3+: Admin manual follow-up call
- 1 week absent: Escalate to branch admin
- 2 weeks absent: Review enrollment status, potential withdrawal

**Multiple Child Households:**
- If sibling absent, check with parent if both sick
- Combined notification for siblings
- Family status check

**Emergency Contact Escalation:**
- If primary parent unresponsive
- Contact secondary parent
- If both unresponsive, contact emergency contacts
- Log all attempts

**Critical Absence Situations:**
- Sudden stoppage (student was regular, then disappears)
- No response to multiple contact attempts
- Suspected welfare issues
- Involve admin and potentially authorities (in extreme cases)

## 4.5 Attendance-Based Billing Adjustments

### 4.5.1 Billing Policies Based on Attendance

**Absence Billing Policy:**
- No refund for unexcused absences (standard)
- Partial refund for excused absences (based on policy):
  - Medical leave: X% refund or make-up session
  - Family emergency: Make-up session only
  - Extended leave (>1 week): Pro-rated refund
- Centre-caused absences (teacher absent, class cancelled):
  - Full make-up session OR
  - Full credit/refund
- Different policies for different payment plans:
  - Per-session payment: Pay only for attended sessions
  - Monthly payment: No refund but make-up offered
  - Term payment: Refund for prolonged absence only

**Attendance-Based Fees:**
- Pay-per-session model:
  - Fee charged only when attended
  - Prepay credit balance
  - Deduct upon attendance
  - Unused credits rollover or refund policy
- Minimum attendance billing:
  - If student attends <X%, charge minimum fee
  - If student attends >Y%, charge full fee
  - Sliding scale

**Make-Up Session Costs:**
- Make-up sessions included in fee (up to limit)
- Additional make-up sessions charged separately
- Private make-up session higher cost than group
- Make-up credits system

### 4.5.2 Automated Billing Adjustments

**Absence Credits:**
- For excused absences, auto-generate credit
- Credit amount based on:
  - Session fee
  - Absence reason
  - Policy terms
- Credit applied to:
  - Next month's invoice
  - Make-up session booking
  - Future enrollment
  - Refund (if requested)

**Prorated Billing:**
- Student enrolled mid-month:
  - Bill only for sessions from enrollment date onwards
  - Calculate based on sessions attended vs total sessions in month
- Student withdrew mid-month:
  - Bill up to last attended session
  - Refund overpaid amount
- Student on hold:
  - Pause billing during hold period
  - Resume upon return

**Attendance Threshold Discounts:**
- Reward for excellent attendance:
  - >95% attendance: X% discount next month
  - Perfect attendance for term: Bonus discount or free session
  - Loyalty discount for consistent attendance over multiple terms

**Attendance Penalties (If Applicable):**
- Poor attendance fees:
  - <60% attendance: Administrative fee
  - Frequent no-shows: Deposit requirement
  - Unreliable students: Require upfront payment
- Intended to encourage commitment and reduce dropouts

### 4.5.3 Billing Reports and Reconciliation

**Attendance vs Billing Report:**
- Compare sessions scheduled vs attended
- Compare fees charged vs fees should be charged (based on attendance)
- Identify discrepancies
- Automated reconciliation
- Manual adjustments logged

**Credit and Refund Tracking:**
- All credits issued due to absences
- All refunds processed
- Outstanding credits per student
- Expiry tracking for credits
- Utilization rate (credits used vs issued)

**Invoicing with Attendance Data:**
- Itemized invoice showing:
  - Total sessions scheduled
  - Sessions attended
  - Sessions absent
  - Make-up sessions taken
  - Credits applied
  - Net amount due
- Transparency for parents

**Financial Impact of Absences:**
- Revenue lost due to absences
- Revenue recovered via make-up sessions
- Credits issued vs redeemed
- Impact on monthly/annual revenue
- Forecasting adjustments based on historical attendance

### 4.5.4 Attendance-Based Enrollment Reviews

**Enrollment Status Based on Attendance:**
- Policy: Students must maintain minimum X% attendance to remain enrolled
- Attendance monitoring:
  - Monthly review of all students below threshold
  - Warning issued at first breach
  - Probation period to improve
  - If no improvement: Recommend withdrawal OR put on hold
- Exceptions handling:
  - Medical reasons (long-term illness)
  - Family circumstances
  - School commitments
- Admin override with justification

**Inactive Student Management:**
- Student hasn't attended for X weeks:
  - Marked as "Inactive"
  - Billing suspended
  - Slot freed up for other students
  - Parent contacted for intent
  - Options:
    - Withdraw formally
    - Put on hold (with return date)
    - Resume attendance
- Auto-withdrawal after prolonged inactivity:
  - E.g., no attendance for 4 weeks without reason
  - Parent notified before auto-withdrawal
  - Option to reactivate

**Attendance Improvement Plans:**
- For students with poor attendance
- Admin/teacher creates plan:
  - Identify barriers to attendance
  - Set attendance goals
  - Regular check-ins
  - Support measures (transport assistance, schedule changes)
  - Review progress monthly
- Document outcomes

---
