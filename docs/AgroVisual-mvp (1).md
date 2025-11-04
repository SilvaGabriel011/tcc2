AgroVisual
==========

Executive Summary
-----------------

Gerar pacote ZIP com SOW exportado, JSON Schemas, exemplos JSON e lista de tabelas DB/RLS snippets para integração com WindSurf e entrega ao time Cloud S.4.5. Objetivo: proporcionar artefatos estruturados para importação e criação de tarefas no WindSurf, reduzir ambiguidades de integração e manter controle de versões/thresholds. Resultados esperados: SOW document final, schemas e exemplos, mapeamento de histórias/milestones e um ZIP pronto para anexar no WindSurf, incluindo IDs de versões exigidos pelo Cloud S.4.5.

Core Functionalities
--------------------

*   **SOW Export & Packaging:** Generate and package SOW export, JSON schemas, example payloads, and DB/RLS snippets into a ZIP for WindSurf integration. (Priority: **High**)
    
*   **Integration Task Sync:** Create/import milestones, epics, user stories and estimations into WindSurf via CSV/API to populate implementation tasks. (Priority: **High**)
    
*   **Versioning & Threshold Control:** Attach version IDs and thresholds metadata to SOW artifacts for Cloud S.4.5 tracking and release control. (Priority: **Medium**)
    
*   **Automated ZIP Delivery:** Build and deliver a downloadable ZIP containing SOW, schemas, examples, and integration instructions. (Priority: **Medium**)
    

Personas
--------

*   **Product Manager** – Owns roadmap and prioritization; coordinates stakeholders and accepts deliverables.
    
    **Goals:** Deliver features on time, Maintain scope and budget
    
    **Pain Points:** Unclear requirements, Stakeholder misalignment
    
    **Key Tasks:** Define epics/stories, Approve SOW and handoffs
    
*   **Engineering Lead** – Leads implementation, assigns tasks, ensures code quality and deployments.
    
    **Goals:** Ship reliable features quickly, Maintain system scalability
    
    **Pain Points:** Ambiguous specs, Insufficient estimations
    
    **Key Tasks:** Break down stories, Review PRs and deployments
    
*   **Cloud Operations Engineer** – Handles deployments, infra, and environment configs for Cloud S.4.5 team.
    
    **Goals:** Stable production, Secure deployments
    
    **Pain Points:** Missing infra snippets, Lack of RLS/DB details
    
    **Key Tasks:** Apply infra changes, Monitor and rollback
    
*   **Frontend Developer** – Implements UI and integrates with APIs, ensures UX matches designs.
    
    **Goals:** Build intuitive UI, Ensure responsive performance
    
    **Pain Points:** Incomplete API contracts, Late design changes
    
    **Key Tasks:** Implement components, Consume API specs
    
*   **Backend Developer** – Implements business logic, APIs and data models.
    
    **Goals:** Reliable APIs, Efficient data handling
    
    **Pain Points:** Unclear DB schema, Ambiguous edge cases
    
    **Key Tasks:** Design endpoints, Write tests and migrations
    
*   **QA Engineer** – Validates features through testing, ensures acceptance criteria are met.
    
    **Goals:** Detect regressions early, Ensure feature completeness
    
    **Pain Points:** Incomplete acceptance criteria, Late test environments
    
    **Key Tasks:** Write test plans, Execute automated/manual tests
    
*   **Product Designer** – Creates UX/UI designs and prototypes; collaborates on usability.
    
    **Goals:** Create usable interfaces, Maintain design consistency
    
    **Pain Points:** Spec deviations in implementation, Lack of design tokens
    
    **Key Tasks:** Provide mockups, Review implementations
    
*   **Business Stakeholder** – Provides domain input, approves business requirements and budgets.
    
    **Goals:** Achieve business KPIs, Mitigate risks
    
    **Pain Points:** Scope creep, Lack of visibility
    
    **Key Tasks:** Approve features, Review metrics
    
*   **End User (Customer)** – Uses the product to accomplish primary tasks and receives value.
    
    **Goals:** Complete tasks efficiently, Trust product reliability
    
    **Pain Points:** Poor UX, Performance issues
    
    **Key Tasks:** Interact with UI, Provide feedback
    

Stakeholders
------------

*   **Project Management Team:** Oversees project timeline, deliverables, and resource allocation.
    
*   **Development Team:** Includes Frontend, Backend, and AI Specialists responsible for product development.
    
*   **Quality Assurance (QA) Team:** Ensures the product meets quality standards through rigorous testing.
    
*   **Design Team:** Responsible for UX/UI design, focusing on creating an intuitive user experience.
    
*   **Cloud S.4.5 Team:** Handles cloud integration, deployment, and environment configuration; requires SOW IDs/versions.
    
*   **Product Owner / Stakeholder:** Defines product vision, priorities, acceptance criteria, and reviews deliverables.
    
*   **WindSurf Integration Team:** Implements import/sync of SOW artifacts into WindSurf, manages API/CSV integration.
    
*   **Legal & Compliance:** Reviews contracts, data privacy, and compliance requirements for delivery.
    
*   **Operations / DevOps:** Manages CI/CD, monitoring, and production reliability.
    
*   **End Users / Clients:** Provide requirements feedback and validate product fit; ultimate beneficiaries.
    

Tech Stack
----------

*   **Frontend:** React, Next.js
    
*   **Frontend/Backend:** TypeScript
    
*   **Styling:** Tailwind CSS
    
*   **Backend:** Node.js, Supabase
    
*   **Database:** Prisma, Upstash, Prisma
    
*   **Database Management:** PostgreSQL
    
*   **Data Storage:** Redis
    
*   **Server-side image processing:** Sharp
    
*   **Image Processing:** OpenCV
    
*   **Storage:** AWS S3
    
*   **User Authentication:** Clerk
    
*   **Data Fetching:** React Query
    

Project Timeline
----------------

Tasks are categorized by complexity to guide time estimations: XS, S, M, L, XL, XXL.

**Roles:**

*   **Frontend Developer** (FE)
    
*   **Backend Developer** (BE)
    
*   **QA Engineer** (QA)
    
*   **DevOps Engineer** (DevOps)
    

### **Milestone 1: Project setup: environment, CI/CD, design system, DB init and dev tooling**

_Estimated 0 hours_

### **Milestone 2: Authentication & onboarding: auth, landing, roles, manager/user access flows**

_Estimated 353 hours_

