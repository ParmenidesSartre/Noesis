# Feature 10: Administrative Tools

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 10.1 Branch/Center Management (Multi-Location Support)

### 10.1.1 Branch Setup

**Creating a Branch:**
- Branch details:
  - Branch name (e.g., "Downtown Branch", "North Branch")
  - Branch code (unique identifier, e.g., "DTN", "NTH")
  - Address (street, city, state, postal code, country)
  - Contact information:
    - Phone number(s)
    - Email address
    - Website (if branch-specific)
  - Operating hours (by day of week)
  - Time zone (if multi-region)
  - Capacity (max students this branch can accommodate)
  - Number of classrooms
  - Branch manager/admin assignment
  - Opening date
  - Branch status (Active/Inactive/Coming Soon)

**Branch Configuration:**
- Fee structure (branch-specific pricing if different)
- Subjects/courses offered at this branch
- Grade levels served
- Special programs available
- Facilities available (library, lab, cafeteria, etc.)
- Branch-specific policies (refund policy, attendance policy, etc.)

**Branch Branding:**
- Branch logo (if different from main)
- Branch colors/theme
- Branch-specific templates (invoices, certificates)
- Branch contact signatures

### 10.1.2 Multi-Branch Management

**Centralized vs Decentralized:**
- Centralized model: All branches managed from HQ
- Decentralized model: Each branch has autonomy
- Hybrid model: Some central policies, some branch autonomy
- Configure level of independence per branch

**Cross-Branch Operations:**
- Student transfer between branches
- Teacher assignment across branches
- Shared resources (curriculum, materials)
- Cross-branch reporting
- Unified student/parent portal (access all branches)

**Branch Comparison:**
- Compare performance across branches:
  - Enrollment numbers
  - Revenue
  - Retention rate
  - Student performance
  - Teacher performance
- Identify best practices from top-performing branches
- Support underperforming branches

**Branch Communication:**
- Inter-branch announcements
- Share resources and materials
- Teacher collaboration across branches
- Admin meetings (all branch managers)

### 10.1.3 Branch Hierarchy

**Organization Structure:**
- Head office/HQ
- Regional offices (if applicable)
- Individual branches
- Define reporting structure

**Branch Roles:**
- Branch admin (manages one branch)
- Regional manager (oversees multiple branches)
- Super admin (oversees entire organization)

**Branch Permissions:**
- Define what each branch can/cannot do
- Centralized control (e.g., fee changes require HQ approval)
- Branch autonomy (e.g., branch can hire teachers)

## 10.2 Room/Facility Management

### 10.2.1 Room Management

(Already covered extensively in Section 3.4 - Class & Schedule Management)

**Additional Facility Features:**

**Facility Types:**
- Classrooms
- Computer labs
- Science labs
- Art studios
- Music rooms
- Libraries
- Multi-purpose halls
- Meeting rooms
- Staff rooms
- Storage rooms
- Cafeteria/Snack area
- Reception/Lobby
- Restrooms
- Outdoor areas (playground, sports area)

**Facility Maintenance:**
- Maintenance schedule for each facility
- Track repairs and maintenance history
- Report facility issues
- Maintenance request workflow
- Preventive maintenance planning

**Facility Booking:**
- Book facilities for non-class activities:
  - Meetings
  - Events
  - Workshops
  - Exams
- Booking approval workflow
- Prevent conflicts
- External bookings (if facility rented out)

### 10.2.2 Equipment and Asset Management

**Equipment Inventory:**
- List of all equipment:
  - Computers/Laptops
  - Projectors
  - Whiteboards/Smartboards
  - Audio systems
  - Lab equipment
  - Furniture (desks, chairs)
  - Sports equipment
  - Books and materials
- Equipment details:
  - Asset ID/tag
  - Description
  - Location (which room/branch)
  - Purchase date
  - Purchase cost
  - Warranty period
  - Condition (New/Good/Fair/Poor/Needs Repair)
  - Assigned to (teacher, room)

**Asset Tracking:**
- Track asset location and usage
- Transfer assets between rooms/branches
- Check-out/check-in system (for portable equipment)
- Asset depreciation calculation

**Maintenance and Repairs:**
- Schedule equipment maintenance
- Log repairs and service history
- Track maintenance costs
- Alert when warranty expiring
- Dispose of outdated/broken equipment (logging)

**Procurement:**
- Equipment request workflow
- Purchase order creation
- Vendor management
- Budget tracking for equipment purchases

## 10.3 Inventory Management (Books, Materials)

### 10.3.1 Inventory Tracking

**Inventory Items:**
- Textbooks
- Workbooks
- Stationery supplies
- Art supplies
- Lab consumables
- Teaching aids
- Office supplies
- Merchandise (if selling branded items)

**Inventory Details:**
- Item name and description
- Item code/SKU
- Category
- Unit of measure (piece, pack, box, etc.)
- Current stock quantity
- Minimum stock level (reorder point)
- Maximum stock level
- Unit cost
- Selling price (if applicable)
- Supplier information
- Storage location

