# Changelog: Add API Documentation Viewer (Swagger/ReDoc)

**Task:** Implement a full-featured API documentation viewer within the admin dashboard, using both Swagger UI and ReDoc.

---

### Section 1: Files Changed

*   **Added:** `public/openapi.json`
*   **Added:** `src/components/admin/SwaggerUI.tsx`
*   **Added:** `src/components/admin/ReDocUI.tsx`
*   **Edited:** `package.json` & `bun.lockb` (to add dependencies)
*   **Edited:** `src/pages/AdminDashboard.tsx`

---

### Section 2: Detailed Breakdown of Changes

#### **Feature: API Documentation**
This feature adds a comprehensive, interactive API documentation viewer directly into the admin dashboard, available in two popular formats.

*   **URLs for Access:**
    *   **Swagger UI:** `https://new.gdspuppies.com/admin?tab=swagger`
    *   **ReDoc:** `https://new.gdspuppies.com/admin?tab=redoc`

*   **File: `public/openapi.json`**
    *   **Change Type:** Added
    *   **Reason:** This file provides the standardized OpenAPI 3.0 specification for your Supabase Edge Function API. Both Swagger and ReDoc use this file as the source of truth to generate the interactive documentation. It has been pre-populated with a few example endpoints.

*   **File: `package.json` / `bun.lockb`**
    *   **Change Type:** Edited
    *   **Reason:** Added `swagger-ui-react` and `redoc` as new dependencies. These are the libraries that render the documentation UIs.

*   **Files: `src/components/admin/SwaggerUI.tsx` & `ReDocUI.tsx`**
    *   **Change Type:** Added
    *   **Reason:** These are new, simple React components that wrap the respective documentation libraries and point them to the `openapi.json` file for rendering.

*   **File: `src/pages/AdminDashboard.tsx`**
    *   **Change Type:** Edited
    *   **Reason:** This file was modified to integrate the new feature.
        1.  New tabs for "Swagger UI" and "ReDoc" were added to the dashboard's navigation.
        2.  Logic was added to sync the active tab with the URL's query parameter (e.g., `?tab=swagger`). This makes the documentation pages directly linkable, which is crucial for ease of use.

#### **Instructions for `loveable.dev` / Deployment**
*   **Environment Variables:** No new environment variables are required for this feature to function.
*   **Build Process:** No changes are needed for the build process. The new dependencies (`swagger-ui-react`, `redoc`) will be installed automatically during a standard `bun install`.
*   **Deployment:** The changes are self-contained within the repository. A standard deployment of this branch will make the feature live. The most important part is that the `public/openapi.json` file gets deployed as a static asset, which is the default behavior for Vite projects.
