# SIIH Command Center

Build a production-ready full-stack web application called:

SIIH CEP 2.0

SMART INDIA HACKATHON

INTERNAL HACKATHON 2026

The application is for managing an internal hackathon where students can register teams, upload payment proof, access tasks, receive task-specific PDF documents, communicate with administrators, and track their team's registration/task status.

The platform must use:

FRONTEND:

- React / Next.js

- TypeScript

- Tailwind CSS

- Modern component architecture

- Responsive design

- Mobile-first UI

BACKEND:

- Supabase

- Supabase PostgreSQL database

- Supabase Authentication

- Supabase Storage

- Supabase Row Level Security

- Supabase Realtime where useful

DEPLOYMENT:

The application will be hosted under the existing domain:

https://ieprn.co.in/siih2.0

IMPORTANT:

The application must work correctly from the /siih2.0 subpath rather than assuming it is hosted at the root domain.

The design should be inspired by the uploaded SIIH 2.0 poster provided as the visual reference.

==================================================

1. BRAND / VISUAL DESIGN

==================================================

Create a premium futuristic Smart India Hackathon design.

Primary colors:

- Black: #02040A

- Deep navy: #061225

- Electric blue: #009DFF

- Cyan: #00D9FF

- Bright blue: #176BFF

- White: #F5F9FF

- Muted blue-gray

Visual style:

- Cyberpunk

- Artificial intelligence

- Smart city

- Technology

- Hackathon

- Digital network

- Futuristic India

- Glassmorphism

- Neon blue glow

- Thin glowing borders

- Subtle grid patterns

- Digital particles

- Network nodes

- Animated light streaks

Use the uploaded poster as the primary visual inspiration.

Do NOT simply copy the poster.

Create a professional web UI based on its visual language.

==================================================

2. LIVE / ANIMATED BACKGROUND

==================================================

The website should have a live futuristic background.

Create a subtle animated background containing:

- dark futuristic city silhouette

- blue glowing buildings

- digital grid floor

- floating particles

- network nodes

- connecting lines

- moving light particles

- subtle AI circuit patterns

- occasional glowing blue pulses

Prefer implementing this using:

- CSS animations

- Canvas

- Three.js / React Three Fiber if appropriate

Do not make the animation heavy.

The background must:

- remain smooth on mobile

- respect prefers-reduced-motion

- not interfere with text readability

- have a dark overlay behind content

Create several background layers:

Layer 1:

dark gradient

Layer 2:

animated grid

Layer 3:

futuristic city / digital structures

Layer 4:

particles and network nodes

Layer 5:

blue glow effects

The dashboard pages can use a more subtle version of the background.

==================================================

3. WEBSITE STRUCTURE

==================================================

Create the following sections/routes.

PUBLIC:

/siih2.0

Landing page

/siih2.0/register

Team registration

/siih2.0/login

Team leader login

/siih2.0/teams

Registered teams/public team directory

/siih2.0/tasks

Public/general task information if enabled by admin

TEAM PORTAL:

/siih2.0/team

Team dashboard

/siih2.0/team/profile

Team profile

/siih2.0/team/members

Team members

/siih2.0/team/tasks

Assigned tasks

/siih2.0/team/tasks/[taskId]

Task details

/siih2.0/team/documents

Task documents/PDFs

/siih2.0/team/submissions

Submissions

/siih2.0/team/notifications

Notifications

/siih2.0/team/settings

Account settings

ADMIN:

/siih2.0/admin

Admin dashboard

/siih2.0/admin/teams

Team management

/siih2.0/admin/teams/[teamId]

Team details

/siih2.0/admin/members

Student/member management

/siih2.0/admin/registrations

Registration management

/siih2.0/admin/payments

Payment verification

/siih2.0/admin/forms

Dynamic registration form builder

/siih2.0/admin/tasks

Task management

/siih2.0/admin/tasks/create

Create task

/siih2.0/admin/tasks/[taskId]

Task management/details

/siih2.0/admin/documents

PDF/document management

/siih2.0/admin/notifications

Notifications

/siih2.0/admin/settings

Hackathon settings

/siih2.0/admin/admins

