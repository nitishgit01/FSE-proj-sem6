# WageGlass — Product Requirements Document (PRD)
**Version:** 1.0 — MVP  
**Date:** March 2026  
**Project Lead:** Member 1 (Servant Leader)  
**Team Size:** 3  
**Stack:** MERN (MongoDB, Express.js, React, Node.js) + TypeScript  
**Deadline:** 48-hour first deliverable sprint  

---

## 1. Executive Summary

WageGlass is an anonymous salary transparency platform that empowers professionals to understand their market value by contributing to and browsing a community-verified salary dataset. Users submit their compensation anonymously and immediately receive context — where they stand relative to peers with the same role, location, and experience level.

The core value proposition is a two-sided loop: the more people submit, the more valuable the data becomes for everyone. Every user is both a contributor and a beneficiary.

---

## 2. Problem Statement

### The Core Problem
Pay inequality persists in part because salaries are treated as taboo. Professionals — especially women, minorities, and career-changers — are systematically underpaid because they have no reliable, verified benchmarks for their exact role, location, experience level, and company size.

### Why Existing Solutions Fail
- **LinkedIn Salary:** Requires a paid subscription; data is self-reported without verification incentive.
- **Glassdoor:** Company-first, not role-first; company reviews overshadow compensation data.
- **Levels.fyi:** Excellent but scoped to big tech. Unusable for finance, healthcare, design, or non-US markets.
- **PayScale / Indeed:** Aggregated from resumes; not real-time, community-driven, or transparent about methodology.

### What WageGlass Does Differently
- No subscription required to view data.
- Anonymous by default — no profile, no employer tag, no social graph.
- Contribution-gated insight: your percentile is revealed only after you submit, creating a fair exchange.
- Enforces minimum dataset sizes before displaying results — no individual can be reverse-engineered from the data.

---

## 3. Target Users

### Primary User: The Underpaid Professional
- Age 22–45, employed full-time or recently job-searching.
- Suspects they are underpaid but has no verified data to confirm it.
- About to negotiate a raise, accept a job offer, or evaluate a counter-offer.
- Located in any country; particularly underserved markets outside the US.

### Secondary User: The Curious Contributor
- Wants to "give back" to a community that helped them.
- Submits once every 6–12 months as their salary changes.
- May share WageGlass links with friends before salary negotiations.

### Tertiary User: The Career Changer
- Switching industries or roles and needs baseline salary expectations.
- Has no insider knowledge about compensation norms in their target field.

---

## 4. MVP Scope (First Deliverable — 48 Hours)

The MVP must demonstrate the core value loop end-to-end:

> **Submit salary → See distribution → See your percentile**

### In Scope for MVP
1. Anonymous salary submission (multi-step form)
2. Optional email-verified account creation
3. Salary distribution chart (histogram + percentile lines)
4. "Where do I stand?" percentile widget
5. Filter system (role, location, experience, work mode)
6. Anonymisation threshold enforcement (N ≥ 5)
7. Job title normalisation against a canonical roles taxonomy
8. Basic deployment (live URL accessible by anyone)

### Out of Scope for MVP (Planned for V2)
- Salary trend charts over time
- Company profile pages
- AI negotiation script generator
- Salary alerts and email notifications
- Gender pay gap analytics
- Skills premium calculator
- Community discussion threads

---

## 5. Feature Specifications

### 5.1 Landing Page

**Purpose:** Communicate the value proposition and drive two actions: submit a salary or browse the data.

**Requirements:**
- Headline: clear statement of what WageGlass does in one sentence.
- Two primary CTAs: "Submit Your Salary" and "Explore Salaries".
- Brief explanation of the anonymity model (no name, no email required to submit).
- Social proof section: show total submission count (e.g. "2,847 salaries submitted so far").
- No login wall on the landing page.

**Acceptance Criteria:**
- Page loads in under 2 seconds on a 4G mobile connection.
- Both CTAs are visible above the fold on a 375px mobile viewport.
- Submission count updates from the database, not a hardcoded number.

---

### 5.2 Anonymous Salary Submission (Multi-Step Form)

**Purpose:** Collect accurate, structured compensation data from users with minimal friction.

**Form Structure (3 Steps):**

**Step 1 — Role & Employer**
| Field | Type | Required | Notes |
|---|---|---|---|
| Job Title | Autocomplete text | Yes | Searches canonical roles taxonomy; fuzzy match |
| Industry | Select dropdown | Yes | Enum: Technology, Finance, Healthcare, Design, Marketing, Education, Legal, Other |
| Company Name | Text input | No | Optional; used for company profiles in V2 |
| Company Size | Radio pills | Yes | Startup (1–50), Mid-size (51–500), Enterprise (500+) |
| Years of Experience | Slider (0–30) | Yes | Total years in professional career |

