# Feature 5: Billing & Payment

**Document Version:** 1.0
**Last Updated:** 2026-01-26

---

## 5.1 Fee Structure Management

### 5.1.1 Fee Configuration by Course/Level/Duration

**Base Fee Setup:**
- Course-level base fees:
  - Fee per session (e.g., $50/session)
  - Fee per month (e.g., $200/month for 4 sessions)
  - Fee per term (e.g., $800/term for 12 weeks)
  - Fee per hour (for hourly billing)
- Different rates for different criteria:
  - Grade level (Primary fees vs Secondary fees)
  - Subject (Math vs Science vs Language)
  - Class type (Group vs Small Group vs One-on-One)
  - Session duration (60min vs 90min vs 120min)
  - Day/time (peak hours vs non-peak)
  - Location/branch (premium locations higher fees)

**Fee Packages:**
- Single subject package
- Multi-subject packages:
  - 2 subjects: X% discount
  - 3+ subjects: Y% discount
- Bundled packages (e.g., Math + Science combo)
- Unlimited package (all subjects, fixed price per month)

**Flexible Pricing Models:**
- Per-session (pay as you go)
- Weekly billing
- Monthly billing
- Quarterly billing (with discount)
- Semester/Term billing (with discount)
- Annual billing (with largest discount)
- Subscription model (auto-renewing monthly)

**Dynamic Pricing:**
- Early bird pricing (enroll before X date)
- Last-minute enrollment pricing
- Peak season pricing (exam period intensive courses)
- Off-peak discounts (summer/holiday programs)
- Promotional pricing (launch offers)

**Fee Tiers:**
- Standard tier
- Premium tier (additional benefits: smaller class, extra materials, priority scheduling)
- VIP tier (one-on-one attention, customized curriculum)
- Each tier with different pricing

### 5.1.2 Additional Fees

**One-Time Fees:**
- Registration fee (new student, non-refundable):
  - Amount configurable per branch/course
  - Can be waived for certain conditions (referrals, scholarships)
- Material fee (textbooks, workbooks, supplies):
  - Per subject
  - Per term or one-time
  - Separate invoice or bundled
- Deposit (refundable upon withdrawal):
  - Standard deposit amount
  - Conditions for full/partial refund
  - Offset against fees or separate
- Assessment/Placement test fee
- Certificate fee (upon graduation)
- Re-enrollment fee (students returning after withdrawal)

**Recurring Fees:**
- Facility fee (monthly/term)
- Technology fee (access to online platform)
- Administrative fee (monthly)
- Maintenance fee

**Conditional Fees:**
- Late payment fee (penalty)
- Bounced check/payment failure fee
- Re-assessment fee (if student needs to retake placement test)
- Material replacement fee (lost textbooks)
- Makeup session fee (if beyond included sessions)
- Private tutoring sessions (additional)

**Exam/Competition Fees:**
- Mock exam registration
- External exam registration (handled by centre)
- Competition participation fees
- Separate billing and collection

### 5.1.3 Fee Versioning and History

**Fee History Tracking:**
- Track all fee changes over time
- Version number for each fee structure
- Effective date and end date
- Reason for change logged
- Changed by (admin name)
- Previous fee vs new fee comparison

**Fee Grandfathering:**
- Students enrolled at old fee structure can continue at old rate (if policy allows)
- OR all students migrate to new fee structure from X date
- Configure grace period for transition

**Fee Notifications:**
- Notify parents of fee changes:
  - Advance notice (e.g., 30 days before effective date)
  - Detailed explanation
  - Comparison table (old vs new)
  - Option to provide feedback
- Admin approval required for fee increases

## 5.2 Invoice Generation

### 5.2.1 Automated Invoice Creation

**Recurring Invoice Generation:**
- Scheduled automatic invoice generation:
  - Monthly: Generate on 1st of month (or custom date)
  - Weekly: Generate every Monday (or custom day)
  - Term: Generate at start of term
- Batch generation for all active students
- Individual generation for specific students
- Trigger conditions:
  - New enrollment (immediate)
  - Plan renewal
  - Additional service purchased
  - Manual admin trigger

