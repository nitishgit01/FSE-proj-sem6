# WageGlass — User Flow Document
**Version:** 1.0 — MVP  
**Date:** March 2026  
**Purpose:** Every interaction a user has with WageGlass, from first visit to regular use, mapped step by step.

---

## How to Read This Document

- **→** means the user navigates to a new page or screen.
- **[ACTION]** means the user performs an action.
- **{SYSTEM}** means the system responds or does something.
- **⚠ BRANCH** marks a decision point where the flow splits based on user state.
- **✅ SUCCESS STATE** marks a completed milestone in the user journey.

---

## Flow 1: First-Time Visitor — Discovery Path (No Account)

This is the most common entry point. A user arrives from a shared link, social media, or search.

```
[User arrives at wageglass.com]
        ↓
→ LANDING PAGE
   {SYSTEM: Displays total submission count pulled live from DB}
   {SYSTEM: Shows hero headline, two primary CTAs, anonymity explanation}
        ↓
   ⚠ BRANCH: What does the user do?
        ├── [Clicks "Explore Salaries"] ──────────────→ FLOW 3 (Browse Path)
        └── [Clicks "Submit Your Salary"] ────────────→ FLOW 2 (Submission Path)
```

---

## Flow 2: Salary Submission — Full Path (Guest or Logged-in)

### 2A. Entry to the Submission Form

```
[User clicks "Submit Your Salary" from any page]
        ↓
→ SUBMISSION FORM — Step 1 of 3 (Role & Employer)
   {SYSTEM: Progress bar shows Step 1 of 3 — 0% complete}
   {SYSTEM: Form initialised with empty fields}
```

### 2B. Step 1 — Role & Employer

```
→ STEP 1: Role & Employer
   [User types job title into autocomplete field]
        ↓
   {SYSTEM: Debounced API call to GET /api/roles?q= fires after 300ms}
   {SYSTEM: Dropdown shows matching canonical titles (e.g. "Software Engineer II")}
        ↓
   [User selects a canonical title from dropdown]
   [User selects Industry from dropdown]
   [User types Company Name (optional — can skip)]
   [User selects Company Size (radio pill)]
   [User sets Years of Experience (slider 0–30)]
        ↓
   [User clicks "Next →"]
        ↓
   {SYSTEM: Zod validates Step 1 fields}
        ↓
   ⚠ BRANCH: Validation result?
        ├── FAIL: {SYSTEM: Inline error messages appear below invalid fields}
        │          [User corrects errors]
        │          [User clicks "Next →" again]
        │          → loops back to validation
        └── PASS: → STEP 2
```

### 2C. Step 2 — Compensation

```
→ STEP 2: Compensation
   {SYSTEM: Progress bar updates to Step 2 of 3 — 33% complete}
   {SYSTEM: Currency auto-detected as placeholder — overridable}
        ↓
   [User enters Base Salary (number input or slider)]
        ↓
   {SYSTEM: Total Compensation display updates live: base + bonus + equity}
        ↓
   [User enters Annual Bonus (optional — defaults to 0)]
   [User enters Annual Equity value (optional — defaults to 0)]
   [User adjusts currency if needed]
        ↓
   [User clicks "Next →"]
        ↓
   {SYSTEM: Zod validates Step 2 — salary must be 1,000–10,000,000}
        ↓
   ⚠ BRANCH: Validation result?
        ├── FAIL: {SYSTEM: Error messages shown} → User corrects → loops
        └── PASS: → STEP 3
```

### 2D. Step 3 — Location & Context

```
→ STEP 3: Location & Context
   {SYSTEM: Progress bar updates to Step 3 of 3 — 66% complete}
        ↓
   [User selects Country from searchable dropdown]
   [User types City]
   [User selects Work Mode: Remote / Hybrid / Onsite]
   [User optionally selects Gender (can choose "Prefer not to say")]
        ↓
   [User clicks "Submit →"]
        ↓
   {SYSTEM: Final Zod validation runs on all 3 steps}
        ↓
   ⚠ BRANCH: Validation result?
        ├── FAIL: {SYSTEM: Error messages shown} → User corrects → loops
        └── PASS: → 2E (API call)
```

