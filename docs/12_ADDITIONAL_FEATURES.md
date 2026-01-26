# Feature 12: Additional Features

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 12.1 Waiting List Management

### 12.1.1 Waitlist System

**Adding to Waitlist:**
- When class is full (capacity reached):
  - Option to join waitlist
  - Parent/student submits waitlist request
  - Capture information:
    - Student name and ID
    - Contact information
    - Preferred class(es)
    - Request date
    - Notes (e.g., specific scheduling needs)

**Waitlist Queue:**
- First-come, first-served (FCFS) by default
- OR priority-based (e.g., siblings, returning students, referrals)
- Waitlist position number assigned
- Estimated wait time (if calculable)

**Waitlist Notifications:**
- Confirmation email when added to waitlist
- Position on waitlist
- Estimated availability date
- Regular updates on position changes

### 12.1.2 Waitlist Management

**Spot Availability:**
- When spot becomes available (student withdraws or new class section added):
  - System identifies next student on waitlist
  - Automatic notification sent to parent:
    - "Spot available! Enroll within 48 hours"
  - Countdown timer (deadline to accept)
  - If not accepted within timeframe:
    - Move to next student on waitlist
    - Log reason (declined, no response, etc.)

**Accepting Offer:**
- Parent clicks "Accept" in notification or portal
- Confirms enrollment
- Completes payment (if required)
- Student moved from waitlist to enrolled
- Spot removed from waitlist
- Waitlist updated (everyone moves up one position)

**Declining Offer:**
- Parent clicks "Decline"
- Optional: Reason for declining
- Removed from waitlist OR
- Option to stay on waitlist for different class/time

**Waitlist Reports:**
- Number of students on waitlist (by class, subject, branch)
- Waitlist conversion rate (offers accepted vs declined)
- Average wait time
- Demand analysis (identify high-demand classes)

### 12.1.3 Proactive Waitlist Management

**Auto-Create New Classes:**
- If waitlist exceeds X students:
  - System suggests creating new class section
  - Admin can create new class to clear waitlist
  - Batch enrollment of waitlisted students

**Waitlist Communication:**
- Send updates to waitlist students:
  - New class opening
  - Alternative time slots available
  - Similar courses available