**Invoice Content:**
- Invoice header:
  - Invoice number (unique, auto-generated, e.g., INV-2026-00001)
  - Invoice date
  - Due date (payment terms, e.g., 7 days, 14 days, 30 days)
  - Bill to (parent/guardian information)
    - Name
    - Address
    - Contact
    - Email
  - Tuition centre information
    - Name, address, contact
    - Tax ID/Registration number
    - Logo

- Invoice body (line items):
  - Student name
  - Course/subject name
  - Class name
  - Fee description (e.g., "Tuition Fee - March 2026")
  - Billing period (from date - to date)
  - Quantity (e.g., number of sessions)
  - Unit price
  - Subtotal
  - Multiple line items for multiple subjects

- Deductions/Adjustments:
  - Discounts applied (with reason)
  - Credits from previous payments
  - Refunds
  - Adjustments (with notes)

- Invoice footer:
  - Subtotal
  - Discount total
  - Tax (if applicable, e.g., GST/VAT at X%)
  - Grand total
  - Amount paid
  - Balance due

- Payment instructions:
  - Accepted payment methods
  - Bank account details (for bank transfer)
  - Online payment link
  - Payment deadline
  - Late payment policy

- Terms and conditions
- Notes/special instructions

**Invoice Templates:**
- Multiple invoice templates/designs
- Customizable per branch
- Professional formatting
- Branding (logo, colors)
- Multi-language support
- Export formats (PDF, Excel, Print)

### 5.2.2 Manual Invoice Creation

**Ad-hoc Invoices:**
- Admin can create custom invoice
- Use cases:
  - One-time services
  - Special events/workshops
  - Product sales (books, materials)
  - Custom tutoring
  - Consultation fees
- Select student/parent
- Add line items manually
- Set payment terms
- Preview and generate

**Invoice Editing:**
- Edit draft invoices before sending
- Cannot edit sent invoices (must credit note or new invoice)
- Void invoices (with reason, logged)
- Duplicate invoices for similar services

### 5.2.3 Invoice Delivery

**Delivery Methods:**
- Email (PDF attachment):
  - Send to parent's registered email
  - CC to secondary email if configured
  - Email template with personalized message
  - Delivery confirmation tracking
- In-app notification:
  - Push notification
  - Message in parent portal
  - Badge icon for unread invoices
- SMS with invoice summary and payment link
- Print and hand to parent (at centre)
- Postal mail (if configured)

**Delivery Schedule:**
- Immediate upon generation
- Scheduled send (e.g., send all on 1st of month at 8 AM)
- Resend option if not received

**Invoice Access:**
- Parents can view all invoices in portal
- Download PDF anytime
- Search and filter invoices
- Print invoice

## 5.3 Payment Tracking (Cash, Card, Online)

### 5.3.1 Payment Methods

**Cash Payments:**
- Accept cash at centre
- Admin records payment:
  - Invoice number
  - Amount received
  - Payment date
  - Received by (staff name)
  - Receipt number (auto-generated)
- Cash handling:
  - Daily cash count
  - Cash register reconciliation
  - Bank deposit tracking
  - Cash-in-hand report

**Bank Transfer:**
- Parent transfers to centre's bank account
- Payment reference (invoice number or student ID)
- Admin matches transfer to invoice:
  - Manual matching
  - Auto-matching by reference number
  - Upload bank statement for batch matching
- Bank reconciliation
- Mark invoice as paid once confirmed

**Credit/Debit Card:**
- In-person card payment (POS terminal)
- Card details entered by admin (for recurring)
- Integration with card processor:
  - Stripe
  - Square
  - PayPal
  - Local payment processors
- Card payment status:
  - Authorized
  - Captured
  - Failed
  - Refunded
- Transaction ID logged
- Card fees (merchant fees) tracking

**Online Banking/E-Wallet:**
- Integration with payment gateways:
  - PayPal
  - Stripe
  - Razorpay
  - Local e-wallets (GrabPay, TouchNGo, etc.)
- One-time payment
- Saved payment method (tokenization)
- Redirect to payment page
- Webhook for payment confirmation
- Real-time status update

**Cheque:**
- Accept cheque at centre
- Record cheque details:
  - Cheque number
  - Bank name
  - Cheque date
  - Amount
  - Received date
- Cheque status:
  - Received
  - Deposited
  - Cleared
  - Bounced (trigger fee and notification)
