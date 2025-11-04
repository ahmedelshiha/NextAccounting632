# Plan: Retire “Entities” Tab (Clients + Team) and Migrate to Dashboard User Directory

## Goals
- Remove Entities tab and consolidate all Clients/Team management into the Dashboard tab’s unified user directory.
- Preserve full CRUD and workflows via unified forms/services while maintaining backward compatibility and redirects.
- Reduce duplication (types, APIs, forms, filters) and simplify navigation.

## Current State (from docs/ADMIN_USERS_DATA_AUDIT_REPORT.md + code)
- Entities tab exists with Clients/Team sub-tabs: `src/app/admin/users/components/tabs/EntitiesTab.tsx`
- Dashboard tab already hosts the unified user directory (UsersTable + AdvancedUserFilters): `ExecutiveDashboardTab.tsx`
- Unified types/hooks/services are in place: `types/entities.ts`, `useFilterUsers.ts`, `useUnifiedUserService.ts`, `useEntityForm.ts`
- Legacy routes redirect to Entities: `/admin/clients`, `/admin/team` → `/admin/users?tab=entities`
- APIs: `/api/admin/entities/clients`, `/api/admin/entities/team-members`; and generalized `/api/admin/users` search/filter in place
- Forms: `ClientFormModal.tsx`, `TeamMemberFormModal.tsx` (duplicated logic)

## Decision
- Retire Entities tab and move Clients/Team management into Dashboard tab via:
  - Role-scoped filters (CLIENT, TEAM_MEMBER, TEAM_LEAD, etc.) and saved views
  - A single “New” action that opens a unified User form (role-first flow)
- Keep legacy routes functional via updated redirects into Dashboard tab with role filters.

## Scope
- UI: Tabs/navigation, Dashboard enhancements, form consolidation, removal of Entities tab.
- API: Prefer `/api/admin/users` with role filters; keep legacy `/api/admin/entities/*` endpoints during deprecation window.
- Types/hooks/services: Continue using unified types and hooks.
- Tests: Update E2E/unit to new paths and behaviors.
- Docs: Update all references.

## Phased Rollout (with feature flag: `RETIRE_ENTITIES_TAB`)
1) Prepare (FF off)
2) Dual-run (FF on for staging) + redirects to Dashboard
3) Remove Entities (FF default on) post soak
4) Cleanup legacy APIs, tests, docs

---

## Single-Page Dashboard Redesign (Oracle Fusion–style “Work Area”)
[kept: see above sections for IA, layout, interactions, a11y, perf, mobile, migration steps]

---

## Admin/Users Code Audit Findings (pre-implementation reference)
[kept: entry points, contexts, components, hooks, APIs, risks, tests, flags]

---

## Gaps Identified (to close before coding)
- URL role filter not parsed/applied on Dashboard; legacy route redirects lack role preselection.
- Client/Team modals not unified; need `UnifiedUserFormModal` and role-first creation path from `CreateUserModal`.
- UsersTable `onViewProfile` not wired to `UserProfileDialog` drawer; missing Saved Views, left filter rail, and Command Bar/⌘K.
- `/api/admin/entities/*` missing `Deprecation` headers; feature flags + telemetry not standardized.

---

## Phased To‑Do Plan (small, trackable tasks)

### Phase 0 — Flags, Telemetry, Guards
- [ ] Add feature flags: `RETIRE_ENTITIES_TAB`, `DASHBOARD_SINGLE_PAGE` (env + runtime check).
- [ ] Instrument telemetry events: `users.view_saved`, `users.search`, `users.bulk_apply`, `users.redirect_legacy`.
- [ ] Add runtime guard in `EnterpriseUsersPage.tsx` to hide Entities when `RETIRE_ENTITIES_TAB` on.