**Stock Levels:**
- Real-time stock tracking
- Stock in (purchases, additions)
- Stock out (sales, usage, wastage)
- Stock adjustments (corrections, audits)
- Low stock alerts (when below minimum)
- Overstock alerts (when above maximum)

### 10.3.2 Stock Management

**Stock In:**
- Receive new stock (purchase orders, donations)
- Record quantity received
- Update inventory levels
- Generate stock receipt

**Stock Out:**
- Issue stock to teachers/students/classes
- Sale of materials to parents
- Stock used for classes
- Record quantity issued
- Update inventory levels
- Generate issue receipt

**Stock Transfer:**
- Transfer stock between branches
- Transfer requisition and approval
- Update stock levels at both locations
- Track in-transit stock

**Stock Audit:**
- Periodic physical stock count
- Compare actual vs system stock
- Identify discrepancies
- Adjust stock levels
- Investigate variances (theft, wastage, errors)

### 10.3.3 Inventory Reports

**Stock Level Report:**
- Current stock of all items
- Filter by category, location, low stock
- Export to Excel

**Stock Movement Report:**
- All stock in and stock out transactions
- Date range filter
- By item, by location
- Identify fast-moving and slow-moving items

**Stock Valuation Report:**
- Total value of inventory (quantity × unit cost)
- By category, by location
- For financial reporting

**Reorder Report:**
- Items below minimum stock level
- Suggested reorder quantity
- Supplier information for reordering

## 10.4 Staff Payroll Integration

### 10.4.1 Payroll Data Management

**Employee Payroll Information:**
- Employee ID
- Full name
- Role (Teacher, Admin, Support Staff)
- Employment type (Full-time, Part-time, Contract)
- Pay rate:
  - Salary (monthly for full-time)
  - Hourly rate (for part-time)
  - Per-session rate (for contract teachers)
- Bank account details (for direct deposit)
- Tax information (tax ID, tax exemptions)

**Working Hours Tracking:**
- For hourly/part-time staff:
  - Track hours worked (from attendance or manual entry)
  - Overtime hours
  - Approved leave hours (paid/unpaid)
- For teachers:
  - Classes taught (number of sessions)
  - Auto-calculate from class schedule
  - Substitute sessions covered

**Deductions and Benefits:**
- Statutory deductions (tax, social security, etc.)
- Voluntary deductions (insurance, retirement contributions)
- Benefits (allowances, bonuses)
- Advances/loans (deduct from salary)

### 10.4.2 Payroll Processing

**Payroll Calculation:**
- Calculate gross pay:
  - Salary OR Hourly rate × Hours worked OR Sessions × Per-session rate
  - Add allowances, bonuses, overtime
- Calculate deductions:
  - Taxes
  - Social security
  - Other deductions
- Calculate net pay (Gross pay - Deductions)

**Payroll Approval:**
- Generate payroll report for approval
- Admin reviews payroll
- Approve or adjust
- Finalize payroll

**Payroll Disbursement:**
- Generate payment instructions
- Integration with bank (for direct deposit):
  - Upload payroll file to bank portal
  - Or use API integration
- Generate cheques (if paying by cheque)
- Pay cash (record cash payment)
- Record payment date

**Payslip Generation:**
- Auto-generate payslips for all employees
- Payslip details:
  - Employee name and ID
  - Pay period
  - Gross pay breakdown
  - Deductions breakdown
  - Net pay
  - Year-to-date totals
- Deliver payslips:
  - Email to employee
  - Available in employee portal
  - Print and hand out

### 10.4.3 Payroll Reporting

**Payroll Summary Report:**
- Total payroll cost for the period
- Breakdown by employee type
- Breakdown by department/branch
- Comparison to budget

**Tax Reports:**
- Tax deductions summary (for government reporting)
- Annual tax forms (W-2, 1099, etc., region-specific)
- Export for accountant

**Employee Payroll History:**
- Individual employee's payroll history
- All pay periods
- Total earnings year-to-date
- Total deductions

**Payroll Integration:**
- Export payroll data to accounting software:
  - QuickBooks
  - Xero
  - Sage
  - Custom export format (CSV, Excel)

## 10.5 Expense Tracking

### 10.5.1 Expense Management

**Expense Categories:**
- Operational Expenses:
  - Rent and utilities (electricity, water, internet)
  - Salaries and wages
  - Teacher payments
  - Office supplies
  - Cleaning and maintenance
- Marketing and Advertising:
  - Online ads
  - Print materials
  - Events and promotions
- Technology:
  - Software subscriptions
  - Hardware purchases
  - IT support
- Academic:
  - Textbooks and materials
  - Equipment for labs
  - Curriculum development
- Administrative:
  - Bank fees
  - Insurance
  - Legal and professional fees
  - Licenses and permits

**Recording Expenses:**
- Expense entry form:
  - Date
  - Category
  - Description
  - Amount
  - Payment method (cash, card, bank transfer, cheque)
  - Vendor/Supplier
  - Receipt/invoice number
  - Paid by (employee name if reimbursement)
  - Branch (which branch incurred this expense)