- Cheque clearance tracking (usually 3-5 business days)

**Payment Plans:**
- Installment payments
- Split large payments over time
- Auto-debit schedule
- Installment tracking (paid X of Y installments)

### 5.3.2 Payment Recording and Reconciliation

**Recording Payments:**
- Payment entry form:
  - Select student/parent
  - Select invoice(s) to pay
  - Payment amount
  - Payment method
  - Payment date
  - Reference number (transaction ID, cheque number, etc.)
  - Notes
- Partial payment handling:
  - Apply to specific invoice
  - Split across multiple invoices
  - Create payment plan for remaining balance
- Overpayment handling:
  - Credit to account
  - Refund
  - Apply to next invoice

**Payment Confirmation:**
- Immediate confirmation to parent:
  - Email with payment details
  - SMS confirmation
  - In-app notification
- Official receipt generated automatically
- Update invoice status to "Paid" or "Partially Paid"

**Payment Reconciliation:**
- Daily reconciliation:
  - All payments received
  - By payment method
  - Match with bank statements
  - Identify discrepancies
- Monthly reconciliation:
  - Total revenue collected
  - Outstanding balances
  - Pending payments
  - Failed payments
- Auto-reconciliation features:
  - Match bank deposits with recorded payments
  - Flag unmatched transactions
  - Suggest matches

**Payment Reports:**
- Payments received today/this week/this month
- Payments by method
- Payments by branch
- Payments by course/subject
- Payment trends
- Cash flow report

## 5.4 Payment Gateway Integration

### 5.4.1 Supported Payment Gateways

**Gateway Options:**
- Stripe (international, widely supported)
- PayPal (international)
- Square (US, simple setup)
- Razorpay (India, Southeast Asia)
- iPay88 (Malaysia, Singapore)
- 2C2P (Southeast Asia)
- MOLPay/RazerPay (Malaysia)
- eGHL (Malaysia)
- Authorize.Net (US)
- Local bank payment gateways

**Gateway Features:**
- Credit/Debit card processing
- E-wallet integration
- Online banking (FPX for Malaysia, etc.)
- QR code payments
- Recurring payments
- Tokenization (save card for future)
- 3D Secure authentication
- Multi-currency support (if international students)
- Mobile-optimized payment pages

### 5.4.2 Payment Flow

**Online Payment Process:**
1. Parent receives invoice via email/portal
2. Clicks "Pay Now" button or link
3. Redirected to payment gateway hosted page:
   - Pre-filled amount
   - Student/invoice details
   - Centre branding (if gateway supports)
4. Parent selects payment method:
   - Card (enter details or use saved card)
   - E-wallet (login to wallet)
   - Online banking (select bank, login)
5. Payment gateway processes payment:
   - Validates details
   - Authorizes transaction
   - Captures funds
6. Payment result:
   - Success: Redirected to success page
   - Failed: Redirected to failure page with reason
7. Webhook notification sent to system:
   - Payment status
   - Transaction ID
   - Amount
   - Timestamp
8. System updates invoice status automatically:
   - Mark as paid
   - Record payment details
   - Generate receipt
9. Parent receives confirmation:
   - Email with receipt
   - SMS notification
   - In-app update

**Saved Payment Methods:**
- Parent can save card for future payments
- Tokenized (secure, no card details stored on system)
- One-click payment for recurring invoices
- Manage saved cards in parent portal

**Recurring/Auto-Payment:**
- Parent authorizes auto-payment
- Set up recurring charge schedule
- Auto-charge on invoice generation
- Notification before each charge
- Option to cancel auto-payment anytime
- Failed auto-payment handling:
  - Retry logic (e.g., retry after 3 days)
  - Notify parent
  - Revert to manual payment

### 5.4.3 Payment Security

**PCI Compliance:**
- Never store raw card numbers
- Use tokenization
- Encrypted transmission
- Secure API keys
- Regular security audits

**Fraud Prevention:**
- Address Verification System (AVS)
- CVV verification
- 3D Secure (Verified by Visa, MasterCard SecureCode)
- Velocity checks (unusual payment patterns)
- IP address monitoring
- Block suspicious transactions

**Data Protection:**
- Encrypt sensitive data at rest and in transit
- Secure SSL certificates
- Access controls (only authorized staff can view payment data)
- Audit logs (all payment activities logged)

