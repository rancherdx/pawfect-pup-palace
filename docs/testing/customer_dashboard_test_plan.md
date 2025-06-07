# Customer Dashboard Functionality Test Plan

This document outlines the test plan for the customer-facing dashboard features.

**User for Testing:** `customer@example.com` (Password: `Password123$Puppies`)

---

**I. User Profile (`/dashboard` - UserProfile section):**

1.  **View Profile:**
    *   **Test Case ID:** UP-VIEW-001
    *   **Steps:**
        1.  Log in as `customer@example.com`.
        2.  Navigate to the dashboard (`/dashboard`).
        3.  Locate the "Your Profile" section.
    *   **Expected Results:**
        *   User's name "John Smith" is displayed.
        *   User's email "customer@example.com" is displayed.
        *   User's phone "555-0101" is displayed (based on `master_seed.sql` updates).
        *   User's address "123 Main St, Anytown, USA 12345" is displayed.
        *   User's preferences "Email for general updates, SMS for urgent alerts." are displayed.
        *   All information should match the seed data for `user-customer-001`.

2.  **Edit Profile:**
    *   **Test Case ID:** UP-EDIT-001
    *   **Steps:**
        1.  Log in as `customer@example.com` and navigate to the dashboard.
        2.  Click the "Edit Profile" button.
        3.  In the form, change the phone number to `555-0202`.
        4.  Change the address to `456 New Ave, Othertown, USA 67890`.
        5.  Change preferences to `SMS only for all communications.`.
        6.  Click the "Save Changes" button.
    *   **Expected Results:**
        *   A success toast message (e.g., "Profile Updated") is displayed.
        *   The displayed profile information (phone, address, preferences) updates immediately on the page without a full refresh.
        *   After refreshing the page, the new information (`555-0202`, `456 New Ave...`, `SMS only...`) persists, confirming it was saved to the backend.

3.  **Cancel Edit:**
    *   **Test Case ID:** UP-CANCEL-001
    *   **Steps:**
        1.  Log in as `customer@example.com` and navigate to the dashboard.
        2.  Click "Edit Profile".
        3.  Change the "Full Name" field to "Johnny Smith".
        4.  Click the "Cancel" button.
    *   **Expected Results:**
        *   The "Full Name" field reverts to "John Smith".
        *   No changes are saved to the backend (verify by refreshing if necessary, though cancellation should be client-side).

---

**II. Creature/Puppy Profiles (`/dashboard` - Your Fur Family / CreatureProfiles section & `/dashboard/puppy/:puppyId` - PuppyProfile section):**

1.  **View Adopted Puppies (CreatureProfiles):**
    *   **Test Case ID:** CP-VIEW-001
    *   **Steps:**
        1.  Log in as `customer@example.com`.
        2.  Navigate to the dashboard.
        3.  Observe the "Your Fur Family" (or similar) section.
    *   **Expected Results:**
        *   `puppy-003` named "Rex" (Labrador Retriever, based on `master_seed.sql` litter and breed data) is listed.
        *   An image for Rex is displayed (either from `image_urls` or a placeholder if none).
        *   The "Adopt a Puppy" button is visible and correctly links to the `/adopt` page.
        *   No other puppies (e.g., puppy-001, puppy-002) should be listed as they are not adopted by `user-customer-001`.

2.  **View Full Puppy Profile (PuppyProfile for `puppy-003`):**
    *   **Test Case ID:** PP-VIEW-001
    *   **Steps:**
        1.  From the "Your Fur Family" list on the dashboard, click on "Rex" (`puppy-003`).
    *   **Expected Results:**
        *   The application navigates to `/dashboard/puppy/puppy-003`.
        *   **Basic Info:**
            *   Name "Rex" is displayed.
            *   Breed "Labrador Retriever" is displayed.
            *   Birth date "2025-06-15" is displayed.
            *   Color "Black" is displayed.
            *   Status "reserved" (or "adopted" if seed data implies full adoption) is displayed.
        *   **Health Records Tab:**
            *   **Vaccinations:** Any vaccinations specifically seeded for `puppy-003` should appear. (Note: `master_seed.sql` instructions focused on other puppies; if none for `puppy-003`, this section would be empty or show "No vaccination records").
            *   **Growth Chart:** Any weight/height logs for `puppy-003` should render points. (Similar to vaccinations, check seed data).
            *   **Documents:** Any documents for `puppy-003` should be listed.