- Attach receipt image/PDF

**Expense Approval:**
- Expense submission by staff
- Approval workflow:
  - Small expenses (<$X): Auto-approved
  - Medium expenses ($X-$Y): Branch admin approves
  - Large expenses (>$Y): Super admin approves
- Approved expenses processed for payment

**Expense Reimbursement:**
- Employees submit expenses for reimbursement
- Attach receipts
- Admin reviews and approves
- Reimburse via next payroll or separate payment

### 10.5.2 Expense Tracking and Reporting

**Expense Dashboard:**
- Total expenses (MTD, YTD)
- Expenses by category
- Expenses by branch
- Budget vs actual
- Alerts for over-budget categories

**Expense Reports:**
- Detailed expense report (all transactions)
- Summary by category
- Summary by vendor
- Summary by branch
- Export to Excel/PDF

**Budget Management:**
- Set budget for each expense category
- Set budget for each branch
- Track actual vs budget
- Variance analysis
- Alerts when approaching or exceeding budget

**Expense Analytics:**
- Expense trends over time
- Identify cost-saving opportunities
- Vendor analysis (spending per vendor, negotiate better rates)

## 10.6 Document Management

### 10.6.1 Document Repository

**Document Types:**
- Policies and procedures
- Contracts and agreements (employment, vendor, parent)
- Legal documents (licenses, permits, certifications)
- Forms and templates
- Meeting minutes
- Correspondence
- Marketing materials
- Financial documents (invoices, receipts, tax filings)
- Student records (confidential)
- Teacher records (confidential)

**Document Storage:**
- Centralized document repository
- Organized by category and folder structure
- Version control (track document revisions)
- Document metadata (title, description, tags, date, owner)

**Document Upload:**
- Drag-and-drop upload
- Bulk upload
- Scan and upload (paper documents digitized)
- Supported formats (PDF, Word, Excel, images, etc.)

**Document Access Control:**
- Set permissions per document or folder:
  - Public (all users)
  - Admin only
  - Specific roles
  - Specific users
- Confidential documents (restricted access)
- Audit log (who accessed which document when)

### 10.6.2 Document Search and Retrieval

**Search Functionality:**
- Search by document name
- Search by keywords in document content (full-text search)
- Filter by document type, date, owner, category
- Advanced search (multiple criteria)

**Document Preview:**
- Preview documents without downloading
- PDF viewer, Word viewer, etc.

**Document Download:**
- Download original file
- Download as PDF (if converted)
- Bulk download (zip multiple documents)

### 10.6.3 Document Workflow

**Document Approval Workflow:**
- Submit document for approval (e.g., new policy)
- Approval chain (reviewer 1 → reviewer 2 → final approver)
- Comments and feedback
- Approve, request changes, or reject
- Track approval status

**Document Expiry and Renewal:**
- Set expiry date for documents (e.g., insurance policy, license)
- Alerts before expiry
- Renewal workflow
- Archive expired documents

**E-Signatures:**
- Integration with e-signature tools (DocuSign, Adobe Sign, HelloSign)
- Send documents for signature
- Track signature status
- Store signed documents

## 10.7 Calendar and Events Management

### 10.7.1 Calendar System

**Master Calendar:**
- System-wide calendar showing all events
- Types of events:
  - Holidays (public holidays, school holidays)
  - Term dates (start and end of each term)
  - Exam schedules
  - Parent-teacher meetings
  - Staff meetings
  - Training sessions
  - Workshops and seminars
  - School events (concerts, sports day, etc.)
  - Marketing events (open house, trial class sessions)
  - Maintenance days (centre closed)

**Calendar Views:**
- Monthly view
- Weekly view
- Daily view
- Agenda view (list format)
- Filter by event type, branch, user

**Multiple Calendars:**
- Academic calendar (terms, exams, holidays)
- Class schedules calendar
- Events calendar
- Staff calendar
- Personal calendar (for each user)
- Overlay multiple calendars

### 10.7.2 Event Creation

**Creating Events:**
- Event name
- Event type/category
- Description
- Date and time (start and end)
- All-day event (checkbox)
- Recurring event (repeat daily, weekly, monthly, yearly)
- Location (branch, room, or external venue)
- Organizer
- Attendees/participants
- Public or private event
- Registration required (Yes/No)

**Event Notifications:**
- Notify attendees when event created
- Reminders before event (1 week, 1 day, 1 hour)
- Notification channels (email, SMS, push)

**Event Registration:**
- RSVP/registration link
- Track registrations
- Capacity limit
- Waitlist

### 10.7.3 Calendar Integration

**Personal Calendar Sync:**
- Export centre calendar to personal calendar:
  - Google Calendar
  - Apple Calendar
  - Outlook Calendar
  - iCal format
- Two-way sync (if integration supported)

**Calendar Sharing:**
- Share calendar with external parties (parents, partners)
- Public calendar URL
- Embed calendar on website

**Calendar Permissions:**
- Who can create events (admin, teachers, specific roles)
- Who can view calendar (all users, specific roles)
- Who can edit events

---