### 5.4.4 Payment Gateway Management

**Configuration:**
- Admin can configure gateway credentials:
  - API keys
  - Merchant ID
  - Secret keys
  - Webhook URLs
- Test mode vs Live mode
- Enable/disable specific payment methods
- Currency settings
- Transaction fees configuration

**Transaction Monitoring:**
- Real-time transaction status
- Failed transaction reasons
- Refund management
- Chargeback handling
- Dispute management

**Settlement and Payout:**
- Gateway settlement schedule (e.g., daily, weekly)
- Payout to centre's bank account
- Settlement reports
- Transaction fees deduction
- Net amount received

## 5.5 Automated Payment Reminders

### 5.5.1 Reminder Configuration

**Reminder Schedule:**
- Before due date reminders:
  - 7 days before
  - 3 days before
  - 1 day before
  - Due date
- After due date reminders:
  - 1 day overdue
  - 3 days overdue
  - 7 days overdue
  - 14 days overdue
  - 30 days overdue (final notice)
- Customizable schedule per branch

**Reminder Channels:**
- Email (primary)
- SMS (for critical reminders)
- WhatsApp (if integrated)
- Push notification (mobile app)
- In-app alert
- Combination (e.g., email + SMS for overdue)

**Reminder Preferences:**
- Parents can set reminder preferences:
  - Preferred channel
  - Frequency
  - Opt-out (not recommended but allowed)

### 5.5.2 Reminder Content

**Payment Reminder Email:**
- Subject: "Payment Reminder - Invoice #[NUMBER] Due [DATE]"
- Body:
  - Greeting
  - Invoice summary (student name, amount, due date)
  - Amount breakdown
  - Payment status (unpaid/partially paid)
  - Days until due (or days overdue)
  - Payment link (direct link to pay online)
  - Payment instructions (if offline payment)
  - Contact information
  - Late payment policy (if overdue)

**Reminder Tone:**
- Friendly reminder (before due date)
- Polite reminder (just after due date)
- Urgent reminder (7+ days overdue)
- Final notice (30+ days overdue)

**Personalization:**
- Personalized with parent and student names
- Specific invoice details
- Payment history reference
- Encourage prompt payment

### 5.5.3 Escalation Process

**Progressive Reminders:**
- Increase urgency as overdue period increases
- Change tone from friendly to firm
- Increase frequency
- Escalate to phone call or in-person meeting

**Late Payment Actions:**
- After X days overdue:
  - Suspend student from classes (policy dependent)
  - Hold report cards/certificates
  - Withhold enrollment for next term
  - Restrict access to online materials
- Communication of consequences:
  - Clear policy stated in reminders
  - Advance warning before action taken

**Debt Collection:**
- For severely overdue accounts (e.g., 60+ days):
  - Final demand letter
  - Involve debt collection agency (if applicable)
  - Legal action (last resort)
  - Write-off (if uncollectible, logged for records)

### 5.5.4 Reminder Reports

**Reminder Effectiveness:**
- Track reminder sent vs payments received
- Which reminder schedule works best
- Optimal timing for reminders
- Response rate per channel

**Overdue Account Monitoring:**
- Dashboard showing all overdue accounts
- Aging report (0-30 days, 31-60 days, 61-90 days, 90+ days)
- Total overdue amount
- High-risk accounts flagged

## 5.6 Receipt Generation

### 5.6.1 Automatic Receipt Creation

**Receipt Trigger:**
- Automatically generated upon payment confirmation
- One receipt per payment transaction
- Receipt number (unique, sequential, e.g., REC-2026-00001)

**Receipt Content:**
- Receipt header:
  - Receipt number
  - Receipt date
  - Tuition centre details (name, address, tax ID, logo)
  - "Official Receipt" heading

- Payment details:
  - Paid by (parent name)
  - Student name(s)
  - Payment date
  - Payment method
  - Transaction reference (cheque number, transaction ID, etc.)

- Invoice details:
  - Invoice number(s) paid
  - Original invoice amount
  - Amount paid
  - Outstanding balance (if partial payment)

- Line items (what the payment is for):
  - Description (e.g., "Tuition Fee for Mathematics - March 2026")
  - Amount