Admin/user management

==================================================

4. LANDING PAGE

==================================================

Create a visually impressive landing page.

Hero section:

Large title:

SIIH 2.0

SMART INDIA HACKATHON

INTERNAL HACKATHON 2026

Subtitle:

IDEAS TODAY. IMPACT TOMORROW.

Buttons:

REGISTER YOUR TEAM

TEAM LOGIN

VIEW REGISTERED TEAMS

Include:

- countdown timer

- event dates

- team size

- registration status

- prize information

- hackathon information

Based on the supplied poster:

Date:

26th to 27th September 2026

Team size:

6 persons / team

Prize:

₹1.5 Lakh Cash Prize

However, do NOT hard-code values that should be configurable.

Create admin settings so administrators can change:

- event name

- dates

- team size

- prize

- registration deadline

- registration fee

- contact details

- announcement text

==================================================

5. REGISTRATION SYSTEM

==================================================

Create a multi-step team registration system.

Step 1:

Team information

Fields:

- Team Name

- Team Leader Full Name

- Team Leader Gmail

- Team Leader Phone

- College / Institution

- Department

- Year / Semester

- State

- City

Step 2:

Team members

Allow configurable team size.

Default:

6 members

Each member should have:

- Full Name

- Gmail

- Phone

- College

- Department

- Year

- Student ID / Roll Number

The administrator must be able to configure:

- minimum team size

- maximum team size

- required fields

- optional fields

Prevent duplicate:

- team leader email

- member email

- phone if configured

- student ID if configured

Step 3:

Registration form

The admin should be able to create additional custom fields.

Example:

- Gender

- Course

- Section

- Previous hackathon experience

- GitHub profile

- LinkedIn profile

- Technical skills

- Other information

Step 4:

Payment

Display configurable registration fee.

Example:

Registration Fee:

₹ XXXX

The admin can change this amount.

Show:

- payment instructions

- UPI ID

- QR code

- bank details if required

Allow the team leader to upload payment proof.

Accepted formats:

- JPG

- JPEG

- PNG

- PDF

Maximum file size should be configurable.

Store uploaded files securely in Supabase Storage.

Payment status:

PENDING

UNDER REVIEW

VERIFIED

REJECTED

If rejected:

admin must provide rejection reason.

Step 5:

Review and submit.

Show complete registration summary.

Require:

"I confirm that the information provided is correct."

Submit button.

After registration:

generate a unique Team Registration ID.

Example:

SIIH26-0001

SIIH26-0002

SIIH26-0003

Do not use sequential IDs if they expose sensitive information unless admin chooses that format.

Display:

Registration Successful

Team ID:

SIIH26-XXXX

Send confirmation email if email service is configured.

==================================================

6. TEAM LEADER AUTHENTICATION

==================================================

Team leaders should be able to log in using their registered Gmail address.

Use Supabase Authentication.

Preferred authentication:

Google OAuth

Allow:

"Continue with Google"

Only allow access if:

- Gmail matches registered team leader email

- account belongs to a registered team

Optional fallback:

Magic link email authentication.

After authentication:

redirect to:

/siih2.0/team

Do not allow ordinary users to access admin routes.

Use role-based access control.

Roles:

SUPER_ADMIN

ADMIN

TEAM_LEADER

Potential future role:

EVALUATOR

==================================================

7. TEAM DASHBOARD

==================================================

Create a beautiful team dashboard.

Header:

Welcome, [Team Leader Name]

Team:

[Team Name]

Registration ID:

[SIIH26-XXXX]

Dashboard cards:

Registration Status

Payment Status

Team Members

Tasks Assigned

Tasks Completed

Pending Submissions

Notifications

Progress indicator:

Registration

Payment

Verification

Task 1

Task 2

Task 3

Final Submission

Example:

Registration      ✓

Payment            ✓

Verification       ✓

Task Assigned      ✓

Submission         Pending

Show important announcements.

Show upcoming deadlines.

Show recent task updates.

==================================================

8. TEAM PROFILE

==================================================

Team leaders can view their team details.

Display:

- Team Name

- Registration ID

- Leader

- College

- Department

- Members