*   **Login Validation:** As a: website user, I want to: login using my credentials, So that: I can access my account securely.**(5.5 hours)** - User can log in with valid email and password System rejects invalid credentials with clear message Successful login sets session cookie and redirects to dashboard
    
    *   DB: Create users migration in prisma/migrations/20251104\_create\_users.sql preserving migration naming and schema for users table with standard fields (id, email, password\_hash, created\_at). Ensure migration up/down SQL and Prisma integration. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement login() in apps/api/services/auth/AuthService.ts using Prisma user lookup, bcrypt to verify password, and JWT issuance. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add login mutation handler in apps/api/routes/auth/login.ts wiring GraphQL/REST (depending on stack) to AuthService.login and set proper response. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LoginForm component in components/auth/LoginForm.tsx to collect email and password with validation, and emit login action. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Wire LoginPage to use LoginForm in pages/auth/login.tsx (route\_auth\_login, comp\_auth\_login\_main) within Next.js pages. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add session creation and cookie set in apps/api/routes/auth/login.ts (table\_sessions) to persist login session in DB. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for login in tests/integration/login.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add docs for login flow in docs/auth/login.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Password Reset:** As a: website user, I want to: reset my password via email, So that: I can regain access if I forget credentials.**(10 hours)** - User can request password reset link via email System validates email exists in user store Password reset link expires after defined window and allows password update
    
    *   DB: Create password\_resets table migration in \`prisma/migrations/\` and update \`prisma/schema.prisma\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add requestPasswordReset mutation handler in \`apps/api/services/auth/AuthService.ts\` to create token and store in \`password\_resets\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add completePasswordReset mutation in \`apps/api/services/auth/AuthService.ts\` to validate token, check expiry, and update password in \`apps/api/services/user/UserService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Wire router endpoints in \`apps/api/routes/auth.ts\` to expose requestPasswordReset and completePasswordReset (router\_route\_auth\_login, router\_route\_auth\_register) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement sendResetEmail(to, token) in \`apps/api/services/email/EmailService.ts\` using templated link \`/auth/reset?token=\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ForgotPassword page component in \`apps/web/routes/auth/forgot.tsx\` calling requestPasswordReset (route\_auth\_login, route\_auth\_register) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ResetPassword page component in \`apps/web/routes/auth/reset.tsx\` to submit new password to completePasswordReset (route\_auth\_login) - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add index and TTL cleanup job for \`password\_resets\` in \`apps/api/jobs/cleanup/cleanupPasswordResets.ts\` (uses table\_password\_resets) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`apps/api/tests/passwordReset.test.ts\` covering request, token expiry, and password update - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document API endpoints and frontend flow in \`docs/auth/password-reset.md\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Role-Based Access:** As a: platform user, I want to: access features based on role, So that: unauthorized actions are prevented.**(8.5 hours)** - Access control checks gate endpoints per role Dashboard shows features aligned with role Audit logs capture access decisions
    
    *   DB: Create user\_roles migration in prisma/migrations/20251104\_add\_user\_roles preserving existing user table relationships and adding join table or enum to map users to roles as part of MVP RBAC; migration must be idempotent and rollback-safe. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add role fields and assignRole() in apps/api/services/auth/AuthService.ts, integrating with Prisma models and ensuring role assignment is permission-checked and idempotent. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add role-based middleware in apps/api/middleware/auth.ts to gate endpoints by role, leveraging existing request.user context and granting access by requiredRoles metadata. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /roles router and endpoints in apps/api/routes/role.ts (router\_route\_auth\_register) for fetchAvailableRoles and assignRole, wired with AuthService and RBAC middleware. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update Dashboard to show role features in components/auth/RoleAwareDashboard.tsx (route\_auth\_login comp\_auth\_login\_main), consuming API to reflect current user roles and feature gating. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement audit logging service in apps/api/services/audit/AuditService.ts to record access decisions, including user, target, action, outcome, timestamp, and reason. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Emit audit logs in middleware at apps/api/middleware/auth.ts when decisions made, integrating with AuditService and ensuring minimal perf impact. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add audit\_logs table migration in prisma/migrations/20251104\_add\_audit\_logs referencing table\_users and table\_user\_roles - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add role selection on register in components/auth/RegisterForm.tsx (route\_auth\_register comp\_register\_form) to capture initial user role choices. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in tests/role.access.test.ts covering gate endpoints, dashboard rendering, and audit log entries - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **MFA Enrollment:** As a: platform user, I want to: enroll in MFA, So that: I add an additional layer of security to my account.**(10 hours)** - User can enable MFA in settings MFA enrollment flows support TOTP or SMS System enforces MFA challenge on login after enrollment
    
    *   DB: Create mfa fields and user\_mfa\_devices migration in prisma/migrations/ to store MFA factors (totp\_secret, sms\_number, enabled\_methods, and device\_id) and a relation to user records. Ensure migration up/down scripts, indices, and data model alignment with Prisma schema. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add registerMfa and verifyMfa mutations in apps/api/routes/auth/mfa.ts to initialize MFA enrollment and verify codes from TOTP or SMS providers. Wire to AuthService enrollment, store factors, and challenge state. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement enrollTOTP() and enrollSMS() in apps/api/services/auth/AuthService.ts to create MFA enrollments, generate secrets or codes, and persist enrollment state. Include methods to trigger SMS delivery and TOTP provisioning. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build MfaSettingsPanel component in components/auth/MfaSettingsPanel.tsx and route in route\_auth\_layout to allow users to view and manage MFA enrollments (enable/disable methods) and trigger enrollment flows from UI. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Update login and completeMfa in router\_route\_auth\_login.ts to enforce MFA challenge during authentication flow after initial credentials. Validate enrolled methods and prompt for OTP/SMS code as part of login sequence. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update LoginPage comp\_auth\_login\_main to handle MFA challenge UI in components/auth/LoginMfaChallenge.tsx when MFA is required after initial login. Show appropriate input and focus management. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Add SMS provider config and secrets in apps/api/config/sms.ts and env. Include provider client initialization, retry, and secure storage considerations. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   QA: Add E2E tests for MFA enrollment and login in tests/e2e/mfa.enrollment.spec.ts to cover enrollment flows, UI interactions, and MFA challenge during login. - (XL) (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Session Persistence:** As a: website user, I want to: maintain session across page reloads, So that: I stay logged in without re-authenticating frequently.**(7 hours)** - Session persists for defined timeout across reloads Token stored securely (HTTPOnly) Logout terminates session and clears token
    
    *   DB: Create sessions table migration in \`prisma/migrations/2025\_create\_sessions\_table/\` preserving PRISMA migration conventions and ensuring session\_id, user\_id, expires\_at, and data columns with indices for lookup by user and TTL compatible with Redis store. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement createSession() and clearSession() in \`apps/api/services/auth/AuthService.ts\` leveraging Prisma models and Redis cache for session management, including proper serialization and error handling. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update login and logout mutations in \`apps/api/routes/auth/login.ts\` to set/clear HTTPOnly cookie via \`router\_route\_auth\_login\` and leverage createSession/clearSession. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Configure Redis session store in \`apps/api/config/session.ts\` and \`infra/session\_redis.tf\` - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Add checkSession logic to \`route\_auth\_login\` using \`components/auth/LoginForm.tsx\` to persist UI session state - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update Auth layout in \`route\_auth\_layout\` to read session via \`router\_route\_auth\_login\` checkSession query and hydrate client state - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for session persistence in \`tests/auth/session.spec.ts\` covering reloads and logout - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add session persistence docs in \`docs/auth/session.md\` and PR checklist in \`PR\_TEMPLATE.md\` - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Manager Login: (48 hours)**
    
    *   DB: Create users table migration in \`prisma/migrations/20251104\_create\_users\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create sessions table migration in \`prisma/migrations/20251104\_create\_sessions\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create user\_roles table migration in \`prisma/migrations/20251104\_create\_user\_roles\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement login() in \`apps/api/services/auth/AuthService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add /auth/login route in \`apps/api/routes/auth/login.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add session middleware in \`apps/api/middleware/session.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LoginForm component in \`components/auth/LoginForm.tsx\` and connect to \`route\_auth\_login\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create /auth/login page in \`pages/auth/login.tsx\` using \`components/auth/LoginForm.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Security: Enforce manager role check in \`apps/api/services/auth/AuthService.ts\` (verify \`table\_user\_roles\`) (4 hours)\[FE\]\[BE\]
        
    *   Seed: Add manager user seed in \`prisma/seed.ts\` referencing \`table\_users\` and \`table\_user\_roles\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test in \`tests/auth/managerLogin.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document login flow and routes in \`docs/auth/manager-login.md\` (4 hours)\[FE\]\[BE\]
        
*   **Farm Selector: (52 hours)**
    
    *   DB: Add 'farms' table migration in \`prisma/migrations/20251104\_add\_farms\_table/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add 'user\_farms' join table migration in \`prisma/migrations/20251104\_add\_user\_farms\_table/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement getFarms() in \`apps/api/services/farm/FarmService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement assignUserToFarm(userId, farmId) in \`apps/api/services/farm/FarmService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add /api/farms router and handlers in \`apps/api/routes/farms.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build FarmSelector component in \`components/auth/FarmSelector.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate FarmSelector into \`app/auth/layout.tsx\` (route\_auth\_layout) and \`app/auth/login/page.tsx\` (route\_auth\_login) flows (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook useFarms in \`hooks/useFarms.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Auth: Update AuthService to persist selected farm in \`apps/api/services/auth/AuthService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create prisma seed script to add sample farms in \`prisma/seed.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for /api/farms in \`apps/api/tests/farms.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend test for FarmSelector in \`apps/web/components/\_\_tests\_\_/FarmSelector.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document Farm Selector usage in \`docs/features/farm-selector.md\` (4 hours)\[FE\]\[BE\]
        
*   **Role Consent: (32 hours)**
    
    *   DB: Add role consent fields and migration in \`prisma/migrations/\` to update \`table\_user\_roles\` and \`table\_roles\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add getRoles() and consentRole(userId, roleId) in \`apps/api/services/auth/AuthService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create route handler \`apps/api/routes/auth/roleConsent.ts\` to expose consent endpoints (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build RoleConsent component in \`components/auth/RoleConsent.tsx\` and UI styles in \`styles/RoleConsent.module.css\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate RoleConsent into \`pages/auth/register.tsx\` (route\_auth\_register) and \`pages/auth/layout.tsx\` (route\_auth\_layout) (4 hours)\[FE\]\[BE\]
        
    *   DB: Create Prisma seed script \`prisma/seed/rolesSeed.ts\` to populate \`table\_roles\` with consentable roles (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`tests/roleConsent.test.ts\` covering API and UI flows (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write role consent docs in \`docs/role-consent.md\` and update API spec in \`docs/api.md\` (4 hours)\[FE\]\[BE\]
        
*   **Manager Threshold Config:** As a: admin, I want to: configure threshold values for manager alerts, so that: I can tune alerts to operational needs**(32 hours)** - Admin can set threshold values per metric Validation prevents invalid thresholds (e.g., min > max) Thresholds persist across sessions Alerts trigger when thresholds breached in test data
    
    *   DB: Create thresholds table migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchThresholds and getManagerThresholds in \`apps/api/routes/landing/router.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold, updateThreshold, bulkUpdateThresholds in \`apps/api/routes/landing/mutations.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ManagerThresholdConfig component in \`components/landing/ManagerThresholdConfig.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Add route integration at \`/landing\` in \`pages/landing.tsx\` to include \`components/landing/ManagerThresholdConfig.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Validation: Add threshold validation (min<=max) in \`components/landing/ManagerThresholdConfig.tsx\` and \`apps/api/routes/landing/validators.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   Persistence: Implement Prisma model and repository methods in \`apps/api/prisma/thresholds.ts\` to persist thresholds to \`table\_thresholds\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for alerts trigger using test data in \`tests/landing/thresholds.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Forage Photo & Heatmap:** As a: operations analyst, I want to: display forage photos with a heatmap overlay, so that: I can identify hotspots and capture visual context on the landing page**(32 hours)** - Photos load with correct aspect ratio Heatmap overlays align with forage locations Clicking a photo shows metadata panel Data refresh updates heatmap without full page reload
    
    *   Frontend: Build ForageGallery component in \`components/landing/ForageGallery.tsx\` to display photos with correct aspect ratio (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add HeatmapOverlay component in \`components/landing/HeatmapOverlay.tsx\` and integrate on /landing via \`route\_landing\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchForageImages() in \`apps/api/routes/landing.ts\` to return images from \`table\_forage\_photos\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchHeatmapLayer() in \`apps/api/routes/landing.ts\` and endpoint for \`router\_route\_landing\` to provide heatmap points (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement ImageMetadataPanel in \`components/landing/ImageMetadataPanel.tsx\` and modal open on photo click in \`components/landing/ForageGallery.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Add onHeatmapUpdate subscription handler in \`apps/api/routes/landing.ts\` and client socket in \`components/landing/HeatmapOverlay.tsx\` using Socket.io (4 hours)\[FE\]\[BE\]
        
    *   Data: Add SQL migration to populate \`table\_forage\_photos\` and update Prisma model in \`prisma/schema.prisma\` and migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/landing.test.ts\` and frontend tests in \`components/landing/\_\_tests\_\_/ForageGallery.test.tsx\` for acceptance criteria (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **GMD Silhouette View: (0 hours)**
    
*   **Forage Photo & Heatmap: (0 hours)**
    
*   **Color Legend & Short Text: (0 hours)**
    
*   **Manager Threshold Config: (0 hours)**
    
*   **Toggle Technical Metrics: (28 hours)**
    
    *   Frontend: Add TechnicalMetricsToggle component in \`components/landing/TechnicalMetricsToggle.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate toggle into \`/landing\` page in \`pages/landing.tsx\` to show/hide metrics (4 hours)\[FE\]\[BE\]
        
    *   API: Create PATCH /api/metrics/toggle handler in \`apps/api/routes/metrics.ts\` to persist preference (4 hours)\[FE\]\[BE\]
        
    *   DB: Add user\_preferences migration in \`prisma/migrations/\` with technical\_metrics boolean referencing \`table\_users\` (4 hours)\[FE\]\[BE\]
        
    *   Backend: Implement savePreference() in \`apps/api/services/preferences/PreferencesService.ts\` to update \`table\_users\` or \`user\_preferences\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Persist toggle via React Query mutation in \`hooks/useTechnicalMetrics.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for \`components/landing/TechnicalMetricsToggle.test.tsx\` and API tests for \`apps/api/routes/metrics.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Accessibility Icons: (28 hours)**
    
    *   Frontend: Add AccessibilityIcon component in \`components/icons/AccessibilityIcon.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate AccessibilityIcon into \`/landing\` route in \`pages/landing.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add accessible button wrapper in \`components/ui/IconButton.tsx\` for AccessibilityIcon (4 hours)\[FE\]\[BE\]
        
    *   Styling: Add Tailwind classes and utilities in \`styles/globals.css\` and \`tailwind.config.js\` for icon sizing and contrast (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Feature: Implement accessibility toggle state in \`hooks/useAccessibility.ts\` and persist to \`utils/storage.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add a11y tests for icons in \`tests/accessibility/landingIcons.test.tsx\` using axe-core (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Document icon usage and a11y guidelines in \`docs/landing/accessibility-icons.md\` (4 hours)\[FE\]\[BE\]
        
*   **GMD Silhouette View:** As a: data analyst, I want to: visualize the silhouette of growth, so that: I can quickly assess distribution without revealing individual identities**(36 hours)** - User can toggle silhouette visibility on landing page Silhouette renders within designated container without layout shift Silhouette data reflects current dataset and updates on data refresh Performance: silhouette render time < 200ms for typical dataset
    
    *   Frontend: Add silhouette toggle UI in \`components/landing/LandingVisuals/SilhouetteToggle.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Render silhouette container in \`components/landing/LandingVisuals/SilhouetteView.tsx\` (no layout shift) -> integrate in \`route\_landing\` via \`comp\_landing\_visuals\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchSilhouetteSVG query in \`apps/api/routes/landing/silhouette.ts\` to return SVG and metadata (4 hours)\[FE\]\[BE\]
        
    *   Backend: Create silhouette refresh mutation requestSilhouetteRefresh in \`apps/api/routes/landing/refresh.ts\` and subscription onSilhouetteUpdate in \`apps/api/routes/landing/subscriptions.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add gmd\_silhouettes migration in \`prisma/migrations/\` and seed in \`prisma/seed.ts\` using table \`table\_gmd\_silhouettes\` (4 hours)\[FE\]\[BE\]
        
    *   Performance: Implement canvas-based render in \`components/landing/LandingVisuals/SilhouetteRenderer.tsx\` to ensure <200ms render (4 hours)\[FE\]\[BE\]
        
    *   Data-binding: Wire React Query hook in \`hooks/useSilhouette.ts\` calling \`router\_route\_landing.fetchSilhouetteSVG\` and updating \`components/landing/LandingVisuals/SilhouetteView.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit + integration tests in \`tests/landing/silhouette.test.ts\` for toggle, render timing, and update on data refresh (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document feature and API in \`docs/landing/silhouette.md\` and update \`comp\_landing\_visuals\` README (4 hours)\[FE\]\[BE\]
        
*   **Color Legend & Short Text:** As a: product manager, I want to: present a color legend and concise explanatory text, so that: users understand visualization semantics at a glance**(24 hours)** - Legend entries correspond to color mappings Text explains color semantics clearly Legend is responsive and accessible (keyboard focus, alt text) Legend updates when color scale changes
    
    *   Frontend: Build ColorLegend component in \`components/landing/ColorLegend.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add ShortText block in \`components/landing/LegendShortText.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchLegend and fetchLegendText in \`apps/api/routers/landing.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add seed/migration for \`color\_legends\` in \`prisma/migrations/\` and update \`prisma/seed.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Integration: Wire Legend updates via subscription onLegendUpdate in \`apps/api/routers/landing.ts\` and \`components/landing/ColorLegend.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   QA: Accessibility & responsiveness tests in \`tests/landing/colorLegend.test.tsx\` (keyboard focus, aria, alt text) (4 hours)\[FE\]\[BE\]\[QA\]
        

### **Milestone 3: API contracts and Supabase schema: API contracts, schemas, tables, DDL, RLS rules**

_Estimated 139.5 hours_

*   **Return Technical Response:** As a: support engineer, I want to: return a structured technical response for API contracts ingestion/annotation, So that: downstream systems and clients receive precise contract details and validation results in a consistent format**(8 hours)** - The system returns a structured technical response containing contract IDs, status, and timestamps Response adheres to the predefined contract schema version The response includes validation errors if any with clear messages The response is delivered within 2000ms under normal load The response is logged for auditing with trace identifiers
    
    *   API: Add /contracts/response route handler in \`apps/api/routes/contracts/response.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement response formatter in \`apps/api/services/contracts/ResponseService.ts\` to return contract IDs, status, timestamps - (M) (1 hours)\[FE\]\[BE\]
        
    *   Schema: Define contract response schema v1 in \`apps/api/schemas/contractResponse.v1.ts\` and export types - (M) (1 hours)\[FE\]\[BE\]
        
    *   Validation: Implement runtime validator in \`apps/api/services/contracts/ContractValidator.ts\` to emit validation errors with messages - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Logging: Add audit logging with trace IDs in \`apps/api/services/logging/AuditLogger.ts\` and integrate into response flow - (M) (1 hours)\[FE\]\[BE\]
        
    *   Perf: Add integration test measuring response time <2000ms in \`apps/api/tests/integration/contractsResponse.test.ts\` using fixtures and Upstash/Redis mocks - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Ensure contract IDs mapping and add indexes in \`prisma/migrations/\` migration file referencing table\_users for ownership - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Document response schema and examples in \`docs/api/contracts/response.md\` and update OpenAPI spec in \`apps/api/openapi.yaml\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Include public photo\_url + optional signed\_photo\_url in schemas and examples:** As a: API consumer, I want to: See public photo\_url and optional signed\_photo\_url in all relevant schemas and provide examples, So that: Clients can access public image URLs while securely handling signed access.**(11 hours)** - Schema for endpoints including photo\_url as a public field is present and validated Optional signed\_photo\_url field is included with proper nullability and access control Examples demonstrate presence and usage of photo\_url and signed\_photo\_url across at least two endpoints Response examples do not expose signed URLs without authorization Validation ensures photo\_url is a valid URL and signed\_photo\_url, when present, is a valid signed URL
    
    *   API: Add photo\_url and optional signed\_photo\_url to TypeScript schemas in \`apps/api/schemas/imageSchemas.ts\` (api\_development) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update OpenAPI docs in \`docs/openapi.yaml\` with photo\_url (required) and signed\_photo\_url (nullable, protected) and examples (documentation) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Validate photo\_url as URL and signed\_photo\_url as signed URL in \`apps/api/routes/images/validators.ts\` (api\_development, testing) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Modify GET /images/:id handler in \`apps/api/routes/images/getImage.ts\` to include public photo\_url and conditionally include signed\_photo\_url when authorized (api\_development) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Modify POST /images handler in \`apps/api/routes/images/postImage.ts\` to return photo\_url and optionally signed\_photo\_url in response examples (api\_development) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Implement signed URL generation and verification in \`apps/api/services/storage/S3Service.ts\` and reference AWS S3 (infrastructure) - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Auth: Add access control check in \`apps/api/middleware/auth.ts\` to gate signed\_photo\_url inclusion (api\_development) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update example response usage in \`apps/web/components/ImageCard.tsx\` to display photo\_url and request signed\_photo\_url when user authorized (frontend\_component) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for schema validation in \`apps/api/tests/imageSchemas.test.ts\` (testing) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add integration tests for GET/POST images in \`apps/api/tests/images.integration.test.ts\` ensuring signed\_photo\_url not exposed to unauthorized users (testing) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update examples in \`README.md\` and \`docs/openapi.yaml\` demonstrating both endpoints with photo\_url and signed\_photo\_url usage (documentation) - (M) (1 hours)\[FE\]\[BE\]
        
*   **Provide JSON Schema + filled examples for all endpoints:** As a: API consumer, I want to: Have complete JSON Schema definitions and filled examples for all endpoints, So that: I can validate requests and responses against the contract easily.**(6.5 hours)** - JSON Schema generated for all endpoints Filled request/response examples for all endpoints Schemas and examples validated against a schema validation tool No missing required fields in the schemas Examples include typical and edge-case payloads
    
    *   API Contract Discovery: Scan apps/api/routes/ to enumerate endpoints and document in apps/api/docs/endpoints-list.md. Preserve route naming conventions, HTTP methods, and parameter locations. Output should map each endpoint to its method, path, auth requirements, and expected media types, ready for schema derivation. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Schema Creation: For each endpoint discovered in 8\_1, create JSON Schema files in apps/api/schemas/requests/ describing input shapes, validations, and required properties; include examples of valid payloads. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Response Schema Creation: For each endpoint, add JSON Schema files in apps/api/schemas/responses/ detailing status fields, data payloads, error structures; ensure consistency with request schemas and OpenAPI references. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Typical Examples: Populate apps/api/examples/typical/ with filled request/response examples for each endpoint, aligned to the created request/response schemas. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Edge-Case Examples: Add edge-case payloads in apps/api/examples/edge-cases/ covering validation errors, auth failures, rate limits, and unusual inputs. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   OpenAPI Integration: Update apps/api/docs/openapi.yaml to reference apps/api/schemas/\* for requests and responses; ensure components.schemas include all newly added definitions and that paths reference correct schemas. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Schema Validation Tests: Implement apps/api/tests/schemaValidation.test.ts using AJV to validate generated examples against corresponding schemas. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   CI Workflow: Create .github/workflows/validate-schemas.yml to run schema tests on PRs and main; ensure CI install of dependencies and caching. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Create apps/api/docs/api-schemas.md with links to schemas and examples; provide usage notes and structure. - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Return Layman Response: (24 hours)**
    
    *   API: Add /layman-response route in \`apps/api/routes/laymanResponse.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement formatLaymanResponse(prompt, aiResult) in \`apps/api/services/response/ResponseService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Wire route to service in \`apps/api/routes/index.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Integration: Create integration test in \`apps/api/tests/laymanResponse.int.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Unit: Add unit tests for formatLaymanResponse in \`apps/api/services/response/ResponseService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add API contract doc in \`docs/api/layman-response.md\` (4 hours)\[FE\]\[BE\]
        
*   **RLS: farm manager access: (28 hours)**
    
    *   DB: Create farms and farm\_managers tables migration in \`prisma/migrations/20251104\_add\_farms\_and\_farm\_managers\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policies for farm\_managers in \`supabase/policies/farm\_managers.sql\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement getFarmManagers() in \`apps/api/services/farm/FarmService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add middleware to enforce manager scope in \`apps/api/middleware/rls.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build FarmManagersList component in \`apps/web/components/farm/FarmManagersList.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for RLS in \`apps/api/tests/farm/rls.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document RLS setup and migration in \`docs/security/rls\_farm\_manager.md\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **RLS: read-only analysts: (32 hours)**
    
    *   DB: Add 'analyst' role and RLS policies migration in \`prisma/migrations/20251104\_add\_analyst\_role\_and\_rls/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create SQL policy file for Supabase in \`db/policies/rls\_analyst.sql\` to enforce read-only on metrics, thresholds, annotations, versions (4 hours)\[FE\]\[BE\]
        
    *   API: Implement isAnalyst(user) in \`apps/api/services/auth/AuthService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add RLS enforcement middleware in \`apps/api/middleware/rls.ts\` to map analyst role to read-only DB role (4 hours)\[FE\]\[BE\]
        
    *   API: Update data access methods in \`apps/api/services/metrics/MetricService.ts\` to prevent write operations for analysts (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Show ReadOnlyBanner in \`apps/web/components/analytics/ReadOnlyBanner.tsx\` when user is analyst (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`apps/api/tests/rls.test.ts\` verifying analysts can read but not write (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add role docs in \`docs/roles.md\` describing analyst read-only privileges and RLS setup (4 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Read access:** As a: manager, I want to: read data governed by farm-scoped RLS rules, So that: farm-level access is enforced without exposing write capabilities**(9 hours)** - System allows read access for farm-scoped users with manager role Unauthorized users cannot read restricted data Audit log records read attempts by users in manager role
    
    *   DB: Add farm\_id and RLS policy for manager read in \`prisma/migrations/20251104\_add\_farm\_rls.sql\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add threshold\_audit\_logs table migration in \`prisma/migrations/20251104\_create\_threshold\_audit\_logs.sql\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement getThresholdsForFarm(farmId) in \`apps/api/services/thresholds/ThresholdsService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /api/farms/\[id - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add auth middleware check manager role in \`apps/api/middleware/auth.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement recordReadAttempt(userId,farmId,result) in \`apps/api/services/audit/ThresholdAuditService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build thresholds page in \`apps/web/pages/farms/\[id - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add API integration tests in \`apps/api/tests/thresholds.test.ts\` for manager allowed and unauthorized denied - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add audit log tests in \`apps/api/tests/thresholds.test.ts\` to verify entries in \`table\_threshold\_audit\_logs\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Write access:** As a: manager, I want to: write data within farm-scoped rules, So that: data integrity is maintained while enforcing scope**(7.5 hours)** - System permits writes only when user role is manager and within farm scope Writes are rejected for non-manager or out-of-scope users Audit log records write operations with success/failure details
    
    *   DB: Create threshold\_audit\_logs migration in prisma/migrations/ to record write operations - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policy and farm\_scope column migration for table\_thresholds in prisma/migrations/ to enforce farm scoping - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement write authorization middleware in apps/api/middleware/authorization.ts to allow only managers within farm scope - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update thresholds write endpoint in apps/api/routes/thresholds.ts to use middleware and log outcomes to apps/api/services/audit/AuditService.ts - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement AuditService.recordWrite() in apps/api/services/audit/AuditService.ts to insert into prisma/migrations/ generated model for threshold\_audit\_logs - (M) (1 hours)\[FE\]\[BE\]
        
    *   Supabase: Add/verify RLS policies in Supabase console for table\_thresholds referencing role and farm scope (document in docs/supabase/rls.md) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Gate write UI in components/thresholds/ThresholdEditor.tsx to hide/disable for non-managers or out-of-scope users - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Fetch user role and farm scope in hooks/useCurrentUser.ts from services/auth/AuthService.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in tests/integration/thresholds.test.ts for manager in-scope write, non-manager rejection, and audit log entries - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document write access behavior and audit logging in docs/security/write-access.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Admin override:** As a: admin, I want to: override RLS rules under controlled conditions, So that: admins can perform emergency data access while maintaining audit trails**(7.5 hours)** - Admin override is allowed only via approved workflow Override actions are recorded in audit logs with reason and timestamp Access is limited to specified tables and operations
    
    *   DB migration to extend table\_threshold\_audit\_logs with admin\_override\_reason and admin\_override\_by; update prisma schema and generate migration files in prisma/migrations; ensure existing table\_threshold\_audit\_logs schema changes are compatible with ORMs and database constraints - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement approveOverride() workflow in apps/api/services/override/OverrideService.ts to apply admin overrides, validate permissions, update audit logs, and trigger related events - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add POST /overrides route handler in apps/api/routes/overrides.ts to initiate override request, including input validation and delegation to OverrideService - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add POST /overrides/:id/approve in apps/api/routes/overrides.ts to perform approved override using apps/api/services/override/OverrideService.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Create trigger/function to insert audit record into table\_threshold\_audit\_logs in prisma/migrations/ - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Enforce table/operation restrictions in apps/api/middleware/authorization.ts for override endpoints - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AdminOverrideRequestForm component in apps/web/components/overrides/AdminOverrideRequestForm.tsx to submit override requests - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AdminOverrideApprovalPanel in apps/web/components/overrides/AdminOverrideApprovalPanel.tsx for approvers to approve with reason - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for override workflow in apps/api/tests/override.test.ts covering approved-only path and audit log entries - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Document override workflow and audit fields in docs/overrides.md and update README.md - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Tests & audits:** As a: auditor, I want to: run tests and audits of RLS rules, So that: we can verify policy compliance and detect deviations**(6 hours)** - Automated tests validate all RLS policies for read/write Audits produce reports showing policy coverage and violations Tests pass in CI with no policy violations
    
    *   DB: Create RLS policy migrations in prisma/migrations/ for table\_thresholds and table\_threshold\_audit\_logs with policy definitions, enabling row-level security on both tables for test scenarios. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add policy enforcement hooks in apps/api/services/auth/AuthService.ts to log RLS-related context for tests, ensuring hooks surface policy decisions and user context to test suite. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Write read/write RLS tests in tests/rls/thresholds.test.ts targeting table\_thresholds to verify correct row access under different user roles and policy rules. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Write audit log verification tests in tests/rls/audit\_logs.test.ts targeting table\_threshold\_audit\_logs to ensure audit entries reflect policy decisions and RLS effects. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Script: Build audit report generator scripts/audit/generateReport.ts to scan test outputs and DB for RLS violations, producing a concise report. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   CI: Add workflow .github/workflows/rls-tests.yml to run RLS tests and fail on violations, integrating with existing CI pipelines. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add DB seed and teardown scripts in scripts/db/seed\_rls.ts and scripts/db/teardown.ts for CI, ensuring deterministic test DB state. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        

### **Milestone 4: Thresholds: storage, preview, API, versioning, seed scripts and persist/versioning triggers**

_Estimated 331.5 hours_

*   **Thresholds CRUD: (42 hours)**
    
    *   DB: Create thresholds table migration in \`prisma/migrations/\` (cite: table\_users) (4 hours)\[FE\]\[BE\]
        
    *   DB: Add Threshold model in \`prisma/schema.prisma\` and generate client in \`prisma/client.ts\` (cite: table\_users) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold() in \`apps/api/services/thresholds/ThresholdService.ts\` (api\_development) (cite: table\_users) (4 hours)\[FE\]\[BE\]
        
    *   API: Add routes in \`apps/api/routes/thresholds.ts\` with CRUD endpoints (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdList component in \`components/thresholds/ThresholdList.tsx\` (frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdForm in \`components/thresholds/ThresholdForm.tsx\` (frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement get/update/delete methods in \`apps/api/services/thresholds/ThresholdService.ts\` (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add pages/route \`pages/farms/\[id (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for \`apps/api/services/thresholds/ThresholdService.spec.ts\` (testing) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add integration tests for \`apps/api/routes/thresholds.test.ts\` (testing) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Update API docs in \`docs/thresholds.md\` and frontend README \`components/thresholds/README.md\` (documentation) (4 hours)\[FE\]\[BE\]
        
*   **Thresholds Preview: (34 hours)**
    
    *   DB: Add thresholds columns & migration in \`prisma/migrations/\` - create table reference for thresholds by farm (4 hours)\[FE\]\[BE\]
        
    *   API: Implement getThresholdsByFarm(farmId) in \`apps/api/services/thresholds/ThresholdsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add route GET /api/farms/\[id (2 hours)\[FE\]\[BE\]
        
    *   Cache: Add Redis caching in \`apps/api/services/thresholds/ThresholdsService.ts\` (cache key \`farm:thresholds:{id}\`) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPreview component in \`apps/web/components/thresholds/ThresholdsPreview.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add data fetching hook useThresholds in \`apps/web/hooks/useThresholds.ts\` using React Query to call \`/api/farms/{id}/thresholds\` (4 hours)\[FE\]\[BE\]
        
    *   UI: Add page integration at \`apps/web/app/farms/\[id (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add unit tests for \`apps/api/services/thresholds/ThresholdsService.test.ts\` and \`apps/web/components/thresholds/ThresholdsPreview.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README in \`apps/api/services/thresholds/README.md\` and \`apps/web/components/thresholds/README.md\` (4 hours)\[FE\]\[BE\]
        
*   **Thresholds Versioning: (32 hours)**
    
    *   DB: Add table 'threshold\_versions' migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Update \`prisma/schema.prisma\` add model ThresholdVersion in \`prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement versioning endpoints in \`apps/api/routes/thresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement createVersion()/listVersions() in \`apps/api/services/thresholds/ThresholdsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsVersionList component in \`components/thresholds/ThresholdsVersionList.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook useThresholdsVersions in \`hooks/useThresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`apps/api/tests/thresholds.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add feature docs in \`docs/thresholds\_versioning.md\` (4 hours)\[FE\]\[BE\]
        
*   **Farm Defaults: (34 hours)**
    
    *   DB: Add farm\_defaults table migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add FarmDefault model in \`prisma/schema.prisma\` and generate client (4 hours)\[FE\]\[BE\]
        
    *   API: Implement CRUD routes in \`apps/api/routes/thresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement ThresholdService methods in \`apps/api/services/thresholds/ThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add caching in \`apps/api/services/cache/CacheService.ts\` for farm defaults using Redis (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build FarmDefaultsForm component in \`apps/web/components/thresholds/FarmDefaultsForm.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create page \`apps/web/pages/farms/\[id (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/thresholds.test.ts\` for CRUD and cache (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document API and frontend usage in \`docs/thresholds.md\` (4 hours)\[FE\]\[BE\]
        
*   **Permissions: (44 hours)**
    
    *   DB: Create roles and permissions tables migration in \`prisma/migrations/20251104\_create\_roles\_permissions/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add farm\_id and owner fields to thresholds migration in \`prisma/migrations/20251104\_update\_thresholds/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement PermissionsService in \`apps/api/services/permissions/PermissionsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add authorization middleware to \`apps/api/middleware/auth.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create permissions routes in \`apps/api/routes/permissions.ts\` for checking and assigning roles (4 hours)\[FE\]\[BE\]
        
    *   API: Protect thresholds routes in \`apps/api/routes/thresholds.ts\` to enforce permissions (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPermissions component in \`apps/web/components/thresholds/ThresholdsPermissions.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate route guard in \`apps/web/pages/thresholds/\[farmId (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add API tests in \`apps/api/tests/permissions.test.ts\` covering role checks (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests in \`apps/web/tests/ThresholdsPermissions.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document permissions model and API in \`docs/permissions.md\` (4 hours)\[FE\]\[BE\]
        
*   **Thresholds Update: (36 hours)**
    
    *   DB: Create threshold\_versions migration in \`prisma/migrations/\` to add fields for versioning and active flag (4 hours)\[FE\]\[BE\]
        
    *   API: Implement GET /thresholds/preview in \`apps/api/routes/thresholds/preview.ts\` to fetch preview from \`table\_preview\_sessions\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement PUT /thresholds/update in \`apps/api/routes/thresholds/update.ts\` to store new thresholds in \`table\_threshold\_versions\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Add threshold service methods in \`apps/api/services/thresholds/ThresholdService.ts\` with preview() and update()\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPreview component in \`components/thresholds/ThresholdsPreview.tsx\` to call /thresholds/preview and display \`table\_preview\_sessions\` data (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsEditor component in \`components/thresholds/ThresholdsEditor.tsx\` with form to PUT to /thresholds/update and show version list from \`table\_threshold\_versions\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create seed script in \`prisma/seed/seedThresholds.ts\` to add sample entries into \`table\_threshold\_versions\` and \`table\_preview\_sessions\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/thresholds.test.ts\` for preview and update endpoints referencing \`table\_threshold\_versions\` and \`table\_preview\_sessions\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README section in \`docs/thresholds.md\` describing API routes and DB tables (\`table\_threshold\_versions\`, \`table\_preview\_sessions\`) (4 hours)\[FE\]\[BE\]
        
*   **Thresholds RBAC: (40 hours)**
    
    *   DB: Create threshold\_roles & threshold\_permissions tables migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add foreign keys linking \`threshold\_versions\` to threshold\_roles in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement RBAC middleware in \`apps/api/middleware/rbac.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add preview/update RBAC checks to \`apps/api/routes/thresholds/preview.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add preview/update RBAC checks to \`apps/api/routes/thresholds/update.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement role-check functions in \`apps/api/services/thresholds/ThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add permission-aware preview component in \`components/thresholds/ThresholdPreview.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Disable update UI based on RBAC in \`components/thresholds/ThresholdEditForm.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for RBAC on preview/update in \`apps/api/tests/thresholds/rbac.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document RBAC model and endpoints in \`docs/thresholds/rbac.md\` (4 hours)\[FE\]\[BE\]
        
*   **Save Preview:** As a: manager, I want to: save the current preview configuration, So that: I can reuse or share the configured thresholds later**(9.5 hours)** - Saved configuration persists per user Saved previews appear in user’s saved list Retrieving a saved preview restores UI state accurately Duplicate save with same name prompts user to rename
    
    *   DB: Create migration for saved\_previews table in prisma/migrations/ with fields: id, userId, name, config, createdAt; ensure proper types and constraints (id as UUID, userId foreign key, unique index on (userId, name) to prevent duplicates per user). - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Add SavedPreview model in prisma/schema.prisma and run generate client; align with 3.1 table and include createdAt default now; ensure type-safe Prisma client usage. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Create saved previews router in apps/api/routes/savedPreviews.ts with CRUD endpoints (list, get, create, delete); wire to Prisma client and ensure auth middleware provides userId. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement savePreview(userId, data) in apps/api/services/savedPreviews/SavedPreviewService.ts to persist a new preview; enforce per-user unique name constraint and return created object. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add GET /saved-previews in apps/api/routes/savedPreviews.ts to list user's previews; implement pagination/limit default; ensure only current user's previews are returned. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add POST /saved-previews in apps/api/routes/savedPreviews.ts with duplicate-name check; return 400 if name exists for user; integrate savePreview service. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Create SavePreviewModal component in components/thresholds/SavePreviewModal.tsx to input name and config, with submit invoking POST /saved-previews. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Create SavedPreviewsList component in components/thresholds/SavedPreviewsList.tsx to render user's previews from API and allow selection to restore. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook useSavedPreviews in hooks/useSavedPreviews.ts to call GET /saved-previews and provide data to SavedPreviewsList. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook useSavePreview in hooks/useSavePreview.ts to call POST /saved-previews and handle duplicate response - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate Save button in apps/web/app/thresholds/PreviewPage.tsx to open SavePreviewModal.tsx - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Restore UI state from preview in apps/web/app/thresholds/PreviewPage.tsx when selecting an item from SavedPreviewsList.tsx - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Auth: Ensure endpoints use Clerk auth middleware in apps/api/middleware/auth.ts to attach userId - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for saved previews API in apps/api/tests/savedPreviews.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests for SavePreviewModal in apps/web/tests/SavePreviewModal.test.tsx - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Revert:** As a: manager, I want to: revert changes to thresholds to a previous state, So that: I can undo mistakes**(9 hours)** - Revert restores last saved state No data loss beyond undo scope Revert action is undoable within session Audit log records revert events
    
    *   DB: Create audit\_logs table migration in \`prisma/migrations/20251104\_create\_audit\_logs/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add revert endpoint POST /api/thresholds/revert in \`apps/api/pages/api/thresholds/revert.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement revertThresholdState(userId, flowId) in \`apps/api/services/thresholds/ThresholdService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add last\_saved\_state column and migration for thresholds in \`prisma/migrations/20251104\_add\_last\_saved\_state/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Revert button and undo toast in \`apps/web/components/thresholds/PreviewControls.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate revert mutation with React Query in \`apps/web/hooks/useRevertThreshold.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Record audit log entry in \`apps/api/services/audit/AuditService.ts\` on revert events - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement in-session undo by caching pre-revert state in \`apps/web/utils/revertCache.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit/integration tests for revert flow in \`apps/api/tests/revert.test.ts\` and \`apps/web/tests/revert-ui.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Preview Impact:** As a: manager, I want to: preview thresholds impact on outputs, So that: I can assess decisions before applying changes**(8 hours)** - Preview renders without errors for valid thresholds Preview results update in real-time with parameter changes Preview handles edge cases with extreme threshold values System logs preview events for auditing
    
    *   DB: Create previews table migration in \`prisma/migrations/20251104\_create\_previews\_table/\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement generatePreview() in \`apps/api/services/preview/PreviewService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /api/preview route in \`apps/api/routes/preview.ts\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PreviewPanel component in \`apps/web/components/preview/PreviewPanel.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add preview page in \`apps/web/pages/thresholds/preview.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Realtime: Setup Socket.io server in \`apps/api/socket.ts\` and client in \`apps/web/services/socket.ts\` - (L) (2 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Logging: Implement preview event logging in \`apps/api/services/logging/LoggingService.ts\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Cache: Add Redis caching for preview results in \`apps/api/services/preview/PreviewCache.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests in \`apps/api/tests/preview.test.ts\` and \`apps/web/components/preview/PreviewPanel.test.tsx\` - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Preview Photo:** As a: manager, I want to: preview threshold-related photo or visual asset, So that: I can validate visual alignment with thresholds**(9.5 hours)** - Preview displays selected photo correctly Handles missing assets gracefully Supports zoom and pan on image Image loads within 2 seconds under typical conditions
    
    *   Frontend: Build PhotoPreview component in components/preview/PhotoPreview.tsx (supports zoom/pan, keyboard controls) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Create PreviewPlaceholder in components/preview/PreviewPlaceholder.tsx (handles missing assets gracefully) - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add image optimization endpoint in apps/api/pages/api/image/optimize.ts (uses Sharp, ensures <2s load) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement image caching in apps/api/services/cache/ImageCache.ts (Redis/Upstash integration) - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate React Query hook in hooks/usePhotoPreview.ts to fetch optimized image and handle loading state - (M) (1 hours)\[FE\]\[BE\]
        
    *   Performance: Add integration test in tests/e2e/photoPreview.spec.ts to assert image loads <2s - (XL) (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Preview Impact: (0 hours)**
    
*   **CI Deploy Hook:** As a: devops engineer, I want to: trigger and validate a CI deploy hook that runs on deploy to create v2025-11-01-01, So that: deployment processes produce expected seed script version artifacts.**(4.5 hours)** - CI hook executes on deploy and creates versioned artifacts Artifacts are stored in the designated artifact repository Hook reports success or failure with logs Seed script version file matches v2025-11-01-01
    
    *   INFRA: Add CI workflow in .github/workflows/ci-deploy-hook.yml to run on deploy and execute seed and build artifacts with integrated steps for triggering seed and packaging artifacts - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DEV: Implement seed script and version file in scripts/seeds/thresholds\_seed\_v2025-11-01-01.sql and scripts/seeds/VERSION preserving seed versioning and ensuring idempotent initialization - (M) (1 hours)\[FE\]\[BE\]
        
    *   DEV: Add Node deployment script in apps/api/scripts/deploy\_build.ts to package artifacts and output versioned artifact dist/artifact-v2025-11-01-01.tar.gz - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   INFRA: Implement artifact upload step in .github/workflows/ci-deploy-hook.yml calling scripts/upload\_artifact.sh to push to artifact repo (ensure repo URL in apps/api/config/artifact\_repo.env) - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   QUALITY: Add logging and reporting in apps/api/scripts/deploy\_build.ts to emit JSON logs to logs/ci\_deploy.log and post status in apps/api/scripts/report\_status.ts - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   QUALITY: Add CI verification step in .github/workflows/ci-deploy-hook.yml to run psql check ensuring scripts/seeds/VERSION equals v2025-11-01-01 and seed effects on table\_users if applicable - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Seed Data Verification:** As a: data engineer, I want to: verify that seed data for thresholds is correctly generated and loaded in the staging database, So that: the system's thresholding features can rely on accurate initial data.**(4.5 hours)** - Seed data is generated and stored in the expected staging location Seeded thresholds count matches predefined schema Verification script runs successfully without errors and reports mismatches Data integrity checks confirm no null or invalid threshold values
    
    *   DB: Add thresholds seed migration in prisma/migrations/20251101\_seed\_thresholds/seed.sql preserving Prisma context and using SQL INSERTs matching Prisma model thresholds - (M) (1 hours)\[FE\]\[BE\]
        
    *   Script: Implement seed generator in apps/api/scripts/seedThresholds.ts to store staging CSV in staging/thresholds/v2025-11-01-01/ using Node.ts and CSV parsing to generate seed records - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add verification endpoint in apps/api/routes/thresholds/verify.ts to run verification script invoking apps/api/scripts/verifySeedThresholds.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Script: Implement verification logic in apps/api/scripts/verifySeedThresholds.ts to check counts and nulls against Prisma models - (M) (1 hours)\[FE\]\[BE\]
        
    *   Test: Add integration tests in apps/api/tests/seedVerification.test.ts to assert seeded counts and integrity - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Doc: Add verification run docs in docs/thresholds/verification.md and CI step in .github/workflows/seed-verification.yml - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Create seed script:** As a: DevOps engineer, I want to: create a seed script that initializes thresholds data for the system, So that: the environment has baseline values for testing and production workflows**(5 hours)** - The seed script runs without errors and completes within 2 minutes The script creates all required threshold records with correct default values Duplicate seed runs do not corrupt existing data and are idempotent Seed data is verifiable via a lightweight query or log output
    
    *   DB: Create thresholds table migration in prisma/migrations/2025XXXX\_create\_thresholds/ preserving migration structure and generating initial schema for thresholds with id, value, and constraint fields; ensures Prisma migration runs under MVP seed setup - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Add Prisma model Threshold in prisma/schema.prisma and generate client; ensure model maps to thresholds table with fields and relations; trigger prisma generate - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement runSeedScript() in apps/api/routes/sql/seed.ts (router\_route\_sql\_seed) to trigger seed - (M) (1 hours)\[FE\]\[BE\]
        
    *   Script: Create seed script scripts/seedThresholds.ts that upserts thresholds into prisma/ client with idempotency and 2min timeout - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Run Seed button in apps/web/pages/sql/seed.tsx and integrate with comp\_sql\_seed\_runner to call router\_route\_sql\_seed.runSeedScript - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Logging: Add lightweight verification endpoint getSeedThresholds in apps/api/routes/sql/seed.ts and log to logs/seed.log - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test tests/seed/seed.spec.ts to verify idempotency and completion within 2 minutes - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document seed usage and verification in docs/seed.md and update /sql/seed route README (route\_sql\_seed) - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Seed thresholds v2025-11-01-01:** As a: DevOps engineer, I want to: seed thresholds using the v2025-11-01-01 package, So that: the environment reflects the exact baseline version for this release**(13 hours)** - The seeded version matches v2025-11-01-01 metadata All threshold records align with the version specification Migration path for future versions is validated Seed operation completes within expected time window
    
    *   DB: Implement migration script at prisma/migrations/20251101\_seed\_thresholds/ to seed thresholds data with version tag v2025-11-01-01, ensuring idempotency and rollback compatibility. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement runSeedScript mutation in apps/api/routers/seed/router\_route\_sql\_seed.ts to execute seed v2025-11-01-01 via the seed runner, handling auth, validation, and idempotent execution signals. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add getSeedScripts query in apps/api/routers/seed/router\_route\_sql\_seed.ts to list available seed scripts and ensure onSeedRunStatusChange subscription integration for real-time progress updates. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Service: Implement SeedRunner.ts in apps/api/services/seed to execute the seed script for thresholds, insert thresholds into the database, and persist version metadata v2025-11-01-01; emit status updates via subscription. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Seed Runner Panel in \`apps/web/components/sql/SeedRunnerPanel.tsx\` to trigger runSeedScript and show progress (4 hours)\[FE\]\[BE\]
        
    *   DB: Add validation migration and constraints in prisma/migrations/20251101\_constraints/ to enforce threshold schema (types, ranges, not-null constraints) and maintain backward compatibility for seed data. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Create integration tests in apps/api/tests/seed/seed\_v2025\_11\_01\_01.test.ts to verify records creation, timing metadata, and end-to-end seed run path. - (XL) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add seed documentation in docs/seeds/v2025-11-01-01.md describing metadata, rollback path, API surface, and usage guidelines. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Verify seed run:** As a: QA engineer, I want to: verify the seed run produced the expected thresholds data, So that: we ensure the environment is correctly seeded before tests or production runs**(7 hours)** - Thresholds table contains all expected records with correct values No missing or duplicate entries after seed Seed verification can be automated in CI Verification step logs provide clear pass/fail signals
    
    *   DB: Add thresholds verification SQL script in \`apps/api/db/seed/verify\_thresholds.sql\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchSeedRunDetails verification endpoint in \`apps/api/routes/sql/seedRoute.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add seed verification worker in \`apps/api/services/seed/SeedVerifier.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Enhance /sql/seed page logging in \`apps/web/pages/sql/seed.tsx\` and \`apps/web/components/SeedResults.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   CI: Add automated seed verification job in \`.github/workflows/seed-verify.yml\` running \`apps/api/db/seed/verify\_thresholds.sql\` and calling \`apps/api/routes/sql/seedRoute.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests in \`apps/api/tests/seed/verifySeed.test.ts\` to assert no duplicates and correct records - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Add verification docs in \`docs/seed/verify\_seed.md\` with expected table values and CI signals - (M) (1 hours)\[FE\]\[BE\]
        

### **Milestone 5: Annotation pipeline: normalize/evaluate, generator, cache/queue, Upstash and instant delta fast path**

_Estimated 471 hours_

*   **Normalize units & scales: (36 hours)**
    
    *   DB: Add normalized\_units column migration in \`prisma/migrations/\` (create migration file)\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement normalizeUnits() in \`apps/api/services/metrics/NormalizeService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add route /api/metrics/normalize in \`apps/api/routes/metrics.ts\` to call NormalizeService (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build NormalizeForm component in \`apps/web/components/metrics/NormalizeForm.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add utility normalizeScale() in \`apps/web/utils/units/normalize.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add validation middleware for units in \`apps/api/middleware/validateUnits.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Create unit tests for normalizeScale in \`apps/web/utils/units/\_\_tests\_\_/normalize.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Create API integration tests in \`apps/api/tests/metrics/normalize.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update normalization docs in \`docs/normalize.md\` with examples and accepted units (4 hours)\[FE\]\[BE\]
        
*   **Calculate derived metrics: (32 hours)**
    
    *   DB: Add derived\_metrics columns migration in \`prisma/migrations/20251104\_add\_derived\_metrics/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement calculateDerivedMetrics() in \`apps/api/services/metrics/MetricsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add /metrics/derived route in \`apps/api/routes/metrics.ts\` to call MetricsService.calculateDerivedMetrics (4 hours)\[FE\]\[BE\]
        
    *   DB: Add Prisma model changes in \`prisma/schema.prisma\` for derived metrics fields on relevant tables (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build DerivedMetricsPanel component in \`apps/web/components/metrics/DerivedMetricsPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Fetch derived metrics using React Query in \`apps/web/hooks/useDerivedMetrics.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for MetricsService.calculateDerivedMetrics in \`apps/api/services/metrics/\_\_tests\_\_/MetricsService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add docs for derived metrics in \`docs/metrics/derived\_metrics.md\` (4 hours)\[FE\]\[BE\]
        
*   **Validate & flag anomalies: (24 hours)**
    
    *   DB: Create anomaly\_flags migration in \`prisma/migrations/\` referencing table\_users (table\_users) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement computeAnomalies() in \`apps/api/services/validation/ValidationService.ts\` (validation\_service) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add /api/validation/flag endpoint in \`apps/api/routes/validation.ts\` (validation\_route) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build AnomalyFlags component in \`components/validation/AnomalyFlags.tsx\` (anomaly\_flags\_component) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add Redis caching config in \`apps/api/config/redis.ts\` (redis\_cache) (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Create unit tests in \`tests/validation/validation.test.ts\` (validation\_tests) (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Attach farm thresholds: (40 hours)**
    
    *   DB: Add farm\_thresholds table migration in \`prisma/migrations/20251104\_add\_farm\_thresholds/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Update \`prisma/schema.prisma\` with model FarmThreshold in \`prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold() in \`apps/api/services/farm/FarmThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add farm thresholds router in \`apps/api/routes/farm.ts\` with POST /api/farms/:farmId/thresholds (4 hours)\[FE\]\[BE\]
        
    *   API: Add validation middleware in \`apps/api/middleware/validation.ts\` for threshold payload (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build AttachThresholds component in \`components/flow\_normalize/AttachThresholds.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create React Query hook useAttachThresholds in \`apps/web/hooks/useAttachThresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route/page for normalize flow in \`pages/flow\_normalize/attach-thresholds.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add unit tests for FarmThresholdService in \`tests/unit/FarmThresholdService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add integration test for POST /api/farms/:farmId/thresholds in \`tests/integration/farmThresholds.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Persist normalized record: (28 hours)**
    
    *   DB: Create prisma migration for normalized\_records in \`prisma/migrations/\` and add model in \`prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Implement NormalizeRepository.saveNormalizedRecord in \`apps/api/services/normalize/NormalizeRepository.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add POST /api/normalize in \`apps/api/routes/normalize.ts\` to call NormalizeService (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement NormalizeService.normalizeAndPersist in \`apps/api/services/normalize/NormalizeService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add SaveNormalized button and call /api/normalize in \`components/normalize/NormalizeResult.tsx\` and \`pages/normalize.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Utils: Add validation utility in \`apps/api/utils/validation.ts\` to validate normalized payload (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Create integration tests in \`apps/api/tests/normalize.test.ts\` for persistence flow (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Provide Composition Metadata:** As a: content creator, I want to: Provide Composition Metadata, So that: I can attach structured metadata to generated annotations for downstream processing**(5.5 hours)** - The system accepts a payload containing composition metadata fields (e.g., author, timestamp, composition ID) with valid types Validation enforces required fields and formats (e.g., timestamp ISO 8601) On successful submission, metadata is stored with the annotation and retrievable System handles invalid or missing fields with clear error messages within 2000ms
    
    *   DB: Add composition metadata columns to prisma/migrations for table\_annotation\_metadata (author, composition\_id, timestamp). Ensure ALTER or new migration adds columns with correct types and default nullability, and wire into Prisma schema. Persist migration metadata table changes and ensure backward compatibility. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement POST /annotations/metadata handler in apps/api/routes/annotations/metadata.ts to accept composition metadata payload and route to service.saveMetadata with validation step. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add validation schema in apps/api/services/validation/AnnotationMetadataValidator.ts enforcing required fields and ISO8601 timestamp. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Implement saveMetadata() in apps/api/services/annotations/AnnotationService.ts to store metadata with annotation in table\_annotation\_metadata. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build CompositionMetadataForm component in components/annotations/CompositionMetadataForm.tsx to submit metadata to /annotations/metadata - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests in apps/api/tests/annotations/metadata.test.ts for valid/invalid payloads and <2000ms responses - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add API spec and error messages in docs/api/annotations.md and update README.md with metadata fields and formats - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Sync Annotation Cache:** As a: admin, I want to: sync the annotation cache across nodes/services, So that: cached annotations stay consistent and up-to-date**(11 hours)** - Manual trigger successfully synchronizes cache and reports success Background sync runs without user intervention and maintains consistency Cache version/timestamp updates upon successful sync Error scenarios: retryable failures are retried automatically up to N times Security: only authorized admin can trigger sync and audit log records the action
    
    *   DB: Add cache\_version and last\_synced\_at columns to \`table\_photo\_annotations\` in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add admin-only POST /admin/annotations/sync in \`apps/api/routes/admin/annotations.ts\` to trigger sync - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement syncAnnotationsCache() in \`apps/api/services/annotations/AnnotationSyncService.ts\` with Redis update and versioning - (M) (1 hours)\[FE\]\[BE\]
        
    *   Background: Add cron job in \`apps/api/services/scheduler/BackgroundScheduler.ts\` to call syncAnnotationsCache() - (M) (1 hours)\[FE\]\[BE\]
        
    *   Auth: Add admin check middleware in \`apps/api/middleware/auth.ts\` to secure /admin/annotations/sync - (M) (1 hours)\[FE\]\[BE\]
        
    *   Audit: Record sync action in \`apps/api/services/audit/AuditService.ts\` and \`table\_annotation\_metadatas\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Retry: Implement exponential retry decorator in \`apps/api/lib/retry/RetryUtil.ts\` used by AnnotationSyncService.ts (max N retries) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Cache: Implement Redis key schema and TTL updates in \`apps/api/services/cache/CacheService.ts\` when syncing annotations - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add GET /admin/annotations/sync/status in \`apps/api/routes/admin/annotations.ts\` to report last sync and version - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`apps/api/tests/annotationSync.test.ts\` covering manual trigger, background run, retries, and auth - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README in \`apps/api/README.md\` with sync endpoint, cron schedule, and admin requirements - (M) (1 hours)\[FE\]\[BE\]
        
*   **Auth & Farm Scoping:** As a: farm operator, I want to: Auth with farm-scoped credentials and initialize a scoped farming context, So that: I can work with annotations securely within the correct farm context**(7 hours)** - Farm-scoped authentication succeeds and issues a short-lived token Token is validated for subsequent requests within the session Context initialization binds user actions to the correct farm namespace Error messages guide the user when farm context is missing or invalid Performance latency for auth and context init must be under 1500ms
    
    *   API/DB integration: Add farm\_id column to table\_sessions via prisma/migrations/20251101\_add\_farm\_to\_sessions to enable farm-scoped session association; update migrations graph and ensure backwards-compatible schema change. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement issueFarmScopedToken(userId,farmId) in AuthService to issue short-lived, farm-scoped JWT or opaque token binding user to a farm; align with existing token issuance flow. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add middleware verifyFarmContext in apps/api/middleware/auth.ts to bind farm namespace from token or context and enforce farm-scoped routing decisions. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement validateToken(sessionToken) in AuthService.ts with short-lived token logic and farm-scoped validation hooks integrated with issueFarmScopedToken. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Create routes POST /auth/farm-login in routes/auth.ts to issue farm-scoped token via issueFarmScopedToken, wiring to appropriate controller/service and validation. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build FarmLoginForm component in web frontend to select farm and authenticate, wiring to /auth/farm-login and handling farm-scoped token storage. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add context initialization in ContextService.ts to bind user actions to farm; ensure per-farm action attribution in auditing/logging. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in farmAuth.test.ts for token issuance and validation covering farm-scoped token lifecycle. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Monitoring: Add latency metrics for auth endpoints in AuthMetrics.ts to measure farm-scoped auth endpoint performance. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Docs: Update README to describe farm-scoped auth and error messages, including examples and troubleshooting. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Preview Thresholds\\n%% Allow manager to preview with weights on/off (binary) or numeric weights if enabled; preview does not persist unless saved: (36 hours)** - Preview renders thresholds in the UI with current weights (binary or numeric) Toggling weights updates the preview immediately without persisting changes When enabled, numeric weights are applied in preview; when disabled, only binary toggle is shown Preview reflects edge cases like zero or maximum weight values System does not persist any preview changes unless Save is clicked
    
    *   Frontend: Build ThresholdPreview component in \`components/annotation/ThresholdPreview.tsx\` (renders binary/numeric, edge cases) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add PreviewControls in \`components/annotation/PreviewControls.tsx\` (weights on/off toggle, numeric input when enabled) (4 hours)\[FE\]\[BE\]
        
    *   API: Create preview endpoint \`apps/api/pages/api/preview/thresholds.ts\` (compute preview, non-persistent using preview\_sessions) (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement preview logic in \`apps/api/services/preview/PreviewService.ts\` (apply numeric or binary weights) (4 hours)\[FE\]\[BE\]
        
    *   DB: Add preview\_sessions migration in \`prisma/migrations/\` referencing \`table\_preview\_sessions\` and \`table\_thresholds\_preview\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate React Query in \`hooks/useThresholdPreview.ts\` to call \`api/preview/thresholds\` and update \`components/annotation/ThresholdPreview.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for \`components/annotation/ThresholdPreview.test.tsx\` and \`components/annotation/PreviewControls.test.tsx\` covering edge cases (zero/max) using Jest/RTL (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add API integration tests in \`apps/api/tests/preview.thresholds.test.ts\` ensuring no DB persistence unless Save endpoint called (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update docs in \`docs/annotation/thresholds\_preview.md\` describing preview behavior and file paths (4 hours)\[FE\]\[BE\]
        
*   **Thresholds Preview Save:** As a: annotation engineer, I want to: save thresholds preview, So that: changes persist for the next session**(10.5 hours)** - Saved thresholds persist across sessions for the user UI reflects saved values after reload Conflict resolution when multiple edits occur Audit trail available for changes to thresholds Technical: data stored securely with versioning
    
    *   DB: Create thresholds\_preview migration in prisma/migrations/ to add table\_thresholds\_preview with versioning and audit fields - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement saveThresholds(userId, payload) in apps/api/services/thresholds/ThresholdsService.ts with versioning and secure storage - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add POST /thresholds/preview route in apps/api/routes/thresholds.ts calling apps/api/services/thresholds/ThresholdsService.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement GET /thresholds/preview route in apps/api/routes/thresholds.ts to fetch latest for user - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Add conflict resolution logic in apps/api/services/thresholds/ThresholdsService.ts using optimistic locking/version compare - (M) (1 hours)\[FE\]\[BE\]
        
    *   Realtime: Emit threshold updates via apps/api/services/realtime/RealtimeService.ts using Socket.io to notify clients - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPreview component in components/thresholds/ThresholdsPreview.tsx to display and edit thresholds - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate React Query hooks in hooks/useThresholds.ts to GET/POST /thresholds/preview - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Persist UI state and reload reflect saved values in pages/thresholds.tsx using components/thresholds/ThresholdsPreview.tsx and hooks/useThresholds.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Audit: Create audit logging in apps/api/services/audit/AuditService.ts recording changes to table\_thresholds\_preview - (M) (1 hours)\[FE\]\[BE\]
        
    *   Security: Ensure encryption at rest for threshold blobs via S3/DB encryption configs in apps/api/config/security.ts and update prisma/schema.prisma - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add integration tests in apps/api/tests/thresholds.test.ts for save/load/conflict scenarios - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document API and frontend usage in docs/thresholds\_preview.md and inline JSDoc in apps/api/services/thresholds/ThresholdsService.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Auth & Farm Scoping: (0 hours)**
    
*   **Include Signed URLs: (36 hours)**
    
    *   DB: Add signed\_url fields to \`prisma/migrations/20251101\_add\_signed\_url\_to\_annotation\_images.sql\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement generateSignedUrl() in \`apps/api/services/storage/S3Service.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create endpoint \`apps/api/routes/api/storage/signedUrl.ts\` to return signed URLs (4 hours)\[FE\]\[BE\]
        
    *   API: Update upload handler in \`apps/api/routes/api/annotations/upload.ts\` to use signed URL for direct S3 upload (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update uploader in \`components/annotation/AnnotationUploader.tsx\` to request signed URL and upload to S3 (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update preview in \`components/annotation/AnnotationPreview.tsx\` to fetch expiring signed URL via \`apps/api/routes/api/storage/signedUrl.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Cache: Implement Redis caching in \`apps/api/services/cache/RedisCache.ts\` for signed URL reuse (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`tests/api/signedUrl.test.ts\` covering generation and access (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add usage docs \`docs/signed-urls.md\` and update README \`README.md\` (4 hours)\[FE\]\[BE\]
        
*   **Thresholds Versioning: (40 hours)**
    
    *   DB: Create migration for \`threshold\_versions\` in \`prisma/migrations/\` to update \`table\_threshold\_versions\` schema (4 hours)\[FE\]\[BE\]
        
    *   DB: Add fields and relations in \`prisma/schema.prisma\` for \`threshold\_versions\`, linking to \`annotation\_images\` and \`annotation\_metadatas\` in \`prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createVersion() in \`apps/api/services/thresholds/ThresholdService.ts\` to insert into \`table\_threshold\_versions\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add routes in \`apps/api/routes/thresholds.ts\` for version CRUD using \`apps/api/services/thresholds/ThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Cache: Implement version caching in \`apps/api/services/cache/ThresholdCache.ts\` using Upstash/Redis for \`threshold\_versions\` previews (4 hours)\[FE\]\[BE\]
        
    *   Preview: Update \`apps/api/services/preview/PreviewService.ts\` to use versioned thresholds from \`table\_thresholds\_preview\` and \`table\_threshold\_versions\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build \`ThresholdVersionManager\` component in \`apps/web/components/thresholds/ThresholdVersionManager.tsx\` to list, create, and switch versions via \`apps/api/routes/thresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add integration in \`apps/web/pages/annotation/\[id (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add unit/integration tests in \`apps/api/tests/thresholds.test.ts\` covering \`table\_threshold\_versions\` operations and API routes (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Create \`docs/thresholds.md\` documenting versioning API endpoints and DB schema changes (4 hours)\[FE\]\[BE\]
        
*   **Cache Annotation Generate: (13 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Create annotation\_cache migration in \`prisma/migrations/\` to add table\_annotation\_cache (ID: \`table\_annotation\_cache\`) - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create annotation\_queue migration in \`prisma/migrations/\` to add table\_annotation\_queue (ID: \`table\_annotation\_queue\`) - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create annotations\_cache migration in \`prisma/migrations/\` to add table\_annotations\_cache (ID: \`table\_annotations\_cache\`) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add Prisma models in \`prisma/schema.prisma\` for table\_annotation\_cache, table\_annotation\_queue, table\_annotations\_cache - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement cache generation methods in \`apps/api/services/annotation/AnnotationService.ts\` (saveCache(), generateCacheFromAnnotation()) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement queue job creation in \`apps/api/services/queue/QueueService.ts\` to push to annotation\_queue (uses table\_annotation\_queue) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Add Upstash Redis helper in \`apps/api/lib/upstash/redis.ts\` and configure in env - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Create API route \`apps/api/pages/api/annotations/cache/generate.ts\` to call AnnotationService.generateCacheFromAnnotation() - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build CacheGenerateForm component in \`apps/web/components/annotation/CacheGenerateForm.tsx\` with validation using \`apps/api/lib/validation/annotation.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add page \`apps/web/app/annotations/cache/page.tsx\` to host CacheGenerateForm and show status - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement validation schema in \`apps/api/lib/validation/annotation.ts\` and integrate in \`apps/api/pages/api/annotations/cache/generate.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add unit tests in \`apps/api/tests/annotationCache.test.ts\` for AnnotationService and API route - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add docs \`docs/annotations/cache.md\` describing flow, endpoints, and DB tables (cite table\_annotation\_cache, table\_annotation\_queue, table\_annotations\_cache) - (M) (1 hours)\[FE\]\[BE\]
        
*   **Queue Image Render: (7 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Create annotation\_queue migration in prisma/migrations/ to add table\_annotation\_queue with schema updates for queue metadata and status tracking (id, created\_at, updated\_at, queue\_item\_id, status). Ensure migration runs in MVP environment and seeds initial table if required. - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Create annotation\_jobs migration in prisma/migrations/ to add table\_annotation\_jobs with schema updates for job metadata linked to annotation\_queue (foreign key). - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement POST /api/queue/render in apps/api/pages/api/queue/render.ts to enqueue image render requests and validate input using renderSchema validation, returning appropriate HTTP statuses. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Add QueueProducer in apps/api/services/queue/QueueProducer.ts to push messages to Upstash/Redis and write to table\_annotation\_queue, including retry hooks for resilience. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Worker: Build QueueConsumer worker in apps/api/workers/queueConsumer.ts to pull from Upstash, create jobs in table\_annotation\_jobs, and update table\_annotation\_cache, including error handling. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Create EnqueueRenderButton component in apps/web/components/queue/EnqueueRenderButton.tsx to call /api/queue/render and show status. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Validation: Add request validation schemas in apps/api/lib/validation/renderSchema.ts and integrate in apps/api/pages/api/queue/render.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   ErrorHandling: Implement retry and error logging in apps/api/services/queue/QueueProducer.ts and apps/api/workers/queueConsumer.ts with monitoring hooks - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing & Docs: Add integration tests in apps/api/tests/queue.test.ts and document usage in docs/queue\_render.md - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Cache Invalidation: (8 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Create migration to add invalidation\_log in \`prisma/migrations/\` for annotation\_invalidation\_log (table\_annotation\_invalidation) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add POST /annotations/invalidate in \`apps/api/routes/annotations.ts\` to enqueue invalidation (table\_annotation\_queue, table\_annotation\_jobs) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Implement invalidateCache() in \`apps/api/services/cache/CacheService.ts\` to remove keys from Upstash Redis and write to \`apps/api/services/cache/invalidation.ts\` (table\_annotation\_cache, table\_annotations\_cache) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Worker: Implement queue processor in \`apps/api/workers/annotationQueueProcessor.ts\` to process annotation invalidation jobs (table\_annotation\_queue, table\_annotation\_jobs) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add InvalidateCacheButton component in \`apps/web/components/annotations/InvalidateCacheButton.tsx\` and hook to POST /annotations/invalidate (table\_annotation\_cache) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add validation and error handling in \`apps/api/middleware/validation.ts\` for invalidate endpoint (table\_annotation\_queue, table\_annotation\_invalidation) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add integration tests in \`apps/api/tests/invalidateCache.test.ts\` covering enqueue, worker processing, and Redis eviction (table\_annotation\_queue, table\_annotation\_cache, table\_annotation\_invalidation) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README and \`docs/cache-invalidation.md\` with usage, API spec, and rollback steps (table\_annotation\_cache) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Preview With Weights: (12 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Add annotations\_cache & annotation\_cache migrations in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Update Prisma model for \`annotation\_cache\` in \`prisma/schema.prisma\` referencing table\_annotation\_cache - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement previewWithWeightsPreview() in \`apps/api/services/annotation/AnnotationService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add route POST /annotations/preview in \`apps/api/routes/annotations.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Cache: Integrate Upstash/Redis caching in \`apps/api/services/cache/UpstashCache.ts\` to use table\_annotation\_cache and \`table\_annotations\_cache\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Queue: Push invalidation/job to annotation\_queue in \`apps/api/services/queue/AnnotationQueue.ts\` (writes to table\_annotation\_queue) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build PreviewWithWeights component in \`apps/web/components/annotation/PreviewWithWeights.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Create hook usePreviewWithWeights in \`apps/web/hooks/usePreviewWithWeights.ts\` calling \`api/annotations/preview\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Validation: Add server-side validation in \`apps/api/services/annotation/AnnotationService.ts\` and request schema in \`apps/api/routes/annotations.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   UI: Add responsive styles in \`apps/web/components/annotation/PreviewWithWeights.module.css\` (Tailwind config in \`apps/web/tailwind.config.js\`) - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add integration tests for preview endpoint in \`tests/integration/preview.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend component tests in \`tests/components/PreviewWithWeights.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Cache Annotation Generate: (0 hours)**
    
*   **Preview with Weights: (0 hours)**
    
*   **Cache TTL Policies: (11 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Add ttl\_seconds and ttl\_policy columns to \`annotation\_cache\` in \`prisma/migrations/\` (create migration file) - (M) (1 hours)\[FE\]\[BE\]
        
    *   INFRA: Configure Upstash/Redis client in \`apps/api/config/upstash.ts\` - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Implement CacheService.setWithTTL(key, value, ttl) in \`apps/api/services/cache/CacheService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add cache TTL routes in \`apps/api/routes/cache.ts\` (POST /cache, PUT /cache/:id/ttl) - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Backfill existing \`annotation\_cache\` rows with default ttl in \`prisma/migrations/\` script - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build TTLControl component in \`components/cache/TTLControl.tsx\` with accessibility and responsive UI - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Validate TTL input and store policy in \`apps/api/routes/cache.ts\` -> uses \`apps/api/services/cache/CacheService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create \`annotation\_invalidation\_log\` insertion in \`apps/api/services/cache/CacheService.ts\` when TTL expires referencing \`table\_annotation\_invalidation\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   TESTING: Add unit tests for CacheService in \`apps/api/tests/cache.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   TESTING: Add integration tests for API routes in \`apps/api/tests/cacheRoutes.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DOCS: Document TTL policies and usage in \`docs/cache-ttl.md\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Normalize Job Enqueue: (28 hours)**
    
    *   API: Add normalize job types in \`apps/api/types/upstash/jobs.ts\` (api\_development,documentation) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement enqueueNormalizeJob() in \`apps/api/services/queue/QueueService.ts\` (api\_development)\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add POST /api/normalize endpoint in \`apps/api/pages/api/normalize.ts\` (api\_development,frontend\_component)\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Update normalize job handler in \`apps/api/workers/normalizeWorker.ts\` (api\_development,testing)\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build NormalizeButton in \`apps/web/components/NormalizeButton.tsx\` to call \`/api/normalize\` (frontend\_component,documentation)\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for enqueue in \`apps/api/tests/normalize.test.ts\` (testing)\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README section in \`apps/api/README.md\` about normalize job payloads (documentation)\` (4 hours)\[FE\]\[BE\]
        
*   **Evaluate Metrics: (28 hours)**
    
    *   Infra: Add Redis (Upstash) config in \`apps/api/config/upstash.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Create metrics router in \`apps/api/routes/metrics.ts\` to expose evaluation endpoints (4 hours)\[FE\]\[BE\]
        
    *   Worker: Implement evaluate job handler in \`apps/api/workers/evaluateWorker.ts\` to compute metrics (4 hours)\[FE\]\[BE\]
        
    *   Service: Add MetricsService.calculateMetrics() in \`apps/api/services/metrics/MetricsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create metrics table migration in \`prisma/migrations/\` for storing evaluation results (4 hours)\[FE\]\[BE\]
        
    *   Backend: Integrate queue enqueue in \`apps/api/services/queue/QueueService.ts\` to push evaluate jobs to Upstash (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for MetricsService in \`apps/api/services/metrics/\_\_tests\_\_/MetricsService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Normalize & Score:** As a: data engineer, I want to: normalize incoming delta metrics and compute a composite score, So that: stakeholders can compare results consistently across runs**(8.5 hours)** - Normalization pipeline handles missing values gracefully Scores are reproducible given same input Output is stored with run metadata and versioning Pipeline logs show processing time and any anomalies Edge case: non-numeric inputs are rejected with clear error messages
    
    *   DB: Add threshold\_versions migration in prisma/migrations/ to support versioning (table\_threshold\_versions). Preserve PRISMA migrations to enable versioned thresholds for Normalize & Score flow. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Create normalizeAndScore endpoint in apps/api/routes/instantDelta.ts to accept numeric inputs, run NormalizeService and ScoreService, and return results with metadata. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement normalization pipeline in apps/api/services/normalize/NormalizeService.ts (handle missing values, reject non-numeric). - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement scoring in apps/api/services/score/ScoreService.ts (deterministic RNG/versioned model). - (M) (1 hours)\[FE\]\[BE\]
        
    *   Store: Save outputs and run metadata to S3 in apps/api/services/storage/StorageService.ts and record version in prisma/migrations/ (table\_threshold\_versions). - (L) (2 hours)\[FE\]\[BE\]
        
    *   Logging: Add timing and anomaly logs in apps/api/middleware/logging.ts and integrate with monitoring. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Validation: Add input validators in apps/api/validators/inputValidator.ts to reject non-numeric with clear errors. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Create unit tests for normalization and scoring in apps/api/tests/normalizeScore.test.ts (reproducibility & edge cases). - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document pipeline, versioning, and error messages in docs/instantDelta/normalize\_score.md - (M) (1 hours)\[FE\]\[BE\]
        
*   **Generate Annotation:** As a: product analyst, I want to: generate annotation notes from delta results, So that: stakeholders receive actionable insights with context**(8 hours)** - Annotation includes delta magnitude, confidence, and suggested actions Notes reference dataset schemas and run identifiers Annotations are saved with link to results and can be exported Annotation generation handles missing data gracefully Annotation content passes basic quality checks
    
    *   DB: Create annotations table and migration in prisma/migrations/ referencing table\_threshold\_versions and table\_users - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement generateAnnotation() in apps/api/services/annotations/AnnotationService.ts to compute delta, confidence, suggested actions and handle missing data - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add annotations routes in apps/api/routes/annotations.ts to save, retrieve, and export annotations - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AnnotationPanel component in apps/web/components/annotations/AnnotationPanel.tsx to display delta, confidence, actions, dataset schema and run IDs - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Add S3 export helper in apps/api/services/storage/S3Exporter.ts to export annotations with result links - (L) (2 hours)\[FE\]\[BE\]
        
    *   DB: Create index and relation entries in prisma/schema.prisma for annotations -> table\_threshold\_versions and annotations -> users - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for AnnotationService in apps/api/tests/AnnotationService.test.ts covering missing data and quality checks - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add export button and CSV/JSON export in apps/web/components/annotations/ExportControls.tsx calling apps/api/routes/annotations.ts export endpoint - (M) (1 hours)\[FE\]\[BE\]
        
    *   Documentation: Update docs in docs/annotations.md describing schema refs, run ID usage, and export format - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Instant Eval Trigger:** As a: data scientist, I want to: trigger an instant delta evaluation process from the UI, So that: I can quickly assess changes without full pipeline run and accelerate decision-making**(7.5 hours)** - Trigger initiates evaluation within 2 seconds for small datasets Evaluation completes with delta score and basic metrics visible System handles invalid trigger gracefully with a helpful error message No required user authentication changes; existing auth remains Evaluation result is stored in a retrievable log with timestamp
    
    *   API: Implement POST /api/eval/instant route in apps/api/routes/eval/instant.ts to accept instant eval requests, route to EvalService for processing, and respond with job/enqueue status using Fastify/Express-like framework in TypeScript - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement handler evaluateInstant() in apps/api/services/eval/EvalService.ts to validate payload and enqueue job for instant evaluation, orchestrating validation, queueing, and response generation - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Worker: Create fast eval worker in apps/api/workers/instantEvalWorker.ts to compute delta score and metrics from input data, and push results to evaluation\_results store via LoggingService or direct DB call - (L) (2 hours)\[FE\]\[BE\]
        
    *   DB: Add evaluation\_results table migration in prisma/migrations/xxxx\_create\_evaluation\_results/ to store result, delta, metrics, timestamp - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build InstantEvalButton component in apps/web/components/eval/InstantEvalButton.tsx to call /api/eval/instant and show status, including loading state and result display - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add input validation and graceful errors in apps/api/middleware/validate.ts and use in apps/api/routes/eval/instant.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Logging: Implement storeResult() in apps/api/services/logging/LoggingService.ts to write to evaluation\_results and include timestamp - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for instant eval in apps/api/tests/eval/instant.test.ts covering success, invalid payload, timing <2s - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Cache & Invalidate: (28 hours)**
    
    *   Infra: Configure Upstash Redis client in \`apps/api/lib/redis.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Add cache metadata columns migration for \`table\_threshold\_versions\` in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement cache layer in \`apps/api/services/cache/CacheService.ts\` using Upstash Redis (4 hours)\[FE\]\[BE\]
        
    *   API: Update threshold version fetch in \`apps/api/services/threshold/ThresholdService.ts\` to use CacheService (4 hours)\[FE\]\[BE\]
        
    *   API: Add invalidate endpoint in \`apps/api/routes/thresholds/invalidate.ts\` to call CacheService.invalidate (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Use React Query cache and add invalidate hook in \`components/thresholds/useInvalidateThreshold.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for cache and invalidate in \`apps/api/tests/cache.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Threshold Versioning:** As a: platform admin, I want to: version thresholds for delta evaluation and expose API to fetch thresholded results, So that: experiments can be analyzed with adjustable cutoffs**(7 hours)** - Default thresholds exist and are versioned API endpoint returns thresholded deltas with version info Changing thresholds preserves historical results and root cause traces Threshold update is auditable and timestamped API handles invalid version requests gracefully
    
    *   DB: Create threshold\_versions table migration in prisma/migrations/20251104\_create\_threshold\_versions/. Implement Prisma migration to add threshold\_versions with fields: id (PK), version\_number, created\_at, is\_current, description. Ensure migration is idempotent and fits existing Prisma schema. Build steps: generate migration, run prisma migrate dev, verify DB schema and seed alignment. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add default thresholds seed in prisma/seed/thresholdsSeed.ts. Extend thresholdsSeed to populate threshold\_versions defaults and existing thresholds for MVP. Ensure deterministic seeds and alignment with threshold\_versions versions. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement getThresholdedDelta() in apps/api/services/thresholds/ThresholdService.ts. Function computes delta values based on current threshold\_version and stored thresholds. Use Prisma client to fetch version, thresholds, and compute delta for a given input; expose interface for other components. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /api/thresholds GET route in apps/api/routes/thresholds.ts returning version metadata. Route should fetch current version and metadata from ThresholdService, format response, and handle errors. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement updateThresholdVersion() in apps/api/services/thresholds/ThresholdAdminService.ts with audit logging. Allow admin to create new threshold\_version entry, set current flag, and log audit record to audit\_logs table. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Add audit log table migration in prisma/migrations/20251104\_create\_audit\_logs/. Create audit\_logs table with fields: id, actor, action, timestamp, version\_id, notes. Ensure FK to threshold\_versions if applicable. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add validation for version param in apps/api/routes/thresholds.ts to handle invalid version requests gracefully. Validate format and existence, return 400 with helpful message on invalid input. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Create integration tests for thresholding in apps/api/tests/thresholds.test.ts. Cover getThresholdedDelta(), /api/thresholds endpoint, updateThresholdVersion flow with mocks or test DB, and audit logging verification. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add ThresholdsAdmin UI in apps/web/components/thresholds/ThresholdsAdmin.tsx to view versions and update. Implement UI for listing version history, selecting version, and triggering updates via admin API. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Document threshold versioning and API in docs/thresholds.md. Include endpoints, data model, versioning semantics, and audit considerations. - (XS) (0.5 hours)\[FE\]\[BE\]
        

### **Milestone 6: Workers & rendering: annotation worker, renderer worker, renderer image generation, worker pseudocode and SQL for annotations/ingest**

_Estimated 576 hours_

*   **Compose Annotation Metadata: (40 hours)**
    
    *   DB: Create annotations table migration in \`prisma/migrations/\` referencing table\_users (table\_users) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement ComposeMetadataService.compose() in \`apps/api/services/annotation/ComposeMetadataService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Add background job handler in \`apps/api/jobs/annotationWorker.ts\` to call ComposeMetadataService.compose()\` (4 hours)\[FE\]\[BE\]
        
    *   Storage: Save metadata JSON to S3 in \`apps/api/services/storage/S3Service.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Queue: Add Redis/Upstash queue integration in \`apps/api/utils/queue.ts\` and register job type 'compose\_metadata' (4 hours)\[FE\]\[BE\]
        
    *   API: Add route POST \`/api/annotations/compose\` in \`apps/api/pages/api/annotations/compose.ts\` to enqueue compose\_metadata job (4 hours)\[FE\]\[BE\]
        
    *   ML: Integrate OpenAI/TensorFlow call in \`apps/api/services/annotation/ComposeMetadataService.ts\` to generate metadata (4 hours)\[FE\]\[BE\]
        
    *   DB: Add Prisma model and index updates in \`prisma/schema.prisma\` for table\_annotations and create \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests in \`tests/composeMetadata.test.ts\` for ComposeMetadataService (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write docs in \`docs/compose-metadata.md\` and update README in \`apps/api/README.md\` (4 hours)\[FE\]\[BE\]
        
*   **Resolve Photo URLs (public or signed): (32 hours)**
    
    *   DB: Add photo storage\_type column in \`prisma/migrations/\` to table\_annotation\_compositions (4 hours)\[FE\]\[BE\]
        
    *   API: Implement resolvePhotoUrl() in \`apps/api/services/photos/PhotoService.ts\` to return public or signed URL (4 hours)\[FE\]\[BE\]
        
    *   API: Add /photos/resolve route in \`apps/api/routes/photos.ts\` to call PhotoService.resolvePhotoUrl (4 hours)\[FE\]\[BE\]
        
    *   Worker: Update background worker job handler in \`apps/api/workers/annotationWorker.ts\` to invoke PhotoService.resolvePhotoUrl and store result (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update component to fetch resolved URL in \`components/photos/PhotoRenderer.tsx\` using React Query hook in \`apps/web/hooks/usePhoto.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Infra: Add S3 signing utility in \`apps/api/lib/s3/sign.ts\` using AWS SDK to generate pre-signed URLs (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for PhotoService.resolvePhotoUrl in \`apps/api/services/photos/\_\_tests\_\_/PhotoService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document resolve flow in \`docs/flow\_worker/resolve\_photo\_urls.md\` (4 hours)\[FE\]\[BE\]
        
*   **Queue Render Job: (32 hours)**
    
    *   Infra: Add Redis (Upstash) client in \`apps/api/src/lib/redis.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Infra: Implement queue wrapper in \`apps/api/src/lib/queue.ts\` using BullMQ/Upstash Redis (4 hours)\[FE\]\[BE\]
        
    *   API: Create enqueue endpoint POST /api/render in \`apps/api/src/routes/render.ts\` to push job to queue (4 hours)\[FE\]\[BE\]
        
    *   Worker: Implement render worker in \`apps/api/workers/renderWorker.ts\` to process queue jobs (4 hours)\[FE\]\[BE\]
        
    *   Storage: Implement S3 upload in \`apps/api/services/storage/S3Service.ts\` to save render outputs (4 hours)\[FE\]\[BE\]
        
    *   DB: Add render\_jobs table migration in \`prisma/migrations/\` to track job status (4 hours)\[FE\]\[BE\]
        
    *   Notification: Emit job status via Socket.io in \`apps/api/src/lib/socket.ts\` from worker (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/render.test.ts\` for enqueue -> process -> storage flow (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Store Annotation Result: (36 hours)**
    
    *   DB: Add AnnotationResult model in \`prisma/schema.prisma\` and create migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create POST /api/annotations handler in \`apps/api/routes/annotations.ts\` to accept worker payload (4 hours)\[FE\]\[BE\]
        
    *   API: Implement storeAnnotationResult() in \`apps/api/services/annotation/AnnotationService.ts\` to save result via Prisma client (4 hours)\[FE\]\[BE\]
        
    *   Storage: Upload annotated file to S3 in \`apps/api/services/storage/S3Service.ts\` and store path in DB (4 hours)\[FE\]\[BE\]
        
    *   Worker: Update Vercel background worker handler in \`apps/worker/handlers/annotationHandler.ts\` to call /api/annotations or AnnotationService directly (4 hours)\[FE\]\[BE\]
        
    *   Cache/Queue: Acknowledge job and push notification via Redis/Upstash in \`apps/api/services/queue/QueueService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Notification: Emit socket event via \`apps/api/services/notification/SocketService.ts\` to notify user of stored result (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test in \`apps/api/tests/annotations.test.ts\` to verify DB record and S3 upload (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README in \`apps/api/README.md\` describing annotation payload and endpoints (4 hours)\[FE\]\[BE\]
        
*   **Validate Signed Photo URL: (24 hours)**
    
    *   API: Add endpoint validateSignedUrl in \`apps/api/routes/photos.ts\` to accept signed URL payload (4 hours)\[FE\]\[BE\]
        
    *   Worker: Implement validation job handler in \`apps/api/workers/photoValidationWorker.ts\` to verify S3 signature and response (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Add verifySignedUrl(url: string) in \`apps/api/services/photos/PhotoService.ts\` using AWS S3 SDK and Sharp/OpenCV checks (4 hours)\[FE\]\[BE\]
        
    *   DB: Update photo record status in \`prisma/migrations/\` and \`apps/api/prisma/schema.prisma\` for table\_annotation\_compositions\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for verifySignedUrl in \`apps/api/tests/photoService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Integration: Add integration test for endpoint in \`apps/api/tests/photosRoute.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Dedupe Render Jobs: (24 hours)**
    
    *   DB: Add render\_jobs\_dedupe table migration in \`prisma/migrations/2025xxxx\_add\_render\_jobs\_dedupe/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement dedupe key generation and store in \`apps/api/services/dedupe/DedupeService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Integrate dedupe check in \`apps/api/jobs/worker.ts\` to skip duplicate Upstash jobs (4 hours)\[FE\]\[BE\]
        
    *   Redis: Implement Upstash locking logic in \`apps/api/services/upstash/UpstashClient.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`tests/worker/dedupe.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Monitoring: Add logging/metrics in \`apps/api/lib/logger.ts\` and \`apps/api/lib/metrics.ts\` (4 hours)\[FE\]\[BE\]
        
*   **Publish Render Completion: (36 hours)**
    
    *   DB: Add 'render\_status' and 'render\_completed\_at' columns in \`prisma/migrations/\` for table\_annotation\_compositions (table\_annotation\_compositions) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement POST /renders/complete handler in \`apps/api/routes/renders.ts\` to validate payload and update composition (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Service: Add markRenderComplete(compositionId, metadata) in \`apps/api/services/renders/RenderService.ts\` to update DB and S3 metadata (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Worker: Handle Upstash job 'render:complete' in \`apps/api/workers/renderWorker.ts\` to call RenderService.markRenderComplete (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Queue: Emit Upstash job in \`apps/api/services/queue/QueueService.ts\` when render finishes in background worker (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Send Socket.io event 'renderCompleted' in \`apps/api/services/realtime/RealtimeService.ts\` to notify frontend (frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Listen to 'renderCompleted' in \`components/RenderStatus/RenderStatus.tsx\` and update UI (frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test for POST /renders/complete in \`apps/api/tests/renders.complete.test.ts\` (testing) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Update README section in \`docs/workers.md\` describing render completion flow (documentation) (4 hours)\[FE\]\[BE\]
        
*   **Read Thresholds Version: (24 hours)**
    
    *   DB: Add 'thresholds\_version' column to \`prisma/migrations/\` migration for \`table\_annotation\_compositions\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement readThresholdsVersion() in \`apps/api/services/annotations/ThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add GET /annotations/thresholds-version route in \`apps/api/routes/annotations.ts\` calling \`ThresholdService.readThresholdsVersion\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Integrate readThresholdsVersion call in Vercel background worker \`apps/api/workers/flowWorker.ts\` to enqueue Upstash job (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit test for ThresholdService.readThresholdsVersion in \`apps/api/tests/services/thresholdService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README section in \`apps/api/README.md\` describing thresholds\_version field and API route \`/annotations/thresholds-version\` (4 hours)\[FE\]\[BE\]
        
*   **Generate render job: (38 hours)**
    
    *   DB: Create table\_jobs migration in \`prisma/migrations/create\_table\_jobs.sql\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add Next.js API route in \`apps/api/routes/render.ts\` to accept render requests (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createRenderJob() in \`apps/api/services/render/RenderService.ts\` to validate, persist to \`prisma/migrations/\` and return job id (4 hours)\[FE\]\[BE\]
        
    *   API: Implement enqueue() in \`apps/api/services/queue/QueueService.ts\` to push job to Upstash Redis (4 hours)\[FE\]\[BE\]
        
    *   Worker: Build consumer in \`apps/worker/processor.ts\` to pull job from Upstash and call renderer (4 hours)\[FE\]\[BE\]
        
    *   Worker: Implement Renderer in \`apps/worker/services/renderer/Renderer.ts\` to generate images using Sharp/OpenCV and save to \`/tmp\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Implement S3 upload in \`apps/worker/services/s3/S3Client.ts\` to upload final images to AWS S3 (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create RenderButton in \`components/render/RenderButton.tsx\` to call \`/api/render\` and show job status (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration test in \`apps/api/tests/render.test.ts\` for createRenderJob and queueing (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write usage docs in \`docs/render\_job.md\` (2 hours)\[FE\]\[BE\]
        
*   **Fetch canonical data: (34 hours)**
    
    *   DB: Add canonical\_data table migration in \`prisma/migrations/20251104\_add\_canonical\_data/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add Canonical model in \`prisma/schema.prisma\` and generate client in \`prisma/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create CanonicalService.getCanonical(id) in \`apps/api/services/canonical/CanonicalService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add Redis cache helper in \`apps/api/lib/redis.ts\` to use Upstash (4 hours)\[FE\]\[BE\]
        
    *   API: Implement GET /api/canonical/\[id (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook useCanonicalData in \`apps/web/hooks/useCanonicalData.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build CanonicalViewer component in \`apps/web/components/canonical/CanonicalViewer.tsx\` to display fetched data (4 hours)\[FE\]\[BE\]
        
    *   QA: Add integration test for API in \`apps/api/tests/canonical.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document canonical endpoint and hook in \`docs/canonical.md\` (4 hours)\[FE\]\[BE\]
        
*   **Compose image: (36 hours)**
    
    *   API: Add compose endpoint POST /api/compose in \`apps/api/pages/api/compose.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement composeImage(data) in \`apps/api/services/image/ComposeService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Add renderer worker handler in \`apps/api/workers/renderer/rendererWorker.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Storage: Upload composed image to S3 in \`apps/api/services/storage/S3Service.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Processing: Integrate Sharp/OpenCV pipeline in \`apps/api/lib/imageProcessing/pipeline.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ComposeEditor component in \`apps/web/components/compose/ComposeEditor.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Validate request and persist job in \`apps/api/services/jobs/JobService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create jobs table migration in \`prisma/migrations/\` for compose jobs (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Emit job status via Socket.io in \`apps/api/lib/realtime/socket.ts\` (4 hours)\[FE\]\[BE\]
        
*   **Upload annotation image: (36 hours)**
    
    *   Frontend: Build AnnotationUpload component in \`components/renderer/AnnotationUpload.tsx\` (api\_development, frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   API: Add POST /api/annotations/upload route in \`apps/api/pages/api/annotations/upload.ts\` (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement uploadImageToS3 in \`apps/api/services/storage/S3Service.ts\` (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   DB: Create annotations table migration in \`prisma/migrations/\` adding annotations table (testing, documentation) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement saveAnnotationMetadata in \`apps/api/services/annotations/AnnotationService.ts\` to write to \`prisma/\` models (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Integration: Add client upload mutation in \`lib/api/annotations.ts\` using React Query (frontend\_component) (4 hours)\[FE\]\[BE\]
        
    *   Worker: Notify renderer workers via Upstash in \`apps/api/services/notifications/UpstashClient.ts\` after upload (api\_development) (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test for upload flow in \`apps/api/tests/annotations/upload.test.ts\` (testing) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document API and component usage in \`docs/annotations\_upload.md\` (documentation) (4 hours)\[FE\]\[BE\]
        
*   **Update annotations record: (34 hours)**
    
    *   DB: Create annotations table migration in \`prisma/migrations/\` (add annotations table with id, userId, data, updatedAt) (4 hours)\[FE\]\[BE\]
        
    *   DB: Add Annotation model in \`prisma/schema.prisma\` and run \`prisma generate\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement updateAnnotation(id, payload) in \`apps/api/services/annotations/AnnotationService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add route PATCH \`/api/annotations/\[id (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AnnotationForm component in \`components/annotations/AnnotationForm.tsx\` with fields and validation (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Create hook useUpdateAnnotation in \`hooks/useUpdateAnnotation.ts\` using React Query mutation to PATCH \`/api/annotations/\[id (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Emit update via Socket.io in \`apps/api/services/annotations/AnnotationService.ts\` after successful update (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration test in \`tests/annotations/update.test.ts\` covering API and DB update (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update \`docs/annotations.md\` with API contract and example request/response (4 hours)\[FE\]\[BE\]
        
*   **Render Job Consumption:** As a: operations engineer, I want to: render and consume a rendering job from Upstash queue, So that: I can initiate image generation workflow and feed downstream stages**(5 hours)** - System polls Upstash queue for new render jobs Job is dequeued and acknowledged without loss Rendered job metadata (jobId, timestamp) stored in in-memory queue for downstream steps
    
    *   API: Implement Upstash polling loop in \`apps/api/services/worker/RenderWorker.ts\` - poll Upstash queue for new render jobs - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement dequeue and acknowledge logic in \`apps/api/services/worker/RenderWorker.ts\` - safely dequeue and ack jobs - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Store rendered job metadata in in-memory queue in \`apps/api/services/queue/InMemoryQueue.ts\` (store jobId, timestamp) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test for polling and dequeue in \`tests/worker/renderWorker.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Add README section in \`docs/worker/RenderWorker.md\` describing consumption flow and failure handling - (M) (1 hours)\[FE\]\[BE\]
        
*   **Generate PNG/SVG:** As a: rendering service, I want to: generate PNG and SVG outputs from the render data, So that: downstream consumers can use both raster and vector formats for various use cases**(6.5 hours)** - PNG and SVG files are created from input render data File sizes verified not to exceed limits Generated assets are accessible to downstream steps or stored in temp storage with metadata
    
    *   Renderer worker: Implement RenderWorker.ts to consume Upstash jobs and orchestrate rendering flow by invoking lib.render.renderer with input payloads and dispatching results to downstream services (temp storage, size validation, and storage service). - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Lib: Renderer util in apps/api/lib/render/renderer.ts to generate PNG/SVG from input data using server-side rendering pipeline; preserves architectural reference to downstream tempStore and storage service integrations. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Lib: Size validator in apps/api/lib/validate/sizeValidator.ts to verify file size limits for generated assets against configured max\_size and unit conversions; used by render flow prior to storage upload. - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Service: Supabase upload in apps/api/services/storage/SupabaseService.ts to store assets and return public URLs; handle bucket paths, permissions, and error scenarios. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement RenderJobService in apps/api/services/render/RenderJobService.ts to log attempts in table\_render\_job\_attempts and manage retry/mark-as-failed flow; integrate with Upstash job statuses. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Lib: Temp storage helper in apps/api/lib/temp/tempStore.ts to save files with metadata for downstream steps; abstracted storage backend and metadata shepherding. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Test: Add unit tests for renderer in apps/api/tests/renderer.test.ts - (XS) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Test: Add integration tests for worker flow in apps/api/tests/worker.integration.test.ts - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
*   **Store to Supabase:** As a: data engineer, I want to: persist generated assets and related metadata to Supabase storage and database, So that: assets are durably stored and retrievable for users**(5.5 hours)** - Assets uploaded to Supabase storage bucket with correct content-type Database records created with asset references, jobId, timestamps Error handling with retries for transient storage/database failures
    
    *   Storage: Implement uploadAssetToSupabase(file, contentType) in apps/api/services/storage/SupabaseStorageService.ts. Expose a function to upload binary assets to Supabase storage bucket with proper content-type handling, error mapping, and retry hook if configured. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Create insertRenderAssetRecord(jobId, assetPath, metadata) in apps/api/services/db/RenderAssetService.ts. Inserts a record linking render job with stored asset, including metadata columns. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Worker: Integrate store flow in apps/api/workers/renderer/RendererWorker.ts to call uploadAssetToSupabase and insertRenderAssetRecord. Orchestrate storage and DB write during render work. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Retry: Add retry logic with exponential backoff in apps/api/lib/retries/exponentialBackoff.ts and apply in SupabaseStorageService.ts and RenderAssetService.ts. Implement configurable backoff strategy for transient failures. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Schema: Add columns for asset\_ref, job\_id, content\_type, created\_at in migration in prisma/migrations/ for table table\_forage\_photos. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for storage+db in apps/api/tests/renderer/storeToSupabase.test.ts. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Logging: Add structured error logging and alerting calls in apps/api/services/storage/SupabaseStorageService.ts and apps/api/services/db/RenderAssetService.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Persist Metadata:** As a: workflow coordinator, I want to: persist end-to-end metadata about render job to a metadata store, So that: auditing and traceability across the pipeline is ensured**(7 hours)** - End-to-end metadata record created with jobId, status, timestamps Metadata store write is idempotent Queryable audit logs available for recent jobs
    
    *   DB: Add render\_metadata table migration in prisma/migrations/ with jobId, status, createdAt, updatedAt preserved; ensure file-based Prisma migration exists and is reversible - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add Prisma model RenderMetadata in prisma/schema.prisma and run prisma migrate to create table; ensure relational compatibility and type mappings - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement persistMetadata(job) in apps/api/services/renderer/MetadataService.ts with idempotent upsert logic using Prisma upsert to store job metadata - (M) (1 hours)\[FE\]\[BE\]
        
    *   Worker: Call persistMetadata in apps/api/workers/rendererWorker.ts after job completion to persist results - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Create audit route GET /api/metadata/recent in apps/api/routes/metadata.ts returning recent jobs - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Create index on jobId and createdAt in migration prisma/migrations/ for query performance - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Test: Add unit tests for MetadataService.upsert in apps/api/services/renderer/\_\_tests\_\_/MetadataService.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Test: Add integration test for /api/metadata/recent in apps/api/tests/metadata.integration.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document metadata schema and API in docs/metadata.md and update README - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Upload to Supabase Storage:** As a: data pipeline operator, I want to: upload the rendered image to Supabase Storage, So that: artifacts are stored reliably for access by downstream services**(7.5 hours)** - Image uploaded to correct bucket with correct path Upload success status returned and retrievable Checksum or ETag matches source image to verify integrity Retry on transient network failures up to 3 attempts
    
    *   Config: Add Supabase client in apps/api/config/supabase.ts with proper environment-based config, initialization of SupabaseClient, and export for injection into API routes and services. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Implement uploadToSupabase mutation in apps/api/routers/workerDocs/uploadToSupabase.ts to accept filePath and fileBuffer, perform upload via SupabaseStorageService, return uploadResult with ETag/checksum and status. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Create apps/api/services/storage/SupabaseStorageService.ts with uploadToSupabase(filePath, fileBuffer) and retry logic (3 attempts) to upload to Supabase Storage, returning ETag/checksum. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Checksum: Implement checksum/ETag computation in apps/api/services/storage/ChecksumService.ts to verify integrity against uploaded data, used by upload flow and returned in uploadResult. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Worker: Integrate upload call in apps/worker/image-renderer-worker.js to call API mutation and pass file buffer and path, handling retries and backoff if API fails. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add UploadButton component in apps/web/components/UploadButton.tsx to call router\_route\_worker\_docs get signed URL or mutation, handle loading state, and display results. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Schema: Add response schema in apps/api/schemas/uploadResult.ts to include success status and ETag/checksum, used by uploadToSupabase mutation and client. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Tests: Create tests/uploadToSupabase.test.ts covering upload, retry, and checksum verification - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Persist Annotation Metadata:** As a: data engineer, I want to: persist annotation metadata linked to the rendered image, So that: downstream analytics can correlate image with its annotations**(7.5 hours)** - Metadata stored in database with correct foreign key to image Consistency checks ensure all required fields present Replication/backup mechanism in place Query returns complete metadata for a given image id
    
    *   DB: Create annotations metadata migration in prisma/migrations/20251104\_create\_annotations\_metadata/ (preserve prisma migrate structure) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add AnnotationMetadata model in prisma/schema.prisma and update apps/api/prisma/migrations/ - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement saveAnnotationMetadata mutation in apps/api/routers/workerDocs/router.ts referencing router\_route\_worker\_docs - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement getAnnotationMetadataByImageId query in apps/api/routers/workerDocs/queries.ts referencing router\_route\_worker\_docs - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Add validation for required metadata fields in apps/api/services/annotations/AnnotationService.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add replication/backup job to upload metadata snapshots to S3 in apps/api/jobs/backup/annotationBackupJob.ts - (L) (2 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests for save and fetch in apps/api/tests/annotations/metadata.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update /worker/docs route examples in apps/web/routes/worker/docs/examples.tsx referencing route\_worker\_docs and comp\_worker\_docs\_examples - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Retry & Error Handling:** As a: system operator, I want to: implement retry and error handling for the worker tasks, So that: failures are resiliently managed and retries occur with backoff**(8 hours)** - Worker logs errors with context Retry mechanism with exponential backoff implemented Maximum retry limit enforced Fatal errors surfaced to monitoring system
    
    *   DEV: Add structured logger in \`apps/api/workers/image-renderer-worker.js\` to log errors with context - (M) (1 hours)\[FE\]\[BE\]
        
    *   DEV: Implement retry with exponential backoff in \`apps/api/workers/image-renderer-worker.js\` (max retries configurable via \`process.env.WORKER\_MAX\_RETRIES\`) - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DEV: Extract backoff util in \`apps/api/utils/backoff.ts\` and use from \`apps/api/workers/image-renderer-worker.js\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DEV: Enforce max retry limit and mark fatal errors in \`apps/api/workers/image-renderer-worker.js\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   INFRA: Integrate fatal error reporting to monitoring in \`apps/api/services/monitoring/MonitoringService.ts\` and call from \`apps/api/workers/image-renderer-worker.js\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   QUALITY: Add unit tests for backoff util in \`apps/api/utils/backoff.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   QUALITY: Add integration tests for worker retry behavior in \`apps/api/workers/\_\_tests\_\_/image-renderer-worker.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   QUALITY: Document retry config and behavior in \`/worker/docs/retry-and-errors.md\` (route\_worker\_docs) - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Render Annotation Image:** As a: data pipeline operator, I want to: render an annotation image from input image and metadata, So that: downstream steps can visualize and verify annotations within the render pipeline**(6.5 hours)** - Render completes for a sample image with annotation overlay Output image maintains original dimensions and color fidelity Annotation data is correctly overlaid as per provided metadata System handles missing optional fields gracefully without failure
    
    *   Setup: Add image rendering worker at workers/image-renderer-worker.js to handle Sharp/OpenCV pipeline, enabling scalable background processing for renderAnnotationImage tasks using a Redis/Upstash queue. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Implement GET/POST endpoint fetchAnnotationImage in apps/api/routes/workerDocs.ts to call the image-renderer-worker (via job queue) and return the rendered image in the response, integrating with router\_route\_worker\_docs. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Ensure table\_annotations has required fields; add Prisma migration in prisma/migrations/ to update table\_annotations with necessary columns for render metadata tracking. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement renderAnnotationImage(imagePath, metadata) in apps/api/services/image/RenderService.ts using Sharp/OpenCV and S3 interactions to produce rendered image and store in S3, returning URL. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Integration: Wire worker to RenderService in apps/api/workers/image-renderer-worker.js and ensure Redis/Upstash job queue handling, including retries and dead-lettering. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Add example and test in apps/web/routes/worker/docs/Examples.tsx to call /worker/docs fetchAnnotationImage (route\_worker\_docs, comp\_worker\_docs\_examples) - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Write unit tests for apps/api/services/image/RenderService.test.ts validating dimensions, color fidelity, and missing fields handling (testing) - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update worker docs code viewer in apps/web/components/CodeViewer/WorkerExample.tsx with sample usage (comp\_worker\_docs\_codeviewer) - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   🖼 **Upload Photo:** As a: user, I want to: upload a photo so that I can initiate the annotation workflow and generate silhouettes**(10 hours)** - User can select and upload a photo file (PNG/JPG) Upload progress is visible and completes successfully System validates file size and type Uploaded photo is stored securely with encryption at rest On success, a generated thumbnail is created and stored
    
    *   Frontend: Implement PhotoUploadForm.tsx in components/photos/PhotoUploadForm.tsx to present a file input, show selected file name, and display a real-time upload progress bar, wired to React Query for mutation usage and upload lifecycle - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement requestUploadUrl mutation in apps/api/routes/annotatedImages.ts to generate a signed S3 URL for the client to upload a file, including validation of file type/size constraints and response with signedUrl and key - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement finalizeUpload mutation in apps/api/routes/annotatedImages.ts to record the uploaded photo in DB and trigger a thumbnail generation job, updating encrypted\_url, thumbnail\_url, and size fields - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Configure S3 encryption and bucket policy in infra/aws/s3/bucket.tf or apps/api/config/s3.ts to enable encryption at rest, SSE-KMS or SSE-S3, and derive bucket policy for secure upload - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Backend: Add getUploadConfig query in apps/api/routes/annotatedImages.ts to expose max file size and allowed types for client validation before initiating upload - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   Backend: Validate file type/size in apps/api/services/upload/UploadService.ts before issuing URL to ensure compliance with allowed types/sizes - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create forage\_photos migration in prisma/migrations/ adding encrypted\_url, thumbnail\_url, size, content\_type (table: table\_forage\_photos) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Worker: Implement thumbnail generation job in apps/api/jobs/thumbnail/ThumbnailJob.ts using OpenCV and store thumbnail to S3 - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate upload flow with React Query in hooks/usePhotoUpload.ts (request URL, upload with progress, call\_finalizeUpload) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Security: Ensure encryption at rest wiring in apps/api/config/s3.ts and document in docs/security.md - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add E2E test for upload flow in tests/e2e/photoUpload.spec.ts (PNG/JPG, size validation, progress, thumbnail created) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   🖼 **View Annotated (photo\_url public, signed\_photo\_url optional):** As a: user, I want to: view annotated images so that I can verify markings overlaid on the photo**(5 hours)** - Should render the annotated image from the public photo\_url If signed\_photo\_url is provided, ensure secure access and display of the signed image Annotations should align with the original image dimensions within 2px accuracy System handles missing annotated data gracefully by showing a placeholder Performance: image loads within 2 seconds on standard network
    
    *   Frontend: Implement AnnotatedImage component at components/images/AnnotatedImage.tsx. Render image from provided photo\_url or signed\_photo\_url, draw user/AI annotations on an HTML5 canvas aligned to image with 2px pixel-perfect offset, support re-render on prop changes, and handle loading/error states within React workflow. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create signed URL verification route at apps/api/routes/images/verifySignedUrl.ts to securely validate and fetch signed\_photo\_url, returning 401/403 on invalid tokens, and 200 with url data on success; integrate with existing authentication middleware and route structure - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Extend forage\_photos with new 'annotations' field to store annotation data; propagate changes to prisma/schema.prisma and migrations; ensure data model supports JSON encoding and indexing for efficient retrieval - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add image loader with caching using React Query and Upstash/Redis in utils/imageLoader.ts to cache image URLs and metadata; integrate with existing React Query client and suspense/placeholder patterns - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement PlaceholderImage component at components/images/PlaceholderImage.tsx to render placeholder visuals when annotated data is unavailable; ensure accessibility and graceful degradation - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests at tests/integration/annotatedImage.test.ts to validate rendering, 2px alignment tolerance, and performance <2s across typical viewport sizes; mock API and image assets - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add monitoring for image load times in apps/api/monitoring/imageLatency.ts and set alerts; integrate with existing observability stack (metrics, dashboards, alerting rules) - (S) (0.5 hours)\[FE\]\[BE\]
        
*   🖼 **Toggle Layman/Tech: (32 hours)**
    
    *   Frontend: Add ToggleSwitch component in \`components/annotate/ToggleLaymanTech.tsx\` (api\_development)\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate toggle into AnnotatedImage view in \`components/annotate/AnnotatedImageView.tsx\` (frontend\_component)\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add user preference endpoints in \`apps/api/routes/preferences.ts\` to GET/POST laymanTech preference (api\_development)\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Implement save/get preference in \`apps/api/services/preferences/PreferencesService.ts\` (api\_development)\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create preferences migration in \`prisma/migrations/\` to add user\_preferences table referencing \`table\_users\` (documentation)\` (4 hours)\[FE\]\[BE\]
        
    *   Backend: Add auth middleware usage in \`apps/api/routes/preferences.ts\` and reference \`apps/api/services/auth/AuthService.ts\` (api\_development)\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for PreferencesService in \`apps/api/services/preferences/PreferencesService.test.ts\` (testing)\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add integration tests for preferences endpoint in \`apps/api/routes/preferences.test.ts\` (testing)\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   🖼 **Preview Thresholds: (40 hours)**
    
    *   DB: Add threshold fields (min\_threshold, max\_threshold) migration in \`prisma/migrations/20251104\_add\_preview\_thresholds/\` (4 hours)\[FE\]\[BE\]
        
    *   DB Model: Update ForagePhoto model in \`apps/api/models/ForagePhoto.ts\` to include minThreshold and maxThreshold (4 hours)\[FE\]\[BE\]
        
    *   API: Implement GET/PUT thresholds endpoints in \`apps/api/routes/forage.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Add setPreviewThresholds() and getPreviewThresholds() in \`apps/api/services/forage/ForageService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdControl component in \`components/annotator/ThresholdControl.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate thresholds into ImagePreview renderer in \`components/annotator/ImagePreview.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Validation: Add server-side validation for thresholds in \`apps/api/middleware/validateThresholds.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add API tests in \`apps/api/tests/forage.thresholds.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add component tests for ThresholdControl in \`tests/components/ThresholdControl.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write preview thresholds docs in \`docs/preview-thresholds.md\` (4 hours)\[FE\]\[BE\]
        
*   🖼 **Cache Invalidation:** As a: admin, I want to: invalidate image cache so that updated annotations are served**(10 hours)** - Admin can trigger cache invalidation for affected image keys Cache layer responds within 1 minute and serves fresh content Automated tests verify new annotations bypass stale cache No user-visible errors during invalidation Audit log records cache invalidations
    
    *   API: Add invalidateImageCache mutation in \`apps/api/routes/annotatedImages/router.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add getCacheStatus query in \`apps/api/routes/annotatedImages/router.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Cache: Implement cache invalidation helper in \`apps/api/services/cache/cacheInvalidator.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Wire Redis/Upstash client in \`apps/api/services/cache/redisClient.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Worker: Create background worker to purge tombstones in \`apps/api/workers/cacheWorker.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Admin Invalidate button in \`apps/web/components/admin/InvalidateCacheButton.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create cache\_invalidation\_audit migration in \`prisma/migrations/2025xxxx\_create\_cache\_invalidation\_audit/\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Log invalidation to DB in \`apps/api/services/audit/CacheAuditService.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add integration tests in \`apps/api/tests/cacheInvalidation.test.ts\` to verify fresh content served - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add frontend e2e test in \`apps/web/tests/adminInvalidate.spec.ts\` to ensure no user-visible errors - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        

### **Milestone 7: Deliverables: architecture diagrams, diagram files, README, ZIP package, prioritized exports and SOW package for WindSurf**

_Estimated 396.5 hours_

*   **Add Supabase table schemas and RLS: (36 hours)**
    
    *   DB: Create \`users\` table schema in \`prisma/migrations/20251104\_create\_users\_table/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create \`render\_jobs\` table schema in \`prisma/migrations/20251104\_create\_render\_jobs\_table/\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policies for \`users\` in \`supabase/policies/users.sql\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policies for \`render\_jobs\` in \`supabase/policies/render\_jobs.sql\` (4 hours)\[FE\]\[BE\]
        
    *   API: Update \`apps/api/services/auth/AuthService.ts\` to enforce Supabase identity checks (4 hours)\[FE\]\[BE\]
        
    *   API: Add DB access methods for render\_jobs in \`apps/api/services/render/RenderJobService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Infra: Add Supabase seed and migration scripts in \`scripts/supabase/migrate\_and\_seed.sh\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Write integration tests for RLS in \`tests/integration/rls.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document schemas and RLS in \`docs/db/supabase\_schemas.md\` (4 hours)\[FE\]\[BE\]
        
*   **Define render job flow and queue integration: (48 hours)**
    
    *   DB: Add render\_jobs model in \`prisma/schema.prisma\` and migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createRenderJob() in \`apps/api/services/render/RenderService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add POST /api/render in \`apps/api/pages/api/render.ts\` to enqueue job via \`libs/queue/UpstashQueue.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Worker: Build worker processor in \`apps/worker/processor/RenderWorker.ts\` to pull from Upstash and process jobs (4 hours)\[FE\]\[BE\]
        
    *   Storage: Implement uploadToS3() in \`apps/api/services/storage/S3Service.ts\` for final render artifacts (4 hours)\[FE\]\[BE\]
        
    *   Queue: Implement Upstash queue client in \`libs/queue/UpstashQueue.ts\` with enqueue/dequeue APIs (4 hours)\[FE\]\[BE\]
        
    *   DB: Add status update logic in \`apps/api/services/render/RenderService.ts\` to update \`render\_jobs\` table (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build RenderJobList component in \`components/jobs/RenderJobList.tsx\` using React Query to poll \`/api/jobs\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add jobs page in \`apps/web/pages/jobs.tsx\` to show job creation form and status (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Add Socket.io emitter in \`apps/api/libs/socket/socket.ts\` and client in \`apps/web/libs/socket/socket.ts\` to push status updates (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test in \`apps/api/tests/render.test.ts\` for create->enqueue->DB update flow (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add Upstash config and secrets in \`apps/api/config/upstash.ts\` and \`apps/worker/config/upstash.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Verify diagram assets: (32 hours)**
    
    *   Verify: Check existence of diagrams/implementation-diagram.png at \`public/diagrams/implementation-diagram.png\` (4 hours)\[FE\]\[BE\]
        
    *   Verify: Check existence of diagrams/implementation-diagram.svg at \`public/diagrams/implementation-diagram.svg\` (4 hours)\[FE\]\[BE\]
        
    *   Validation: Run image integrity check for \`public/diagrams/implementation-diagram.png\` using \`scripts/validateImages.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Validation: Parse and validate \`public/diagrams/implementation-diagram.svg\` for broken references using \`scripts/validateSVG.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Ensure S3 CDN link for \`public/diagrams/implementation-diagram.png\` in \`services/storage/S3Service.ts\` is reachable (4 hours)\[FE\]\[BE\]
        
    *   API: Ensure S3 CDN link for \`public/diagrams/implementation-diagram.svg\` in \`services/storage/S3Service.ts\` is reachable (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update image import in \`components/diagrams/DiagramView.tsx\` to reference \`/diagrams/implementation-diagram.png\` and \`/diagrams/implementation-diagram.svg\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit test for diagram assets in \`tests/diagrams/diagramAssets.test.ts\` to assert existence and HTTP 200 for CDN links (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Attach JSON schema files:** As a: developer, I want to: attach JSON schema files validating diagram data, So that: we enforce correct structure for diagram assets.**(5.5 hours)** - JSON Schemas present and valid (no syntax errors) Schemas referenced by diagram assets for validation Schema versioning maintained
    
    *   DB: Implement Prisma migration at prisma/migrations/20251104\_add\_schema\_attachments/ to add schema\_attachments table and indices for metadata storage (title, owner, s3Url, mimeType, etag, createdAt, updatedAt). Ensure rollup compatibility and migrations gating in MVP. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement attachJsonSchema mutation at apps/api/routes/diagrams/router\_route\_diagrams\_folder.ts to store metadata in Prisma, save s3 link reference, and trigger S3 upload via 6.4 service. Ensure input validation via 6.3 validator and idempotency for repeated attachments. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Add JSON schema validation util at apps/api/services/validation/jsonSchemaValidator.ts to validate incoming JSON against provided schema using AJV, expose validateSchema(input, schema) with clear error reporting. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Storage: Implement S3 upload in apps/api/services/storage/S3Service.ts used by attachJsonSchema flow to upload schema.json and return s3Url, with proper mime type and encryption; integrate retry policy. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build SchemaAttachForm component at apps/web/components/diagrams/SchemaAttachForm.tsx and wire to route\_diagrams\_folder for form submission; handle client-side validation and show upload progress. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add fetchSchemaAttachmentsStatus query in apps/api/routes/diagrams/router\_route\_diagrams\_folder.ts to retrieve status of attachments and link to comp\_diagrams\_file\_list; support filtering by status and pagination. - (M) (1 hours)\[FE\]\[BE\]
        
    *   QA: Add unit & e2e tests for schema attach in apps/api/tests/schemaAttach.test.ts and apps/web/tests/SchemaAttachForm.test.tsx to cover mutation, validation, storage, and UI flow. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Package files into ZIP:** As a: release engineer, I want to: package files into ZIP, So that: we can distribute the diagram assets as a single archive.**(8 hours)** - ZIP archive contains all diagram assets (SVG, PNG, schemas) Archive passes integrity check Unzip verification extracts all files with correct paths
    
    *   API: Add requestPackageZip mutation handler in \`apps/api/routes/diagrams/package.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement zipAssets() in \`apps/api/services/zip/ZipService.ts\` to collect SVG/PNG/schemas and create ZIP - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add integrity check and checksum generation in \`apps/api/services/zip/ZipService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Export ZIP button in \`apps/web/components/diagrams/ActionPanel/ExportZipButton.tsx\` using comp\_diagrams\_action\_panel - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Stream ZIP to client in \`apps/api/routes/diagrams/package.ts\` and reference router\_route\_diagrams\_folder - (M) (1 hours)\[FE\]\[BE\]
        
    *   Test: Unit tests for ZipService in \`apps/api/tests/zip.test.ts\` to verify ZIP contents and checksum - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Test: Integration test for frontend export in \`apps/web/tests/export.integration.test.ts\` to verify unzip and paths using route\_diagrams\_folder and comp\_diagrams\_action\_panel - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Add CI job in \`.github/workflows/package-zip.yml\` to run tests and verify artifact integrity - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Add implementation-diagram.png:** As a: developer, I want to: add implementation-diagram.png, So that: we have a raster fallback for the diagram when SVGs are not preferred.**(3 hours)** - PNG file added to repository File retrieval by path works in app PNG included in any asset registry if present
    
    *   Files: Add implementation-diagram.png to public/diagrams/implementation-diagram.png using project’s static asset pipeline (public directory) and ensure file presence in repository. This task establishes the PNG asset availability for serving and integration. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add file-serving route in apps/api/routes/diagrams.ts to serve /diagrams/implementation-diagram.png from the public directory, ensuring proper HTTP headers and cache behavior. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Update uploadDiagramFiles mutation in apps/api/routers/diagrams/router\_route\_diagrams\_folder.ts to register PNG assets and save metadata for implemented diagrams, including public path, original filename, and timestamp. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Include implementation-diagram.png in components/diagrams/DiagramsFileList.tsx and ensure path /diagrams/implementation-diagram.png is displayed in the list. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Add asset registry entry in config/assets/registry.json for public/diagrams/implementation-diagram.png - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   QA: Add integration test in apps/api/\_\_tests\_\_/diagrams.test.ts to fetch /diagrams/implementation-diagram.png and check 200 response - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Add implementation-diagram.svg:** As a: product team member, I want to: add implementation-diagram.svg, So that: we have the SVG copy of the diagram in the project assets to support scalable diagrams.**(7 hours)** - SVG file is added to repository without errors SVG verifies in project build (lint/svg checks) Existing diagrams remain intact, with no broken links
    
    *   FS: Add SVG file at \`public/diagrams/implementation-diagram.svg\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   FS: Add PNG fallback \`public/diagrams/implementation-diagram.png\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update \`apps/api/routes/diagrams.ts\` to include implementation-diagram metadata - (M) (1 hours)\[FE\]\[BE\]
        
    *   FE: Update \`components/diagrams/DiagramsFileList.tsx\` to render implementation-diagram.svg - (M) (1 hours)\[FE\]\[BE\]
        
    *   DATA: Update \`data/diagrams/index.ts\` to reference implementation-diagram files - (M) (1 hours)\[FE\]\[BE\]
        
    *   CI: Add SVG lint step in \`.github/workflows/ci.yml\` and \`package.json\` scripts - (M) (1 hours)\[FE\]\[BE\]
        
    *   DOC: Update \`docs/diagrams.md\` to list implementation-diagram.svg - (M) (1 hours)\[FE\]\[BE\]
        
*   **Export PNG from SVG:** As a: product team member, I want to: export PNG from SVG, So that: we have a rasterized diagram for environments that do not support SVGs.**(7 hours)** - PNG export completes without error PNG dimensions match SVG dimensions No visual artifacts introduced in export
    
    *   Frontend: Add Export PNG button in components/diagrams/DiagramsActionPanel.tsx. Add a UI element wired to trigger export flow; button should be accessible, labeled 'Export PNG', and sit within DiagramsActionPanel with existing styling and event handling hooks. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement client-side SVG to PNG conversion in utils/convert/svgToPng.ts. Convert an in-memory SVG string/DOM node to a PNG blob via canvas serialization, ensuring cross-browser compatibility. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add export endpoint handler in apps/api/routes/diagrams/export.ts to accept SVG and return PNG stream. Implement HTTP POST /diagrams/export to receive SVG data, invoke conversion (server-side or via service), and stream PNG back; include basic validation. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Integrate conversion library (sharp/puppeteer) in apps/api/services/convert/ConvertService.ts. Implement a ConvertService that uses chosen library to convert SVG to PNG; expose a method convertSvgToPng(svg: string) -> Buffer/Stream; handle errors and resource cleanup. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Wire export action to API in components/diagrams/DiagramsActionPanel.tsx -> call /diagrams/export. Implement API call, handle loading states, and display success/error feedback. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add E2E test exporting PNG in tests/e2e/exportSvgToPng.spec.ts verifying dimensions and visual similarity. Use headless browser to export from SVG in UI, validate PNG dimensions and compare a reference image or hash for similarity. - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
*   **Update README for diagrams:** As a: project maintainer, I want to: update README to reflect diagrams assets and usage, So that: developers can understand and utilize the diagram assets.**(3.5 hours)** - README lists available diagram assets (SVG/PNG) Usage section covers how to render diagrams No broken links in README
    
    *   Docs: Update README to list SVG/PNG assets in apps/web/diagrams/README.md, preserving existing architecture refs and listing assets used by diagrams module in React frontend. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Docs: Add Usage section showing render commands and examples in apps/web/diagrams/README.md, using existing render utilities and diagrams assets in the frontend. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Ensure fetchReadme reads apps/api/diagrams/readme.md in router implementation apps/api/routes/diagrams.ts, preserving Express.js route patterns and middleware contracts. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update ReadmeViewer.tsx to correctly handle image links in READMe content from apps/web/components/diagrams/ReadmeViewer.tsx, ensuring image rendering and fallback messaging for broken links. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Quality: Implement link checker test for README in scripts/tests/checkReadmeLinks.js, validating that all links in apps/api/diagrams and apps/web/diagrams READMEs are live or correctly redirected. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Provide README.md:** As a: project maintainer, I want to: provide README.md for diagrams repository, So that: contributors have guidance and context.**(6 hours)** - README.md exists and renders on repo host Guidance covers asset usage and contribution No dead references in README
    
    *   Frontend: Create README.md at apps/web/public/diagrams/README.md containing an overview of the diagrams folder and a list of assets (images, SVGs, fonts) with relative paths and usage notes - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Backend: Add README fetch API in apps/api/routers/diagrams/readme.ts implementing fetchReadme to serve the README content from storage or template - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Backend: Implement prepareReadmeTemplate in apps/api/routers/diagrams/readme.ts to scaffold README template with placeholders for title, assets, and sections - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Implement uploadReadme mutation in apps/api/routers/diagrams/readme.ts to save README to S3 and DB metadata - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Update README Viewer component in apps/web/components/diagrams/ReadmeViewer.tsx to render README content and verify all links resolve correctly - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add unit tests for README links in apps/web/tests/diagrams/readme.test.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add contribution guidelines section to apps/web/public/diagrams/README.md with PR and asset usage instructions - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Create diagram PNG/SVG:** As a: product designer, I want to: create diagram PNG and SVG exports of the implementation diagram, So that: stakeholders can view and share diagrams in common formats**(8 hours)** - Export PNG file is generated with correct resolution (min 1024x768) Export SVG file is generated with scalable vector data and preserves colors Generated files are available in expected export directory or API response Corrupt file handling returns meaningful error, no partial writes
    
    *   DB: Add diagrams\_exports migration in prisma/migrations/ to create the export\_records table and schema for storing exported diagram metadata, including relations to user/diagrams and expiration policy. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement REST/Next.js API route POST /api/diagrams/export to initiate export; validate input, enqueue render task, respond with export\_id and status. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Service: Implement renderDiagramPNG() in apps/api/services/render/RenderService.ts using Sharp/OpenCV to produce PNG at minimum 1024x768 and quality-preserving options. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement renderDiagramSVG() in apps/api/services/render/RenderService.ts preserving colors and vector data; ensure SVG output is valid and metadata-consistent. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Save exports to Supabase Storage in apps/api/services/storage/StorageService.ts and generate download link - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create render\_job entry in apps/api/services/render/RenderService.ts writing to table\_render\_jobs via Prisma client in apps/api/prisma/client.ts - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Return export package metadata and download link in apps/api/pages/api/diagrams/export.ts response - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   ErrorHandling: Implement atomic write and corruption check in apps/api/services/storage/StorageService.ts (write to tmp/, validate, move) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Export button and progress UI in apps/web/components/diagrams/ExportButton.tsx calling /api/diagrams/export - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for export endpoint in apps/api/tests/diagrams/export.test.ts checking PNG (>=1024x768) and SVG preservation - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document export API and file locations in docs/diagrams/export.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Export SVG file:** As a: user, I want to: export the SVG file, So that: I can reuse vector diagram in other tools**(6 hours)** - SVG file is generated SVG validates against schema SVG file contains all shapes and metadata Attempt to export preserves original viewbox and dimensions
    
    *   DB-side: Create diagrams\_exports table via prisma/migrations/ diagrams\_exports; ensure schema supports export metadata and status, and index for lookup; migration applied in MVP flow. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement generateSvgExport mutation in apps/api/routers/flow/diagram/export.ts to trigger export workflow; accepts diagramId and options, returns exportJobId and status. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create SvgGenerator service in apps/api/services/export/SvgGenerator.ts to build SVG preserving viewBox/dimensions and include metadata - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add ExportButton component in components/flow/ExportButton.tsx to trigger generateSvgExport via route\_flow\_diagram\_export; wire to MVP flow route and show status/toast - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Update Assets List in components/flow/AssetsList.tsx to show export status and download link (comp\_flow\_diagram\_export\_assets\_list) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Add S3 upload util in apps/api/services/storage/S3Client.ts and config in apps/api/config/s3.ts - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add SVG schema validator in apps/api/services/validation/SvgSchemaValidator.ts and tests in tests/export/svgExport.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Create zip\_artifacts record in apps/api/services/db/DiagramsRepo.ts when export starts (table\_zip\_artifacts) - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Create ZIP package (assemble PNG, SVG, schemas, examples, README):** As a: user, I want to: assemble PNG, SVG, schemas, examples, and README into a ZIP, So that: I have a complete, packaged diagram bundle**(9 hours)** - ZIP contains PNG, SVG, schemas (JSON), examples (JSON), and README ZIP can be downloaded and is not corrupted File list matches expected contents and counts
    
    *   API: Add createZipPackage handler in \`apps/api/routes/flow/diagram/export/zip.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ZIP assembly service in \`apps/api/services/zip/ZipService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchAssetContent() usage in \`apps/api/routes/flow/diagram/export/zip.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Download button in \`apps/web/components/flow/DownloadPanel.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Assets list UI in \`apps/web/components/flow/AssetsList.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create zip\_artifacts entry in \`apps/api/db/queries/zipArtifacts.ts\` and migration in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Generate README content in \`apps/api/services/zip/READMEGenerator.ts\` and store in \`readme\_packages\` table via \`apps/api/db/queries/readmePackages.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Test: Add integration test for ZIP creation in \`apps/api/tests/zip.test.ts\` verifying PNG, SVG, schemas, examples, README - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Upload ZIP to S3 in \`apps/api/services/zip/ZipService.ts\` using AWS S3 helpers \`libs/aws/s3.ts\` and create download link in \`apps/api/db/queries/downloadLinks.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Generate ZIP package with PNG+SVG and JSONs:** As a: product user, I want to: generate a ZIP package containing PNG, SVG, and JSON schema/examples, So that: I can download a complete diagram bundle for integration or archival**(12 hours)** - ZIP file is generated containing PNG, SVG, and at least one JSON file for schemas ZIP includes a manifest.json listing all files with sizes User can download the ZIP from the system and it is 100% intact (no corruption)
    
    *   API: Implement createZipPackage mutation in \`apps/api/routes/flow/diagram/export.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Build ZipService.createPackage in \`apps/api/services/zip/ZipService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Add image export PNG/SVG in \`apps/api/services/image/ImageService.ts\` using Sharp - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement ManifestGenerator.generate in \`apps/api/services/zip/ManifestGenerator.ts\` to list files and sizes - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement S3 upload in \`apps/api/services/storage/S3Service.ts\` for ZIP artifact storage - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create diagrams\_package record in \`apps/api/db/diagramsPackageRepo.ts\` and migration in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Store zip\_artifacts metadata in \`apps/api/db/zipArtifactsRepo.ts\` referencing table\_zip\_artifacts - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build DownloadPanel component in \`apps/web/components/flow/DiagramExportDownloadPanel.tsx\` (comp\_flow\_diagram\_export\_download\_panel) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route page in \`apps/web/pages/flow/diagram/export.tsx\` (route\_flow\_diagram\_export) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add onZipProgress subscription in \`apps/api/routes/flow/diagram/export.ts\` for progress updates (router\_route\_flow\_diagram\_export) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration test \`apps/api/tests/zipPackage.test.ts\` to verify ZIP contains PNG, SVG, JSON and manifest.json - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add E2E \`apps/web/tests/DiagramExport.e2e.ts\` to verify user can download intact ZIP - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Provide ZIP in-chat:** As a: user, I want to: provide the ZIP package via in-chat delivery, So that: I can access it directly without leaving the chat**(12 hours)** - ZIP link or attachment is delivered in-chat Link/attachment is accessible without authentication issues Denial or error cases handled gracefully with a message
    
    *   DB: Create diagrams\_package and zip\_artifacts migrations in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add requestZipExport handler in \`apps/api/routers/flow/diagramExport.ts\` to call \`services/zip/ZipService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ZipService.generateZip() in \`apps/api/services/zip/ZipService.ts\` to assemble files and upload to S3 - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement retryZipExport mutation in \`apps/api/routers/flow/diagramExport.ts\` with rate-limit handling - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ExportButton component in \`apps/web/components/flow/ExportZipButton.tsx\` to call router\_route\_flow\_diagram\_export requestZipExport - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add /flow/diagram/export page in \`apps/web/pages/flow/diagram/export.tsx\` using comp\_flow\_diagram\_export\_header - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add getExportOptions query in \`apps/api/routers/flow/diagramExport.ts\` to list available artifacts from \`table\_diagrams\` and \`table\_diagrams\_package\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement onZipStatus subscription in \`apps/api/routers/flow/diagramExport.ts\` to push status updates - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create download link record in \`apps/api/services/download/DownloadService.ts\` and \`prisma/migrations/\` for \`table\_download\_links\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Configure S3 bucket and presigned URL logic in \`apps/api/services/storage/S3Client.ts\` and env in \`apps/api/.env\` - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add integration test for requestZipExport in \`apps/api/tests/flow/diagramExport.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add user-facing error messages in \`apps/web/components/flow/ExportZipButton.tsx\` and \`apps/api/middleware/errorHandler.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Attach to ticket:** As a: support agent, I want to: attach the export artifacts to the corresponding ticket, So that: context is preserved for issue resolution**(14 hours)** - Export artifacts attached to ticket Ticket references include all asset links Attachment process handles large files gracefully Audit trail updated with attach action
    
    *   DB: Create diagrams\_exports migration in \`prisma/migrations/20251104\_create\_diagrams\_exports\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create zip\_artifacts migration in \`prisma/migrations/20251104\_create\_zip\_artifacts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement attach endpoint in \`apps/api/routes/attachments.ts\` to POST /tickets/:id/attach - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement AttachmentService.attachFile in \`apps/api/services/attachments/AttachmentService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement SupabaseStorage.uploadFile in \`apps/api/services/storage/SupabaseStorage.ts\` with multipart and resumable support - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ZipService.createZip in \`apps/api/services/zip/ZipService.ts\` for packaging diagrams\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement DownloadService.generateLink in \`apps/api/services/download/DownloadService.ts\` to create entries in \`prisma/migrations/\` and \`apps/api/services/download/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement AuditService.recordAttachment in \`apps/api/services/audit/AuditService.ts\` to update audit trail - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AttachToTicket component in \`components/attachments/AttachToTicket.tsx\` with drag-drop and progress - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add ticket attachments UI in \`app/tickets/\[id - (M) (1 hours)\[FE\]\[BE\]
        
    *   Integration: Wire Socket.io progress events in \`apps/api/services/attachments/AttachmentService.ts\` and \`components/attachments/AttachToTicket.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create download\_links migration in \`prisma/migrations/20251104\_create\_download\_links\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`tests/attachments/attach.test.ts\` for large file uploads and audit updates - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update docs in \`docs/attachments.md\` with API usage and file size guidance - (M) (1 hours)\[FE\]\[BE\]
        
*   **Include README:** As a: document specialist, I want to: include a README with usage and schema references in the export bundle, So that: users understand contents and usage**(6 hours)** - README present in bundle README content includes usage steps and schema references README renders correctly in text viewers Non-ASCII characters handled without corruption
    
    *   Doc: Create README.md in \`packages/diagrams/README.md\` with usage steps and schema references (include non-ASCII example) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update export handler in \`apps/api/routes/diagrams/export.ts\` to include README.md in ZIP bundle - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Save README to Supabase Storage via \`apps/api/services/storage/StorageService.ts\` when packaging\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add entry in \`apps/api/services/diagrams/DiagramsService.ts\` to record README presence in \`table\_diagrams\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration test in \`apps/api/tests/diagrams/export.test.ts\` verifying README in ZIP and UTF-8 handling - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   CI: Add pipeline step in \`.github/workflows/ci.yml\` to validate README renders in plain text viewers - (M) (1 hours)\[FE\]\[BE\]
        
*   **Include README:** As a: end user, I want to: include a README file in the ZIP package, So that: I have contextual guidance and usage notes**(4 hours)** - README.md exists in ZIP README contains at least installation and usage sections README size < 4KB
    
    *   Enhance: Implement README.md creation under apps/web/README.md (<4KB) with installation and usage sections. The task involves writing a static README file in repository, ensuring size <4KB and proper content to support downstream readme consumption by API and ZIP packaging. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Enhance: Implement API handlers getReadme() and updateReadme() at apps/api/routers/flow/diagram/export/readme.ts to read and modify the README content stored in apps/web/README.md or in a readme repository hook, using existing API framework (Next.js/Express-style routing) and validation layer. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Enhance: Build Frontend README Panel component at apps/web/components/flow/DiagramExport/ReadmePanel.tsx to display README content, allow basic edit if permitted, fetch via API, and render readme in panel with styling hooks. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Enhance: Add readme\_packages migration in prisma/migrations/ to reference readme\_packages table, ensuring schema migration exists and aligns with readmes usage in project. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Enhance: Update ZipService.ts to include apps/web/README.md in ZIP generation, ensuring file is included and path preserved. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Enhance: Add unit test at apps/api/tests/readme.test.ts to verify README existence and size (<4KB) during API-driven generation or validation path. - (XS) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Diagrams priority: export SVG/PNG: (4.5 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   Frontend: Implement UI controls to export diagrams; add Export buttons in apps/web/components/diagrams/DiagramsActionPanel.tsx, wired to route\_diagrams\_folder comp\_diagrams\_action\_panel; ensure proper state, loading indicators, and error display; integrate with existing DiagramsActionPanel structure. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement exportDiagram mutation in apps/api/routers/diagrams/export.ts; create/extend GraphQL/REST mutation (depending on stack) to trigger diagram export; coordinate with storage step for output artifacts; return status with artifact reference or error. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Add S3 upload logic in apps/api/services/storage/S3Service.ts and integrate in apps/api/routers/diagrams/export.ts; implement upload of zip artefacts to S3 with proper bucket, key naming, ACL, and error handling; return uploaded URL/key to API layer. - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Insert zip\_artifacts record in apps/api/services/artifacts/ArtifactService.ts and migration in prisma/migrations/ (table\_zip\_artifacts); ensure schema aligns with stored artifact data (artifact\_id, url, key, diagrams\_id, created\_at) and provide transactional integrity. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Validation/Errors: Add validation and error handling in apps/web/components/diagrams/DiagramsActionPanel.tsx and apps/api/routers/diagrams/export.ts; add input guards, error responses, and user-facing messages; ensure consistent error taxonomies across frontend/backend. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests & Docs: Add integration tests in apps/api/tests/export.test.ts and update README.md at project root (router\_route\_diagrams\_folder); ensure end-to-end flow tested from frontend action to S3 upload and DB insert; update docs to reflect new export flow. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Prepare README.md: (9 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   Docs: Create README template file \`diagrams/README\_TEMPLATE.md\` in \`apps/api/diagrams/README\_TEMPLATE.md\` preserving architecture references and providing placeholder sections for diagrams, usage notes, contribution guidelines, and validation hooks; ensure path alignment with diagram-related API/docs structure. - (XS) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement fetchReadme() in \`apps/api/routes/diagrams/readme.ts\` using existing Express/Next.js API route patterns to retrieve README content from storage (DB or filesystem) and return JSON with content and metadata. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement uploadReadme() in \`apps/api/routes/diagrams/uploadReadme.ts\` to store provided README content via POST, supporting contentType and metadata, and handling overwrite or versioning strategy. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build README Viewer component \`components/diagrams/READMEViewer.tsx\` for route \`/diagrams/folder\` to display README content with basic formatting, fetch data from API, and support navigation between diagrams folders. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add responsive styles in \`styles/diagrams/READMEViewer.module.css\` and integrate in \`pages/diagrams/folder.tsx\` to ensure README viewer adapts to breakpoints and mobile layouts. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Validation: Add server-side README validation in \`apps/api/lib/validate/readmeValidator.ts\` to enforce content structure, allowed sections, and length constraints before storage. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Create readmes table migration in \`prisma/migrations/readmes\` to store README content and metadata - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Wire createReadme and uploadReadme mutations in \`apps/api/routers/diagramsRouter.ts\` to expose server-side operations from the frontend. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Accessibility: Add ARIA and keyboard support in \`components/diagrams/READMEViewer.tsx\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   ErrorHandling: Implement user-friendly error messages in \`apps/api/middleware/errorHandler.ts\` and \`components/diagrams/READMEViewer.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add unit tests for \`apps/api/lib/validate/readmeValidator.ts\` and \`components/diagrams/READMEViewer.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update top-level \`README.md\` in project root with usage and contribution notes and link to \`diagrams/README\_TEMPLATE.md\` - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Export all JSON schemas: (9 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   API: Implement exportAllSchemas mutation handler in apps/api/routers/diagrams/exportAllSchemas.ts, enabling server-side aggregation of schemas for export and returning a tar/zip payload or schema list. Ensure authentication, proper input validation, and error handling against existing Diagram and Schema models. - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Add zip\_artifacts record creation in apps/api/services/zip/ZipService.ts to track generated archives for exports, embedding metadata (diagram IDs, schema counts, creation timestamp) and enabling later retrieval and audit. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement schema aggregation logic in apps/api/services/schemas/SchemaService.ts to collect and deduplicate schemas across diagrams, respecting versioning and compatibility rules, and producing a consumable payload for export. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Upload generated zip to S3 in apps/api/services/storage/S3Service.ts, integrating with existing storage layer, handling multipart uploads if large, and ensuring metadata tagging. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Export Schemas button in apps/web/components/diagrams/ExportSchemasButton.tsx to trigger export flow, show status, and handle results (download link or archive). - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend Route: Create /diagrams export page in apps/web/app/diagrams/export/page.tsx referencing comp\_diagrams\_file\_list and providing export progress feedback. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Validation: Add JSON schema validation in apps/api/services/schemas/Validator.ts to verify schema compatibility and schema structure before export. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add integration tests for export flow in apps/api/tests/exportAllSchemas.test.ts validating end-to-end behavior from mutation to storage/upload. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Export all example JSONs: (9 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Add zip\_artifacts migration in \`prisma/migrations/\` to store export metadata\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement exportAllExamples mutation in \`apps/api/routers/diagrams.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement export logic in \`apps/api/services/export/ExportService.ts\` to collect examples, zip, upload to S3 and create record - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ExportExamplesButton component in \`components/diagrams/ExportExamplesButton.tsx\` with responsive accessible UI - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hook in \`hooks/diagrams/useExportExamples.ts\` to call exportAllExamples mutation - (M) (1 hours)\[FE\]\[BE\]
        
    *   Validation: Add server-side validation in \`apps/api/services/export/ExportService.ts\` for example JSON formats and in \`components/diagrams/ExportExamplesButton.tsx\` for client-side checks - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   ErrorHandling: Implement error feedback in \`components/diagrams/ExportExamplesButton.tsx\` and \`apps/api/routers/diagrams.ts\` with user-friendly messages - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test \`apps/api/tests/exportAllExamples.test.ts\` for exportAllExamples flow - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update \`README.md\` and \`diagrams/implementation-diagram.png\` references for export feature - (M) (1 hours)\[FE\]\[BE\]
        
*   **Prepare ZIP package:** As a: product engineer, I want to: prepare a ZIP package containing diagrams, schemas, examples, and README, So that: I can deliver a ready-to-distribute artifact for customers**(6.5 hours)** - ZIP file is created with correct top-level structure and all required folders/files Generated ZIP passes integrity check (CRC/size) ZIP package contains diagrams, schemas, examples, and README at expected paths
    
    *   Dev: Implement generator script to assemble folder structure for ZIP package under apps/api/scripts/generateZipPackage.ts, producing a ready-to-package in-memory or filesystem structure matching apps/api/templates/zip contents and assets. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Dev: Expose API endpoint POST /zip-packages in apps/api/routes/zipPackages.ts to trigger generation by invoking the generator script and return a reference to the produced ZIP package. Uses Express-like routing within the existing API stack with auth middleware. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Dev: Implement ZIP creation in apps/api/services/zip/ZipService.ts that constructs the ZIP from the generated folder structure, computes CRC and size metadata, and exposes metadata for storage and testing. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Dev: Persist zip package details by storing a record in apps/api/models/zipPackageModel.ts and creating a table\_zip\_packages entry, including references to storage location, CRC, size, and timestamps. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Dev: Include example assets: diagrams/schemas/examples and README templates under apps/api/templates/zip/ to be included in the ZIP and documented for consumers. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Quality: Write integration test for ZIP integrity in apps/api/tests/zipPackage.test.ts to validate CRC and size across generated ZIP against expected values. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Infra: Integrate with Supabase Storage by implementing uploads in apps/api/services/storage/SupabaseStorage.ts and link uploaded ZIPs back to zipPackages records. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Docs: Generate README in apps/api/templates/zip/README.md and ensure the included asset path is preserved in the ZIP, with documentation referencing structure and usage. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   🧰 **Add worker pseudocode JS:** As a: developer, I want to: add worker pseudocode JS to the ZIP package, So that: the package includes runnable scaffolding for workers**(3 hours)** - Pseudocode JS file exists in package Code passes linting rules Pseudocode compiles or runs in sandbox ZIP manifest includes worker JS Edge case: missing dependencies handled gracefully
    
    *   Dev: Create worker pseudocode JS in \`packages/zip/workers/workerPseudocode.js\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Dev: Add lint rules and eslint config in \`packages/zip/.eslintrc.js\` - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Dev: Add TypeScript declaration in \`packages/zip/types/workerPseudocode.d.ts\` - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   QA: Create sandbox run script in \`packages/zip/scripts/runWorkerSandbox.js\` - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Dev: Update ZIP manifest to include worker in \`packages/zip/manifest.json\` - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Add CI lint step in \`.github/workflows/ci.yml\` to lint \`packages/zip/workers/workerPseudocode.js\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   QA: Add graceful dependency check in \`packages/zip/scripts/checkDeps.js\` - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   📄 **Add SOW document:** As a: project manager, I want to: add a SOW document to the ZIP package, So that: stakeholders have a formal scope and agreement included with the package**(8 hours)** - SOW document file is added to the ZIP package in the correct directory SOW metadata (filename, version) is included in the package manifest System validates that the SOW is a valid, non-corrupted document before packaging Package can be downloaded with the SOW present Edge case: if SOW file is missing, packaging fails with a clear error
    
    *   DB: Create zip\_asset model and migration in \`prisma/migrations/20251104\_add\_zip\_assets\_table/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add SOW validation util in \`apps/api/services/validation/SowValidator.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement ManifestService.updateWithSow(filename, version) in \`apps/api/services/package/ManifestService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ZipService.addFileToPackage(filePath) in \`apps/api/services/package/ZipService.ts\` to include SOW into ZIP\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API Route: Add handler for \`/zip/package/doc\` to package ZIP with SOW in \`apps/api/routes/zip/package/doc/handler.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Update zip\_package\_assets insert logic in \`apps/api/services/package/ZipService.ts\` to record SOW metadata in \`prisma/\` operations - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Create integration tests in \`apps/api/tests/zip\_package\_sow.test.ts\` for packaging, validation, download, and missing SOW error - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add docs for SOW packaging in \`docs/zip-package.md\` and update README.md in package root - (M) (1 hours)\[FE\]\[BE\]
        
*   🔁 **Add WindSurf tasks CSV:** As a: build engineer, I want to: add WindSurf tasks CSV to the ZIP package, So that: task data is available for downstream processing**(8 hours)** - WindSurf CSV is generated with correct headers CSV is included in ZIP ZIP manifest lists WindSurf CSV with correct path Corrupt CSV is rejected with meaningful error Duplicate entries are detected and handled
    
    *   API: Add WindSurf CSV generator in \`apps/api/services/zip/ZipService.ts\`: create headers and rows - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Include WindSurf CSV in ZIP in \`apps/api/services/zip/ZipService.ts\` and update \`apps/api/routes/zip/package/doc.ts\` to reference file path - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add ZIP manifest entry for WindSurf CSV in \`apps/api/services/zip/ManifestService.ts\` with path \`diagrams/windsurf/tasks.csv\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement CSV validation for corruption in \`apps/api/services/validation/CsvValidator.ts\` (reject corrupt CSV with error) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement duplicate detection for WindSurf entries in \`apps/api/services/validation/DedupService.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add unit tests for CSV generation and headers in \`apps/api/tests/zip/windsurf\_csv.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add integration test ensuring CSV included in ZIP and manifest lists it in \`apps/api/tests/zip/zip\_integration.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update route docs in \`apps/api/routes/zip/package/doc.ts\` to document WindSurf CSV path and error cases - (M) (1 hours)\[FE\]\[BE\]
        
*   **Include diagrams PNG/SVG:** As a: architect, I want to: include diagrams PNG and SVG into the ZIP package, So that: users can view visuals in multiple formats**(8 hours)** - PNG diagrams present for all diagrams SVG diagrams present for all diagrams No broken image references in manifest
    
    *   Diagrams: Generate PNG diagram1.png from sources and place at apps/api/diagrams/diagram1.png using the project's diagram generation tooling (e.g., canvas/diagram generator). Ensure source-to-PNG conversion preserves layout and fonts; store under diagrams/ directory with proper file permissions. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Diagrams: Export diagram1.svg as vector from sources via the vector diagram tool; save to apps/api/diagrams/diagram1.svg. Maintain SVG structure, viewBox, and styling; ensure accessibility attributes where applicable. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Diagrams manifest: Create apps/api/diagrams/manifest.json listing PNG and SVG paths (diagram1.png, diagram1.svg) for diagrams package, exposing relative paths and a version field. Include a hash or checksum reference if used by the zip package. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Zip endpoint: Implement API endpoint in apps/api/routes/zip.ts to package diagrams/, schemas/, examples/, README.md into a zip archive and serve it as a streaming response. Ensure content-type and content-disposition headers, and handle large payload without memory explosion. - (L) (2 hours)\[FE\]\[BE\]
        
    *   DB migration: Add migration in prisma/migrations to update table\_zip\_packages schema to accommodate new zip\_packages data (e.g., new columns or altered types for manifest or size). Include up/down migrations. - (M) (1 hours)\[FE\]\[BE\]
        
    *   ZipService: Implement storeZipRecord() in apps/api/services/zip/ZipService.ts to insert a new record into table\_zip\_packages with fields like id, createdAt, size, manifest, and paths. Ensure idempotency and handle conflicts. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build DownloadZip.tsx component to render a download link or button that navigates to /api/zip and triggers browser download. Include basic loading/error states and accessibility attributes. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration test at apps/api/tests/zip.test.ts to request /api/zip and verify that the response contains PNG/SVG assets and that the manifest.json inside the zip has no broken refs. Validate HTTP status and content-type, and perform basic zip inspection. - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
*   **Add JSON schemas:** As a: developer, I want to: add JSON schemas to the ZIP package, So that: consumers can validate data against the definitions**(8 hours)** - Schemas validated against sample data Schemas included under schemas/ directory in ZIP Schema files are minified or formatted with consistent indentation
    
    *   Create schemas directory and placeholder README in apps/api/schemas/README.md with initial project structure and docs placeholder - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Add JSON schema file package.schema.json in apps/api/schemas/package.schema.json with base schema for package metadata - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Add JSON schema file diagrams.schema.json in apps/api/schemas/diagrams.schema.json describing diagrams data model - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Add JSON schema file examples.schema.json in apps/api/schemas/examples.schema.json for example datasets - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Implement validation script in apps/api/scripts/validateSchemas.ts to validate schemas against apps/api/schemas/samples/ data - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Add sample data files in apps/api/schemas/samples/package.sample.json, diagrams.sample.json, examples.sample.json - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Integrate schemas into ZIP generator in apps/api/scripts/zipPackage.ts to include schemas/ directory - (M) (1 hours)\[FE\]\[BE\]
        
    *   Add formatting/minification step in apps/api/scripts/zipPackage.ts to ensure consistent indentation or minify schema files - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Add unit tests in apps/api/tests/schemaValidation.test.ts to assert schemas validate sample data - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Add CI workflow update in .github/workflows/zip.yml to run node apps/api/scripts/validateSchemas.js and include schemas in artifact - (L) (2 hours)\[FE\]\[BE\]
        
*   **Add examples JSON:** As a: developer, I want to: add examples JSON to the ZIP package, So that: users can see concrete data structures and usage**(4.5 hours)** - Examples JSON files present for each schema Examples validate against corresponding schemas (where applicable) Examples located under examples/ directory in ZIP
    
    *   Create examples directory and placeholder README in packages/zip/README.md with a minimal overview of available examples and structure, preserving existing ZIP package location conventions and using Markdown. Ensure directory exists and README is tracked in version control. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Populate packages/zip/examples/ with example JSON files aligned to each schema under packages/zip/schemas, following naming convention schemaName.example.json, ensuring valid JSON syntax and alignment to respective schema definitions. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Implement TypeScript validation script at packages/zip/scripts/validateExamples.ts that loads all examples in packages/zip/examples, validates against corresponding schemas in packages/zip/schemas using the project’s validation logic (e.g., JSON schema or TS-based validators), and reports mismatches. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Add npm script in packages/zip/package.json to run ts-node packages/zip/scripts/validateExamples.ts, enabling a quick validation flow during development. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Add unit test in packages/zip/tests/validateExamples.test.ts to assert all examples pass schema validation, mocking filesystem and schemas where appropriate. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Update ZIP assembly logic to include packages/zip/examples/ when building ZIP in packages/zip/scripts/buildZip.ts, ensuring examples are packaged with the zip artifact. - (M) (1 hours)\[FE\]\[BE\]
        
*   📄 **Add DDL SQL:** As a: database administrator, I want to: Add DDL SQL, So that: The ZIP package includes schema creation statements for quick deployment.**(5 hours)** - DDL file present under schemas/ with .sql extension SQL parses without syntax error in standard parser Files referenced by DDL exist (tables, indexes) Checksum/manifest validates presence and size
    
    *   DDL: Implement generation of schemas/package.ddl.sql with table and index definitions; ensure all referenced names align with existing schema and architecture references; integrate with ZipBuilder or packaging flow to place file under schemas directory. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add SQL parse validation test in tests/sql/parse.test.ts using the project's standard SQL parser to validate the created DDL in schemas/package.ddl.sql. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Integration: Implement reference existence checker in apps/api/routers/diagrams.ts to verify files referenced by DDL exist (e.g., referenced tables, schemas, and modules) before packaging or deployment. - (L) (2 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Implementation: Add manifest/checksum generation in apps/api/services/package/ZipBuilder.ts to record file presence and size for schemas/package.ddl.sql in the package manifest. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Delivery: Expose schemas listing in /zip/package/doc route by updating route\_zip\_package\_doc component to include schemas/package.ddl.sql - (S) (0.5 hours)\[FE\]\[BE\]
        
*   🔐 **Add RLS SQL:** As a: database administrator, I want to: Add RLS SQL, So that: Row-level security policies are provisioned within the sample schema.**(4.5 hours)** - RLS SQL present under schemas/ with .sql extension RLS policies reference existing tables SQL valid and parsable Documentation references policy names in readme or schemas
    
    *   DB: Create folder \`schemas/rls/\` and placeholder \`.gitkeep\` in \`schemas/rls/.gitkeep\` preserving repository structure for RLS SQL assets and ensuring the directory exists for subsequent files. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policies file \`schemas/rls/policies.sql\` with policies referencing \`users\`, \`zip\_packages\`, \`zip\_package\_assets\` tables, defining RLS policies and policy names that will be invoked by application code. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add helper functions \`schemas/rls/functions.sql\` used by policies in \`schemas/rls/functions.sql\`, including function definitions for reusability in policies and any required security-barrier logic. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Dev: Implement SQL validation script in \`scripts/validate\_sql.ts\` to parse \`schemas/rls/\*.sql\` and report syntax or reference errors, integrating with existing project validation workflow. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add parse test \`tests/sql/parsePolicies.test.ts\` to ensure SQL is valid and parsable, validating that policies.sql and functions.sql compile with the parser used in the project. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update \`schemas/README.md\` to reference policy names defined in \`schemas/rls/policies.sql\` and document their purpose and usage within RLS. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Docs: Update root \`README.md\` ( \`/README.md\`) to list RLS policy names and paths \`schemas/rls/policies.sql\` for discoverability, including a short note on how to extend policies. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Ensure buildPackage in \`apps/api/routers/diagrams.ts\` includes \`schemas/rls/\*.sql\` in zip output, so RLS SQL assets are packaged for deployment. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
*   🧪 **Add seed SQL:** As a: developer, I want to: Add seed SQL, So that: The ZIP includes initial data for quick testing.**(2.5 hours)** - Seed SQL file under schemas/seed/ with .sql SQL inserts execute without errors in test environment Data volume within expected limits Document seed data overview in readme
    
    *   DB: Create seed SQL file \`schemas/seed/seed.sql\` with INSERTs for required tables (limit rows) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add test seed runner script in \`scripts/run-seed-test.ts\` to execute \`schemas/seed/seed.sql\` against test DB using Prisma/pg - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add test \`tests/seed/seed.spec.ts\` to run \`scripts/run-seed-test.ts\` and assert no errors and expected row counts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Update \`schemas/seed/README.md\` with seed data overview and volume limits - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   🗂 **Add schemas JSON:** As a: developer, I want to: Add schemas JSON, So that: The ZIP includes a machine-readable schema definition for tooling.**(3 hours)** - schemas.json exists under schemas/ JSON is valid and adheres to schema schema Contains all defined tables with correct fields Validation against a sample ORM model passes
    
    *   API: Create schemas folder and add schemas/schemas.json with a base schema listing all tables and fields. Ensure path schemas/schemas.json exists and is consumable by API and validators. Provide structure reflecting tables with fields and types. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add endpoint to fetch schemas in apps/api/routers/diagrams.ts implementing fetchSchemasAndExamples to read schemas/schemas.json and return it, with proper error handling and 200 OK on success. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Scripting: Add Prisma model validation script in scripts/validateSchemasAgainstPrisma.ts to validate the contents of schemas/schemas.json against Prisma models defined in prisma/schema.prisma. Use JSON parsing and Prisma introspection concepts to compare model names and fields. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add unit test to validate JSON and schema adherence in tests/schemas/schemas.test.ts using AJV to validate schemas/schemas.json against schemas/schema-schema.json. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Data: Add sample ORM model example in schemas/examples/sampleOrmModel.json and run validation in scripts/validateSchemasAgainstPrisma.ts to ensure the sample model validates against Prisma schema. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   🧾 **Add examples JSON:** As a: developer, I want to: Add examples JSON, So that: The ZIP provides example payloads for integration testing.**(5 hours)** - examples.json exists under examples/ JSON validity check passes Contains representative example payloads for each endpoint Size and structure aligned with readme examples
    
    *   zip/package/examples/examples.json file creation with a placeholder structure to define the examples JSON schema for endpoints in the zip package README - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Populate zip/package/examples/examples.json with representative payloads for each endpoint, aligning with example payloads described in zip/package/README.md - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Add JSON schema validator and tests in apps/api/utils/jsonValidator.ts and apps/api/tests/examplesJson.test.ts to validate shapes of examples.json against defined schema - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Expose examples via API: implement fetchSchemasAndExamples resolver in apps/api/routers/diagrams.ts to serve schemas and examples to clients - (M) (1 hours)\[FE\]\[BE\]
        
    *   Add CI validation: script at ci/scripts/validate\_examples.sh validates zip/package/examples/examples.json and wire it into CI workflow at .github/workflows/ci.yml - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
*   🖼 **Include PNG export:** As a: designer, I want to: include PNG export of diagrams in the ZIP package, So that: visual artifacts are available for quick review**(5.5 hours)** - PNG files are generated for all diagrams PNG files are included in ZIP under diagrams/png ZIP manifest references PNG assets Images pass basic integrity check (valid PNG) Edge case: diagrams missing PNGs triggers fallback or warning
    
    *   API: Implement PNG generation utility at apps/api/services/images/generatePng.ts using Sharp/OpenCV to render diagrams as PNGs for the ZIP package. Integrates with existing image service layer and respects manifest schema. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Extend ZIP builder at apps/api/routes/zip/package.ts to include diagrams/png/ directory and manifest entries for PNG assets created by the PNG generator. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Create zip\_package\_assets records in apps/api/db/zipPackageAssets.ts when PNGs are created (refs table\_zip\_assets) to link PNG assets to the package. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement PNG integrity check in apps/api/services/images/verifyPng.ts to validate PNG integrity, headers, and correctness before packaging. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add fallback/warning logic in apps/api/routes/zip/package.ts to log missing PNGs and mark manifest accordingly when PNGs are absent. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add export PNG button and status UI in apps/web/components/zip/ExportPngButton.tsx and wire the route route\_zip\_package\_doc to trigger PNG export and display status. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for PNG generation and verification in apps/api/tests/images/generatePng.test.ts (type: testing) to cover happy path and edge cases. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Update README in apps/api/README.md describing diagrams/png inclusion and manifest format (type: documentation) - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Add README.md:** As a: user, I want to: add README.md to the ZIP package, So that: provide quick start, overview, and usage instructions**(4 hours)** - README.md present with basic usage README contains sections for diagrams, schemas, and examples README.md renders correctly in standard viewers
    
    *   Documentation: Implement initial README.md scaffold at README.md with a minimal usage skeleton and placeholders for diagrams, schemas, and examples, aligned with project MVP scope and general usage patterns. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Documentation: Create diagrams folder and add sample diagram at diagrams/architecture.drawio, preserving diagram format compat with draw.io editor and referencing architecture discussion in README. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Documentation: Create schemas folder and add sample SQL schema at schemas/database\_schema.sql, ensuring SQL is valid and aligned with basic MV README examples. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Documentation: Create examples folder and add sample usage document at examples/basic\_usage.md, ensuring Markdown content demonstrates a typical MVP usage. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Documentation: Update README.md to populate sections for diagrams, schemas, and examples, and include usage examples in README.md using the created assets. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Documentation: Add CI check at .github/workflows/markdown-lint.yml to validate README rendering and basic markdown correctness on PRs. - (M) (1 hours)\[FE\]\[BE\]
        
*   📦 **Include SVG diagram:** As a: user, I want to: Include an SVG diagram, So that: The ZIP package contains a scalable vector diagram for diagrammatic reference.**(5.5 hours)** - SVG file is present in the ZIP under diagrams/ with correct .svg extension SVG renders in a browser viewer without missing elements SVG file metadata includes width and height attributes ZIP package integrity validates against a known manifest
    
    *   Create SVG file at diagrams/diagram.svg with width/height metadata in packages/assets/diagrams/diagram.svg while keeping existing repository structure intact and ensuring valid SVG syntax and viewBox attributes for scalable rendering. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Add a Node/TypeScript script at packages/scripts/generate-zip.ts to package diagrams/diagram.svg into dist/zip/package.zip, updating manifest accordingly and ensuring deterministic zip structure. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Implement ZipService.generatePackage() in apps/api/services/zip/ZipService.ts to assemble ZIP from dist/zip and validate the manifest, ensuring proper error handling and idempotent packaging. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Add API route handler in apps/api/routes/diagrams.ts for /diagrams/export to return ZIP using router\_route\_diagrams\_folder route, including proper auth and content-type headers. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Create frontend ZipViewer component in apps/web/components/zip/ZipViewer.tsx to fetch the ZIP from route\_zip\_package\_doc and preview SVG content inside the browser, handling loading/error states and SVG rendering from within ZIP archive. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Add tests and manifest validation in packages/tests/zip.test.ts to ensure SVG presence, renderability, and metadata correctness within the ZIP package. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   📦 **Include PNG placeholder:** As a: user, I want to: Include a PNG placeholder, So that: The ZIP shows a visual placeholder when diagrams fail to render.**(3.5 hours)** - PNG file exists under diagrams/placeholder.png File size within expected range Can be opened without corruption in standard image viewer ZIP manifest lists placeholder.png
    
    *   FS: Add placeholder PNG at diagrams/placeholder.png and verify size range with filesystem checks and diagram rendering validation in the ZIP packaging flow. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add uploadPlaceholder endpoint in apps/api/routes/diagrams/uploadPlaceholder.ts to accept diagrams/placeholder.png with basic content-type validation and storage reference. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Insert placeholder asset row in apps/api/prisma/seed/zip\_assets\_seed.ts referencing diagrams/placeholder.png into table\_zip\_assets - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   ZIP: Update manifest generation in apps/api/services/zip/ZipService.ts to include diagrams/placeholder.png in ZIP manifest - (M) (1 hours)\[FE\]\[BE\]
        
    *   Test: Add image validation test in apps/api/tests/placeholder.test.ts to open diagrams/placeholder.png and check not corrupted - (XS) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   📘 **Add worker docs MD:** As a: developer, I want to: Add worker docs MD, So that: The ZIP includes documentation describing the worker's behavior and usage.**(4.5 hours)** - worker\_docs.md present Markdown validates (lint or parser) Documentation covers setup, usage, and examples Link references to code artifacts
    
    *   Docs: Create packages/docs/worker\_docs.md with setup, usage, examples and links to code artifacts preserving architecture references and including Tech Stack context (DocsService, MD formatting, and link artifacts) - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Add route doc page content in apps/web/pages/zip/package/doc.tsx referencing /zip/package/doc - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Expose fetchWorkerDocs in apps/api/routers/diagrams.ts (fetchWorkerDocs query) to serve worker\_docs.md - (M) (1 hours)\[FE\]\[BE\]
        
    *   Assets: Add example file diagrams/examples/worker\_example.js and reference in packages/docs/worker\_docs.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Link docs metadata in apps/api/services/docs/DocsService.ts and update prisma/migrations/ for zip\_package\_assets metadata - (M) (1 hours)\[FE\]\[BE\]
        
    *   CI: Add markdown lint workflow .github/workflows/mdlint.yml to validate worker\_docs.md - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Package: Ensure buildPackage mutation in apps/api/routers/diagrams.ts includes worker\_docs.md into ZIP output - (M) (1 hours)\[FE\]\[BE\]
        
*   **Prepare SQL seed:** As a: database administrator, I want to: prepare SQL seed data for SOW export, So that: the environment has consistent baseline data for testing and demo scenarios**(4.5 hours)** - Seed script runs without errors and creates required tables Seed data covers all edge cases (nulls, defaults) Seed data verified against schema constraints and relations Idempotent seed execution Performance impact on startup minimal
    
    *   DB: Create seed migration in apps/api/prisma/migrations/20251104\_create\_seed\_tables/ preserving existing Prisma migration conventions; outputs a SQL-based migration that creates seed tables and seeds basic schema with idempotent constraints. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Implement idempotent seed script in apps/api/prisma/seed/seed.ts using PrismaClient to upsert seed data into seed\_tables ensuring no duplicates on repeated runs and safe execution in existing runtime. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add createSeed and fetchSeedPreview in apps/api/routes/sow/package/seed.router.ts to expose seed creation and lightweight preview data, wiring to existing seed service and ensuring route-level validation. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Test: Add seed verification tests in apps/api/tests/seed.test.ts to validate migration outcome, idempotent seed, and API seed endpoints behavior. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Perf: Add startup seed gating in apps/api/server/startup.ts to minimize seed impact on startup latency and ensure seeds run conditionally. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Document seed usage and idempotency in docs/seed.md to explain how seeds are created, applied idempotently, and how to run seeds locally - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Validate SOW export:** As a: business user, I want to: validate SOW export data and structure, So that: I can trust the exported document meets requirements and accuracy expectations**(10 hours)** - Export contains all required sections and fields Data in export matches source system within tolerance Export file validates against defined schema constraints User can trigger re-export after corrections Audit trail exists for export actions
    
    *   API: Add validateSowExport mutation handler in \`apps/api/routers/sow/package.ts\` to validate against schema - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement exportSow mutation in \`apps/api/routers/sow/package.ts\` with re-export support and audit logging - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Export button and re-export flow in \`apps/web/routes/sow/package/page.tsx\` and \`components/comp\_sow\_package\_footer.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create fetchPackageSchemas query in \`apps/api/routers/sow/package.ts\` to provide export schema - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for SOW export in \`apps/api/tests/sow/export.spec.ts\` validating fields and schema - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Add export\_audits table migration in \`prisma/migrations/{timestamp}\_create\_export\_audits/\` to record export actions - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add getExportStatus query in \`apps/api/routers/sow/package.ts\` to report export progress - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add SOW Preview panel checks in \`apps/web/components/comp\_sow\_package\_preview.tsx\` to surface missing fields - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement validateSow logic in \`apps/api/services/sow/validateSow.ts\` comparing source data and tolerance - (M) (1 hours)\[FE\]\[BE\]
        
    *   Documentation: Update export validation docs in \`docs/sow/export\_validation.md\` with acceptance criteria and re-export steps - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Package JSON Schemas:** As a: data integration engineer, I want to: package JSON schemas for SOW export, So that: downstream systems can validate data contracts and ensure consistent serialization**(8.5 hours)** - Schema package loads without errors in schema registry All relevant SOW export JSON schemas are included in the package Schema versioning is applied and visible in package metadata Edge case: handle optional fields and deprecated properties gracefully
    
    *   API: Add getPackageSchemas handler in apps/api/routers/sow/packageRouter.ts with access to SchemaService to fetch and return aggregated SOW export schemas. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement validatePackage schema loader in apps/api/services/schemas/SchemaService.ts to validate and load package schemas for SOW exports. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement package builder in apps/api/services/schemas/PackageBuilder.ts to collate SOW export schemas into a packaged bundle for delivery. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add publishPackage mutation in apps/api/routers/sow/packageRouter.ts with version metadata to publish a new package version. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add schema registry integration in apps/api/services/schemas/RegistryClient.ts to upload package to central registry. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Create unit tests for SchemaService in apps/api/services/schemas/\_\_tests\_\_/SchemaService.test.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Create integration test for PackageBuilder + RegistryClient in apps/api/services/schemas/\_\_tests\_\_/PackageIntegration.test.ts - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add package preview action in apps/web/routes/sow/package/page.tsx to call getPackageSchemas - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Quality: Add documentation for schema package and versioning in docs/schemas/README.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Package SOW Export: (0 hours)**
    
*   **Include JSON Schemas: (0 hours)**
    
*   **Add SQL DDL/RLS: (0 hours)**
    
*   **Add Worker Pseudocode: (0 hours)**
    
*   **Add Diagrams: (0 hours)**
    
*   **Short README: filenames & usage: (4.5 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   Create top-level README.md documenting project filenames and short usage, path README.md, preserving references to API, frontend, DB where relevant, and listing key files created in MVP. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Add documentation section in apps/api/README\_API.md describing API endpoints for readme management, referencing AuthService.ts for authentication flow and prisma migrations in prisma/ for data changes. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Document short usage in apps/web/README\_frontend.md, referencing components/README\_USAGE.md and pages/index.tsx to illustrate how to render or access README data. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement CRUD endpoints for readme\_packages in apps/api/routes/readme.ts, ensuring RESTful behavior, proper validation, and connection to prisma for persistence. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Create readme\_packages migration in prisma/migrations/ to support storing readme package metadata. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ReadmeList component in components/readme/ReadmeList.tsx that lists filenames and usage, wiring to readme API endpoints. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add accessibility tests for README pages in tests/readme.accessibility.test.ts, ensuring ARIA semantics and keyboard navigation. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add README usage examples in docs/usage/examples.md with copyable snippets demonstrating usage. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Integration: unzip & import schemas: (7 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Add readme\_packages migration in prisma/migrations/20251104\_add\_readme\_packages keeping existing Prisma schema changes, enabling readme\_packages table creation for imported schemas. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement unzip and import endpoint in apps/api/routes/readme/import.ts to orchestrate unzip), validate, and trigger ZipProcessor and ReadmeImportService, returning appropriate HTTP status and messages. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Create ZipProcessor.processZip in apps/api/services/zip/ZipProcessor.ts to extract uploaded zip, read schema files, validate against schema rules, and return list of schemas or errors for downstream processing. - (L) (2 hours)\[FE\]\[BE\]
        
    *   API: Add Prisma import logic in apps/api/services/readme/ReadmeImportService.ts to store into readme\_packages table, linking imported schemas with packages and handling idempotency. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build UploadZip component in components/readme/UploadZip.tsx with accessibility and responsive UI to upload zip, show previews, drag-and-drop, and status status messages. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add progress and error handling in components/readme/UploadZip.tsx and hook in hooks/useUploadReadme.ts to reflect API progress, success, and error states. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in apps/api/tests/readmeImport.test.ts for unzip, validation, and DB write - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README usage in README.md with import instructions and examples, including CLI/API usage and example payloads. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Diagrams: PNG + SVG usage: (12 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB: Add diagrams columns to \`apps/api/prisma/migrations/\` for readme\_packages in \`prisma/migrations/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement uploadDiagram() in \`apps/api/services/readme/ReadmeService.ts\` to accept PNG/SVG and validate type - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add routes in \`apps/api/routes/readmeRoutes.ts\` for POST /readme/:id/diagram and GET /readme/:id/diagram - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Integrate Supabase Storage calls in \`apps/api/services/storage/SupabaseStorage.ts\` to store PNG and SVG - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Add image processing in \`apps/api/services/image/ImageService.ts\` using Sharp/OpenCV for PNG thumbnails - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build DiagramUploader component in \`apps/web/components/readme/DiagramUploader.tsx\` with responsive UI and accessibility - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build DiagramViewer component in \`apps/web/components/readme/DiagramViewer.tsx\` to render PNG and inline SVG safely - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add page integration in \`apps/web/app/readme/\[id - (M) (1 hours)\[FE\]\[BE\]
        
    *   Validation: Add server-side validation in \`apps/api/middleware/validateDiagram.ts\` to enforce size/type and sanitize SVG - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Update readme\_packages model in \`apps/api/prisma/schema.prisma\` and create migration in \`prisma/migrations/\` to reference diagrams - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Update README usage section in \`README.md\` with PNG+SVG integration examples and API docs \`docs/readme/diagrams.md\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`apps/api/tests/readme/diagram.test.ts\` for upload and retrieval - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Deployment: upload ZIP to storage: (7.5 hours)** - Story functionality is implemented as specified User interface is responsive and accessible Data is properly validated and stored Error handling provides helpful feedback
    
    *   DB migration: add columns zip\_path and uploaded\_at to readme\_packages in Prisma migrations; ensure backward compatibility and data migration plan; update types and indexes as required. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Introduce Supabase client in apps/api/lib/supabaseClient.ts to enable storage interactions; configure with project URL and anon/public key; export a typed client instance. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Implement upload endpoint in apps/api/routes/readme/upload.ts to accept multipart ZIP via HTTP POST; parse multipart form, validate file mime type, size limits, and auth; respond with status and resource location or error. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement saveZipToStorage in apps/api/services/readme/ReadmeService.ts to store ZIP to Supabase Storage; utilize Supabase client to upload, set metadata, and return storage path; handle errors and retries if necessary. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add validation and error handling in apps/api/routes/readme/upload.ts and apps/api/services/readme/ReadmeService.ts to cover missing files, invalid formats, oversized files, and storage failures; propagate clear error messages. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Build UploadZip component UI in apps/web/components/readme/UploadZip.tsx with accessible responsive form; include file input for ZIP, progress indicator, and validation messages. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Integrate uploading via React Query in apps/web/hooks/useUploadReadme.ts and call apps/api/routes/readme/upload.ts; show upload progress and handle success/error states. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Docs: Update README.md with usage and integration instructions for ZIP upload feature; include API routes, frontend components, and example payloads. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add API tests in apps/api/tests/readmeUpload.test.ts for upload success and error cases; mock storage client, verify status codes and responses, test validation paths. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests in apps/web/components/readme/UploadZip.test.tsx for accessibility and responsiveness; use testing-library and responsive checks. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        

### **Milestone 8: UI: Layman view, Data overview, Manager dashboard, weights UI, legend and landing visuals**

_Estimated 983 hours_

*   **Toggle: alternar visual Leigo/Técnico (legenda + ver métricas):** As a: Leigo usuario, I want to: toggle between layman and technical visual modes with a legend and metrics, So that: I can switch explanations easily.**(7 hours)** - Toggle control switches visual mode Legend updates to reflect mode Metrics remain visible and accurate in both modes No layout breakage when switching modes
    
    *   Frontend: Implement a Toggle UI control in components/layman/ToggleTechnicalLayman.tsx that switches between Layman and Technical modes. Wire the control to route\_layman and comp\_layman\_toggle for state management and rendering of the toggle in the layout. Ensure type-safe props and accessibility (aria-pressed, keyboard support). - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Update Toggle & Metrics Panel in components/layman/ToggleMetricsPanel.tsx to reflect current mode (Layman/Technical) and keep metrics visible when toggled. Link UI to route\_layman\_legend and comp\_layman\_toggle\_metrics for state propagation and rendering of the metrics panel edge. Ensure legend link toggles accordingly. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement setViewPreference mutation in apps/api/routes/layman/laymanRouter.ts to persist user view preference (Layman vs Technical) via router\_route\_layman. Ensure authentication context and input validation, and expose appropriate GraphQL/REST mutation wiring as per existing API style. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add fetchLegendConfig query in apps/api/routes/layman/legendRouter.ts and ensure router\_route\_layman\_legend returns mode-aware legend configuration based on current view (Layman/Technical). - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Update Legend panel in components/layman/LegendPanel.tsx to consume fetchLegendConfig and comp\_layman\_legend\_panel. Render legend items that adapt to current mode and ensure alignment with metrics panel when in technical mode. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Add/Update layman\_legends entries in prisma/migrations/ to support technical vs layman variants, updating table\_layman\_legends accordingly to store per-mode legend configurations. - (L) (2 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Integration: Persist user preference in apps/api/services/preferences/PreferenceService.ts and tie to table\_layman\_views and router\_route\_layman. Ensure PreferenceService reads/writes to DB and reflects in API responses. - (M) (1 hours)\[FE\]\[BE\]
        
    *   QA: Add visual/layout tests in tests/layman/toggle.spec.tsx and accessibility checks to ensure no layout breakage and metrics accuracy when toggling between modes. Include screenshot baselines and ARIA validation. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Manager: configurar thresholds por métrica e fazenda:** As a: Manager, I want to: configure thresholds per metric and farm, So that: I can tailor alerts and views to farm-specific goals.**(12 hours)** - Thresholds can be set per metric and per farm Changes persist across sessions Alerts trigger when thresholds breached UI validates inputs and prevents invalid configurations
    
    *   DB: Create threshold\_profiles migration in \`prisma/migrations/20251104\_create\_threshold\_profiles.sql\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement updateThresholds mutation in \`apps/api/routes/laymanAnnotations.ts\` (router\_route\_layman\_annotations) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add updateThresholds handler in \`apps/api/routes/laymanLegend.ts\` (router\_route\_layman\_legend) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Build ThresholdService.saveThresholds in \`apps/api/services/thresholds/ThresholdService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdForm component in \`components/layman/ThresholdForm.tsx\` (comp\_layman\_toggle\_metrics) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Thresholds panel to \`pages/layman/index.tsx\` (route\_layman) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdList in \`components/layman/ThresholdList.tsx\` (comp\_layman\_metrics) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Validation: Add client-side validation in \`components/layman/ThresholdForm.tsx\` ensuring valid numeric ranges - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Persistence: Ensure sessions persist via DB in \`apps/api/services/thresholds/ThresholdService.ts\` -> table\_threshold\_profiles - (M) (1 hours)\[FE\]\[BE\]
        
    *   Alerts: Emit alert events to \`subMetricUpdates\` via \`apps/api/services/thresholds/ThresholdService.ts\` when breached - (M) (1 hours)\[FE\]\[BE\]
        
    *   Subscriptions: Wire \`subMetricUpdates\` in \`apps/api/routes/laymanAnnotations.ts\` to notify frontends (subMetricUpdates) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`tests/api/thresholds.test.ts\` covering set/get and alerts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Dynamic visuals: generate silhouette + annotated photo + short label (ruim/ok/ótimo):** As a: field technician, I want to: generate a silhouette and annotate visuals with a short label so that: I can quickly communicate field conditions**(10 hours)** - Silhouette generation succeeds for input images Annotated photo includes label with correct Portuguese term Generated visuals render in UI with responsive scaling
    
    *   API: Add image processing endpoint POST /api/layman/process in \`apps/api/routes/layman/process.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement silhouette generation using OpenCV in \`apps/api/services/image/ImageProcessor.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement annotation overlay and label classification in \`apps/api/services/image/Annotator.ts\` (uses TensorFlow.js/OpenAI) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Storage: Save processed images to S3 in \`apps/api/services/storage/S3Service.ts\` and record metadata in \`prisma/layman\_images.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create migration for \`layman\_images\` in \`prisma/migrations/\` to match table\_layman\_images - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LaymanImageDisplay component in \`apps/web/components/layman/LaymanImageDisplay.tsx\` for silhouette + annotated photo + label - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route integration in \`apps/web/pages/layman/index.tsx\` (route\_layman) to call /api/layman/process via React Query - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Create annotations page view in \`apps/web/pages/layman/annotations.tsx\` (route\_layman\_annotations) to list images from table\_layman\_images - (M) (1 hours)\[FE\]\[BE\]
        
    *   UI: Add responsive CSS in \`apps/web/styles/layman.css\` and Tailwind config to ensure responsive scaling - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add unit tests for \`apps/api/services/image/ImageProcessor.test.ts\` and integration test for \`apps/api/routes/layman/process.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Gado: silhueta anotada dinâmica (vermelho/amarelo/verde) + texto curto + ver métricas:** As a: Leigo usuário, I want to: visualize a dynamic annotated silhouette with color codings and concise text, So that: I can quickly gauge performance metrics.**(6 hours)** - User can view a dynamic silhouette with color states vermelho/amarelo/verde Short accompanying text is displayed Verified metrics are visible and up-to-date System handles silhouette rendering without errors
    
    *   API: Add fetchSilhouetteState query in apps/api/routes/layman/router.ts to return color state and shortText - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add fetchGadoMetrics query in apps/api/routes/layman/router.ts to return verified metrics - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add silhouette\_state and short\_text columns migration in prisma/migrations/ for table\_layman\_images - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build GadoSilhouette component in components/layman/GadoSilhouette.tsx to render dynamic SVG with vermelho/amarelo/verde and short text - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate GadoSilhouette into pages/layman/index.tsx (route\_layman) and connect to router\_route\_layman queries via React Query - (M) (1 hours)\[FE\]\[BE\]
        
    *   Realtime: Implement subSilhouetteUpdates subscription handling in apps/api/routes/layman/router.ts and client in components/layman/GadoSilhouette.tsx using Socket.io/React Query subscriptions - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for components/layman/GadoSilhouette.test.tsx and integration tests for API queries in apps/api/tests/layman/silhouette.test.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Forragem: foto anotada + silhueta colorida (vermelho/amarelo/verde) + texto curto + ver métricas:** As a: Leigo usuário, I want to: see an annotated forage image with colored silhouette and concise text, So that: I can quickly interpret forage status alongside metrics.**(8.5 hours)** - Annotated image renders with color-coded silhouette Short text accompanies image Metrics pane shows current values Image loads reliably with no distortion No accessibility issues in color usage
    
    *   Frontend: Implement ForragemAnnotatedPanel component at components/layman/ForragemAnnotatedPanel.tsx, rendering a color silhouette overlay (red/yellow/green) atop the uploaded forage photo and displaying a concise annotation text. Integrates with comp\_layman\_main\_forragem for shared visuals and state management; ensure compatibility with existing styling system and responsive layout. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add fetchForragemAnnotation handler in apps/api/routers/layman/annotations.ts returning annotation, silhouette mask path, and metrics using router\_route\_layman\_annotations contract. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Service: Implement image processing in apps/api/services/image/ForageImageService.ts to generate a color-coded silhouette (red/yellow/green) using OpenCV or TensorFlow.js, ensuring no distortion and alignment with the annotation mask. Consumes input from router\_route\_layman\_annotations, outputs silhouette\_mask\_path and confidence/metrics. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Storage: Update uploadForagePhoto in apps/api/routers/layman/index.ts to store image in S3 and metadata in table\_layman\_images, including silhouette\_mask\_path and annotation\_text fields. - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add migration to create/alter table\_layman\_images with fields for silhouette\_mask\_path and annotation\_text in prisma/migrations to support new metadata. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add MetricsDrawer in components/layman/MetricsDrawer.tsx to display current values from router\_route\_layman\_annotations using comp\_layman\_metrics; ensure syncing with live data and accessible UI. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Accessibility: Implement color contrast check and alt text enforcement in components/layman/ForragemAnnotatedPanel.tsx and test in tests/forragem/accessibility.test.ts (references comp\_layman\_main\_forragem) ensuring compliance with accessibility standards. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   QA: Add integration tests in tests/forragem/forragem.integration.test.ts to verify image loads without distortion, silhouette colors correct, text present, and metrics displayed (router\_route\_layman\_annotations comp\_layman\_main\_forragem comp\_layman\_metrics table\_layman\_images) - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
*   **Manager: configurar thresholds por métrica e fazenda: (40 hours)**
    
    *   DB: Add threshold\_profiles migration in \`prisma/migrations/\` to include metric, farm\_id, min,max,profile\_name\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create thresholds router in \`apps/api/routes/thresholds.ts\` with endpoints GET /thresholds, POST /thresholds, PUT /thresholds/:id (4 hours)\[FE\]\[BE\]
        
    *   API: Implement service methods in \`apps/api/services/thresholds/ThresholdsService.ts\` for createThreshold(), updateThreshold(), getThresholdsByFarm()\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPage component in \`apps/web/components/layman/ThresholdsPage.tsx\` under route \`route\_layman\` to list and edit thresholds (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create ThresholdForm component in \`apps/web/components/layman/ThresholdForm.tsx\` to configure metric, farm, min, max (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Add validation middleware in \`apps/api/middleware/validation.ts\` for thresholds payloads (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   DB: Seed default threshold profiles in \`prisma/seed.ts\` for sample farms and metrics (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Connect ThresholdsPage to API using React Query in \`apps/web/hooks/useThresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/thresholds.test.ts\` for endpoints (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Add usage docs in \`docs/layman/thresholds.md\` and update \`route\_layman\` README (4 hours)\[FE\]\[BE\]
        
*   **Gado metrics mapping: peso vs meta, GMD 7/30d, BCS (thresholds configurable):** As a: ranch manager, I want to: map cattle metrics to targets so that: I can track performance against goals**(10 hours)** - Peso vs meta visualization updates when weight changes GMD 7/30d metric updates and trends visible BCS thresholds configurable and persisted across sessions
    
    *   DB: Add thresholds columns to \`prisma/migrations/20251104\_add\_threshold\_profiles/\` - update \`prisma/schema.prisma\` and create migration in \`prisma/migrations/20251104\_add\_threshold\_profiles/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create thresholds CRUD in \`apps/api/routes/thresholds.ts\` and service in \`apps/api/services/thresholds/ThresholdService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add metrics endpoint GMD in \`apps/api/routes/metrics.ts\` and implement logic in \`apps/api/services/metrics/MetricService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PesoVsMetaChart component in \`apps/web/components/metrics/PesoVsMetaChart.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build GMDTrend component in \`apps/web/components/metrics/GMDTrend.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build BcsThresholdsEditor in \`apps/web/components/metrics/BcsThresholdsEditor.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate components in \`apps/web/routes/route\_layman/LaymanViewPage.tsx\` to fetch from \`apps/api/routes/metrics.ts\` and \`apps/api/routes/thresholds.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Seed default BCS thresholds in \`prisma/seed/seedThresholds.ts\` updating table\_threshold\_profiles - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for MetricService in \`apps/api/services/metrics/\_\_tests\_\_/MetricService.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests for PesoVsMetaChart in \`apps/web/components/metrics/\_\_tests\_\_/PesoVsMetaChart.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Forragem metrics mapping: biomassa kg/ha, cobertura %, índice 0-100 (thresholds configurable):** As a: pasture manager, I want to: map forage metrics to land health so that: I can monitor biomass and coverage against thresholds**(9 hours)** - Biomassa kg/ha visualization updates with data input Cobertura % visualization with range sliders Index 0-100 thresholds configurable and saved
    
    *   DB: Create threshold\_profiles migration in prisma/migrations/ for biomassa, cobertura, and indice fields. Ensure data types align (float/decimal for thresholds, integers for indices), add table constraints and default values, and update Prisma schema accordingly. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement thresholds CRUD in apps/api/routes/thresholds.ts using REST endpoints (GET, POST, PUT, DELETE) with validation, authentication middleware, and Prisma-based data access against threshold\_profiles. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add endpoints to serve biomassa and cobertura data in apps/api/routes/laymanData.ts, aggregating data from threshold\_profiles and exposing as biomassa/cobertura fields for frontend visualization. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build BiomassaVisualization component in apps/web/components/layman/BiomassaVisualization.tsx to render biomass data using threshold values, with responsive charts and accessibility labels. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build CoberturaSlider component in apps/web/components/layman/CoberturaSlider.tsx to adjust coverage thresholds; integrates with IndexThresholdsForm for persistence. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build IndexThresholdsForm in apps/web/components/layman/IndexThresholdsForm.tsx to configure 0-100 thresholds, with form validation and submit to thresholds API. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   Frontend: Integrate components into route\_layman page apps/web/pages/layman.tsx, wiring BiomassaVisualization, CoberturaSlider, and IndexThresholdsForm into the page layout and navigation. - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Seed default threshold\_profiles in prisma/seed.ts to provide initial values for biomassa, cobertura, and indice thresholds. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add persistence logic using Prisma in apps/api/services/thresholdService.ts to encapsulate data access for threshold\_profiles with create/read/update/delete methods. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add React Query hooks in apps/web/hooks/useThresholds.ts to fetch/save thresholds, including cache invalidation and error handling for robust UX. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Legend & toggle: show legend and toggle to view technical metrics:** As a: analyst, I want to: show a legend and provide a toggle to view technical metrics so that: I can switch between high-level view and detailed metrics**(10 hours)** - Legend displays all relevant metrics with clear icons Toggle properly switches metric view without data loss Metrics view loads quickly and correctly reflects current data
    
    *   DB: Create layman\_legends migration in prisma/migrations/20251104\_add\_layman\_legends/ - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement LegendService.getLegends() in apps/api/services/legend/LegendService.ts - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /api/legend route in apps/api/routes/legend.ts to serve legends - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Legend component in components/layman/Legend.tsx with icons in components/layman/LegendIcon.tsx - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add LegendToggle component in \`components/layman/LegendToggle.tsx\` and integrate into \`pages/layman/legend.tsx\` (route\_layman\_legend) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Hook up data fetching using React Query in hooks/useLaymanLegends.ts and connect in pages/layman/index.tsx (route\_layman) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Infra: Implement Redis caching helper in apps/api/utils/cache.ts for legend responses - (M) (1 hours)\[FE\]\[BE\]
        
    *   Quality: Add unit tests for Legend component in tests/components/Legend.test.tsx and API tests in tests/api/legend.test.ts - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Legenda: cores (verde/amarelo/vermelho) + ícones acessíveis + rótulos curtos:** As a: Leigo usuário, I want to: see color legend with accessible icons and short labels, So that: I can understand color codes quickly.**(5 hours)** - Color legend displays Verde/Amarelo/Vermelho Icons meet accessibility guidelines (contrast, aria-labels) Labels are concise and readable Legend is responsive and accessible via keyboard navigation
    
    *   Frontend: Build Legend component in components/layman/Legend.tsx showing Verde/Amarelo/Vermelho with short labels, accessible labels and color-coding wired to Tailwind colors. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add Legend panel to /layman route in pages/layman/index.tsx and connect comp\_layman\_legend, wiring up Legend.tsx into the Layman page layout. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchLegendConfig in apps/api/routes/layman/legend.ts to return legend items - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Add default legend rows to prisma/migrations/ for table table\_layman\_legends - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Accessibility: Ensure icons have aria-labels and contrast in components/layman/Legend.tsx and styles/tailwind.config.js - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Styling: Implement colors Verde/Amarelo/Vermelho in styles/colors.css and Tailwind config at tailwind.config.js - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Keyboard navigation & focus handling in components/layman/Legend.tsx with role and tabindex - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add accessibility and responsiveness tests in tests/legend.accessibility.test.tsx - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document legend usage and a11y in docs/layman/legend.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Priority color rule: any 'ruim' → vermelho; any 'ok' → amarelo; all 'excelente' → verde:** As a: farm operator, I want to: define and apply a priority color rule so that: I can quickly assess field status with color-coded indicators**(8 hours)** - Color rule applied to data points and reflected in UI System handles mixed statuses by color blending or default rule Rule persists across sessions and can be edited by user
    
    *   DB: Add priority\_color\_rule fields to \`prisma/migrations/\` for \`table\_layman\_legends\` and \`table\_threshold\_profiles\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement /layman/legend/color-rule GET/PUT in \`apps/api/routes/laymanLegend.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Service: Implement computePriorityColor(items) in \`apps/api/services/layman/LegendService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Apply color logic in \`apps/web/components/layman/LaymanItem.tsx\` to reflect vermelho/amarelo/verde - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LegendEditor in \`apps/web/routes/layman/legend/LegendEditor.tsx\` to edit and persist rule - (M) (1 hours)\[FE\]\[BE\]
        
    *   Persistence: Save user rule in \`apps/api/services/layman/LegendService.ts\` -> table\_layman\_legends and \`table\_threshold\_profiles\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for computePriorityColor in \`apps/api/services/layman/\_\_tests\_\_/LegendService.test.ts\` and frontend snapshot tests in \`apps/web/components/layman/\_\_tests\_\_/LaymanItem.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update docs in \`docs/layman/priority-color-rule.md\` and add UI help text in \`apps/web/routes/layman/legend/LegendEditor.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Animal Silhouette View - Priority Color Rule:** As a: data analyst, I want to: filter and visualize animal silhouettes by priority color rule, So that: I can quickly identify high-priority species at a glance in the data overview.**(17 hours)** - Verify silhouette renders with correct priority color for highest-priority animals Filter controls apply color rule to visible silhouettes System maintains color rule consistency across view refreshes Performance: silhouettes render within 200ms for datasets up to 10k records
    
    *   API: Implement getPriorityColorRules handler at apps/api/routers/dataview/getPriorityColorRules.ts to fetch priority color rules from the database and return as structured colorRule objects via REST/JSON, wiring through existing API router framework. - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add priority\_color\_rule fields and create a migration for table\_animal\_silhouettes in prisma/migrations to store color rules tied to silhouettes, including indexes on animal\_id and priority for efficient retrieval. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Implement setPriorityColorRule(ruleId) mutation in apps/api/routers/dataview/setPriorityColorRule.ts to assign/update a color rule for a given silhouette rule roster, handling validation, permission checks, and cascading updates to cache and subscriptions. - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Update VisualDetailPanel.tsx to apply color rules on silhouette rendering using getPriorityColorRules data, ensuring color is applied per silhouette priority and reacts to updates via subscriptions. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Bind filter controls in FilterControls.tsx to color rule attributes so users can filter silhouettes by color/priority, integrating with existing filter pipeline. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Add subscription onPriorityRuleUpdates in apps/api/routers/dataview/subscriptions.ts to push real-time updates to clients when priority color rules change. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Cache: Implement priority rule caching in apps/api/services/cache/priorityCache.ts to store and invalidate color rule lookups for fast reads and to reduce DB load. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Performance: Optimize silhouette query with index in prisma/migrations and adjust fetchVisualDetails.ts to leverage the index for color-rule-backed silhouette retrieval. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for color rule rendering in tests/integration/dataview/priorityColor.test.ts to verify end-to-end rendering across components. - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add performance test for rendering 10k silhouettes in tests/perf/renderPerf.test.ts to ensure rendering scales with color rules. - (XL) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document color rule behavior in docs/features/animal-silhouette-priority.md detailing API, DB schema, frontend rules, and performance considerations. - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Forage Photo + Color Overlay - Priority Color Rule:** As a: data analyst, I want to: display forage photo tiles with a color overlay based on priority rule, So that: I can quickly assess forage importance in the overview.**(9.5 hours)** - Forage tiles render photos with color overlay reflecting priority Overlay color updates on priority change without page reload Tiles resize correctly on responsive layouts Latency for tile rendering under 250ms for typical dataset sizes
    
    *   API: Add getPriorityColorRules() in apps/api/routes/dataview/router\_route\_dataview.ts and implement requestPriorityRulesRefresh() mutation. Expose rule lookup by priority, and provide a hook to refresh clients when rules change. Uses GraphQL/REST depending on existing stack; integrate with existing Socket.io/Redis pubsub for real-time updates. - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add priority column migration for table\_forage\_photos in prisma/migrations/ and update apps/api/prisma/schema.prisma to store per-photo priority; ensure default and constraints align with color rule lookups. Migration must be reversible and test migration behavior. - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement onPriorityRuleUpdates subscription in apps/api/routes/dataview/router\_route\_dataview.ts and emit via Socket.io/Redis pubsub to connected clients when rules change. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Update ForageTile component in apps/web/components/dataview/ForageTile.tsx to render photo with color overlay based on priority using comp\_dataview\_visuals props. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add responsive styles in apps/web/styles/forage-tile.css (Tailwind in apps/web/components/dataview/ForageTile.tsx) to ensure tiles resize correctly on route\_dataview - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add setPriorityColorRule(ruleId) mutation in apps/api/routes/dataview/router\_route\_dataview.ts and call requestPriorityRulesRefresh() to notify clients - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Use React Query + Socket listener in apps/web/pages/dataview/index.tsx (route\_dataview) to subscribe to onPriorityRuleUpdates and update comp\_data\_main state without reload - (M) (1 hours)\[FE\]\[BE\]
        
    *   Performance: Implement Redis caching for priority color lookups in apps/api/services/cache/RedisClient.ts and integrate cache in apps/api/routes/dataview/router\_route\_dataview.ts to keep render latency <250ms - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for color mapping in apps/api/tests/priorityColor.test.ts and frontend integration/perf test in apps/web/tests/forageTile.test.tsx (measure render time) - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
*   **Threshold Configuration UI:** As a: admin, I want to: configure data thresholds through UI, So that: I can adjust alerts and visual cues to suit farm conditions**(36 hours)** - Thresholds can be created/edited with validation Changes persist to storage UI shows current threshold status and validation messages
    
    *   API: Add fetchThresholds & updateThreshold handlers in \`apps/api/routes/dataview/thresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold & deleteThreshold in \`apps/api/routes/dataview/thresholds.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Threshold Configuration Panel component in \`apps/web/components/data/ThresholdConfigPanel.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Integrate panel into \`/dataview\` page in \`apps/web/pages/dataview.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add form validation logic in \`apps/web/components/data/ThresholdConfigForm.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   Frontend: Wire real-time updates via Socket.io in \`apps/web/lib/socket.ts\` and \`apps/web/components/data/ThresholdConfigPanel.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DB: Add prisma model for thresholds in \`prisma/schema.prisma\` referencing table\_thresholds (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for validation in \`apps/web/components/data/\_\_tests\_\_/ThresholdConfigForm.test.tsx\` (4 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   Testing: Add integration tests for API in \`apps/api/tests/thresholds.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Manager Multi-farm Dashboard:** As a: manager, I want to: view an aggregated dashboard across multiple farms, So that: I can monitor overall performance and identify outliers**(44 hours)** - Dashboard aggregates across all farms Drill-down per-farm view available Filters keep state across navigation
    
    *   DB: Create manager\_dashboards migration in \`prisma/migrations/20251104\_create\_manager\_dashboards\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchAggregatedMetrics in \`apps/api/routes/dataview.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchFarmsSummary & fetchFarmList in \`apps/api/routes/dataview.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ManagerMultiFarmPanel component in \`apps/web/components/ManagerMultiFarmPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add page integration in \`apps/web/pages/dataview.tsx\` to include comp\_data\_main and ManagerMultiFarmPanel (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement filters state hook in \`apps/web/hooks/useFilters.ts\` (persist across navigation) (4 hours)\[FE\]\[BE\]
        
    *   API: Add Redis caching for aggregated metrics in \`apps/api/config/cache.ts\` and \`apps/api/services/metrics/metricsService.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Integration: Wire frontend API client in \`apps/web/lib/api/dataview.ts\` to router\_route\_dataview operations (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add backend tests in \`apps/api/tests/dataview.test.ts\` for fetchAggregatedMetrics and fetchFarmsSummary (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests in \`apps/web/tests/ManagerMultiFarmPanel.test.tsx\` for UI and filter persistence (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update feature doc in \`docs/features/manager-multi-farm.md\` and API docs in \`apps/api/docs/dataview.md\` (4 hours)\[FE\]\[BE\]
        
*   **Layman Summary Card: (0 hours)**
    
*   **Animal Silhouette View: (0 hours)**
    
*   **Forage Photo + Color Overlay: (0 hours)**
    
*   **Threshold Configuration UI: (0 hours)**
    
*   **Manager Multi-farm Dashboard: (0 hours)**
    
*   **Legend & Accessibility: (28 hours)**
    
    *   Frontend: Create Legend component at \`components/dataview/Legend.tsx\` with ARIA roles and keyboard support (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate Legend into DataOverviewPage in \`pages/dataview/index.tsx\` (route\_dataview) and add toggle state (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add accessible color palette and contrast utilities in \`styles/accessibility/colors.css\` and \`utils/accessibility/contrast.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement keyboard navigation and focus styles in \`components/dataview/Legend.tsx\` and \`styles/accessibility/focus.css\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Persist legend visibility preference in localStorage via \`hooks/useLegendPreference.ts\` and integrate in \`pages/dataview/index.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Quality: Add unit tests for Legend in \`\_\_tests\_\_/components/dataview/Legend.test.tsx\` (accessibility and keyboard) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add E2E tests for Legend toggle and keyboard in \`e2e/dataview/legend.spec.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Manager Thresholds & Weights:** As a: manager, I want to: configure thresholds and weights for data quality metrics in the overview, So that: I can tailor the visualization to business priorities.**(41 hours)** - UI to set metric thresholds and weights Validation rejects invalid thresholds/weights Persist thresholds/weights across sessions Impact: changes reflect in overall data quality score within 1 second
    
    *   DB: Create thresholds and threshold\_weights migrations in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add thresholds router and controllers in apps/api/routes/thresholds.ts - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ThresholdService methods in \`apps/api/services/thresholds/ThresholdService.ts\` to CRUD thresholds and weights (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ThresholdsPanel component in \`apps/web/components/dataview/ThresholdsPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route integration on \`/dataview\` in \`apps/web/pages/dataview.tsx\` to include ThresholdsPanel (route\_dataview) (4 hours)\[FE\]\[BE\]
        
    *   Validation: Implement validation schema in \`apps/api/services/thresholds/validation.ts\` and client-side validators in \`apps/web/components/dataview/validators.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Persistence: Add Prisma models update in \`prisma/schema.prisma\` for table\_thresholds (table\_thresholds) and table\_threshold\_weights (table\_threshold\_weights) (4 hours)\[FE\]\[BE\]
        
    *   Realtime: Emit threshold updates via Socket.io in \`apps/api/services/thresholds/ThresholdService.ts\` and handle in \`apps/web/lib/socket.ts\` to update DataOverview (route\_dataview) (4 hours)\[FE\]\[BE\]
        
    *   Performance: Optimize score recalculation in \`apps/api/services/thresholds/ScoreCalculator.ts\` to reflect changes within 1s (4 hours)\[FE\]\[BE\]
        
    *   Tests: Add unit tests for ThresholdService in \`apps/api/tests/thresholds.test.ts\` and frontend tests for ThresholdsPanel in \`apps/web/tests/ThresholdsPanel.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document API endpoints in \`docs/api/thresholds.md\` and UI usage in \`docs/ui/ThresholdsPanel.md\` (4 hours)\[FE\]\[BE\]
        
*   **Technical Metrics Toggle:** As a: admin, I want to: toggle technical metrics visibility in the data overview, So that: I can simplify the view for non-technical users**(9 hours)** - Toggle affects all panels consistently Persist toggle state across sessions Non-technical view hides technical metrics completely Audit log records toggle changes
    
    *   DB: Add technical\_metrics\_flags migration in \`prisma/migrations/\` to create/alter table\_technical\_metrics\_flags (table\_technical\_metrics\_flags) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Create toggle endpoint POST /api/technical-metrics/toggle in \`apps/api/routes/technicalMetrics.ts\` to update \`table\_technical\_metrics\_flags\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add audit log entry in \`apps/api/services/audit/AuditService.ts\` when toggle changes (table\_users, table\_sessions) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build TechnicalMetricsToggle component in \`apps/web/components/TechnicalMetricsToggle.tsx\` on route\_dataview (/dataview) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Wire toggle state persistence in \`apps/web/lib/toggleState.ts\` using Redis/cache via \`apps/api/services/cache/CacheService.ts\` and localStorage fallback - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update panels to respect toggle in \`apps/web/components/DataPanel.tsx\` to hide/show technical metrics (route\_dataview) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`apps/api/tests/technicalMetrics.test.ts\` for toggle endpoint and audit logging - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend e2e tests in \`apps/web/tests/technicalToggle.spec.ts\` to verify toggle affects all panels and persistence (route\_dataview) - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README and \`docs/features/technical-metrics.md\` describing toggle behavior and file locations - (M) (1 hours)\[FE\]\[BE\]
        
*   **Layman Summary Card:** As a: layman user, I want to: view a simple summary card of data overview, So that: I can quickly understand key metrics without technical details**(48 hours)** - The summary card displays at least 3 key metrics The card updates when underlying data changes within 1 minute The UI handles missing data gracefully without crashing
    
    *   DB: Create layman\_summaries table migration in \`prisma/migrations/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement getLaymanSummary query in \`apps/api/routes/dataview.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add onLaymanSummaryUpdate subscription in \`apps/api/routes/dataview.ts\` and \`apps/api/sockets/laymanSummarySocket.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Service: Build summary generation & refresh in \`apps/api/services/summary/summaryService.ts\` (regenerateLaymanSummary, requestSummaryRefresh) (4 hours)\[FE\]\[BE\]
        
    *   Infra: Add Redis caching in \`apps/api/config/redis.ts\` (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Build LaymanSummaryCard component in \`apps/web/components/data/LaymanSummaryCard.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LaymanSummaryPanel in \`apps/web/components/data/LaymanSummaryPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Create React Query hook useLaymanSummary in \`apps/web/hooks/useLaymanSummary.ts\` with 1min refetchInterval (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add graceful missing-data handling in \`apps/web/components/data/LaymanSummaryCard.tsx\` tests and UI (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add API tests for getLaymanSummary in \`apps/api/\_\_tests\_\_/getLaymanSummary.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add frontend tests for LaymanSummaryCard in \`apps/web/\_\_tests\_\_/LaymanSummaryCard.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Create docs/layman\_summary.md describing behavior and endpoints (4 hours)\[FE\]\[BE\]
        
*   **Layman Dashboard: (40 hours)** - Dashboard loads within 2 seconds Key metrics (revenue, active users, uptime) render correctly No technical jargon on UI; tooltips explain terms
    
    *   API: Add fetchLaymanSummary query handler in \`apps/api/routes/manager/dashboard.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement getSummaryCounts in \`apps/api/routes/manager/dashboard.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add manager\_dash summary migration in \`prisma/migrations/XXXX\_add\_manager\_dash.sql\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Layman Summary Panel component in \`apps/web/components/manager/LaymanSummaryPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate Layman Summary Panel into ManagerDashboardPage in \`apps/web/pages/manager/dashboard.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Performance: Add Redis caching for summary in \`apps/api/services/cache/CacheService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   UX: Add plain-language tooltips in \`apps/web/components/manager/LaymanSummaryPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add onSummaryUpdate subscription in \`apps/api/routes/manager/dashboard.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test for dashboard load and metrics in \`apps/api/tests/manager/dashboard.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend e2e test for /manager/dashboard in \`apps/web/tests/e2e/managerDashboard.spec.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Threshold Config:** As a: admin user, I want to: configure alert thresholds for critical metrics, So that: operations can be alerted when values exceed safe limits**(19.5 hours)** - Thresholds can be set per metric Alerts trigger when threshold breached There is a fallback/default threshold Changes persist across sessions
    
    *   DB: Create thresholds migration in prisma/migrations/ to add thresholds table columns and defaults preserving existing schema semantics and defaults for all threshold fields (e.g., value, level, etc.) - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Add Threshold model in prisma/schema.prisma and link to table\_farms, ensuring relation integrity and default behaviors - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchThresholds query in apps/api/routes/manager/dashboard.ts to read from table\_thresholds and return in expected shape - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold, updateThreshold, deleteThreshold mutations in apps/api/routes/manager/dashboard.ts with proper validations - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add onThresholdsUpdated subscription in apps/api/routes/manager/dashboard.ts using Socket.io - (L) (2 hours)\[FE\]\[BE\]
        
    *   Backend: Implement persistence logic in apps/api/services/thresholds/ThresholdService.ts to read/write table\_thresholds - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Thresholds Configuration Panel component in components/manager/ThresholdsPanel.tsx (connect to route\_manager\_dashboard & comp\_manager\_dashboard\_thresholds) - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Add React Query hooks in hooks/useThresholds.ts to fetch/mutate via router\_route\_manager\_dashboard - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Implement default/fallback logic in components/manager/ThresholdsPanel.tsx to apply fallback thresholds when none set - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Notifications: Implement ThresholdNotifier in apps/api/services/notifications/ThresholdNotifier.ts to trigger alerts when table\_thresholds breached - (XL) (4 hours)\[FE\]\[BE\]
        
    *   Integration: Wire subscription updates to components/manager/ThresholdsPanel.tsx via Socket.io client in lib/socket/client.ts - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for ThresholdService in apps/api/services/thresholds/\_\_tests\_\_/ThresholdService.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests for ThresholdsPanel in components/manager/\_\_tests\_\_/ThresholdsPanel.test.tsx - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README and docs/thresholds.md with usage and default behavior in docs/thresholds.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Preview & Approve Visuals:** As a: Manager, I want to: preview and approve visuals for campaigns or dashboards, So that: I can ensure visual accuracy before publication.**(6.5 hours)** - User can preview visuals with current data in a modal/viewer Manager can approve visuals which triggers update to deployment status System logs the approval action with timestamp and user Preview reflects latest visuals without requiring page refresh
    
    *   DB: Add manager\_visual\_approvals table migration in prisma/migrations for table\_manager\_visual\_approvals preserving schema references and ensuring migration aligns with existing Prisma setup and table naming conventions. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Create visuals router apps/api/routes/manager/visuals.ts with GET /:id and POST /:id/approve implementing endpoints to fetch visual deployment data and to trigger approval workflow, wired to service layer. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Backend: Implement VisualApprovalService.approve() in apps/api/services/visuals/VisualApprovalService.ts to update deployment status and insert into table\_manager\_visual\_approvals. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Build VisualPreviewModal component in components/manager/VisualPreviewModal.tsx to preview visuals in modal/viewer - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Add useVisualsSubscription hook in hooks/useVisualsSubscription.ts using Socket.io to push live updates to route\_manager\_dashboard - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate approve action in components/manager/VisualPreviewModal.tsx calling POST /api/manager/visuals/:id/approve and optimistic update via React Query - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Add socket event emit in apps/api/socket.ts to notify visual updates to subscribed clients - (M) (1 hours)\[FE\]\[BE\]
        
    *   Backend: Add logging of approvals in apps/api/services/logging/ApprovalLogger.ts storing user and timestamp into table\_manager\_visual\_approvals and table\_users reference - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Multi-farm Overview:** As a: admin user, I want to: view an overview of multiple farms with aggregated metrics, So that: I can compare performance across farms at a glance**(7 hours)** - Aggregate metrics by farm Drill-down to farm details Filter by date range and farm status
    
    *   DB: Add aggregates to \`prisma/migrations/xxxx\_add\_farm\_aggregates.sql\` for \`table\_farms\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchFarmsOverview in \`apps/api/routers/managerDashboard.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchFarmMetrics(query) in \`apps/api/routers/managerDashboard.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Multi-farm Overview Panel component in \`apps/web/components/manager/MultiFarmOverview.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route /manager/dashboard data fetching in \`apps/web/pages/manager/dashboard.tsx\` using \`route\_manager\_dashboard\` and \`components/manager/MultiFarmOverview.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add date range and farm status filters in \`apps/web/components/manager/MultiFarmFilters.tsx\` and wire to \`MultiFarmOverview.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for overview and drill-down in \`apps/api/tests/managerDashboard.test.ts\` and \`apps/web/tests/MultiFarmOverview.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Propagate Multi-farm Defaults:** As a: Admin, I want to: propagate multi-farm default settings to all farms in the account, So that: consistent configurations across farms without manual per-farm setup.**(10 hours)** - Default settings are applied to all farms on propagation Propagation skips farms with already identical settings Audit log records propagation events with timestamps and source System handles propagation when new farms are added and applies defaults automatically
    
    *   DB: Add manager\_defaults\_propagation table migration in \`prisma/migrations/\` to store propagation events and source - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add default\_settings columns/relations in \`prisma/migrations/\` for \`table\_thresholds\` and link to \`table\_farms\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement propagateDefaultsToAllFarms() in \`apps/api/services/manager/DefaultsService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add POST /api/manager/propagate-defaults handler in \`apps/api/routes/manager/propagation.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement compareAndSkipIfIdentical() in \`apps/api/services/manager/DefaultsService.ts\` to skip identical farms - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Record propagation audit entry in \`apps/api/services/manager/AuditService.ts\` writing to \`manager\_defaults\_propagation\` table - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Backend: Add event listener for new farm creation in \`apps/api/events/farms.ts\` to auto-apply defaults - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add 'Propagate Defaults' button to \`route\_manager\_thresholds\` page component in \`apps/web/components/manager/PropagateDefaultsButton.tsx\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Show propagation status and audit entries in \`route\_manager\_dashboard\` via \`apps/web/components/manager/PropagationAuditList.tsx\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Add Redis lock usage in \`apps/api/services/manager/DefaultsService.ts\` to prevent concurrent propagations - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Unit tests for DefaultsService.compareAndSkipIfIdentical() in \`apps/api/tests/DefaultsService.test.ts\` - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Integration test for POST /api/manager/propagate-defaults in \`apps/api/tests/propagation.integration.test.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update README in \`apps/api/README.md\` with propagation workflow and API usage - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Preview With Weights: (28 hours)**
    
    *   DB: Add weight columns to \`prisma/migrations/\` and update \`apps/api/prisma/schema.prisma\` for thresholds in file \`apps/api/prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create GET /manager/previewWeights handler in \`apps/api/src/routes/manager/preview.ts\` to fetch weighted preview (4 hours)\[FE\]\[BE\]
        
    *   API: Add computeWeights utility in \`apps/api/services/weights/WeightsService.ts\` and integrate with \`apps/api/src/routes/manager/preview.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PreviewWithWeights component in \`apps/web/components/manager/PreviewWithWeights.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add route integration on \`/manager/dashboard\` in \`apps/web/pages/manager/dashboard.tsx\` to mount \`components/manager/PreviewWithWeights.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add tests for weights computation in \`apps/api/tests/weights.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add unit tests for PreviewWithWeights in \`apps/web/tests/PreviewWithWeights.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Toggle weights on/off: (32 hours)**
    
    *   DB: Add 'enabled' column to \`weights\_by\_farm\` in \`prisma/migrations/\` (table\_weights\_by\_farm) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement setWeightsEnabled mutation in \`apps/api/routes/manager/weights.ts\` (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]
        
    *   Service: Add toggle handler in \`apps/api/services/weights/WeightsService.ts\` (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build WeightsToggle component in \`apps/web/components/WeightsConfig/WeightsToggle.tsx\` (comp\_manager\_flow\_weights\_main) (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Integrate toggle into route \`/manager/flow/weights\` in \`apps/web/pages/manager/flow/weights.tsx\` (route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]
        
    *   API: Add getWeightsConfig query update in \`apps/api/routes/manager/weights.ts\` (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Tests: Add API tests for setWeightsEnabled in \`apps/api/tests/weights.test.ts\` (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Tests: Add frontend tests for WeightsToggle in \`apps/web/components/WeightsConfig/WeightsToggle.test.tsx\` (comp\_manager\_flow\_weights\_main) (4 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
*   **Preview weighted tie-break: (34 hours)**
    
    *   API: Add fetchPreviewResult query in \`apps/api/routes/manager/flow/weights.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement computePreviewWeightedTieBreak in \`apps/api/services/weights/WeightsService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add sample preview data migration in \`prisma/migrations/20251104\_add\_weights\_preview.sql\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PreviewPanel component in \`apps/web/components/manager/flow/weights/PreviewPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Wire fetchPreviewResult via React Query in \`apps/web/components/manager/flow/weights/PreviewPanel.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add onPreviewUpdate subscription in \`apps/api/routes/manager/flow/weights.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Create API unit tests in \`apps/api/tests/weightsPreview.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Create frontend tests in \`apps/web/tests/PreviewPanel.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Add feature doc in \`docs/weights-preview.md\` (2 hours)\[FE\]\[BE\]
        
*   **Save farm-specific weights: (40 hours)**
    
    *   DB: Create migration for weights\_by\_farm in \`prisma/migrations/\` - add farm\_id, weight\_name, value, created\_by, timestamps (4 hours)\[FE\]\[BE\]
        
    *   API: Add createWeight mutation handler in \`apps/api/routers/manager/weights.ts\` implementing router\_route\_manager\_flow\_weights#createWeight (4 hours)\[FE\]\[BE\]
        
    *   API: Add updateWeight mutation handler in \`apps/api/routers/manager/weights.ts\` implementing router\_route\_manager\_flow\_weights#updateWeight (4 hours)\[FE\]\[BE\]
        
    *   API: Add fetchSavedWeights query in \`apps/api/routers/manager/weights.ts\` implementing router\_route\_manager\_flow\_weights#fetchSavedWeights (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Extend \`components/manager/weights/SavedWeightsList.tsx\` to call fetchSavedWeights and display per-farm weights (route\_manager\_flow\_weights -> comp\_manager\_flow\_weights\_list) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add SaveWeight form in \`components/manager/weights/SaveWeightForm.tsx\` and integrate into \`pages/manager/flow/weights.tsx\` (route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]
        
    *   API: Add subscription onWeightChanged in \`apps/api/routers/manager/weights.ts\` implementing router\_route\_manager\_flow\_weights#onWeightChanged using Socket.io (4 hours)\[FE\]\[BE\]
        
    *   Backend: Add Prisma model update in \`prisma/schema.prisma\` for table\_weights\_by\_farm (table\_weights\_by\_farm) (4 hours)\[FE\]\[BE\]
        
    *   Integration: Wire create/update calls in \`components/manager/weights/SaveWeightForm.tsx\` to \`apps/api/routers/manager/weights.ts\` APIs (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for weights API in \`apps/api/tests/manager/weights.test.ts\` covering create/update/fetch (router\_route\_manager\_flow\_weights) (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Reset to defaults: (20 hours)**
    
    *   Frontend: Add 'Reset to defaults' button in \`apps/web/components/manager/flow/weights/ActionsFooter.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement resetWeightsToDefaults mutation handler in \`apps/api/routes/manager/flow/weights/router.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add reset defaults function in \`apps/api/services/weights/weightsService.ts\` to update \`table\_weights\_by\_farm\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Wire button to call mutation in \`apps/web/hooks/useResetWeights.ts\` using React Query and route \`route\_manager\_flow\_weights\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration test for reset flow in \`apps/api/tests/weights/resetWeights.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Legend Display:** As a: admin, I want to: display a clear legend for color rules and symbols on the dashboard, So that: users can interpret legend accurately to understand color-coded statuses**(9 hours)** - The legend is visible on the legend page and the dashboard where color rules apply Legend items correspond exactly to defined color rules in the system Users can toggle visibility of the legend without page reload Legend loads within 500ms under normal network conditions System handles missing legend definitions by displaying a default legend set
    
    *   DB: Create layman\_legends\_new migration in \`prisma/migrations/\` to add legend schema - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement GET /legends in \`apps/api/routes/legends.ts\` returning legends from \`table\_layman\_legends\_new\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement fallback default legend in \`apps/api/services/legend/LegendService.ts\` when \`table\_layman\_legends\_new\` missing entries - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add caching for legends in \`apps/api/middleware/cache.ts\` using Redis to meet 500ms load - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Legend component in \`components/legend/Legend.tsx\` with toggle state and React Query hook\`hooks/useLegends.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate Legend on Legend page \`pages/legend.tsx\` and Dashboard \`components/dashboard/DashboardHeader.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Ensure legend toggle persists in \`hooks/useLegendVisibility.ts\` and UI state in \`store/legendSlice.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for legend API in \`tests/api/legend.test.ts\` and frontend tests in \`tests/components/Legend.test.tsx\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document legend feature and failover behavior in \`docs/features/legend.md\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **Manager Thresholds (per-farm, versioned, optional numeric weights for tie display): (48 hours)** - Threshold values can be created, updated, and deleted by authorized managers Thresholds apply to relevant metrics and update in real-time on the legend Alerts trigger at defined threshold levels and reflect in UI Invalid threshold inputs are rejected with clear error messages Threshold definitions are persisted to the database and retrievable on reload
    
    *   DB: Create thresholds table migration in \`prisma/migrations/\` for \`table\_thresholds\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Add threshold\_profiles\_new model in \`prisma/schema.prisma\` and migration in \`prisma/migrations/\` (table\_threshold\_profiles\_new) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement ThresholdService in \`apps/api/services/thresholds/ThresholdService.ts\` with CRUD and versioning logic (4 hours)\[FE\]\[BE\]
        
    *   API: Add routes in \`apps/api/routes/thresholds.ts\` with auth checks for manager role (4 hours)\[FE\]\[BE\]
        
    *   API: Add Socket.IO handler in \`apps/api/sockets/thresholdsSocket.ts\` to emit threshold updates (4 hours)\[FE\]\[BE\]
        
    *   Infra: Configure Redis pub/sub in \`apps/api/lib/redisClient.ts\` for cross-instance threshold events (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Build ThresholdForm component in \`components/thresholds/ThresholdForm.tsx\` (create/update/delete, validation) (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Frontend: Add thresholds management page in \`app/legend/thresholds/page.tsx\` with Clerk auth and manager gating (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update Legend component in \`components/legend/Legend.tsx\` to apply thresholds and optional numeric weights for tie display (4 hours)\[FE\]\[BE\]
        
    *   API: Persist threshold definitions retrieval in \`apps/api/routes/thresholds.ts\` read endpoint (uses table\_thresholds) (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`tests/integration/thresholds.test.ts\` covering CRUD, validation, and real-time updates (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write \`docs/thresholds.md\` describing API, DB schema, frontend usage and validation rules (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Show Technical Metrics (toggle layman/technical, include normalized metrics): (11.5 hours)** - Technical metrics are displayed in a dedicated panel Metrics include at least evaluation time, cache hit rate, and data load time Metrics update asynchronously without blocking user interactions Metrics data persists for a configurable retention period System alarms if metrics deviate from baseline by a defined threshold
    
    *   DB: Create metrics retention table in prisma/migrations/ referencing table\_thresholds and table\_users using Prisma migrate with proper foreign keys and indices for retention policy. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement recordMetric() in apps/api/services/metrics/MetricService.ts to store evaluation\_time, cache\_hit\_rate, data\_load\_time with validation and error handling. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Add /metrics GET endpoint in apps/api/routes/metrics.ts with async pagination and retention filter - (M) (1 hours)\[FE\]\[BE\]
        
    *   Cache: Add Redis caching in apps/api/services/metrics/MetricService.ts for recent metrics with keys in redis and hit rate tracking - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Build TechnicalMetricsPanel component in components/metrics/TechnicalMetricsPanel.tsx using React Query and Socket.io for async updates - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add styles in styles/components/TechnicalMetricsPanel.module.css and integrate into Next.js page pages/legend/metrics.tsx - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Retention: Implement retention cleanup job in apps/api/jobs/metricsRetentionJob.ts that deletes older metrics using Prisma and references table\_thresholds - (L) (2 hours)\[FE\]\[BE\]
        
    *   Alerts: Implement anomaly detection and alarm in apps/api/services/alerts/AlertService.ts that monitors metrics vs thresholds in table\_thresholds - (L) (2 hours)\[FE\]\[BE\]
        
    *   Persistence: Add Prisma model for Metric in prisma/schema.prisma and run migration in prisma/migrations/ - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit and integration tests in tests/metrics/ for MetricService, retention job, and AlertService - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Legend & Color Rules (priority rules + thresholds): (32 hours)**
    
    *   DB: Create thresholds migration in \`prisma/migrations/\` to add thresholds table columns and relations (update \`apps/api/prisma/schema.prisma\`) (4 hours)\[FE\]\[BE\]
        
    *   DB: Create layman\_legends\_new migration in \`prisma/migrations/\` to define legend entries (update \`apps/api/prisma/schema.prisma\`) (4 hours)\[FE\]\[BE\]
        
    *   API: Implement ThresholdService methods in \`apps/api/services/thresholds/ThresholdService.ts\` to CRUD \`table\_thresholds\` and validate priority rules (4 hours)\[FE\]\[BE\]
        
    *   API: Implement LegendService in \`apps/api/services/legends/LegendService.ts\` to CRUD \`table\_layman\_legends\_new\` and map to thresholds (4 hours)\[FE\]\[BE\]
        
    *   API: Add /api/thresholds and /api/legends routes in \`apps/api/routes/thresholds.ts\` and \`apps/api/routes/legends.ts\` using services (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LegendEditor component in \`apps/web/components/legend/LegendEditor.tsx\` to edit legend entries and thresholds using React Query (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add LegendView page in \`apps/web/pages/flow\_legend.tsx\` to display color rules, priority order, and thresholds (4 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests in \`apps/api/tests/thresholds.test.ts\` and \`apps/web/tests/LegendEditor.test.tsx\` to cover acceptance scenarios (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Forragem Visual:** As a: agronomist assistant, I want to: visualize forage visual representations, So that: I can quickly assess forage quality and availability for livestock planning**(36 hours)** - The system renders forage visual data accurately for the selected pasture. Visualizations update when new data is uploaded within 2 minutes. Users can toggle between different forage visualization modes (e.g., color gradient, heatmap). Duplicate or missing data is gracefully handled with an informative message.
    
    *   DB: Add/validate forage columns in \`apps/api/prisma/migrations/2025\_add\_forage\_columns/\` for table\_forage (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchForageLayers resolver in \`apps/api/routes/agrohome/router.ts\` referencing router\_route\_agrohome (4 hours)\[FE\]\[BE\]
        
    *   API: Add onForageUpdate subscription in \`apps/api/routes/agrohome/router.ts\` referencing router\_route\_agrohome (4 hours)\[FE\]\[BE\]
        
    *   Backend: Process uploaded visual assets in \`apps/api/services/visuals/VisualProcessor.ts\` and store to AWS S3\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ForageVisualPanel component in \`apps/web/components/agrohome/ForageVisualPanel.tsx\` for comp\_agrohome\_visual\_panel (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add visualization mode toggles (gradient/heatmap) in \`apps/web/components/agrohome/ForageControls.tsx\` for comp\_agrohome\_visual\_panel (4 hours)\[FE\]\[BE\]
        
    *   Frontend/API: Implement React Query + Socket.io sync in \`apps/web/hooks/useForageData.ts\` to call fetchForageLayers and subscribe onForageUpdate referencing router\_route\_agrohome and comp\_agrohome\_visual\_panel (4 hours)\[FE\]\[BE\]
        
    *   Data: Add duplicate/missing data handling and messages in \`apps/api/services/validation/ForageValidator.ts\` and UI messaging in \`apps/web/components/common/Alert.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Quality: Add tests and docs in \`apps/api/tests/forage.test.ts\` and \`apps/web/tests/ForageVisual.test.tsx\` and docs in \`docs/forage-visual.md\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Gado Silhueta:** As a: ranch manager, I want to: view cattle silhouettes overlay on farm map, So that: I can estimate livestock distribution at a glance**(48 hours)** - Silhouette overlays align with GPS coordinates within acceptable tolerance (±5m). Map panning/zooming maintains silhouette clarity. Users can filter by herd size and species. System handles missing GPS data by showing a warning with fallback density estimation.
    
    *   DB: Add cattle silhouette schema in \`prisma/migrations/202511\_update\_cattle\_silhouette.sql\` for table\_cattle\_silhouette (4 hours)\[FE\]\[BE\]
        
    *   API: Add fetchSilhouetteTemplates handler in \`apps/api/routes/agrohome/router.ts\` using router\_route\_agrohome (4 hours)\[FE\]\[BE\]
        
    *   API: Add onLivestockPositionUpdate subscription in \`apps/api/routes/agrohome/router.ts\` using router\_route\_agrohome (4 hours)\[FE\]\[BE\]
        
    *   Backend: Implement silhouette processing job in \`apps/api/services/silhouette/SilhouetteProcessor.ts\` to use OpenCV and upload to S3 (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build SilhouetteOverlay component in \`app/agrohome/components/SilhouetteOverlay.tsx\` using comp\_agrohome\_visual\_panel and route\_agrohome (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add filters UI for herd size and species in \`app/agrohome/components/SilhouetteFilters.tsx\` referencing comp\_agrohome\_visual\_panel (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchMapTiles and fetchForageLayers optimizations in \`apps/api/routes/agrohome/router.ts\` to support overlay alignment (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate map panning/zooming handlers in \`app/agrohome/components/MapView.tsx\` to preserve silhouette clarity (comp\_agrohome\_visual\_panel) (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Show GPS-missing warning and fallback density estimation in \`app/agrohome/components/SilhouetteOverlay.tsx\` and \`app/agrohome/components/DensityEstimator.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add endpoint updateSilhouetteSelection in \`apps/api/routes/agrohome/router.ts\` for toggling silhouettes (router\_route\_agrohome) (4 hours)\[FE\]\[BE\]
        
    *   Infra: Add Redis caching for silhouette positions in \`apps/api/config/redisClient.ts\` and reference router\_route\_agrohome (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Testing: Add integration tests for silhouette alignment in \`apps/api/tests/silhouetteAlignment.test.ts\` referencing router\_route\_agrohome and table\_cattle\_silhouette (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Threshold Configure: (40 hours)** - Thresholds can be set for multiple sensors with unit validation. Alerts trigger when live data breaches thresholds and persist for defined duration. Users receive notification through preferred channels (SMS/email). Historical data shows when thresholds were exceeded for debugging.
    
    *   DB: Create thresholds migration in \`prisma/migrations/\` to add table\_thresholds columns for sensor\_id, min, max, unit, duration, user\_id (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createThreshold, updateThreshold, deleteThreshold in \`apps/api/routes/agrohome.ts\` using \`apps/api/services/thresholds/ThresholdService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add fetchThresholds and fetchThresholdTemplates queries and onThresholdsUpdated subscription in \`apps/api/routes/agrohome.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Thresholds Config Panel component in \`app/agrohome/ThresholdsPanel.tsx\` and integrate \`comp\_agrohome\_thresholds\` props (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Create ThresholdForm component in \`components/thresholds/ThresholdForm.tsx\` with unit validation and sensor selector (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Service: Implement ThresholdService in \`apps/api/services/thresholds/ThresholdService.ts\` with Prisma queries to table\_thresholds (4 hours)\[FE\]\[BE\]
        
    *   Worker: Build threshold evaluation worker in \`apps/api/workers/thresholdWorker.ts\` using Redis \`apps/api/config/redis.ts\` and Socket.io to trigger alerts (4 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Service: Implement NotificationService in \`apps/api/services/notification/NotificationService.ts\` to send SMS/email via provider and user prefs in table\_users (4 hours)\[FE\]\[BE\]
        
    *   DB: Add thresholds history table migration in \`prisma/migrations/\` to store breaches with timestamp, sensor\_reading, and duration referencing table\_thresholds (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit and integration tests in \`tests/api/thresholds.test.ts\` and \`tests/frontend/thresholds.spec.ts\` for validation, alerting, and notification flows (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Photo Annotation:** As a: farm technician, I want to: annotate photos with species and health markers, So that: I can document animal status and improve record-keeping**(56 hours)** - Photos can be uploaded with metadata tags. Annotations can be added for species, health indicators, and date. Annotations are stored with the photo and retrievable in reports. System supports editing/removing annotations and tracks version history.
    
    *   DB: Create table\_photo\_annotations migration in \`prisma/migrations/\` to store annotations with versioning fields (4 hours)\[FE\]\[BE\]
        
    *   API: Implement uploadPhoto endpoint in \`apps/api/routes/agrohome/uploadPhoto.ts\` to save image to S3 and return photoId (4 hours)\[FE\]\[BE\]
        
    *   API: Implement createAnnotation in \`apps/api/routes/agrohome/createAnnotation.ts\` to insert into \`table\_photo\_annotations\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement updateAnnotation in \`apps/api/routes/agrohome/updateAnnotation.ts\` to add new version row and maintain history (4 hours)\[FE\]\[BE\]
        
    *   API: Implement deleteAnnotation in \`apps/api/routes/agrohome/deleteAnnotation.ts\` to soft-delete annotation in \`table\_photo\_annotations\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PhotoAnnotationArea component in \`components/PhotoAnnotationArea/PhotoAnnotationArea.tsx\` under route\_agrohome to display upload UI and annotations (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add upload handler in \`app/agrohome/uploadHandler.ts\` to call uploadPhoto and show progress (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build AnnotationEditor in \`components/PhotoAnnotationArea/AnnotationEditor.tsx\` to add/edit species, health, date fields and call create/update APIs (4 hours)\[FE\]\[BE\]
        
    *   API: Implement fetchAnnotationsByPhoto in \`apps/api/routes/agrohome/fetchAnnotationsByPhoto.ts\` and subscribe onAnnotationCreated/Updated/Deleted (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate real-time updates in \`components/PhotoAnnotationArea/PhotoAnnotationArea.tsx\` using socket.io to listen to router\_route\_agrohome subscriptions (4 hours)\[FE\]\[BE\]
        
    *   DB: Add photo metadata columns to photos table migration in \`prisma/migrations/\` and link to table\_photo\_annotations (4 hours)\[FE\]\[BE\]
        
    *   API: Implement savePhotoAnnotations in \`apps/api/routes/agrohome/savePhotoAnnotations.ts\` to batch save and return report data (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build PhotoAnnotationsReport page in \`app/agrohome/report/PhotoAnnotationsReport.tsx\` to retrieve and display annotations (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in \`tests/agrohome/photoAnnotation.test.ts\` for upload, create, update, delete flows (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **View Layman Data: (36 hours)**
    
    *   DB: Add layman view fields migration in \`prisma/migrations/2025\_10\_01\_add\_layman\_fields/\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create GET /forage/layman handler in \`apps/api/routes/forage/layman.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement LaymanService.getLaymanList in \`apps/api/services/forage/LaymanService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build LaymanList component in \`app/agrohome/layman/LaymanList.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Add useLayman hook in \`app/hooks/useLayman.ts\` using React Query (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Integrate LaymanList into AgroHomePage in \`app/agrohome/page.tsx\` (route\_agrohome) (4 hours)\[FE\]\[BE\]
        
    *   UI: Add styles for layman view in \`app/styles/layman.css\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add API tests for layman endpoint in \`apps/api/tests/layman.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests for LaymanList in \`app/agrohome/layman/LaymanList.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Forragem Visual: (0 hours)**
    
*   **Gado Silhueta: (0 hours)**
    
*   **Photo Annotation: (0 hours)**
    
*   **Layman Legend: (36 hours)**
    
    *   DB: Add 'legend' fields and create migration in \`prisma/migrations/\` referencing table\_forage and table\_photo\_annotations\` (4 hours)\[FE\]\[BE\]
        
    *   API: Create LegendService with generateLegend() in \`apps/api/services/legend/LegendService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add /api/legend route handler in \`apps/api/routes/legend.ts\` using LegendService (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build Legend component in \`components/legend/Legend.tsx\` and integrate into \`route\_agrohome\` \`/agrohome/page.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Style Legend with Tailwind in \`components/legend/legend.module.css\` and ensure import in \`components/legend/Legend.tsx\` (4 hours)\[FE\]\[BE\]
        
    *   Integration: Implement API call to /api/legend in \`app/agrohome/page.tsx\` using React Query in \`lib/hooks/useLegend.ts\` (4 hours)\[FE\]\[BE\]
        
    *   DB: Create seed script in \`prisma/seed.ts\` to add sample legend entries referencing table\_forage and table\_photo\_annotations\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Add unit tests for LegendService in \`apps/api/tests/legend.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add frontend tests for Legend component in \`components/\_\_tests\_\_/Legend.test.tsx\` (4 hours)\[FE\]\[BE\]\[QA\]
        
*   **Color Composition Rule: (36 hours)**
    
    *   DB: Add color\_composition fields to \`prisma/migrations/\` and update schema in \`prisma/schema.prisma\` (4 hours)\[FE\]\[BE\]
        
    *   API: Implement color composition rule service in \`apps/api/services/color/ColorRuleService.ts\` (4 hours)\[FE\]\[BE\]
        
    *   API: Add endpoint POST /color-rule in \`apps/api/routes/color.ts\` to apply rule (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ColorRulePanel component in \`components/color/ColorRulePanel.tsx\` and integrate in \`/agrohome\` page\` (4 hours)\[FE\]\[BE\]
        
    *   Frontend: Update \`/agrohome\` route in \`app/agrohome/page.tsx\` to import ColorRulePanel (4 hours)\[FE\]\[BE\]
        
    *   DB: Add samples and backfill script in \`scripts/backfill/color\_composition\_backfill.ts\` (4 hours)\[FE\]\[BE\]
        
    *   Testing: Unit tests for ColorRuleService in \`apps/api/services/color/\_\_tests\_\_/ColorRuleService.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Integration tests for /color-rule in \`apps/api/routes/\_\_tests\_\_/color.test.ts\` (4 hours)\[FE\]\[BE\]\[QA\]
        
    *   Documentation: Add rule docs in \`docs/features/color-composition.md\` and API spec in \`docs/api/color.md\` (4 hours)\[FE\]\[BE\]
        

### **Milestone 9: Integration policies: annotation photo URL policy, signed URL handling, RLS snippets, annotation policy and annotation image handling**

_Estimated 57 hours_

*   **Photo URL Policy - Public Default:** As a: content viewer, I want to: access public photo\_url by default, So that: I can view images without requiring authentication when policy allows public access.**(5 hours)** - Public photo\_url is accessible without authentication Default policy applied to all new uploads unless overridden Login is not required to view public photos and public access is logged for auditing
    
    *   DB: Add photo\_policy and access\_log tables in prisma/migrations/, with Prisma schema, migrations, and seed/data hooks if needed. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Apply default public policy on upload in apps/api/services/photos/PhotoService.ts, enforcing policy at upload path and persisting policy reference with uploaded photo metadata. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Serve public photo\_url without auth in apps/api/routes/photos.ts, ensuring GET /photos/:id returns public URL without requiring authentication. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Configure S3 bucket policy for public objects in infra/aws/s3-policy.json, allowing public read on objects tagged public and audit logging enabled. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Logging: Record public access in apps/api/services/logging/AccessLogService.ts, emitting entries on every public GET photo\_url access. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Frontend: Display photo using public URL in components/photos/PublicPhoto.tsx, consuming public URL and rendering image with proper accessibility attributes. - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for public access in apps/api/tests/photos/public\_access.test.ts, validating public fetch path and access restrictions. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document default public policy and override options in docs/photo\_policy.md, including examples and caveats. - (XS) (0.5 hours)\[FE\]\[BE\]
        
*   **Support Signed URL Optional:** As a: content consumer, I want to: optionally use signed\_photo\_url for secure access when needed, So that: access can be restricted and traceable for premium content.**(8.5 hours)** - Signed URL is generated when requested Access with signed URL is logged Fallback to public URL if signed URL generation fails or not requested Expiry time for signed URL is enforced, and revocation checks occur
    
    *   DB migration to create access\_logs table in prisma/migrations to record signed\_url accesses (cite: table\_users) with fields: id, user\_id, resource\_id, signed\_url\_id, access\_at, expires\_at, ip\_address. Ensure migration ties to table\_users via user\_id FK and includes indices on resource\_id and signed\_url\_id. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add generateSignedUrl(requested:boolean) in apps/api/services/storage/StorageService.ts to generate signed or public URL. Integrates with Storage client, respects expiry window, and returns URL + expiry timestamp. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add middleware to log access to apps/api/middleware/accessLogger.ts and record to prisma/migrations access\_logs (cite: table\_users). Middleware should attach request metadata (ip, user, timestamp) for signed URL access attempts and store entries. - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add route GET /photos/:id/url handler in apps/api/routes/photos.ts to call StorageService.generateSignedUrl and enforce expiry/revocation checks. - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update components/photos/PhotoLink.tsx to request signed URL optionally and fall back to public URL. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement revocation check in apps/api/services/auth/AuthService.ts or apps/api/services/storage/StorageService.ts referencing revocation logic and table\_users. - (L) (2 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests in apps/api/tests/photos.test.ts covering signed URL generation, expiry, fallback, and logging - (L) (2 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update developer docs docs/photos/signed\_url.md describing usage and config - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Include URLs in Schemas:** As a: developer, I want to: include photo\_url and signed\_photo\_url fields in data schemas, So that: downstream services can rely on URL delivery without feature flag changes.**(9 hours)** - Schemas include photo\_url field by default Schemas include signed\_photo\_url field when feature enabled Validation ensures URLs are non-empty when present Backward compatibility checks for schema changes
    
    *   DB: Add photo\_url and signed\_photo\_url columns in \`prisma/migrations/20251104\_add\_photo\_urls/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add photo\_url and signed\_photo\_url to response DTO in \`apps/api/src/routes/schemas/schemaRoutes.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Validate non-empty URLs in \`apps/api/src/middleware/validation/urlValidator.ts\` - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   API: Implement feature flag toggle for signed\_photo\_url in \`apps/api/src/services/featureFlag/FeatureFlagService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update TypeScript types in \`apps/web/src/types/schemas.ts\` to include photo\_url and signed\_photo\_url?\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Display photo using photo\_url in \`apps/web/src/components/SchemaPhoto.tsx\` and conditionally use signed\_photo\_url when feature enabled - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Add integration tests for schema responses in \`apps/api/test/schemas.test.ts\` covering presence and validation of URLs - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add backward compatibility tests in \`apps/api/test/backcompat.test.ts\` ensuring old clients accept new schema fields - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Update API schema docs in \`docs/api/schemas.md\` describing photo\_url and signed\_photo\_url behavior - (M) (1 hours)\[FE\]\[BE\]
        
*   **RLS: Read Policy:** As a: data consumer, I want to: read data allowed by row-level security, So that: I can access only the rows I’m permitted to see**(7 hours)** - Policy is applied to target table for read operations Users with read rights cannot see restricted rows Policy evaluation occurs on read requests with correct predicates Audit log records for read permission checks are generated Data access remains compliant with policy across edge cases
    
    *   DB: Create migration \`prisma/migrations/20251104\_add\_rls\_read\_policy.sql\` to add RLS read policy on target table \`thresholds\` in \`prisma/schema.prisma\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add SQL policy function in \`prisma/migrations/20251104\_add\_rls\_read\_policy.sql\` referencing \`table\_users\` for predicates - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add policy evaluation and audit logging in \`apps/api/lib/audit.ts\` for read checks - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Enforce RLS predicates in router handler \`apps/api/routers/route\_sql\_seed.ts\` fetchVerificationStatus to pass role context - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Update auth checks in \`apps/api/services/auth/AuthService.ts\` to supply user context for RLS evaluation - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Update component \`apps/web/components/sql/SeedVerification.tsx\` to handle masked rows and call fetchVerificationStatus (route\_sql\_seed) appropriately - (M) (1 hours)\[FE\]\[BE\]
        
    *   QA: Add integration tests in \`apps/api/tests/rls\_read\_policy.test.ts\` to verify predicates, restricted visibility, audit logs, and edge cases - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **RLS: Write Policy:** As a: data contributor, I want to: write data only where policy permits, So that: data integrity and access controls are maintained**(8 hours)** - Policy evaluated on write attempts Denied writes for rows outside policy scope Successful writes only for permitted rows with proper auditing Policy enforcement at database level for upserts/updates Edge cases: conflict resolution when multiple policies apply
    
    *   DB: Add RLS policy and audit table migration in \`prisma/migrations/xxxx\_create\_rls\_write\_policy/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Implement policy function and trigger in \`apps/api/db/sql/rls\_write\_policy.sql\` to evaluate writes and log audits - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add server-side enforcement checks in \`apps/api/routers/route\_sql\_seed.ts\` integrating with router\_route\_sql\_seed mutations - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement upsert-safe write method in \`apps/api/services/rls/RlsWriteService.ts\` ensuring DB-level policy usage - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add audit retrieval endpoint in \`apps/api/routers/route\_sql\_seed.ts\` to expose write audit logs - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Show write denial/success in \`apps/web/routes/sql/seed/page.tsx\` using route\_sql\_seed and comp\_sql\_seed\_verification - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests in \`apps/api/tests/rls/write\_policy.test.ts\` covering upserts, updates, and conflict scenarios - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document policy behavior and edge cases in \`docs/rls/write\_policy.md\` - (M) (1 hours)\[FE\]\[BE\]
        
*   **RLS: Manager Role:** As a: manager, I want to: manage access via RLS policies for my team, So that: team data access aligns with hierarchy**(9.5 hours)** - Manager can assign/read policies for team members Policy inheritance checked for subordinates Audit events for policy changes are emitted Manager role cannot override core restrictions Performance tested for policy evaluation at scale
    
    *   DB: Create policies & user\_roles migration in prisma/migrations/2025xxxx\_create\_policies\_and\_user\_roles/ preserving architecture references with Prisma migrations and RLS policy tables - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement PolicyService with assign/read methods in apps/api/services/policy/PolicyService.ts using NestJS/TS architecture; ensure integration with prisma and audit hooks - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /rls/policies router and endpoints in apps/api/routers/rls/policies.ts to expose PolicyService capabilities - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Add audit logging on policy changes in apps/api/services/audit/AuditService.ts to capture create/update/delete events - (M) (1 hours)\[FE\]\[BE\]
        
    *   Logic: Implement policy inheritance checks in apps/api/services/policy/PolicyService.ts (evaluateSubordinatesPolicy) to determine inherited permissions - (L) (2 hours)\[FE\]\[BE\]
        
    *   Frontend: Build ManagerPolicyPanel component in apps/web/components/rls/ManagerPolicyPanel.tsx to manage policies in UI - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Create unit/integration tests for PolicyService in apps/api/tests/policy/PolicyService.test.ts - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Testing: Add audit event tests in apps/api/tests/audit/AuditService.test.ts to verify audit logs on policy changes - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Perf: Add policy evaluation load test in tools/perf/policy\_evaluation\_load\_test.js to simulate policy checks under load - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Security: Enforce core restriction checks in apps/api/middleware/rlsMiddleware.ts to gate policy access - (M) (1 hours)\[FE\]\[BE\]
        
*   **RLS: Service Role:** As a: service, I want to: access data via RLS-enabled policies, So that: service accounts operate within prescribed data boundaries**(10 hours)** - Service role has restricted data access per policy Service actions logged and auditable No elevated privileges beyond policy scope Service role conflicts detected and resolved Performance and latency acceptable under service load
    
    *   DB: Add service\_roles and service\_role\_policies migration in \`prisma/migrations/20251101\_create\_service\_roles/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add RLS policies for service role on \`prisma/schema.prisma\` and database with migration in \`prisma/migrations/20251101\_rls\_policies/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement ServiceRoleService.createRole() in \`apps/api/services/rls/ServiceRoleService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /rls/service-role router in \`apps/api/routes/rls/serviceRole.ts\` and wire into API router (\`router\_route\_sql\_seed\`) - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Enforce RLS in middleware \`apps/api/middleware/rls.ts\` calling \`apps/api/services/rls/ServiceRoleService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement limited-scope DB access methods in \`apps/api/services/auth/AuthService.ts\` to use service role credentials - (M) (1 hours)\[FE\]\[BE\]
        
    *   Logging: Implement AuditService.logAction() in \`apps/api/services/logging/AuditService.ts\` to record service actions - (M) (1 hours)\[FE\]\[BE\]
        
    *   Security: Add role conflict detection in \`apps/api/services/rls/ServiceRoleService.ts\` (detect overlapping permissions) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Testing: Create integration tests in \`apps/api/tests/rls/serviceRole.test.ts\` covering RLS enforcement, conflicts, and audit logs - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Perf: Add load test scenario in \`apps/api/tests/rls/serviceRole.perf.ts\` and CI job to validate latency under service load - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        

### **Milestone 10: Documentation & deployment: docs, CI/CD deploy, monitoring and release artifacts**

_Estimated 18.5 hours_

*   **Configure Environment:** As a: DevOps engineer, I want to: configure the deployment environment settings (variables, secrets, and runtime config), So that: the application environment is reproducible across stages and supports CI/CD pipelines**(5 hours)** - Environment variables defined for all services Secrets stored securely and retrievable by CI/CD Environment configuration validated in a staging environment
    
    *   Infra: Define environment variables file \`.env.example\` in \`apps/api/.env.example\` with required keys and default placeholder values for staging and production, including API\_BASE\_URL, DB\_HOST, DB\_USER, DB\_PASS, DB\_NAME, and SECRET\_KEY. Ensure file is committed under version control and referenced by config loader. - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Secrets: Store DB and API secrets in AWS Secrets Manager via \`infra/aws/secrets\_manager\_setup.sh\` with parameterized secret names matching env keys (DB\_HOST, DB\_USER, DB\_PASS, DB\_NAME, API\_KEY, SECRET\_KEY). Script should create or update secrets and output ARNs. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   CI: Add secret retrieval to \`.github/workflows/deploy.yml\` to inject secrets into CI/CD as env vars from AWS Secrets Manager (or from repository-provided secrets) for api deployment workflow steps. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Implement config loader in \`apps/api/src/config/index.ts\` to read env vars and secrets (from Secrets Manager or env file) and expose a unified Config object used across the API. Include validation against required keys and defaults. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   API: Add staging validation endpoint in \`apps/api/src/routes/health.ts\` to verify env config and DB connectivity - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   DB: Create Prisma env-aware migration check in \`prisma/migrations/README.md\` and script \`scripts/check\_migrations.sh\` - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Infra: Create staging deploy job in \`infra/github/actions/staging\_deploy.yml\` to validate environment in staging - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Deploy Infrastructure:** As a: DevOps engineer, I want to: deploy infrastructure using IaC templates (Terraform/CloudFormation) and ensure network, compute, and storage are provisioned, So that: the application stack can be deployed end-to-end**(7 hours)** - IaC templates apply without errors Network security groups and access controls in place Infra deployed in staging with health checks passing
    
    *   Infrastructure: Implement Terraform main module at infra/terraform/main.tf to provision VPC, subnets, and EC2 Auto Scaling Group with launch templates and user data integration for app deployment. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Networking: Define security groups and network ACLs in infra/terraform/network.tf to enforce app/db access controls, referencing internal subnets and ALB security posture. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Secrets and IAM: Add AWS SSM Parameter Store parameters and IAM roles in infra/terraform/iam.tf to securely store app configuration and grant permissions to EC2/ASG and deployment roles. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   CI/CD: Implement GitHub Actions deploy workflow in .github/workflows/deploy.yml to run terraform apply against staging with proper approvals and secrets integration. - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Deploy: Create staging deployment script in scripts/deploy/staging\_deploy.sh to provision infra via Terraform and deploy app artifacts to staging environment. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   HealthChecks: Develop health check suite in scripts/health/checks.sh and configure ALB health checks in infra/terraform/loadbalancer.tf to validate app readiness. - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Monitoring: Add CloudWatch alarms and dashboards in infra/terraform/monitoring.tf to monitor infra and app metrics with appropriate thresholds. - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Testing: Write integration tests for staging health in tests/staging/health.test.ts to verify health endpoints and readiness probes. - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Document deployment steps in docs/deployment/README.md and rollback procedure in docs/deployment/rollback.md, ensuring step-by-step guidance and rollback safety checks. - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
*   **Configure Monitoring:** As a: Site reliability engineer, I want to: configure monitoring and alerting for the deployed stack (metrics collection, dashboards, alerts), So that: operators can detect and respond to issues quickly**(7 hours)** - Metrics collected for key components Dashboards available with baseline visuals Alerts configured for critical incidents and on-call escalation
    
    *   Infra: Provision CloudWatch/Prometheus config in \`infra/monitoring/monitoring.tf\` - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Instrument metrics in \`apps/api/services/metrics/MetricsService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Add query metrics exporter in \`apps/api/services/db/DbMetricsExporter.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Expose client metrics in \`apps/web/components/telemetry/ClientTelemetry.tsx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Dashboards: Create Grafana dashboards JSON in \`infra/monitoring/grafana/dashboards/baseline.json\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Alerts: Implement alert rules in \`infra/monitoring/alerts/alerts.rules.yml\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   OnCall: Configure PagerDuty escalation in \`infra/monitoring/alerts/pagerduty\_integration.tf\` - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        

### **Milestone 11: Maintenance & support: ongoing monitoring, performance, security updates, backups and docs updates**

_Estimated 35 hours_

*   **Monitor System Health:** As a: System Administrator, I want to: monitor system health metrics and alerts across all services, So that: I can proactively identify and resolve issues before they affect users**(12 hours)** - Health dashboard displays at least 5 key metrics (CPU, memory, disk, error rate, latency) Alerts trigger when any metric breaches threshold within 1 minute Data retention policy ensures metrics are stored for 30 days System can be configured to suppress noisy alerts for critical services Monitoring runs with no more than 2% false positives over a 24-hour period
    
    *   DB: Create metrics table migration in \`prisma/migrations/2025\_create\_metrics\_table/\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Implement recordMetric() in \`apps/api/services/monitor/MetricService.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /api/monitor/metrics route in \`apps/api/routes/monitor.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Worker: Build AlertWorker in \`apps/api/workers/AlertWorker.ts\` to evaluate breaches within 1 minute - (M) (1 hours)\[FE\]\[BE\]
        
    *   Cache: Configure Redis client in \`apps/api/services/cache/RedisClient.ts\` for real-time windows - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Frontend: Build HealthDashboard component in \`components/monitor/HealthDashboard.tsx\` showing CPU, memory, disk, error rate, latency - (M) (1 hours)\[FE\]\[BE\]
        
    *   Frontend: Add AlertSuppression UI in \`components/monitor/AlertSuppression.tsx\` to toggle suppression per service - (M) (1 hours)\[FE\]\[BE\]
        
    *   Job: Implement retention job in \`apps/api/jobs/RetentionJob.ts\` to purge metrics older than 30 days - (M) (1 hours)\[FE\]\[BE\]
        
    *   Config: Add alerting config in \`apps/api/config/alerting.ts\` for thresholds and suppression rules - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   Infra: Expose Prometheus exporter in \`apps/api/metrics/PrometheusExporter.ts\` for monitoring accuracy - (M) (1 hours)\[FE\]\[BE\]
        
    *   Tests: Add integration tests in \`tests/monitor/alerting.test.ts\` to verify alerts within 1 minute and <2% false positives - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
    *   Docs: Write monitoring docs in \`docs/monitoring.md\` including suppression and retention policies - (M) (1 hours)\[FE\]\[BE\]
        
*   **Performance Optimization:** As a: Product Engineer, I want to: optimize system performance hotspots identified during maintenance, So that: I can improve response times and resource utilization**(4.5 hours)** - Identify top 3 CPU-intensive endpoints Implement caching or query optimization for top endpoints Measure performance before and after changes showing at least 20% latency reduction No regression in existing features after changes Document changes and impact in release notes
    
    *   Profile: Add CPU profiling endpoints and capture traces in apps/api/utils/profiler.ts - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   Analyze: Identify top 3 CPU-intensive endpoints using apps/api/utils/profiler.ts and record in docs/perf/top\_endpoints.md - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Optimize: Implement Redis caching for GET endpoints in apps/api/middleware/cache.ts - (M) (1 hours)\[FE\]\[BE\]
        
    *   Optimize: Add query optimizations for user-related queries in apps/api/services/user/UserService.ts (adjust Prisma queries) - (M) (1 hours)\[FE\]\[BE\]
        
    *   Measure: Add benchmarking scripts in scripts/perf/benchmark.ts to measure latency before/after changes - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   Test: Create integration tests in tests/integration/perf.test.ts to ensure no regressions - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   Doc: Update release notes in docs/release\_notes.md with changes and impact - (S) (0.5 hours)\[FE\]\[BE\]
        
*   **Security Updates:** As a: Security Engineer, I want to: apply critical security updates and verify patch efficacy, So that: I can reduce risk of vulnerabilities in the production environment**(6 hours)** - Patch deployed to all affected services within 24 hours Vulnerability scan shows 0 criticals post-patch Rollback plan tested and ready Compliance auditor confirmation of patch status No service downtime beyond maintenance window
    
    *   INFRA: Update deployment script in apps/api/deploy/deploy.sh to support hot-patch rollout - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Apply security patch in Apps/api/services/auth/AuthService.ts and apps/api/routes/securityPatch.ts - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DB: Create migration to patch vulnerable schema in prisma/migrations/20251104\_security\_patch/ - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   QA: Run vulnerability scan config in tools/security/scan-config.yml and produce report reports/vuln\_scan.json - (XS) (0.5 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   INFRA: Implement rollback procedure in apps/api/deploy/rollback.sh and test in tests/rollback/test\_rollback.sh - (M) (1 hours)\[FE\]\[BE\]\[DevOps\]\[QA\]
        
    *   MON: Add monitoring and alerting rule in infra/monitoring/alerts.yml to detect post-patch anomalies - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   DOC: Prepare compliance report generator in scripts/compliance/generate\_report.ts and output reports/compliance\_report.pdf - (M) (1 hours)\[FE\]\[BE\]
        
    *   TEST: Add integration test in apps/api/tests/security/patch\_integration.test.ts to ensure zero downtime during maintenance window - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Backup Configuration:** As a: IT Administrator, I want to: configure and verify backup schedules and integrity checks, So that: I can ensure data durability and recoverability**(6 hours)** - Backup runs on schedule without failures Restore tests succeed from recent backups Backup integrity verification passes Alerts for backup failures within 5 minutes Retention policy adheres to defined data retention period
    
    *   INFRA: Add scheduled backup job in apps/api/jobs/backup/schedule.ts to run daily - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   API: Implement backup handler in apps/api/services/backup/BackupService.ts to create backups to AWS S3 - (M) (1 hours)\[FE\]\[BE\]
        
    *   DB: Create backup retention policy migration in prisma/migrations/20251104\_add\_backup\_policy/ - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   QA: Implement restore test script in apps/api/tests/backup/restore.test.ts to verify restore from recent backups - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   QA: Add integrity verification job in apps/api/jobs/backup/verifyIntegrity.ts to checksum backups in S3 - (S) (0.5 hours)\[FE\]\[BE\]\[QA\]
        
    *   INFRA: Configure S3 lifecycle rules and retention in infra/aws/s3.tf and infra/README.md - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   API: Expose backup health endpoint in apps/api/routes/backup.ts to report last backup status - (S) (0.5 hours)\[FE\]\[BE\]
        
    *   INFRA: Configure monitoring and alerting in infra/monitoring/alerts.yaml to alert on failures within 5 minutes - (S) (0.5 hours)\[FE\]\[BE\]\[DevOps\]
        
    *   DOC: Document backup run and restore procedure in docs/backup/README.md - (XS) (0.5 hours)\[FE\]\[BE\]
        
    *   DEV: Add database snapshot export in apps/api/services/backup/pgDump.ts referencing table\_users for testing data inclusion - (M) (1 hours)\[FE\]\[BE\]\[QA\]
        
*   **Update Documentation:** As a: Documentation Specialist, I want to: update system and process documentation reflecting changes, So that: users and operators have accurate and current guidance**(7 hours)** - Documentation updated in all relevant artifacts Changelog generated and published Docs reviewed for accuracy and completeness User-facing changes highlighted in release notes
    
    *   Docs: Update project README in \`README.md\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   DocsSite: Update docs pages in \`apps/web/components/docs/\*.mdx\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   API: Add /docs metadata endpoint in \`apps/api/routes/docs.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Changelog: Implement changelog generator in \`scripts/generate-changelog.ts\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   ReleaseNotes: Create \`docs/release-notes.md\` highlighting user-facing changes - (M) (1 hours)\[FE\]\[BE\]
        
    *   Review: Run docs review checklist in \`docs/REVIEW\_GUIDELINES.md\` and record in \`docs/review\_report.md\` - (M) (1 hours)\[FE\]\[BE\]
        
    *   Publish: Upload docs and changelog to S3 in \`scripts/publish-docs-to-s3.ts\` - (M) (1 hours)\[FE\]\[BE\]
        

### **Total Hours: 3359**