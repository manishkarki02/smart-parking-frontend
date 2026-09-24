# Sajilo Parking Frontend Production Implementation

**Applies to:** Existing React frontend migrating to NestJS API v2  
**Product requirements:** [PRODUCT_REQUIREMENTS.md](../PRODUCT_REQUIREMENTS.md)

## 1. Current implementation

The application uses React 19, TypeScript, Vite, TanStack Router and Query, Zustand, React Hook Form, Zod, Tailwind CSS, component primitives, Axios, and Google Maps integration.

Existing route areas cover public parking discovery/detail, authentication, driver bookings/payments/profile, vendor dashboard/locations/bookings/earnings/settings, and administrator users/vendors/bookings/payments.

### Verified strengths

- Broad driver, vendor, and admin screen coverage.
- Feature-based services, hooks, components, validators, and types.
- Map, browser geolocation, Haversine discovery, booking/payment history, and operational tables.
- Query invalidation and short polling already support state freshness.

### Migration gaps

- Current services target Java API paths and response shapes.
- Destination intent and route comparison are incomplete.
- The UI assumes numbered slots for all vehicle types.
- No frontend automated tests.
- CI publishes an image but does not independently gate typecheck, lint, tests, and build.
- The default branch does not contain the latest v2 work.

## 2. Target architecture

- Keep TanStack Router as the route boundary and TanStack Query as the only owner of server state.
- Keep auth identity in Zustand; keep refresh tokens inaccessible to JavaScript.
- Generate v2 DTO types from OpenAPI or validate them in a dedicated adapter layer.
- Put v2 calls behind feature API modules; components never access Axios directly.
- Centralize authentication refresh, normalized errors, correlation IDs, retry policy, and SSE connection management.
- Represent availability through a discriminated union: numberedSlot for four-wheelers and capacityPool for two-wheelers.

## 3. Implementation backlog

### Platform and session

| ID | Priority | Work and acceptance criteria |
|---|---|---|
| SP-FE-001 | P0 | Replace Java endpoint adapters with /api/v2 clients generated or checked against OpenAPI. |
| SP-FE-002 | P0 | Implement access-token refresh mutex, credentials policy, role-aware route guards, and logout-all behavior. |
| SP-FE-003 | P0 | Normalize API field issues, conflicts, expirations, rate limits, and request IDs into reusable UI states. |
| SP-FE-004 | P1 | Add a global offline banner, recoverable retry behavior, route error boundaries, and release diagnostics. |

### Search and recommendation

| ID | Priority | Work and acceptance criteria |
|---|---|---|
| SP-FE-010 | P0 | Search form accepts destination autocomplete/map pin, vehicle, start, and end time with URL-restorable state. |
| SP-FE-011 | P0 | Results distinguish excluded/unavailable candidates from ranked feasible candidates and show availability type correctly. |
| SP-FE-012 | P1 | Cards and map show driving time, walking time, rate, current availability, recommendation explanation, and fallback labels. |
| SP-FE-013 | P1 | Changing destination, vehicle, or time cancels stale requests and updates both list and map selection. |
| SP-FE-014 | P1 | SSE updates visible availability and recommendation order; polling resumes when SSE is unavailable. |

### Reservation and payment

| ID | Priority | Work and acceptance criteria |
|---|---|---|
| SP-FE-020 | P0 | Four-wheeler checkout selects a numbered slot; two-wheeler checkout requests a capacity unit without exposing a fake slot number. |
| SP-FE-021 | P0 | Quote view displays server price, policy, hold expiration, vehicle, schedule, and location before payment. |
| SP-FE-022 | P0 | Payment initiation creates one idempotency key and preserves it across retries and provider return. |
| SP-FE-023 | P0 | Verification states cover waiting, success, failure, expiry, duplicate return, and support reference. |
| SP-FE-024 | P1 | Booking history/detail show lifecycle, cancellation eligibility, check-in state, payment, and refund status. |

### Vendor and admin

| ID | Priority | Work and acceptance criteria |
|---|---|---|
| SP-FE-030 | P1 | Location form captures map point, hours, rates, vehicle modes, numbered slots, capacity pools, policy, and publication state. |
| SP-FE-031 | P1 | Vendor availability UI prevents unsafe reductions and explains active commitments returned by a 409 response. |
| SP-FE-032 | P1 | Walk-in, check-in, and completion use the same availability concepts and refresh affected dashboard data. |
| SP-FE-033 | P1 | Admin approval, ban, payment reconciliation, refund, and audit views use server pagination and URL filters. |

## 4. UX rules

- Preserve a booking draft only until its quote or hold expires; never imply a saved screen guarantees availability.
- Show a visible countdown using server expiry, correcting for client/server time difference.
- Explain straight-line fallbacks and never label them as road travel time.
- Map markers, cards, tables, and state badges have text equivalents.
- Use Nepal timezone and NPR consistently.
- Support landmark-style addresses and Unicode/Nepali vehicle identifiers.
- Provide loading, empty, stale, offline, permission, conflict, expired, and provider-unavailable states.
- Destructive vendor/admin actions require confirmation and reason where auditing needs it.

## 5. Accessibility and performance

- Meet WCAG 2.2 AA and complete search, reservation, payment, walk-in, and moderation by keyboard.
- Do not make the map the only way to choose a result.
- Target p75 LCP below 2.5 seconds, INP below 200 ms, and CLS below 0.1.
- Lazy-load map and admin bundles; keep route skeleton dimensions stable.
- Cluster or limit markers and virtualize only after accessible non-virtual fallbacks are proven.
- Respect reduced motion and do not encode availability by color alone.

## 6. Tests

| Layer | Required scenarios |
|---|---|
| Unit | Recommendation formatting, time/price display, state badges, query keys, session transitions |
| Component | Destination form, recommendation card, slot/capacity selector, hold countdown, payment result, vendor capacity editor |
| Integration | Refresh mutex, OpenAPI adapter, SSE reconnect/fallback, stale quote conflict, provider return |
| End-to-end | Driver paid booking, final-capacity conflict, cancellation/refund record, vendor walk-in/check-in/complete, admin vendor approval |

CI runs typecheck, lint, unit/component tests, production build, accessibility smoke tests, and Playwright against disposable v2 services.

## 7. Deployment and monitoring

- Produce an immutable Nginx-hosted image using only public VITE variables.
- Apply CSP, HSTS, Referrer-Policy, Permissions-Policy, and frame protections.
- Capture sanitized frontend exceptions, route/API performance, SSE disconnects, search success, hold expiry, and payment outcomes.
- Expose build version in diagnostics.
- Run a post-deploy smoke test for search, login, and a sandbox payment path.

## 8. Frontend launch checklist

- [ ] All production requests target /api/v2 and match published OpenAPI.
- [ ] Hybrid availability is represented without fake slots.
- [ ] Search and route fallback claims are accurate.
- [ ] Hold countdown and payment return survive refresh.
- [ ] Driver, vendor, and admin E2E suites pass.
- [ ] Latest production source is on the public default branch.
- [ ] Accessibility, security headers, error tracking, and responsive QA pass.