- Registration date

- Payment status

- Verification status

Allow editing only where administrator permits.

Some fields should become locked after registration verification.

==================================================

9. TEAM MEMBER MANAGEMENT

==================================================

Display all team members.

Cards/table:

Name

Email

Phone

Department

Year

Student ID

Role

Highlight:

TEAM LEADER

Admin can configure whether team leaders can edit members after registration.

If editing is allowed:

maintain an audit log.

==================================================

10. REGISTERED TEAM DIRECTORY

==================================================

Create:

/teams

This page displays registered teams.

Show:

- Team Name

- Institution

- Department

- Team Leader name if enabled

- Team member count

- Registration status

- Registration ID if enabled

Add search.

Filters:

- College

- Department

- City

- State

- Registration status

Add sorting.

IMPORTANT:

Do not expose personal information publicly by default.

Admin should be able to choose which fields are publicly visible.

For example:

Public:

Team name

College

Member count

Private:

Email

Phone

Student ID

Payment information

==================================================

11. TOTAL TEAM COUNTER

==================================================

On landing page show live statistics:

TOTAL REGISTERED TEAMS

TOTAL STUDENTS

VERIFIED TEAMS

COLLEGES PARTICIPATING

TASKS RELEASED

These numbers should come from Supabase.

Use realtime updates where appropriate.

Example:

127

REGISTERED TEAMS

762

STUDENTS

24

COLLEGES

==================================================

12. ADMIN CONSOLE

==================================================

Create a completely separate admin console.

Admin route:

/siih2.0/admin

The admin dashboard should look like a professional management system while maintaining the futuristic SIIH visual identity.

Sidebar:

Dashboard

Teams

Registrations

Members

Payments

Forms

Tasks

Documents

Notifications

Admins

Settings

Audit Logs

Logout

Dashboard cards:

Total Teams

Pending Registrations

Verified Teams

Rejected Teams

Pending Payments

Total Students

Active Tasks

Upcoming Deadlines

Include charts:

Teams registered over time

Teams by college

Teams by department

Payment status

Registration status

==================================================

13. TEAM MANAGEMENT ADMIN

==================================================

Admin can:

- view all teams

- search teams

- filter teams

- sort teams

- open team

- edit team

- verify team

- reject team

- deactivate team

- restore team

- delete team if authorized

- export teams

Team detail page:

Team name

Registration ID

Leader information

All members

College

Department

Registration date

Payment information

Payment screenshot

Registration form responses

Tasks assigned

Submissions

Notifications

Audit history

Add:

VERIFY TEAM

REJECT TEAM

SUSPEND TEAM

Buttons.

==================================================

14. PAYMENT MANAGEMENT

==================================================

Create dedicated admin payment page.

Table:

Team ID

Team Name

Leader

Amount

Payment Proof

Uploaded Date

Status

Action

Actions:

VIEW PROOF

VERIFY

REJECT

When rejecting:

Reason field required.

Example:

"Payment screenshot is unclear."

The team should see this reason.

Allow admin to download the uploaded proof.

Accepted:

JPG

JPEG

PNG

PDF

Use Supabase Storage.

Payment documents must NOT be publicly accessible.

Use signed URLs.

==================================================

15. DYNAMIC REGISTRATION FORM BUILDER

==================================================

This is very important.

Admin should be able to create multiple registration forms.

Create:

/admin/forms

Button:

+ CREATE FORM

Admin can create:

Form Name

Description

Active/Inactive

Start Date

End Date

Form fields supported:

- Text

- Long text

- Email

- Phone

- Number

- Dropdown

- Radio

- Checkbox

- Multi-select

- Date

- File upload

- URL

- Student ID

- College

- Department

For each field:

Label

Placeholder

Required

Validation

Options

Minimum length

Maximum length

Help text

Allow:

- drag and drop field ordering

- duplicate field

- delete field

- preview form

Admin can publish/unpublish forms.

Store form configuration in Supabase.

Registration responses should be stored in a structured way.

==================================================

16. TASK MANAGEMENT

==================================================

Create complete task management.

Admin page:

/admin/tasks

Button:

+ CREATE TASK