### 2E. Submission Processing

```
[User clicks "Submit →" with valid data]
        ↓
{SYSTEM: Loading state shown on button ("Submitting...")}
{SYSTEM: POST /api/submissions called with full form data}
{SYSTEM: Server validates body again (server-side Zod)}
{SYSTEM: Server normalises jobTitle against roles collection}
{SYSTEM: Server computes totalComp = base + bonus + equity}
{SYSTEM: Server checks rate limit (1 submission per 30 days per user)}
        ↓
⚠ BRANCH: Rate limit hit?
        ├── YES: {SYSTEM: Returns 429 error}
        │         {SYSTEM: Toast notification: "You've already submitted recently.
        │          You can submit again on [date 30 days from last submission]."}
        │         [User stays on form — no data lost]
        └── NO: → submission saved to MongoDB
                  {SYSTEM: Returns 201 with submission ID}
                  → FLOW 2F (Success Screen)
```

### 2F. Success Screen

```
→ SUCCESS SCREEN
        ↓
⚠ BRANCH: Is user logged in?
        │
        ├── LOGGED IN:
        │    {SYSTEM: Computes user's percentile for their role + location}
        │    {SYSTEM: Displays "Your salary was submitted successfully"}
        │    {SYSTEM: Displays "You earn more than X% of [Role] professionals in [City]"}
        │    [Primary CTA: "See the full chart for your role →"]
        │         ↓
        │    [User clicks CTA]
        │         ↓
        │    → STATS PAGE with role + country + city pre-applied as URL filters
        │
        └── GUEST (not logged in):
             {SYSTEM: Displays "Your salary was submitted successfully"}
             {SYSTEM: Displays teaser: "Want to see where you stand?"}
             [CTA 1: "Create a free account to see your percentile →"]
             [CTA 2: "Explore salaries without an account →"]
                  ↓
             ⚠ BRANCH: Which CTA?
                  ├── "Create account" → FLOW 5 (Registration)
                  │    {after registration, redirect back to stats page with filters}
                  └── "Explore" → STATS PAGE with their role + location pre-applied
```

---

## Flow 3: Browsing Salary Data — Discovery Path

```
[User clicks "Explore Salaries" from landing page]
   OR
[User arrives at /stats directly via shared URL with filters in query string]
        ↓
→ STATS PAGE
   {SYSTEM: Parses URL query params for pre-applied filters}
   {SYSTEM: If no filters: shows "Select a role to see salary data" empty state}
   {SYSTEM: Filters sidebar visible on desktop; collapsed on mobile}
        ↓
[User selects a Job Title from searchable filter]
        ↓
{SYSTEM: GET /api/stats?role=...&country=... fires}
{SYSTEM: Server checks: does this filter combo have ≥ 5 submissions?}
        ↓
⚠ BRANCH: Data available?
        │
        ├── N < 5:
        │    {SYSTEM: Returns INSUFFICIENT_DATA error code}
        │    {SYSTEM: Chart area shows: "Not enough data for this combination yet."}
        │    {SYSTEM: CTA: "Be the first to contribute — Submit your salary"}
        │    [User can change filters to find a populated dataset]
        │    [User can click CTA to go to submission form]
        │
        └── N ≥ 5:
             {SYSTEM: Returns aggregated stats: P10/P25/P50/P75/P90, histogram buckets}
             → FLOW 3A (Populated Chart View)
```

### 3A. Populated Chart View

```
→ STATS PAGE (Populated)
   {SYSTEM: Renders 4 stat cards: Median, P75, Total Submissions, [Your %ile if widget used]}
   {SYSTEM: Renders histogram + P25/median/P75 reference lines}
   {SYSTEM: Chart title: "[Role] salaries in [City], [Country] — [N] submissions"}
        ↓
[User hovers over a bar in the histogram]
        ↓
{SYSTEM: Tooltip shows: salary range, number of people, percentile range}
        ↓
[User reads the chart]
        ↓
⚠ BRANCH: What does the user do next?
        ├── [Changes a filter] ─────────────────────────────→ FLOW 3B
        ├── [Uses "Where do I stand?" widget] ──────────────→ FLOW 3C
        ├── [Clicks "Submit Your Salary"] ──────────────────→ FLOW 2
        └── [Copies URL to share with a friend] ────────────→ ✅ (URL contains filters)
```