- Receipt footer:
  - Total amount paid (in numbers)
  - Amount in words (e.g., "Five Hundred Dollars Only")
  - Tax breakdown (if applicable)
  - Signature (admin or digital signature)
  - "Thank you" message
  - Terms: "This is a computer-generated receipt"

**Receipt Formats:**
- PDF (standard, for email and download)
- Print-friendly format
- Mobile-optimized view (for app)
- Thermal printer format (for POS receipt)

### 5.6.2 Receipt Delivery

**Delivery Methods:**
- Email (PDF attachment) - immediate upon payment
- Download from parent portal
- Print at centre (if payment in-person)
- SMS with receipt number and download link
- Available in mobile app

**Receipt Access:**
- Parents can view all receipts in portal
- Search receipts by date, amount, invoice
- Download all receipts for tax purposes
- Print individual or batch print

### 5.6.3 Receipt Management

**Duplicate Receipts:**
- Parents can request duplicate receipts
- Marked as "DUPLICATE" to prevent fraud
- Original receipt number referenced
- Log all duplicate requests

**Receipt Corrections:**
- If receipt has error:
  - Void original receipt (logged, cannot be deleted)
  - Issue corrected receipt with new number
  - Note reference to voided receipt
  - Notify parent of correction

**Tax Receipts:**
- If tuition fees are tax-deductible (depends on region):
  - Annual tax receipt summarizing all payments
  - Tax year end generation (e.g., December/January)
  - Specific tax receipt format compliant with local tax authority
  - Includes tax ID numbers, registration details

**Receipt Archival:**
- All receipts archived permanently
- Searchable database
- Export options for accounting
- Audit trail maintained

## 5.7 Discount and Scholarship Management

### 5.7.1 Discount Types

**Percentage Discounts:**
- X% off total fees
- Examples:
  - 10% sibling discount
  - 15% early bird discount
  - 20% scholarship discount
  - 5% loyalty discount

**Fixed Amount Discounts:**
- $X off total fees
- Examples:
  - $50 referral credit
  - $100 off registration fee
  - $20 off for second subject

**Conditional Discounts:**
- Multi-subject discount:
  - Enroll in 2 subjects: 10% off
  - Enroll in 3+ subjects: 15% off
- Volume discount:
  - More sessions per week = lower per-session cost
- Loyalty discount:
  - X% off after 1 year of enrollment
  - Increasing discount for multi-year students

**Promotional Discounts:**
- Time-limited (e.g., March promotion)
- New student promotions
- Re-enrollment promotions
- Seasonal discounts (summer programs, holiday courses)
- "Bring a friend" promotions

**Referral Discounts:**
- Refer a friend:
  - Referrer gets $X credit or Y% discount
  - Referred student gets $Z off registration fee
- Tiered referrals (more referrals = bigger discount)
- Referral tracking and crediting

### 5.7.2 Sibling Discount

**Automatic Sibling Detection:**
- System identifies siblings (same parent account)
- Auto-applies sibling discount
- Discount structure:
  - 2nd child: 10% off
  - 3rd child: 15% off
  - 4th+ child: 20% off
  - OR flat discount for all siblings

**Sibling Discount Rules:**
- Applied to all siblings OR only to 2nd child onwards
- Applied to lower-fee subjects if different fees
- Stacks with other discounts OR exclusive
- Maximum discount cap (e.g., max 30% total)

**Sibling Linking:**
- Ensure siblings are linked under same parent account
- Admin can manually link if not auto-detected
- Discount applies upon linking

### 5.7.3 Scholarship Programs

**Scholarship Types:**
- Merit-based scholarship:
  - Based on academic performance
  - Requires report cards or exam results
  - Annual renewal based on continued performance
- Need-based scholarship:
  - Based on family financial situation
  - Requires income documents
  - Confidential assessment
- Special talent scholarship:
  - For gifted students or special programs
  - Competition winners
- Full scholarship (100% tuition waived)
- Partial scholarship (X% tuition waived)

**Scholarship Application:**
- Online application form:
  - Student details
  - Academic records
  - Financial information (if need-based)
  - Essay or statement of purpose
  - Supporting documents upload
- Application review:
  - Admin or scholarship committee reviews
  - Interview (if required)
  - Approval or rejection
  - Notification to applicant
