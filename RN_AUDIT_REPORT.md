# React Native Audit & Completion Report

Date: 2026-05-25
App: `admin-qlsv` (Expo Router / React Native) — "Food AI For Gym Members"
Backend audited against: `server-qlsv` (Laravel, `routes/api.php`)

## Summary

- **Files created:** 3
- **Files modified:** 12
- **API endpoints now correctly integrated:** 12 / 12 used by the member app (plus the admin user list)
- The full member journey now works end-to-end: **register → (auto-login) → goal + calorie setup → AI meal plan → rate foods**, with proper loading/empty/error states.

## Files created

| File | Purpose |
|------|---------|
| `app/(auth)/register.tsx` | Registration screen (name, email, password+confirm, DOB, gender, height, weight, activity level) → `POST /auth/register`, then auto-login and continue onboarding. |
| `utils/sessionFlow.ts` | `resolveEntryRoute()` — single source of truth for post-auth routing (no profile → ProfileSetting; no active goal → setting-target; else → DailyScreen). |
| `utils/apiError.ts` | `parseApiError` / `summarizeApiError` — normalizes the backend's **two** 422 shapes (BaseRequest `{message:{field:[]}}` and Laravel default `{message, errors:{}}`). |

## Files modified

| File | Change |
|------|--------|
| `constants/constants.ts` | Rewrote the `API` map to match `routes/api.php` exactly. Removed non-existent routes (`user-goal/*`, `user/list`, `user/delete`, `forgot-password`); added `GOAL`, `CALORIE`, `FOOD_RATING`, real `MEAL_PLAN`/`USER` paths. |
| `store/userStore.ts` | `getUserProfile`/`fetchUserDetail` now use slash-free GET; `createUserProfile` maps to `PUT` (no create route exists); `forgotPassword` is a documented no-op. |
| `store/errorStore.ts` | Now parses **both** 422 formats and preserves Laravel's `errors` map on the exception path, so field-level messages reach `ErrorDialog`. |
| `services/authService.ts` | Added `register()`. |
| `app/splash.tsx` | After token verify, routes via `resolveEntryRoute()` instead of hardcoding DailyScreen. |
| `app/(auth)/_layout.tsx` | Fixed `Stack.Screen` names (`register`, `ForgotPassword`); replaced the racey hard-redirect-to-DailyScreen with the resolver. |
| `app/(auth)/LoginScreen.tsx` | Login now routes via `resolveEntryRoute()`; removed hardcoded dev credentials. |
| `app/(auth)/ForgotPassword.tsx` | Honest "not supported" message (backend has no reset endpoint); removed dead API call + hardcoded creds. |
| `app/Screen/ProfileSetting.tsx` | During onboarding (`?onboarding=1`), advances to the next step after save. |
| `app/Screen/setting-target.tsx` | After saving the first goal it calculates calories and (during onboarding) enters the app; auto-opens the create form on the onboarding step. |
| `app/(app)/ProfileScreen.tsx` | Fetches profile + detail on mount (app-resume previously left it blank). |
| `app/(app)/DailyScreen.tsx` | Real loading + empty states (no more fake placeholder plan); regenerate confirmation; "may take up to 60s" UX; macro targets now come from the real calorie calc (`/calorie/latest`). Removed dead queue state. |
| `app/(web)/UserManagement.tsx` | List wired to `GET /user/get-list` with correct paging param; numeric `role`/`account_status` rendering; write actions honestly report "not supported by API". |
| `app/(web)/addOrEditUser.tsx` | Compiles (optional props), closes cleanly, and states that user creation goes through public registration. |

## What was already correct (left untouched)

- Axios client & 401-refresh/403 interceptors (`api/http.ts`).
- `mealPlanStore` endpoints and `{total,data}` unwrapping.
- `setting-target` goal/calorie endpoints (used correct hardcoded paths all along).
- `RatingModal` and the `POST /food-ratings/rate` integration in `DailyScreen`.
- Theme system, splash animation, `FormComponent` validation engine.

## Known remaining gaps (backend limitations, not fixable client-side)

1. **No true refresh token.** `POST /auth/refresh` requires a *still-valid* JWT, so once the access token expires the refresh also fails and the user is logged out. The client retry logic is correct; the limitation is server-side.
2. **No password reset.** There is no `forgot-password` route; the screen now says so.
3. **No admin user create/update/delete.** Only `POST /auth/register` creates users. Admin `UserManagement` is therefore list-only; write actions report the limitation.
4. **Food images.** The backend does not return image URLs for foods, so `DailyScreen`/`RatingModal` fall back to placeholder images.

## Important notes for developers

- **Set the API base URL** in `admin-qlsv/.env` → `EXPO_PUBLIC_BASE_URL` (currently `http://192.168.0.146:8000`). It must point at the running Laravel server reachable from the device/emulator.
- The Python AI service must be running and reachable from Laravel (`services.python_ai.url`) for meal-plan generation; generation can take up to ~60s.
- **Pre-existing TypeScript noise:** `npx tsc --noEmit` reports many `createStyles(tokens)` errors because `themeTokens` is declared `as const` (dark/light literal-type mismatch). These exist across the whole codebase (including untouched components), are type-only, and do **not** affect the Expo/Babel build. This audit introduced no new type errors. A one-line fix in `store/themeStore.ts` (type the tokens map with `string` values / a shared `ThemeTokens` interface) would clear them all if desired.

## API integration status

| Endpoint | Status | Screen / Store |
|----------|--------|----------------|
| POST /auth/login | ✅ | LoginScreen / authStore |
| POST /auth/register | ✅ (new) | register.tsx / authService |
| POST /auth/refresh | ✅ | http.ts interceptor |
| GET /auth/logout | ✅ | ProfileScreen / authStore |
| GET /auth/me | ✅ | splash.tsx |
| GET /user/detail | ✅ | userStore |
| GET /user/profile | ✅ | ProfileScreen / ProfileSetting |
| PUT /user/profile | ✅ | ProfileSetting |
| GET /goals/active · POST/PUT/DELETE /goals | ✅ | setting-target |
| POST /calorie/calculate | ✅ | setting-target |
| GET /calorie/latest | ✅ (new) | DailyScreen (macro targets) |
| GET /food-categories · /foods · /foods/category | ✅ | mealPlanStore |
| GET /meal-plans/active | ✅ | DailyScreen / mealPlanStore |
| POST /meal-plans/generate | ✅ | DailyScreen / mealPlanStore |
| POST /food-ratings/rate | ✅ | DailyScreen / RatingModal |
| GET /user/get-list | ✅ | UserManagement (admin, list-only) |