### Phase 1 — URL Role Filter + Redirects
- [ ] In `EnterpriseUsersPage.tsx`, parse `role` from URL; set UsersContext filters on mount.
- [ ] Update redirect handlers so:
  - `/admin/clients` → `/admin/users?tab=dashboard&role=CLIENT`
  - `/admin/team` → `/admin/users?tab=dashboard&role=TEAM_MEMBER`
- [ ] Add tests in `e2e/tests/admin-unified-redirects.spec.ts` for role chip active after redirect.

### Phase 2 — Unified Creation Flow
- [ ] Create `src/components/admin/shared/UnifiedUserFormModal.tsx` using `useEntityForm`.
- [ ] Support role-first create (prefill fields by role); validation per role.
- [ ] Replace usage of `ClientFormModal` and `TeamMemberFormModal` across Entities/Dashboard with Unified modal.
- [ ] Update `CreateUserModal` to route into Unified modal with selected role.
- [ ] Add unit tests for payload mapping per role.

### Phase 3 — Work-Area UX Enhancements
- [ ] Wire `UsersTable.onViewProfile` → open `UserProfileDialog` drawer (split-pane/drawer behavior).
- [ ] Add Saved Views (URL-addressable) to `ExecutiveDashboardTab` (e.g., `view=my-team`, `recent`).
- [ ] Implement left filter rail (collapsible) with Role/Status/Department/Tier; sticky on scroll.
- [ ] Add Command Bar with actions: Add, Import CSV, Bulk Update, Export, Refresh.
- [ ] Add Command Palette (⌘K) with quick actions and entity search.
- [ ] Ensure User Directory appears above infolets when `DASHBOARD_SINGLE_PAGE` is on.

### Phase 4 — API Deprecation & Proxies
- [ ] Add `Deprecation: true` and `Link: </api/admin/users>; rel="successor"` headers to `/api/admin/entities/clients*` and `team-members*`.
- [ ] Ensure proxies forward to unified service where possible; normalize responses.
- [ ] Add server logs/metrics for legacy endpoint usage.

### Phase 5 — Retire Entities UI (behind FF)
- [ ] Remove `entities` from `TabNavigation.tsx` when flag on.
- [ ] Remove EntitiesTab code path in `EnterpriseUsersPage.tsx` (flag-guarded first).
- [ ] Update menu validators and redirects; keep redirects for 1–2 sprints.

### Phase 6 — Tests & Docs
- [ ] Update E2E: remove `admin-entities-tab.spec.ts`; adjust flows to Dashboard.
- [ ] Update virtual scrolling tests to navigate Dashboard directly.
- [ ] Update docs to reflect single-page work area and unified creation.

### Phase 7 — Rollout & Monitoring
- [ ] Enable flags in staging; monitor metrics and errors.
- [ ] Enable in production; watch `users.redirect_legacy` trend to decide legacy API removal.
- [ ] After soak, delete EntitiesTab + legacy routes; remove feature flags.

---

## File-Level Task Map
- URL/Redirects: `src/app/admin/users/EnterpriseUsersPage.tsx`, redirect utilities/pages.
- Unified Modal: `src/components/admin/shared/UnifiedUserFormModal.tsx`, replace uses in `EntitiesTab.tsx` and Dashboard components.
- Drawer/Saved Views/Rail/Command Bar: `src/app/admin/users/components/tabs/ExecutiveDashboardTab.tsx`, `UsersTable.tsx`, filters.
- API Deprecation: `src/app/api/admin/entities/clients*/route.ts`, `team-members*/route.ts`, server logging.
- Flags: gating in `TabNavigation.tsx`, `EnterpriseUsersPage.tsx`.
- Tests: `e2e/tests/*`, unit tests for modal payload and URL filter parser.

## Exit Criteria
- Legacy URLs redirect to Dashboard with role preselected; filters applied on load.
- Unified modal handles Client/Team/Admin creation; old modals unused.
- Drawer navigation avoids full-page transitions; Saved Views persist via URL.
- Entities UI hidden; legacy APIs emit deprecation; telemetry confirms adoption. 