Task fields:

Task Title

Task Code

Description

Instructions

Start Date

Start Time

Deadline

Priority

Status

Maximum attempts

Submission type

Status:

DRAFT

SCHEDULED

ACTIVE

CLOSED

ARCHIVED

Tasks can be assigned to:

ALL TEAMS

SELECTED TEAMS

SELECTED COLLEGES

SELECTED CATEGORIES

A task can have:

- text instructions

- images

- links

- PDFs

- documents

- reference files

- video links

==================================================

17. TASK-SPECIFIC PDF DOCUMENTS

==================================================

Admin can upload PDFs to each task.

Example:

Task 01

Problem Statement.pdf

Task 02

Technical Requirements.pdf

Task 03

Submission Guidelines.pdf

Allow:

PDF upload

PDF preview

PDF download

Replace PDF

Delete PDF

Store documents in Supabase Storage.

Documents should be accessible only to authorized teams if task is private.

Use signed URLs.

==================================================

18. TEAM TASK PAGE

==================================================

Team sees:

MY TASKS

Each task card:

Task Number

Task Title

Status

Assigned Date

Deadline

Time Remaining

Submission Status

Example:

TASK 01

AI Innovation Challenge

ACTIVE

Deadline:

26 September 2026

11:30 PM

OPEN TASK

Task detail page:

Title

Description

Instructions

Resources

PDF files

Links

Deadline

Submission requirements

Add:

START TASK

SUBMIT SOLUTION

==================================================

19. TASK SUBMISSIONS

==================================================

Allow administrators to configure submission type.

Supported:

Text

URL

GitHub URL

File

PDF

ZIP

Image

Video URL

For each task, admin defines allowed submission formats.

Team can submit.

Show:

Submitted At

Version

Status

Feedback

Score if enabled

Allow resubmission if admin enables it.

Maintain submission history.

==================================================

20. TASK EVALUATION

==================================================

Create optional evaluation system.

Admin/evaluator can score:

Innovation

Technical Implementation

Impact

Presentation

Feasibility

Design

Configurable scoring.

Total score.

Comments.

Evaluation status:

NOT EVALUATED

IN REVIEW

EVALUATED

Team should only see score/feedback if admin enables it.

==================================================

21. NOTIFICATIONS

==================================================

Create notification system.

Admin can send:

Announcement

Task Released

Deadline Reminder

Payment Rejected

Registration Approved

Registration Rejected

General Notice

Notifications can target:

ALL TEAMS

SELECTED TEAMS

SELECTED COLLEGES

SPECIFIC TEAM

Team dashboard should display unread notifications.

Add:

Mark as read

Mark all as read

==================================================

22. ADMIN ANNOUNCEMENTS

==================================================

Admin can create announcement:

Title

Message

Priority

Target audience

Publish date

Expiry date

Priority:

NORMAL

IMPORTANT

URGENT

Urgent announcements should appear prominently on team dashboard.

==================================================

23. DOCUMENT MANAGEMENT

==================================================

Admin document library.

Categories:

Problem Statements

Task Documents

Rules

Guidelines

Schedules

Templates

Other

Admin can upload:

PDF

DOCX

PPTX

XLSX

JPG

PNG

Allow assigning documents to:

- all teams

- specific teams

- specific tasks

Use Supabase Storage.

==================================================

24. REGISTRATION STATUS

==================================================

Registration statuses:

DRAFT

SUBMITTED

UNDER_REVIEW

PAYMENT_PENDING

PAYMENT_VERIFICATION

VERIFIED

REJECTED

CANCELLED

Create a visual status timeline.

==================================================

25. ADMIN SETTINGS

==================================================

Create settings page.

Admin can configure:

Hackathon name

Logo

Poster

Description

Dates

Registration deadline

Registration fee

UPI ID

Payment QR code

Team minimum size

Team maximum size

Contact details

Prize information

Public team visibility

Public member visibility

Enable/disable registration

Enable/disable login

Enable/disable submissions

Also:

Social media links

Website links

Footer information

==================================================

26. ADMIN MANAGEMENT

==================================================

Super admin can create additional administrators.

Admin fields:

Name

Email

Role

Status

Roles:

SUPER_ADMIN

ADMIN

Permissions:

Manage Teams

Manage Payments

Manage Forms

Manage Tasks

Manage Documents

Manage Notifications

Manage Settings

Manage Admins

Use permission-based authorization.

==================================================

27. AUDIT LOG

==================================================

Create audit logging.

Track:

Admin login

Team registration

Team updates

Payment verification

Payment rejection

Task creation

Task update

Document upload

Document deletion

Team suspension

Admin creation

Settings changes

Log:

User

Action

Timestamp

IP if legally appropriate/configured

Related entity

Admin can filter audit logs.

==================================================

28. DATABASE DESIGN

==================================================

Use Supabase PostgreSQL.

Suggested tables:

profiles

teams

team_members

registration_forms

registration_form_fields

registration_responses

registration_response_values

payments

tasks

task_assignments

task_documents

task_submissions

submission_files

notifications

notification_recipients

announcements

documents

evaluations

admin_users

roles

permissions

audit_logs

hackathon_settings

Create proper foreign keys.

Use UUID primary keys.

Use timestamps:

created_at

updated_at

Use indexes for:

team name

leader email

registration ID

college

status

task status

deadline

==================================================

29. SUPABASE AUTH

==================================================

Use Supabase Auth.

Google OAuth is preferred.

Team leaders login through:

Continue with Google

After authentication:

Find matching registered team leader email.

If no registered team exists:

Show:

"No registered team found for this Google account."

Do not create a team automatically.

Admin authentication must use role verification.

Never trust frontend-only role checks.

Use database policies and server-side validation.

==================================================

30. SUPABASE ROW LEVEL SECURITY

==================================================

Implement proper RLS.

Team leaders can:

READ their own team

READ their own members

UPDATE allowed team information

READ tasks assigned to their team

READ documents assigned to their team

CREATE submissions for their team

READ their own submissions

READ their notifications

Team leaders must NOT be able to:

READ other teams' private information

READ payment proofs of other teams

READ admin information

UPDATE task definitions

DELETE other teams

ACCESS admin routes

Admins can manage according to their permissions.

Public users can only access fields explicitly marked public.

==================================================

31. SUPABASE STORAGE

==================================================

Create storage buckets.

Suggested:

payment-proofs

task-documents

team-submissions

team-files

public-assets

Payment proofs:

PRIVATE

Task documents:

PRIVATE unless marked public

Team submissions:

PRIVATE

Public assets:

PUBLIC

Use signed URLs for private files.

Validate file:

- MIME type

- extension

- file size

Never trust the extension alone.

==================================================

32. SECURITY

==================================================

Security is very important.

Implement:

- Supabase RLS

- server-side authorization

- role-based access

- input validation

- file validation

- file size limits

- protected admin routes

- protected team routes

- signed storage URLs

- rate limiting where possible

- CSRF protection where relevant

- XSS-safe rendering

- SQL injection protection through Supabase

- audit logging

Do not expose:

- Supabase service role key

- private storage URLs

- admin secrets

- sensitive payment data

Only public Supabase anon configuration may be exposed client-side.

==================================================

33. RESPONSIVE DESIGN

==================================================

The website must work beautifully on:

Mobile

Tablet

Laptop

Desktop

Large monitors

The team dashboard should be especially mobile friendly.

Admin console:

Desktop-first but responsive.

Tables should turn into cards on mobile.

==================================================

34. UI COMPONENTS

==================================================

Create reusable components:

Navbar

Footer

Sidebar

DashboardCard

StatCard

TeamCard

MemberCard

StatusBadge

TaskCard

NotificationCard

FileUpload

PaymentUpload

Modal

ConfirmationModal

DataTable

SearchBar

FilterBar

Pagination

FormBuilder

FormFieldEditor

CountdownTimer

ProgressTimeline

Toast

LoadingSkeleton

EmptyState

ErrorState

==================================================

35. LANDING PAGE SECTIONS

==================================================

Include:

Hero

About SIIH

Why Participate

Timeline

Important Dates

How It Works

Team Requirements

Prize

Rules

Frequently Asked Questions