**Step 2 — Compensation**
| Field | Type | Required | Notes |
|---|---|---|---|
| Base Salary | Number input + slider | Yes | Annual, local currency |
| Currency | Select | Yes | Auto-detected by country; overridable |
| Annual Bonus | Number input | No | Cash bonus; 0 if none |
| Annual Equity | Number input | No | Annual equity value in same currency |
| Total Compensation | Calculated display | Auto | base + bonus + equity; shown live |

**Step 3 — Location & Context**
| Field | Type | Required | Notes |
|---|---|---|---|
| Country | Searchable select | Yes | ISO 3166 country list |
| City | Text input | Yes | Free text; indexed |
| Work Mode | Toggle | Yes | Remote / Hybrid / Onsite |
| Gender | Radio | No | Man / Woman / Non-binary / Prefer not to say |

**Behaviour Requirements:**
- All previously entered data is preserved when navigating back between steps.
- Step validation occurs on "Next" click; user cannot proceed with invalid fields.
- Anonymous guest path: form is submittable without creating an account.
- If logged in, userId is attached to submission and submissionCount incremented.
- A user can submit a maximum of once per 30 days (enforced server-side).
- After submission, user is redirected to the success screen.

**Acceptance Criteria:**
- Form submits successfully as a guest (no account required).
- Zod validation rejects: salary below 1000, salary above 10,000,000, yearsExp below 0 or above 50.
- totalComp is computed server-side (not trusted from client).
- Submission appears in MongoDB within 2 seconds of form submit.

---

### 5.3 Success Screen (Post-Submission)

**Purpose:** Reward the user for contributing and immediately drive them to the chart.

**Requirements:**
- Show a confirmation that the salary was received.
- If the user is logged in: show their percentile rank immediately ("You're in the top 34% for Software Engineers in Pune").
- If the user is a guest: show a teaser ("See where you stand — create a free account") with login/register CTA.
- Primary CTA: "Explore salaries for your role" — navigates to the stats page with their role + location pre-applied as filters.

---

### 5.4 Salary Distribution Chart (Core Visualisation)

**Purpose:** The primary reason users visit and return to WageGlass. Makes the data actionable and meaningful.

**Chart Composition:**
- Recharts `ComposedChart` with a `BarChart` histogram (10 equal-width salary buckets) as the base layer.
- `ReferenceLine` components at P25, median (P50), and P75 with labelled tooltips.
- Custom tooltip on hover showing: salary range, number of submissions in that bucket, percentile range.
- Chart title updates dynamically: "Software Engineer salaries in Pune, India (23 submissions)".

**Stat Cards (above chart):**
- Median salary
- 75th percentile salary
- Total submissions in current filter
- Your percentile (if salary entered in the widget)

**"Where Do I Stand?" Widget:**
- Salary input field below the stat cards.
- On input: real-time computation of user's percentile using binary search against P10/P25/P50/P75/P90 breakpoints.
- A distinct coloured `ReferenceLine` with a "You" label overlays the chart at the user's salary position.
- Text below chart: "You earn more than X% of [role] professionals in [location]".

**States:**
1. **Loading:** Skeleton bars animation while API call resolves.
2. **Populated:** Full chart with filters and "Where do I stand?" widget.
3. **Not enough data (N < 5):** Friendly message — "Not enough submissions for this combination yet. Be the first to contribute!" with CTA to submit form.
4. **No filters selected:** Prompt user to select a role to see data.

**Acceptance Criteria:**
- Chart re-renders within 500ms of a filter change.
- "Where do I stand?" widget updates on every keystroke without a new API call.
- Chart is fully readable and usable on a 375px mobile viewport.
- N < 5 guard is enforced: chart never displays data from fewer than 5 submissions.

---

### 5.5 Filter System

**Purpose:** Allow users to narrow the dataset to a peer group that is meaningful to them.

**Filters:**
| Filter | Component | Notes |
|---|---|---|
| Job Title | Searchable select (live API) | Autocomplete against canonical roles |
| Country | Searchable select | ISO country list |
| City | Text input | Debounced 300ms |
| Experience Band | Pills (multi-select) | 0–2 yrs / 3–5 yrs / 6–10 yrs / 10+ yrs |
| Work Mode | Toggle chips | Remote / Hybrid / Onsite |
| Company Size | Toggle chips | Startup / Mid / Enterprise |