### 3B. Changing Filters

```
[User changes any filter — e.g. switches from "Onsite" to "Remote"]
        ↓
{SYSTEM: URL query string updates immediately}
{SYSTEM: Debounced API call fires after 400ms}
{SYSTEM: Chart enters loading state (skeleton animation)}
        ↓
{SYSTEM: New stats return from API}
{SYSTEM: Chart re-renders with new data}
        ↓
[User sees updated distribution for their new filter combination]
→ Back to FLOW 3A
```

### 3C. "Where Do I Stand?" Widget

```
[User finds salary input field below the stat cards]
[User types their current salary]
        ↓
{SYSTEM: No API call needed — computation happens client-side}
{SYSTEM: Binary search against P10/P25/P50/P75/P90 breakpoints from current API response}
{SYSTEM: Computes: user is in the Xth percentile}
{SYSTEM: Overlays a coloured ReferenceLine on chart at user's salary position}
{SYSTEM: Label on line reads "You"}
{SYSTEM: Text below chart updates: "You earn more than X% of [Role] professionals in [Location]"}
{SYSTEM: 4th stat card updates to show "Your percentile: Xth"}
        ↓
[User adjusts salary in the input to explore]
        ↓
{SYSTEM: All of the above updates in real time on each keystroke}
        ↓
⚠ BRANCH: Is user logged in?
        ├── LOGGED IN: No additional prompt
        └── GUEST: {SYSTEM: Soft prompt appears below widget}
                   "Submit your real salary to help others — it only takes 2 minutes"
                   [CTA → FLOW 2]
```

---

## Flow 4: Returning User — Logged-In Regular Visit

```
[Returning user opens wageglass.com]
        ↓
{SYSTEM: Checks for valid JWT in HttpOnly cookie}
        ↓
⚠ BRANCH: Valid session?
        ├── YES: {SYSTEM: User is silently authenticated}
        │         → LANDING PAGE (logged-in state: shows "Welcome back" + quick links)
        │         [User clicks "Explore Salaries"]
        │         → STATS PAGE
        │         → continues into FLOW 3
        │
        └── NO (session expired or first visit):
              → LANDING PAGE (logged-out state)
              → continues into FLOW 1
```

---

## Flow 5: Registration — Creating an Account

```
[User clicks "Create Account" from any CTA or nav link]
        ↓
→ REGISTER PAGE
   [User enters email address]
   [User enters password (min 8 chars, 1 uppercase, 1 number)]
   [User enters password confirmation]
        ↓
   [User clicks "Create Account"]
        ↓
   {SYSTEM: Validates email format and password rules}
        ↓
   ⚠ BRANCH: Validation?
        ├── FAIL: {Inline errors shown} → User corrects → loops
        └── PASS:
              {SYSTEM: POST /api/auth/register}
              {SYSTEM: Email hashed and stored; verification token generated}
              {SYSTEM: Verification email sent via Nodemailer}
              → "CHECK YOUR EMAIL" SCREEN
                   {SYSTEM: "We sent a link to [email]. Click it to verify your account."}
                   {SYSTEM: "Didn't receive it? Resend email" link (rate-limited)}
```

### 5A. Email Verification

```
[User receives verification email]
[User clicks verification link]
        ↓
→ {SYSTEM: GET /api/auth/verify/:token}
{SYSTEM: Token validated against DB; isVerified set to true; token deleted}
        ↓
⚠ BRANCH: Token valid?
        ├── EXPIRED / INVALID:
        │    → "VERIFICATION FAILED" PAGE
        │    {SYSTEM: "This link has expired. Request a new one."}
        │    [User clicks "Resend verification email"]
        │    → Loop back to CHECK YOUR EMAIL screen
        │
        └── VALID:
              → "ACCOUNT VERIFIED" SCREEN
              {SYSTEM: "Your account is verified. You're all set."}
              {SYSTEM: JWT cookie set — user is now logged in}
              [CTA: "Explore Salaries →"]
              → STATS PAGE
```