Registered Teams

Live Statistics

Contact

Footer

Add CTA buttons throughout.

==================================================

36. COUNTDOWN

==================================================

Create countdown:

HACKATHON STARTS IN

Days

Hours

Minutes

Seconds

Also show registration deadline countdown.

Countdown dates must come from admin settings.

==================================================

37. CONTACT SECTION

==================================================

Based on the supplied poster, initially include contact information as configurable settings.

Do NOT permanently hard-code phone numbers.

Admin can change:

Coordinator name

Phone

Email

Enquiry contact

Display contact cards.

==================================================

38. QR CODE

==================================================

Admin can upload:

Registration QR

Payment QR

The QR image should be configurable.

Do not hard-code the QR code from the poster.

==================================================

39. SEARCH

==================================================

Admin search:

Team name

Registration ID

Leader name

Leader email

College

Phone

Public search:

Team name

College

Do not allow public searching by private email or phone.

==================================================

40. EXPORT

==================================================

Admin can export:

Teams CSV

Members CSV

Payments CSV

Registration responses CSV

Task submissions CSV

Export only permitted information based on admin permissions.

==================================================

41. EMAIL NOTIFICATIONS

==================================================

If an email provider is configured, send:

Registration confirmation

Payment received

Payment verified

Payment rejected

Team approved

Task assigned

Task deadline reminder

Submission received

Announcement

Email templates should be configurable where practical.

==================================================

42. ERROR HANDLING

==================================================

Create professional error states.

Examples:

Registration failed

Payment upload failed

File too large

Unsupported file

Session expired

Unauthorized

Team not found

Task unavailable

Deadline passed

Server error

Never expose raw database errors to users.

==================================================

43. LOADING STATES

==================================================

Use skeleton loaders.

Do not leave blank screens while data loads.

Use optimistic UI only where safe.

==================================================

44. ACCESSIBILITY

==================================================

Follow WCAG principles.

Use:

- semantic HTML

- keyboard navigation

- visible focus states

- proper labels

- alt text

- sufficient contrast

- reduced motion support

Do not sacrifice readability for futuristic effects.

==================================================

45. PERFORMANCE

==================================================

Optimize for fast loading.

Lazy load:

- Three.js

- heavy background effects

- large images

- PDFs

- admin charts

Compress images.

Use pagination.

Do not load all teams at once.

Use server-side filtering/pagination where appropriate.

==================================================

46. SEO

==================================================

Create proper metadata:

Title:

SIIH 2.0 | Smart India Hackathon Internal Hackathon 2026

Description:

SIIH 2.0 Smart India Hackathon Internal Hackathon 2026.

Add Open Graph metadata.

Create favicon/logo.

==================================================

47. PWA

==================================================

If practical, make the team portal installable as a PWA.

Include:

- app icon

- manifest

- offline fallback

- mobile-friendly experience

Do not attempt to make sensitive dashboard data available offline.

==================================================

48. ADMIN DASHBOARD DESIGN

==================================================

Admin dashboard should have:

LEFT SIDEBAR

SIIH 2.0 logo

Dashboard

Teams

Registrations

Members

Payments

Forms

Tasks

Documents

Notifications

Announcements

Evaluations

Admins

Audit Logs

Settings

TOP BAR:

Search

Notifications

Admin profile

Logout

MAIN AREA:

Welcome back, Admin

Statistics

Charts

Recent registrations

Pending payments

Upcoming task deadlines

Recent activity

==================================================

49. TEAM DASHBOARD DESIGN

==================================================

Team portal should have:

Top navbar:

SIIH 2.0

Dashboard

My Team

Tasks

Documents

Submissions

Notifications

Profile

User avatar

Logout

Hero:

Welcome back, [Name]

[Team Name]

Registration ID

Then cards:

Registration

Payment

Verification

Tasks

Submissions

==================================================

50. LIVE TEAM STATISTICS

==================================================

Use realtime Supabase data where useful.

Landing page:

Registered Teams

Total Participants

Verified Teams

Colleges

Admin dashboard should update statistics without requiring manual refresh where practical.

==================================================

51. TEAM REGISTRATION VALIDATION