- Application deadlines
- Renewable vs one-time scholarships

**Scholarship Administration:**
- Track scholarship students
- Monitor performance (for renewal)
- Adjust fees to reflect scholarship discount
- Generate scholarship reports:
  - Total scholarships awarded
  - Total financial aid given
  - Scholarship budget vs spent
- Sponsor management (if scholarships sponsored by external parties)

### 5.7.4 Discount Application and Limits

**Applying Discounts:**
- Manual discount application by admin
- Automatic discount (rule-based):
  - Sibling discount auto-applies
  - Early bird if enrolled before X date
  - Referral credit auto-applies after verification
- Discount codes/coupons:
  - Generate unique codes
  - Parents enter code during enrollment or payment
  - System validates and applies
  - Track usage and redemptions

**Discount Stacking:**
- Allow multiple discounts OR limit to one
- Stacking rules:
  - Sibling + Referral = OK
  - Promotional + Scholarship = Not allowed
  - Custom rules per discount type
- Maximum total discount (e.g., cannot exceed 40% off)

**Discount Limitations:**
- Exclude certain fees (e.g., registration fee non-discountable)
- Minimum purchase required (e.g., discount only if enrolled in 2+ subjects)
- Valid for specific courses or branches
- Expiry date for promotional discounts
- Usage limit (e.g., code can be used only once)

**Discount Reporting:**
- Total discounts given (per month, term, year)
- Discount by type
- Discount impact on revenue
- Most popular discounts
- Discount redemption rate

## 5.8 Overdue Payment Tracking

### 5.8.1 Defining Overdue

**Payment Terms:**
- Due date specified on invoice (e.g., 7 days, 14 days, 30 days from invoice date)
- Payment overdue if not received by due date
- Grace period (optional, e.g., 2-day grace period)

**Overdue Categorization:**
- Current (not yet due)
- 1-15 days overdue (early overdue)
- 16-30 days overdue (moderate overdue)
- 31-60 days overdue (seriously overdue)
- 61-90 days overdue (severely overdue)
- 90+ days overdue (delinquent)

**Overdue Status:**
- Invoice marked with overdue status
- Red flag or alert indicator
- Days overdue displayed
- Overdue amount highlighted

### 5.8.2 Overdue Monitoring

**Overdue Dashboard:**
- List of all overdue invoices
- Sort by:
  - Student name
  - Amount
  - Days overdue
  - Branch
- Filter by overdue category
- Search functionality
- Export to Excel for follow-up

**Overdue Alerts:**
- Daily overdue report emailed to admin
- Real-time alerts for new overdues
- Weekly summary of all overdue accounts
- Flag high-value overdue accounts

**Overdue Trends:**
- Monthly overdue rate (% of invoices overdue)
- Overdue amount trend (increasing or decreasing)
- Average days overdue
- Overdue by branch comparison
- Identify patterns (specific subjects, grades, times of year)

### 5.8.3 Overdue Follow-Up Actions

**Automated Actions:**
- Send automated payment reminders (as configured)
- Restrict student access (if policy allows):
  - Suspend from classes after X days overdue
  - Block online materials access
  - Hold report cards/certificates
  - Prevent enrollment renewal

**Manual Follow-Up:**
- Admin calls parent:
  - Polite reminder
  - Inquire about payment issues
  - Offer payment plan if needed
  - Document conversation notes
- In-person meeting (for high-value or long-overdue accounts)
- Send formal demand letter (certified mail)

**Payment Plan Offering:**
- For parents facing financial difficulty:
  - Offer installment plan
  - Waive late fees (if appropriate)
  - Temporary reduction in fee
  - Discuss scholarship/financial aid options
- Document agreed payment plan
- Monitor adherence to plan

**Escalation:**
- After 60-90 days overdue:
  - Final demand letter
  - Suspension from classes (if not already)
  - Consider debt collection agency
  - Legal action (last resort, rarely used)
  - Write-off as bad debt (if uncollectible)

### 5.8.4 Preventing Overdue Payments

**Upfront Payment:**
- Require payment at time of enrollment
- Prepayment for term or semester
- Holds spot in class

**Auto-Payment:**
- Encourage parents to set up auto-payment
- Reduces likelihood of missed payments
- Offer small discount for auto-payment setup

