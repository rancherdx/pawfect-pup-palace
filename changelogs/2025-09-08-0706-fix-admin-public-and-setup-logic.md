# Changelog: Fix Admin Access, Public Pages, and Setup Logic

**Task:** Comprehensive review and fix of a website recently migrated to Supabase. The primary goals were to fix admin dashboard access, repair broken public-facing pages, and implement specific business logic for a two-admin setup page.

---

### Section 1: Files Changed

*   **Edited:** `src/components/ProtectedRoute.tsx`
*   **Edited:** `supabase/functions/setup-status/index.ts`
*   **Edited:** `supabase/functions/setup-admin/index.ts`
*   **Edited:** `src/pages/Setup.tsx`
*   **Added:** `supabase/migrations/20250908065350_add_rls_for_public_pages.sql`
*   **Added:** `supabase/migrations/20250908065454_create_count_super_admins_fn.sql`

---

### Section 2: Detailed Breakdown of Changes

#### **File: `src/components/ProtectedRoute.tsx`**
*   **Change Type:** Edited
*   **Original Code Stub:**
    ```tsx
    if (requiredRole && !user?.roles?.includes(requiredRole)) {
      return <Navigate to="/dashboard" replace />;
    }
    ```
*   **Change Made:** The logic was expanded to check if the user has the `super-admin` role when the `admin` role is required.
*   **Reason:** The original logic did not account for the `super-admin` role, causing users with that role to be redirected away from admin pages. This change aligns the frontend's authorization with the backend's role hierarchy.

#### **File: `supabase/migrations/20250908065350_add_rls_for_public_pages.sql`**
*   **Change Type:** Added
*   **Reason:** This new migration file was added to create Row Level Security (RLS) policies for all public-facing tables (`litters`, `studs`, `blog_posts`, etc.). The original setup was missing these policies, which caused the database to return no data to unauthenticated users, making the public pages appear empty. This file makes those pages viewable by the public.

#### **File: `supabase/migrations/20250908065454_create_count_super_admins_fn.sql`**
*   **Change Type:** Added
*   **Reason:** This new migration file was added to create a new SQL function, `count_super_admins()`. This function is required by the setup page's backend logic to determine how many super admins already exist, enabling the two-admin limit.

#### **File: `supabase/functions/setup-status/index.ts`**
*   **Change Type:** Edited
*   **Original Code Stub:**
    ```typescript
    const { data, error } = await supabase.rpc('check_admin_exists')
    // ...
    return new Response(JSON.stringify({ setupRequired: !data }))
    ```
*   **Change Made:** The function was changed to call the new `count_super_admins()` RPC and return an object with the admin count, e.g., `{ "adminCount": 1 }`.
*   **Reason:** The original function only returned a true/false value. The setup page's new logic requires the specific number of admins to display correct messages and enforce the limit, so this backend function was updated to provide that count.

#### **File: `supabase/functions/setup-admin/index.ts`**
*   **Change Type:** Edited
*   **Changes Made:**
    1.  The check for `check_admin_exists` was replaced with a call to `count_super_admins()`. The function now rejects creation if the count is 2 or more.
    2.  Validation logic was added to check if `adminCount` is 1. If so, it verifies that the new user's name and email match "Girard Sawyer" and "girard@gdspuppies.com".
    3.  A check for a secret header (`X-Setup-Secret`) was added at the beginning of the function to prevent unauthorized API calls.
*   **Reason:** These changes were necessary to implement the user's specific business logic for the two-admin limit and to add a layer of security to the endpoint.

#### **File: `src/pages/Setup.tsx`**
*   **Change Type:** Edited
*   **Changes Made:** The component was significantly refactored.
    1.  State was updated from a `needsSetup` boolean to an `adminCount` number.
    2.  The `checkSetupStatus` function was updated to fetch and store the admin count from the updated API endpoint.
    3.  The JSX rendering was made dynamic to display messages based on the `adminCount` (e.g., "1 of 2 admins created").
    4.  The form and submit button are now disabled if `adminCount` is 2 or more.
    5.  The `handleSubmit` function was updated to pass the `X-Setup-Secret` header in its API call.
*   **Reason:** The entire frontend page needed to be updated to match the new, more complex backend logic for the two-admin setup process.