==================================================

Before submitting:

Check:

- team name uniqueness

- leader email uniqueness

- member email uniqueness

- minimum team size

- maximum team size

- required fields

- duplicate members

- payment proof if required

Display friendly validation messages.

==================================================

52. REGISTRATION RECEIPT

==================================================

After successful registration create a downloadable registration confirmation.

Include:

SIIH 2.0

Team Name

Registration ID

Team Leader

College

Members

Registration Date

Payment Status

Allow:

DOWNLOAD PDF

==================================================

53. ADMIN PDF GENERATION

==================================================

Admin can generate/download:

Team registration PDF

Team details PDF

Registration summary

Payment report

Task report

==================================================

54. TASK DEADLINES

==================================================

Tasks should automatically transition based on dates.

Example:

DRAFT

↓

SCHEDULED

↓

ACTIVE

↓

DEADLINE PASSED

↓

CLOSED

Display countdown.

When deadline passes:

disable submission automatically.

Allow admin override.

==================================================

55. TEAM SUBMISSION VERSIONING

==================================================

Every submission should have:

Version number

Submitted date

Submitted by

Files

Links

Notes

Example:

Version 1

Version 2

Version 3

Admin can see submission history.

==================================================

56. ADMIN TEAM COMMUNICATION

==================================================

Admin can send messages to a team.

Team-specific message:

Subject

Message

Attachment

Priority

Team receives it in notifications.

==================================================

57. DASHBOARD SECURITY

==================================================

Never rely solely on hidden UI elements.

Even if a button is hidden:

backend must reject unauthorized actions.

Admin routes must verify:

authenticated user

admin role

permission

Team routes must verify:

authenticated user

team membership/leadership

==================================================

58. DATABASE SEED DATA

==================================================

Create demo/sample data for development.

Example:

5 sample teams

20 sample members

3 tasks

2 announcements

2 payment statuses

Clearly mark demo data.

Make it easy to remove demo data before production.

==================================================

59. ENVIRONMENT VARIABLES

==================================================

Create .env.example containing:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

Optional:

NEXT_PUBLIC_SITE_URL=

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

EMAIL_PROVIDER_KEY=

Never commit secrets.

==================================================

60. DOMAIN / SUBPATH SUPPORT

==================================================

IMPORTANT.

The application will be available at:

https://ieprn.co.in/siih2.0

Configure routing/base path correctly.

All internal links must work under:

/siih2.0

Examples:

/siih2.0/register

/siih2.0/login

/siih2.0/team

/siih2.0/admin

Do not generate links that incorrectly point to:

/register

/login

/admin

unless the hosting configuration explicitly handles the base path.

Use a configurable base path.

==================================================

61. PRODUCTION QUALITY

==================================================

Do not create a simple prototype.

Build this as a production-ready application.

Use:

- clean architecture

- reusable components

- TypeScript types

- database migrations

- Supabase RLS policies

- proper error handling

- loading states

- responsive design

- security

- accessibility

Avoid:

- hardcoded data

- fake login

- fake database

- localStorage-only authentication

- publicly exposed private files

- insecure admin checks

==================================================

62. ADMIN FIRST-TIME SETUP

==================================================

Create an initial setup mechanism.

The first Super Admin should be able to configure:

Hackathon information

Registration fee

UPI

QR

Dates

Team size

Forms

Task settings

Public visibility

Contact information

After setup:

the system should be ready for registrations.

==================================================

63. FUTURE EXTENSIBILITY

==================================================

Design the database and architecture so future features can be added:

- evaluator portal

- judging

- scoring

- certificates

- attendance

- QR attendance

- mentor portal

- volunteer portal

- live leaderboard

- team chat

- WhatsApp integration

- email integration

- certificate generation

- winner announcements

Do not implement unnecessary features now if they complicate the core application, but structure the architecture so they can be added later.

==================================================

64. FINAL UI DETAILS

==================================================

Use futuristic micro-interactions.

Examples:

Button hover:

blue glow

Cards:

subtle border animation

Successful registration:

animated checkmark

Task released:

blue pulse

Important announcement:

subtle red/orange warning glow