**Payment Reminders:**
- Effective reminder system reduces overdues
- Multiple channels for better reach

**Clear Payment Policies:**
- Clearly communicate payment terms at enrollment
- Display payment due dates prominently
- Explain late payment consequences

**Financial Counseling:**
- Offer financial assistance or scholarship info upfront
- Help parents plan financially
- Identify potential payment issues early

## 5.9 Refund Management

### 5.9.1 Refund Policies

**Refund Eligibility:**
- Withdrawal within X days of enrollment: Full refund (minus non-refundable fees)
- Withdrawal after X days but before start of term: Partial refund (e.g., 50%)
- Withdrawal after term starts: Pro-rated refund based on sessions attended
- No refund after X% of term completed (e.g., 50%)
- Medical/emergency circumstances: Special consideration
- Centre-caused cancellations: Full refund or credit

**Non-Refundable Fees:**
- Registration fee (typically non-refundable)
- Material fees (if materials already provided)
- Processing/administrative fees

**Refund Calculation:**
- Total fees paid
- Minus non-refundable fees
- Minus fees for sessions attended (pro-rated)
- Minus any penalties (if applicable)
- Equals refund amount

**Refund Processing Time:**
- Standard: 7-14 business days
- Depending on refund method:
  - Credit card refund: 5-10 business days
  - Bank transfer: 3-5 business days
  - Cheque: 7-14 business days
  - Cash: Immediate (if collected in-person)

### 5.9.2 Refund Request Process

**Initiating Refund:**
- Parent submits refund request:
  - Via parent portal (online form)
  - Email to admin
  - In-person at centre
- Required information:
  - Student name and ID
  - Invoice/payment details
  - Reason for refund
  - Preferred refund method
  - Bank account details (if bank transfer)

**Refund Review:**
- Admin reviews request:
  - Check refund policy eligibility
  - Verify payment history
  - Calculate refund amount
  - Check for outstanding fees
  - Approve or reject
- Approval workflow:
  - Branch admin approves (<$X amount)
  - Super admin approves (>$X amount)
- Rejection reasons:
  - Not eligible per policy
  - Outstanding fees exceed refund amount
  - Outside refund window
- Notify parent of decision

**Refund Calculation:**
- Automated calculation based on policy
- Admin can adjust if special circumstances
- Itemized breakdown shown:
  - Original amount paid
  - Non-refundable fees
  - Attendance-based deductions
  - Penalties (if any)
  - Net refund amount
- Parent can review before finalizing

### 5.9.3 Refund Processing

**Refund Methods:**
- Credit back to original payment method:
  - If paid by card: refund to same card
  - If paid by bank transfer: refund to same account
- Bank transfer (provide account details)
- Cheque (mailed or collected)
- Cash (collected in-person)
- Credit note (for future use)

**Refund Execution:**
- Payment gateway refund (if paid online):
  - Initiate refund through gateway API
  - Transaction ID recorded
  - Confirmation from gateway
- Manual refund (if paid offline):
  - Bank transfer processed
  - Cheque issued
  - Cash disbursed (with receipt)
- Refund recorded in system:
  - Linked to original payment
  - Refund amount
  - Refund date
  - Refund method
  - Processed by (admin name)

**Refund Confirmation:**
- Parent receives confirmation:
  - Email with refund details
  - Receipt of refund
  - Expected timeline for funds to arrive
- Follow-up if refund not received within stated time

### 5.9.4 Refund Tracking and Reporting

**Refund Register:**
- Database of all refunds issued
- Searchable by:
  - Student name
  - Date range
  - Refund amount
  - Reason
  - Status (pending/processed/completed/failed)
- Export to Excel for accounting

**Refund Reports:**
- Total refunds issued (per month, term, year)
- Refunds by reason (withdrawal, cancellation, etc.)
- Refunds by branch
- Refund rate (refunds vs revenue)
- Average refund amount
- Refund trends (increasing or decreasing)

**Financial Impact:**
- Impact on monthly revenue
- Refund budget (estimated refunds)
- Reconcile refunds with accounting
- Adjust revenue forecasts based on refund history

**Refund Policy Optimization:**
- Analyze refund data to adjust policies
- If high refund rate, investigate causes
- Balance customer satisfaction with financial sustainability

---