**Behaviour:**
- Every filter change triggers a new API call (debounced 400ms to prevent flooding).
- Active filters are synced to the URL query string (`?role=SWE&country=IN&city=Pune`) so the view is shareable via link.
- A "Reset filters" button clears all active filters.
- On mobile: filters collapse into a slide-up drawer triggered by a "Filter" button.

---

### 5.6 Authentication (Optional Accounts)

**Purpose:** Enable personalised features (submission history, percentile memory) without being a barrier to core usage.

**Registration:**
- Email + password only. No OAuth in MVP.
- Password: minimum 8 characters, 1 uppercase, 1 number.
- Email verification required before account is considered active.
- Verification email sent via Nodemailer (Gmail SMTP or Resend free tier).

**Login:**
- Email + password → JWT signed and stored in HttpOnly, Secure, SameSite=Strict cookie.
- Session persists for 7 days with silent refresh.

**Guest vs. Logged-in:**
| Feature | Guest | Logged-in |
|---|---|---|
| Browse chart | ✅ | ✅ |
| Submit salary | ✅ | ✅ |
| See own percentile after submit | ❌ | ✅ |
| 30-day resubmission enforcement | Cookie-based (weak) | Server-enforced (strong) |

---

### 5.7 Anonymisation and Privacy

**This is non-negotiable and must be implemented before launch.**

**Rules:**
1. **N ≥ 5 threshold:** No aggregation result is returned for any filter combination with fewer than 5 submissions. The API returns a specific error code (`INSUFFICIENT_DATA`) instead.
2. **No individual records exposed:** The API never returns raw submission documents to the client. Only aggregated statistics are returned.
3. **Email hashing:** User email addresses are hashed with bcrypt before storage. The raw email is never stored.
4. **Optional fields:** Company name, gender, and city are optional. No submission is rejected for omitting them.
5. **Submission count cap:** submissionCount is incremented on the user record; the submission itself stores no direct link back to the user's profile in the public-facing API response.

---

## 6. Non-Functional Requirements

### Performance
- API responses for stats queries must return in under 800ms for datasets up to 100,000 submissions.
- Frontend initial load: under 3 seconds on a standard 4G connection.
- Recharts renders must complete within 200ms of data arrival.

### Security
- All API routes sanitised against NoSQL injection (mongo-sanitize).
- HTTP security headers set via helmet.js.
- CORS restricted to known frontend origin only.
- Rate limiting: 100 requests per 15 minutes globally; 5 per hour on auth routes; 1 submission per 30 days per user.
- JWT stored exclusively in HttpOnly cookies — never in localStorage.
- HTTPS enforced in production.

### Scalability
- MongoDB compound indexes on (jobTitle + country + city), (submittedAt), (totalComp) to support efficient aggregation as dataset grows.
- Aggregation pipeline designed to run server-side, not in application memory.
- Stateless Express server — horizontally scalable behind a load balancer.

### Accessibility
- All form inputs have associated labels.
- Chart has a data table alternative accessible to screen readers.
- Colour is never the sole means of conveying information (chart uses both colour and labels for percentile lines).
- Keyboard navigable: tab order follows logical reading flow through the form.

### Browser Support
- Chrome 110+, Firefox 110+, Safari 16+, Edge 110+.
- Mobile: iOS Safari 16+, Chrome Android 110+.

---

## 7. Success Metrics for MVP

| Metric | Target at Launch |
|---|---|
| Total submissions in first 48 hours | ≥ 30 (team + friends seeding) |
| Form completion rate | ≥ 70% of users who start Step 1 complete Step 3 |
| Chart load time | ≤ 800ms p95 |
| "Where do I stand?" engagement | ≥ 60% of chart page visitors use the widget |
| Zero critical security issues | Confirmed by Opus security review |

---

## 8. Constraints and Assumptions

- **Budget:** Free tiers only. MongoDB Atlas M0, Railway hobby plan, Vercel hobby plan.
- **Team capacity:** Three developers, 48-hour sprint, parallel workstreams.
- **No real payment processing in MVP.**
- **No third-party salary data APIs** — dataset is 100% user-submitted.
- **Currency:** Submissions stored in user's local currency. Conversion to USD for cross-country comparison is a V2 feature. MVP shows local currency only within the same country filter.
- **Data quality:** Submissions are unverified in MVP. The N ≥ 5 threshold and volume of submissions are the quality controls. Human moderation and verification badges are V2 features.

---

*Document maintained by Member 1. Update this document before starting any V2 feature development.*