Verified:

green status

Pending:

yellow

Rejected:

red

Active:

blue

Use animations carefully.

No excessive animation.

==================================================

65. POSTER INTEGRATION

==================================================

Use the supplied SIIH 2.0 poster as a visual reference.

The poster contains:

SIIH 2.0

SMART INDIA HACKATHON

INTERNAL HACKATHON 2026

IDEAS TODAY. IMPACT TOMORROW.

THINK. BUILD. SOLVE.

26TH TO 27TH SEPTEMBER 2026

6 PERSONS / TEAM

₹1.5 LAKH CASH PRIZE

Use these values as INITIAL CONTENT, but make them editable through Admin Settings.

The uploaded poster may also be used as:

- hero visual

- promotional banner

- registration page reference

- social preview image

Do not distort the poster.

==================================================

66. IMPORTANT UX REQUIREMENT

==================================================

The application should feel like:

"Smart India Hackathon Command Center"

rather than a normal college registration website.

It should feel:

- premium

- futuristic

- trustworthy

- technical

- fast

- professional

The student should immediately understand:

1. What is SIIH 2.0?

2. When is it?

3. How many people can be on a team?

4. What is the prize?

5. How do I register?

6. How do I login?

7. What tasks do I have?

8. What is my team's status?

==================================================

67. IMPLEMENTATION ORDER

==================================================

Build in this order:

PHASE 1

- project setup

- routing

- design system

- Supabase connection

- authentication

PHASE 2

- database schema

- RLS

- storage buckets

- registration system

PHASE 3

- team portal

- admin portal

PHASE 4

- payment verification

- dynamic forms

PHASE 5

- task system

- PDF documents

- submissions

PHASE 6

- notifications

- announcements

- analytics

PHASE 7

- security hardening

- testing

- responsive optimization

- deployment configuration

==================================================

68. REQUIRED OUTPUT

==================================================

Generate:

1. Complete frontend

2. Complete backend integration

3. Supabase database schema

4. Supabase migrations

5. Supabase RLS policies

6. Storage bucket configuration

7. Authentication

8. Admin authentication

9. Team authentication

10. Registration system

11. Payment upload

12. Admin payment verification

13. Dynamic forms

14. Task management

15. Task PDF upload

16. Team task dashboard

17. Submission system

18. Notifications

19. Public team directory

20. Analytics dashboard

21. Settings

22. Audit logs

23. Responsive UI

24. SEO

25. Deployment configuration

Do not use fake/mock APIs in the final implementation.

Use Supabase for persistent data.

==================================================

69. FINAL ACCEPTANCE TEST

==================================================

Before considering the application complete, verify this complete flow:

1. Student opens /siih2.0

2. Student views hackathon information

3. Student clicks Register

4. Student creates team

5. Student enters team leader

6. Student enters members

7. Student completes registration form

8. Student sees payment instructions

9. Student uploads JPG/PNG/PDF payment proof

10. Student submits registration

11. System generates Registration ID

12. Student receives confirmation

13. Admin logs into admin console

14. Admin sees new team

15. Admin opens payment proof

16. Admin verifies payment

17. Team status changes to VERIFIED

18. Team leader logs in using registered Gmail

19. Team dashboard displays verified status

20. Admin creates Task 01

21. Admin uploads Task 01 PDF

22. Admin assigns task to selected team/all teams

23. Team sees Task 01

24. Team opens PDF

25. Team submits solution

26. Admin sees submission

27. Admin can evaluate submission

28. Admin sends announcement

29. Team receives notification

30. Public team count updates

31. Admin exports team list

All of these flows must work with real Supabase data.

==================================================

70. DO NOT DO

==================================================

Do NOT:

- use fake authentication

- store passwords yourself

- expose private files

- expose Supabase service role key

- use static JSON as the primary database

- hard-code registration data

- hard-code payment status

- allow users to access other teams' private data

- allow ordinary users into admin dashboard

- expose phone/email publicly unless configured

- create insecure admin routes

- make the futuristic background reduce readability

Build the complete application with production-quality architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a71f1b5-166b-4ce4-bfef-51a4ce35a047).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