3.  **Add Health Record (for `puppy-003`):**
    *   **Test Case ID:** PP-ADDHEALTH-001
    *   **Steps:**
        1.  Navigate to `/dashboard/puppy/puppy-003`.
        2.  Go to the "Health" tab (or equivalent section).
        3.  Click a button like "Add Health Record".
        4.  Fill in the form for a new "Vaccination" record:
            *   Record Type: `vaccination`
            *   Date: (Select today's date)
            *   Details: "Rabies vaccine administered by Dr. Vet"
        5.  Save the record.
    *   **Expected Results:**
        *   A success message is shown.
        *   The new "Rabies vaccine..." record appears in the vaccinations list immediately.
        *   The record persists after a page refresh.
    *   **Test Case ID:** PP-ADDHEALTH-002
    *   **Steps:**
        1.  On the same puppy profile, add a new "Weight Log" record:
            *   Record Type: `weight_log`
            *   Date: (Select today's date)
            *   Value: `12`
            *   Unit: `lbs`
        2.  Save the record.
    *   **Expected Results:**
        *   A success message is shown.
        *   The new weight log appears in a list/table of health records.
        *   The growth chart (if implemented to show weight) updates with a new data point for 12 lbs on today's date.
        *   The record persists after a page refresh.

4.  **Messaging Tab (within PuppyProfile for `puppy-003`):**
    *   **Test Case ID:** PP-MSG-001
    *   **Steps:**
        1.  Navigate to `/dashboard/puppy/puppy-003`.
        2.  Select the "Messages" or "Chat" tab.
    *   **Expected Results:**
        *   The conversation titled "Checking in on Rex (puppy-003)" (from `conv-002` in seed data) is loaded and selected by default (as it's related to this puppy).
        *   The seeded messages between `user-customer-001` and `admin-breeder-01` are displayed chronologically.
    *   **Test Case ID:** PP-MSG-002
    *   **Steps:**
        1.  In the active chat for "Checking in on Rex (puppy-003)", type "How is his appetite?" into the message input.
        2.  Click "Send".
    *   **Expected Results:**
        *   The message "How is his appetite?" appears immediately in the chat window, attributed to `user-customer-001`.
        *   (Backend Verification): The message is saved to the `messages` table, associated with `conv-002`. The `last_message_preview` and `last_message_at` for `conv-002` in the `conversations` table should update.

5.  **Puppy Not Owned by User:**
    *   **Test Case ID:** PP-AUTH-001
    *   **Steps:**
        1.  Log in as `customer@example.com`.
        2.  Manually navigate to `/dashboard/puppy/puppy-001` (Buddy, who is not adopted by `user-customer-001`).
    *   **Expected Results:**
        *   One of the following based on implementation:
            *   A user-friendly "Puppy not found" or "You do not have permission to view this profile" message is displayed.
            *   The user is redirected (e.g., to the main dashboard page).
            *   The main puppy info might display (if fetched from public `/api/puppies/:id`), but sensitive sections like Health Records (add/view) and Messaging should be disabled, hidden, or show an access denied message. This depends on how `getPuppyHealthRecords` and chat authorization are implemented.

---

**III. Chat History (`/dashboard` - ChatHistory section):**

1.  **View Conversations:**
    *   **Test Case ID:** CH-VIEW-001
    *   **Steps:**
        1.  Log in as `customer@example.com`.
        2.  Navigate to the dashboard and find the "Chat History" or "Messages" section.
    *   **Expected Results:**
        *   Conversation "Question about website features" (`conv-001`) is listed.
        *   Conversation "Checking in on Rex (puppy-003)" (`conv-002`) is listed.
        *   The `last_message_preview` and `last_message_at` (or a formatted version of the date) for each conversation match the latest message from the seed data.
        *   The archived conversation "Post-adoption questions for Lucy" (`conv-003`) is either not present or styled differently (e.g., greyed out) if the UI filters/handles archived chats.

2.  **View Messages in a Conversation:**
    *   **Test Case ID:** CH-VIEWMSG-001
    *   **Steps:**
        1.  In the Chat History section, click on the "Question about website features" conversation (`conv-001`).
    *   **Expected Results:**
        *   The message panel updates to show the messages for `conv-001`.
        *   Seeded messages between `user-customer-001` and `admin-support-01` are displayed in chronological order.

3.  **Send Message:**
    *   **Test Case ID:** CH-SENDMSG-001
    *   **Steps:**
        1.  With "Question about website features" (`conv-001`) active, type "Thanks for the help!" into the message input.
        2.  Click "Send".
    *   **Expected Results:**
        *   The message "Thanks for the help!" appears immediately in the chat window for `conv-001`.
        *   (Backend Verification): The message is saved to the `messages` table for `conv-001`.
        *   The `last_message_preview` for `conv-001` in the conversation list updates to "Thanks for the help!" (or a snippet).
        *   The `last_message_at` for `conv-001` updates to the current time.

4.  **Start New Chat:**
    *   **Test Case ID:** CH-NEWCHAT-001
    *   **Steps:**
        1.  Click the "Start New Chat" button.
        2.  A modal or form appears. Enter a title: "New Food Inquiry".
        3.  Enter the first message: "What brand of food do you recommend for adult Labradors?".
        4.  Submit/Send the new chat request.
    *   **Expected Results:**
        *   The modal closes.
        *   A new conversation titled "New Food Inquiry" (or similar, based on backend logic if title is auto-generated from first message) appears in the conversation list, likely at the top.
        *   This new conversation becomes the active chat.
        *   The message "What brand of food do you recommend for adult Labradors?" is displayed in the message panel.
        *   (Backend Verification): A new record is created in the `conversations` table for `user-customer-001`, and a corresponding message is saved in the `messages` table.

---

**IV. Receipts (`/dashboard` - My Adoption Records / Receipts section):**

1.  **View Receipts:**
    *   **Test Case ID:** RC-VIEW-001
    *   **Steps:**
        1.  Log in as `customer@example.com`.
        2.  Navigate to the dashboard and find the "My Adoption Records" or "Receipts" section.
    *   **Expected Results:**
        *   The transaction `txn-001` (related to `puppy-003` deposit) is listed.
        *   Displayed information:
            *   Order ID (or Transaction ID): `txn-001` (or Square Payment ID `sq_payment_id_example_123`).
            *   Date: Matches `created_at` from seed data (e.g., 5 days ago).
            *   Amount: `$500.00` (from 50000 cents).
            *   Currency: `USD`.
            *   Status: `succeeded`.

2.  **View Receipt Details:**
    *   **Test Case ID:** RC-DETAIL-001
    *   **Steps:**
        1.  Click "View Details" (or similar action) for transaction `txn-001`.
    *   **Expected Results:**
        *   A modal or detail view appears.
        *   Correct Transaction ID, Date, Status, Amount, and Currency are shown.
        *   Item description accurately reflects the transaction (e.g., "Deposit for Rex the black lab." or "Payment for Puppy ID: puppy-003").

3.  **Search/Filter (if implemented):**
    *   **Test Case ID:** RC-SEARCH-001
    *   **Steps:** (Assuming a basic client-side search on the current page of receipts is implemented)
        1.  Enter `txn-001` into a search bar.
    *   **Expected Results:**
        *   Only transaction `txn-001` is visible in the list.
    *   **Test Case ID:** RC-FILTER-001
    *   **Steps:**
        1.  Clear search. Enter `succeeded` into a search bar (or use a status filter).
    *   **Expected Results:**
        *   Transaction `txn-001` (status: succeeded) is visible.

4.  **Pagination (Manual Test - Requires Data Setup):**
    *   **Test Case ID:** RC-PAGINATE-001
    *   **Prerequisite:** Seed more than the default page limit (e.g., >10) transactions for `user-customer-001`.
    *   **Steps:**
        1.  Navigate to the receipts section.
    *   **Expected Results:**
        *   Pagination controls (e.g., "Next", "Previous", page numbers) are visible.
        *   Navigating to the next page loads a new set of transactions.

---

**V. General Checks:**

1.  **Error Handling:**
    *   **Test Case ID:** GEN-ERR-001
    *   **Steps:** (Requires developer tools or specific test setup to simulate API failures)
        1.  For each data-fetching component/section (Profile, Puppies, Puppy Detail, Health Records, Chats, Receipts):
            a.  Simulate a 500 server error from the relevant API endpoint.
            b.  Simulate a 403 Forbidden error.
            c.  Simulate a network error (offline).
    *   **Expected Results:**
        *   A user-friendly error message or toast is displayed (e.g., "Could not load profile. Please try again later.", "You are not authorized to view this information.").
        *   The application remains stable and does not crash.
        *   Sensitive data is not displayed.
    *   **Test Case ID:** GEN-ERR-002
    *   **Steps:**
        1. Attempt to submit the "Edit Profile" form with the "Full Name" field empty (if it's a required field on the frontend).
    *   **Expected Results:**
        * Client-side validation message appears, preventing submission, or a backend error is gracefully handled if validation is primarily backend.


2.  **Loading States:**
    *   **Test Case ID:** GEN-LOAD-001
    *   **Steps:**
        1.  Navigate to each section of the dashboard (Profile, Puppies list, Puppy Detail, Chat History, Receipts).
        2.  Observe behavior while data is being fetched (especially on slower connections, which can be simulated via browser dev tools).
    *   **Expected Results:**
        *   Appropriate loading indicators (e.g., spinners, skeleton screens, "Loading..." text) are displayed in each section while its data is being fetched.
        *   The UI does not appear broken or empty before data arrives.

3.  **Authentication & Authorization:**
    *   **Test Case ID:** GEN-AUTH-001
    *   **Steps:**
        1.  Log out of the application.
        2.  Attempt to navigate directly to `/dashboard` (or any of its sub-routes like `/dashboard/puppy/some-id`).
    *   **Expected Results:**
        *   The user is redirected to the login page.
        *   No dashboard content is accessible.
    *   **Test Case ID:** GEN-AUTH-002
    *   **Steps:** (Requires a tool like Postman or browser dev tools)
        1.  Attempt to call dashboard-related API endpoints (e.g., `/api/user`, `/api/my-puppies`) directly without including an authentication token in the headers.
    *   **Expected Results:**
        *   The API returns a 401 Unauthorized or 403 Forbidden error.
        *   No data is returned.

---

This test plan will be used to guide the verification of the implemented customer dashboard features.