---

## Flow 6: Login — Returning User

```
[User clicks "Log In" from nav or any login CTA]
        ↓
→ LOGIN PAGE
   [User enters email]
   [User enters password]
   [User clicks "Log In"]
        ↓
   {SYSTEM: POST /api/auth/login}
   {SYSTEM: Email looked up; bcrypt compare on password}
        ↓
   ⚠ BRANCH:
        ├── WRONG CREDENTIALS:
        │    {SYSTEM: "Invalid email or password" — same message for both (security)}
        │    {SYSTEM: After 5 failed attempts: account temporarily locked 15 min}
        │    [User retries or clicks "Forgot Password" — V2 feature]
        │
        ├── NOT VERIFIED:
        │    {SYSTEM: "Please verify your email before logging in."}
        │    [Resend verification email link shown]
        │
        └── SUCCESS:
              {SYSTEM: JWT signed and set as HttpOnly cookie}
              {SYSTEM: User redirected to where they came from (returnUrl) or landing page}
              → User continues in logged-in state
```

---

## Flow 7: Logout

```
[User clicks "Log Out" in navigation menu]
        ↓
{SYSTEM: POST /api/auth/logout}
{SYSTEM: HttpOnly cookie cleared on server}
{SYSTEM: React auth state reset to null}
        ↓
→ LANDING PAGE (logged-out state)
```

---

## Flow 8: Mobile-Specific Filter Flow

```
[User visits STATS PAGE on a mobile device (< 768px)]
        ↓
{SYSTEM: Filters sidebar is hidden}
{SYSTEM: "Filter" button visible at bottom of screen or below chart title}
        ↓
[User taps "Filter"]
        ↓
{SYSTEM: Filter drawer slides up from bottom of screen}
{SYSTEM: Overlay darkens the background}
        ↓
[User sets filters inside drawer]
        ↓
[User taps "Apply" or taps outside the drawer]
        ↓
{SYSTEM: Drawer closes}
{SYSTEM: API call fires with new filters}
{SYSTEM: Chart updates}
→ Back to populated chart view (Flow 3A)
```

---

## Flow 9: Shared URL — Direct Chart Link

```
[Friend shares a link: wageglass.com/stats?role=SWE&country=IN&city=Pune&exp=3-5]
        ↓
[New user clicks the link]
        ↓
→ STATS PAGE
{SYSTEM: URL params parsed on mount}
{SYSTEM: Filters pre-populated from URL params}
{SYSTEM: API call fires immediately with those filters}
{SYSTEM: Chart renders with the pre-specified peer group}
        ↓
[New user sees real salary data for their peer group without any setup]
        ↓
{SYSTEM: Soft CTA appears below chart: "These are your peers' salaries.
         How does yours compare? Submit yours — it takes 2 minutes."}
[CTA → FLOW 2]
```

---

## State Machine Summary

| User State | Can Do |
|---|---|
| Guest (no account) | Browse chart, submit salary, use "Where do I stand?" widget |
| Guest (just submitted) | All above + see teaser of percentile; prompted to register |
| Registered, unverified | Cannot log in; can resend verification email |
| Registered, verified, logged in | All above + see full percentile after submission + 30-day enforcement |
| Logged in, rate-limited | Cannot submit; sees next eligible submission date |

---

## Error States Reference

| Scenario | What user sees |
|---|---|
| API timeout (> 10s) | "Something went wrong loading salary data. Try again." with retry button |
| Form submission network failure | "Couldn't save your submission. Your data is safe — try again." |
| N < 5 for filter combo | "Not enough data yet for this combination" + submit CTA |
| Invalid verification link | "This link has expired" + resend option |
| Rate limit on submission | "You can submit again on [date]" |
| Rate limit on auth (5 fails) | "Too many attempts. Please wait 15 minutes." |
| Server 500 error | Generic error with a reference code and "our team has been notified" |

---

*This document is the single source of truth for every screen and transition in WageGlass MVP.*  
*Any feature that does not appear here is out of scope for the first deliverable.*