- Keep engaged (don't lose them to competitors)

## 12.2 Trial Class Booking

### 12.2.1 Trial Class System

**Trial Class Offering:**
- Offer free or discounted trial class:
  - First class free
  - Discounted trial package (e.g., 2 classes for $X)
- Applicable to:
  - New prospective students
  - Students switching subjects/levels
  - Re-engaging withdrawn students

**Trial Class Booking:**
- Public booking form (on website or portal):
  - Parent/student information
  - Interested subject(s)
  - Preferred date/time
  - Preferred branch
  - How did you hear about us? (referral source)
  - Child's current grade/level
  - Any special needs or requirements
  - Additional notes/questions
- Booking confirmation email
- Add to CRM system as "Lead"

**Trial Class Scheduling:**
- Admin reviews trial class requests
- Assign to available class (join existing class for trial)
- OR schedule dedicated trial class session (group trial)
- Assign teacher
- Book classroom
- Confirm date/time with parent
- Send calendar invite

**Trial Class Reminders:**
- Reminder email/SMS:
  - 1 day before trial class
  - 2 hours before trial class
- Include directions to centre, what to bring, contact info

### 12.2.2 Trial Class Experience

**During Trial Class:**
- Teacher welcomes trial student
- Provide trial materials (if needed)
- Engage trial student in class activities
- Observe and assess student's level
- Collect feedback from student (if appropriate)

**Post-Trial Class:**
- Thank you email to parent
- Teacher feedback:
  - Student's performance and level
  - Recommended class/program
  - Next steps
- Follow-up within 24-48 hours:
  - How was the trial experience?
  - Any questions?
  - Offer enrollment options

**Trial Class Feedback:**
- Survey for parent:
  - Satisfaction with trial class
  - Likelihood to enroll
  - What did your child enjoy?
  - Any concerns?
- Track feedback in CRM

### 12.2.3 Trial to Enrollment Conversion

**Enrollment Offers:**
- If trial successful, offer enrollment:
  - Recommended class and schedule
  - Fee structure
  - Early bird discount if enroll within X days
  - Waived registration fee (if applicable)
  - Easy enrollment link

**Conversion Tracking:**
- Track trial class attendees
- Track enrollment rate (% who enroll after trial)
- Conversion by subject, teacher, branch
- Identify effective trial strategies
- Follow-up on non-converters:
  - Understand why they didn't enroll
  - Address concerns
  - Offer alternative options

**Trial Class Analytics:**
- Total trial classes conducted
- Attendance rate (% who showed up)
- No-show rate
- Conversion rate
- Revenue generated from converted trials
- Cost per trial class
- ROI of trial program

## 12.3 Lead Management and CRM

### 12.3.1 Lead Capture

**Lead Sources:**
- Website inquiry form
- Phone inquiries
- Walk-in inquiries
- Trial class registrations
- Event registrations (open house, workshops)
- Referrals
- Social media messages
- Email campaigns
- Third-party platforms (education portals)

**Lead Information:**
- Lead contact details:
  - Parent name
  - Phone number
  - Email address
  - Student name
  - Student age/grade
- Inquiry details:
  - Interested subject(s)
  - Preferred branch
  - Preferred schedule
  - Budget/fee concerns
  - How they heard about us (referral source)
  - Inquiry date
  - Urgency (immediate, within a month, just exploring)
- Assign lead owner (sales person or branch admin)

**Lead Entry:**
- Manual entry (staff enters lead details)
- Web form integration (auto-capture from website)
- Import leads from CSV
- Email integration (parse inquiry emails)
- Chat integration (website live chat)

### 12.3.2 Lead Management

**Lead Stages:**
- New Lead (just received)
- Contacted (initial outreach made)
- Qualified (genuinely interested and fit criteria)
- Trial Scheduled (trial class booked)
- Trial Completed (attended trial)
- Proposal Sent (enrollment offer sent)
- Negotiation (discussing fees, schedule, etc.)
- Enrolled (converted to student)
- Lost (not interested or went to competitor)

**Lead Workflow:**
- Automatic assignment of leads (round-robin or based on criteria)
- Task creation (call lead within 24 hours)
- Reminders for follow-up
- Escalation if no action taken
- Move lead through stages manually or automatically

**Lead Communication:**
- Log all interactions:
  - Phone calls (date, time, notes)
  - Emails sent/received
  - Meetings (in-person or virtual)
  - SMS/WhatsApp messages
- Email templates for common responses
- Automated email sequences (drip campaigns)

**Lead Nurturing:**
- Send relevant content to leads:
  - Success stories
  - Sample lessons
  - Educational tips
  - Event invitations
  - Special offers
- Keep leads engaged until ready to enroll

### 12.3.3 CRM Features

**Contact Management:**
- Centralized database of all leads and contacts
- Search and filter (by status, source, date, branch, etc.)
- Tags and labels (e.g., "Hot Lead", "Price Sensitive", "Sibling")
- Notes and history (all past interactions)
- Related contacts (link parent and children, siblings)

**Task and Activity Management:**
- Create tasks (call lead, send email, schedule meeting)
- Assign tasks to team members
- Due dates and reminders
- Task status (pending, in progress, completed)
- Activity feed (timeline of all activities)

**Pipeline Management:**
- Visual pipeline (Kanban board style)
- Drag-and-drop leads between stages
- Pipeline analytics:
  - Number of leads in each stage
  - Conversion rate between stages
  - Average time in each stage
  - Bottlenecks (where leads get stuck)
- Forecast enrollment (based on pipeline)

**Reporting and Analytics:**
- Lead source effectiveness (which sources bring best leads)
- Conversion rate (leads to enrollments)
- Sales cycle length (time from lead to enrollment)
- Team performance (each sales person's conversion rate)
- Revenue per lead
- Cost per acquisition

**Integration:**
- Integrate CRM with:
  - Website forms (auto-capture leads)
  - Email (send/receive emails from CRM)
  - Calendar (schedule meetings)
  - SMS/WhatsApp (communicate with leads)
  - Accounting (track revenue from converted leads)

## 12.4 Referral Program Tracking

### 12.4.1 Referral Program Setup

**Referral Incentives:**
- Referrer rewards:
  - Cash reward ($X per successful referral)
  - Credit towards tuition fees
  - Discount on next term (X% off)
  - Gift cards
  - Tiered rewards (more referrals = better rewards)
- Referee rewards (referred person):
  - Discount on registration fee
  - First month discount
  - Free trial class
  - Gift upon enrollment

**Referral Program Rules:**
- Who can refer: Current students, parents, alumni, teachers
- Eligible referrals: New students who enroll (not just inquiries)
- Referral credit triggers: After referee pays first invoice OR after X weeks of enrollment (to prevent fraud)
- Expiry: Referral credits expire after X months if not used
- Limits: Max X referrals per person per term (if applicable)

**Referral Code:**
- Each current student/parent gets unique referral code
- Code format: [NAME]-[UNIQUE_ID] (e.g., JOHN-A123)
- Shareable link: www.centre.com/enroll?ref=JOHN-A123
- QR code (for easy sharing)

### 12.4.2 Referral Tracking

**Recording Referrals:**
- During enrollment, ask "Were you referred by someone?"
- Enter referrer's name or referral code
- System links new student to referrer
- Verify referral (admin can confirm)

**Referral Validation:**
- Check if referrer is active student/parent
- Check if referee is genuinely new (not re-enrollment)
- Prevent self-referrals
- Detect fraudulent referrals

**Referral Status:**
- Pending (referee enrolled but not yet paid)
- Approved (referee paid, referrer eligible for reward)
- Rewarded (reward issued to referrer)
- Expired (referee withdrew before credit triggered)
- Invalid (fraud detected)

**Referral Notifications:**
- Notify referrer when referee enrolls
- Notify referrer when credit/reward is approved
- Notify referrer when credit is issued
- Remind referrer of unused credits

### 12.4.3 Referral Management

**Referrer Dashboard:**
- Referrers can see:
  - Their referral code and shareable link
  - Number of successful referrals
  - Total credits/rewards earned
  - Pending referrals
  - Credit balance
  - Leaderboard (top referrers, if enabled)

**Referral Reports:**
- Total referrals (by month, term, year)
- Referrals by referrer (who refers most)
- Conversion rate (referred leads to enrollments)
- Cost of referral program (rewards paid out)
- ROI of referral program (revenue from referrals vs cost)

**Referral Promotion:**
- Promote referral program to current parents/students
- Email campaigns highlighting referral benefits
- Posters and flyers at centre
- Referral contests (e.g., "Refer 3 friends this month and win…")
- Social media sharing tools

## 12.5 Online/Virtual Classroom Integration

### 12.5.1 Virtual Classroom Platforms

**Supported Platforms:**
- Zoom
- Google Meet
- Microsoft Teams
- WebEx
- Custom virtual classroom solution
- Integration with existing LMS (Learning Management System)

**Platform Features:**
- Video conferencing (teacher and students)
- Screen sharing (teacher shares slides, notes)
- Whiteboard (digital whiteboard for explanations)
- Chat (text chat during class)
- Breakout rooms (for group activities)
- Recording (record sessions for replay)
- Polls and quizzes (check understanding)
- Hand raise (virtual hand raise for questions)

### 12.5.2 Online Class Scheduling

**Creating Online Classes:**
- Same as regular class creation (see Section 3.2)
- Select class type: "Online" or "Hybrid" (part online, part in-person)
- Generate virtual meeting link automatically
- OR manually enter meeting link (if using external platform)

**Meeting Details:**
- Meeting ID and password (if applicable)
- Join link (sent to students and parents)
- Dial-in number (for audio-only participants)
- Waiting room (students wait until teacher admits)

**Class Reminders:**
- Reminder emails/SMS with join link
- 1 day before, 1 hour before, 5 minutes before
- One-click join (from reminder email or app)

### 12.5.3 Online Class Management

**Attendance for Online Classes:**
- Automatic attendance (based on who joined meeting)
- Track join time and leave time
- Duration in class
- Teacher can manually adjust (e.g., mark present even if connection issues)

**During Online Class:**
- Teacher starts meeting
- Admit students from waiting room
- Conduct class using platform features
- Monitor engagement (who's active, who's passive)
- Record session

**Post-Class:**
- Recording available for students who missed class or want to review
- Upload recording to video library
- Share recording link with enrolled students only
- Attendance auto-marked based on meeting data

**Online Class Analytics:**
- Average attendance for online classes
- Engagement metrics (how many students participate via chat, polls, etc.)
- Connection quality (any technical issues)
- Compare online vs in-person attendance and performance

### 12.5.4 Hybrid Model

**Blended Learning:**
- Some students attend in-person, some join online (same class session)
- Teacher teaches in classroom, and class is live-streamed
- Online students can interact via chat/video
- Materials shared for all (in-person and online)

**Flexibility:**
- Students can choose to attend in-person or online on a per-session basis
- OR commit to online-only or in-person-only for the term
- Track preference and attendance for both modes

## 12.6 Exam Scheduling

### 12.6.1 Exam Management

**Creating Exams:**
- Exam details:
  - Exam name (e.g., "Term 1 Final Exam - Mathematics")
  - Subject
  - Grade level
  - Exam type (Mid-term, Final, Mock, Placement Test)
  - Exam date and time (start and end)
  - Duration
  - Total marks
  - Passing marks
  - Exam venue (room, branch, or online)
- Exam syllabus/topics covered
- Materials allowed (calculator, formula sheet, etc.)
- Exam instructions

**Exam Scheduling:**
- Create exam schedule for the term
- Multiple exams on different days (avoid conflicts)
- Assign invigilators (teachers who supervise exam)
- Book exam rooms
- Allocate seats (seating plan to prevent cheating)

**Exam Notifications:**
- Announce exam schedule to students and parents
- Exam timetable (all exams for the term)
- Reminders:
  - 1 week before exam
  - 1 day before exam
  - On exam day (morning)

### 12.6.2 Exam Administration

**Exam Attendance:**
- Check-in students as they arrive
- Mark attendance (present/absent)
- Late arrival policy (e.g., cannot enter after 15 minutes)

**Conducting Exam:**
- Distribute exam papers
- Invigilator instructions
- Monitor during exam (prevent cheating)
- Collect exam papers at end

**Exam Submission:**
- For in-person exams: Physical papers collected
- For online exams: Submissions via platform (see quiz management section 6.2)

### 12.6.3 Exam Results

**Grading:**
- Teachers grade exam papers
- Enter scores into system
- Moderation (if required, second teacher reviews)
- Finalize grades

**Results Publication:**
- Publish results to students and parents
- Individual result slips (subject-wise marks, total, grade)
- Class ranking (optional)
- Result analysis (class average, highest, lowest)

**Result Discussion:**
- Schedule result collection day (parents come to discuss)
- OR email results
- Parent-teacher meetings to discuss performance
- Recommendations for improvement

## 12.7 Certificate Generation

### 12.7.1 Certificate Types

**Achievement Certificates:**
- Course completion certificate
- Honor roll certificate (top performers)
- Perfect attendance certificate
- Most improved student certificate
- Subject excellence certificate
- Participation certificates (events, competitions)

**Graduation Certificates:**
- Graduating from a program or level
- Official certificate with:
  - Centre name and logo
  - Student name
  - Course/program completed
  - Dates (enrollment to completion)
  - Grades or performance summary
  - Principal/Director signature
  - Certificate number (unique ID)
  - Date of issue

**Award Certificates:**
- Special awards (e.g., Student of the Year)
- Competition winners
- Scholarship recipients

### 12.7.2 Certificate Design

**Certificate Templates:**
- Professional design with branding
- Customizable templates (different for different certificate types)
- Fields:
  - Centre logo
  - Certificate title
  - Student name (mail merge)
  - Course/achievement (mail merge)
  - Date
  - Signatures (Principal, teacher)
  - Certificate number
  - Decorative borders, seal, watermark
- Multi-language support

**Customization:**
- Admin can customize certificates
- Upload new templates
- Edit text and fields
- Preview before printing

### 12.7.3 Certificate Issuance

**Generating Certificates:**
- Select students (individual or bulk)
- Select certificate type
- Auto-populate student details
- Preview generated certificates
- Approve and finalize

**Printing:**
- Print on certificate paper (high-quality)
- Batch printing (multiple certificates at once)
- OR digital certificates (PDF)

**Distribution:**
- Hand out certificates at ceremony or graduation
- OR mail to home address
- OR email digital certificate
- Parents can download from portal

**Certificate Verification:**
- Each certificate has unique number
- Verification portal (enter certificate number to verify authenticity)
- QR code on certificate (scan to verify)

**Certificate Archive:**
- All issued certificates stored in system
- Searchable by student, certificate number, date
- Reprint certificates if lost (marked as "Duplicate")

---

