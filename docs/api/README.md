# GDS Puppies API Documentation

This document provides details on the API endpoints available in the GDS Puppies application.

## Base URL

All API endpoints are relative to the application's base URL (e.g., `https://yourdomain.com` or `http://localhost:8787`). API routes are typically prefixed with `/api/`.

## Authentication

*   **Public Endpoints**: No authentication required.
*   **User Authenticated Endpoints**: Require a valid session token or JWT passed in the `Authorization: Bearer <token>` header. These primarily use session-based authentication managed by `verifySessionAuth`.
*   **Admin Endpoints**: Require a valid JWT for an admin user, passed in the `Authorization: Bearer <token>` header. These are protected by `adminAuthMiddleware` which verifies JWTs and admin roles.

## Common Error Responses

*   **400 Bad Request**: Invalid input or malformed request.
    ```json
    { "error": "Validation Error", "details": "Specific field error message." }
    ```
*   **401 Unauthorized**: Authentication failed or token is missing/invalid.
    ```json
    { "error": "Unauthorized", "details": "Authentication required." }
    ```
*   **403 Forbidden**: Authenticated user does not have permission for the action.
    ```json
    { "error": "Forbidden", "details": "You do not have administrative privileges." }
    ```
*   **404 Not Found**: Resource not found.
    ```json
    { "error": "Not Found", "details": "Resource with ID [some_id] not found." }
    ```
*   **500 Internal Server Error**: A server-side error occurred.
    ```json
    { "error": "Server Error", "details": "Specific error message or 'Unknown error'." }
    ```

---

## Public API Endpoints

### 1. Puppies

*   **Endpoint**: `GET /api/puppies`
    *   **Description**: Get a paginated list of available puppies.
    *   **Auth Required**: No.
    *   **Query Parameters**:
        *   `page` (optional, number, default: 1): Page number for pagination.
        *   `limit` (optional, number, default: 10): Number of items per page.
        *   `breed` (optional, string): Filter by breed name.
        *   `gender` (optional, string 'Male'/'Female'): Filter by gender.
        *   `minPrice`, `maxPrice` (optional, number): Filter by price range.
        *   `sortBy` (optional, string, e.g., 'price_asc', 'price_desc', 'date_desc'): Sort order.
    *   **Success Response (200 OK)**:
        ```json
        {
          "puppies": [
            { "id": "pup1", "name": "Buddy", "breed": "Golden Retriever", "age_months": 3, "price": 1200, "status": "available", "main_image_url": "/path/to/image.jpg" /* ... more fields ... */ }
          ],
          "currentPage": 1,
          "totalPages": 5,
          "totalPuppies": 50
        }
        ```

*   **Endpoint**: `GET /api/puppies/:id`
    *   **Description**: Get details for a specific puppy.
    *   **Auth Required**: No.
    *   **Path Parameters**:
        *   `id` (string, required): The ID of the puppy.
    *   **Success Response (200 OK)**:
        ```json
        { "id": "pup1", "name": "Buddy", /* ... all puppy details ... */ }
        ```

### 2. Litters

*   **Endpoint**: `GET /api/litters`
    *   **Description**: Get a paginated list of litters.
    *   **Auth Required**: No.
    *   **Query Parameters**: `page`, `limit`, `breed`, `status`, `sortBy`.
    *   **Success Response (200 OK)**: Similar to `/api/puppies` list.

*   **Endpoint**: `GET /api/litters/:id`
    *   **Description**: Get details for a specific litter.
    *   **Auth Required**: No.
    *   **Path Parameters**: `id` (string, required).
    *   **Success Response (200 OK)**: Full litter details.

### 3. Stud Dogs (Public)

*   **Endpoint**: `GET /api/stud-dogs`
    *   **Description**: Get a paginated list of available stud dogs.
    *   **Auth Required**: No.
    *   **Query Parameters**:
        *   `page` (optional, number, default: 1)
        *   `limit` (optional, number, default: 12)
        *   `breed_id` (optional, string): Filter by breed ID.
    *   **Success Response (200 OK)**:
        ```json
        {
          "studDogs": [
            { "id": "stud1", "name": "Champion Rex", "breed_name": "German Shepherd", "age": 3, "stud_fee": 1000, "main_image_url": "/path/to/rex.jpg", "temperament": "Confident and calm" }
          ],
          "currentPage": 1,
          "totalPages": 2,
          "totalStudDogs": 15,
          "limit": 12
        }
        ```

*   **Endpoint**: `GET /api/stud-dogs/:studDogId`
    *   **Description**: Get public details for a specific stud dog.
    *   **Auth Required**: No.
    *   **Path Parameters**: `studDogId` (string, required).
    *   **Success Response (200 OK)**:
        ```json
        {
          "id": "stud1", "name": "Champion Rex", "breed_name": "German Shepherd", "age": 3, "stud_fee": 1000,
          "main_image_url": "/path/to/rex.jpg", "temperament": "Confident", "description": "...",
          "certifications": ["CH", "IPO1"], "image_urls": ["/path/to/rex1.jpg", "/path/to/rex2.jpg"]
        }
        ```

### 4. System & Utility

*   **Endpoint**: `GET /api/init-db`
    *   **Description**: Initializes the database schema. Usually for development/setup.
    *   **Auth Required**: No (but consider restricting in production).
    *   **Success Response (200 OK)**: `{ "message": "Database initialized/verified." }`

*   **Endpoint**: `GET /api/status`
    *   **Description**: Get system health status (DB, KV connections).
    *   **Auth Required**: No.
    *   **Success Response (200 OK)**:
        ```json
        {
          "status": "healthy",
          "services": { "database": "connected", "kv": "connected", "worker": "running" },
          "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
        }
        ```

---

## User Authenticated API Endpoints

Authentication: Requires user session token or JWT (`Authorization: Bearer <token>`).

### 1. User Account

*   **Endpoint**: `POST /api/login`
    *   **Description**: Logs in an existing user.
    *   **Auth Required**: No (for the endpoint itself, but handles credentials).
    *   **Request Body**: `{ "email": "user@example.com", "password": "password123" }`
    *   **Success Response (200 OK)**:
        ```json
        {
          "token": "kv_session_token_string",
          "jwt": "jwt_string",
          "user": { "id": "user1", "email": "user@example.com", "name": "John Doe", "roles": ["user"] }
        }
        ```

*   **Endpoint**: `POST /api/register`
    *   **Description**: Registers a new user.
    *   **Auth Required**: No.
    *   **Request Body**: `{ "email": "newuser@example.com", "password": "password123", "name": "New User" }`
    *   **Success Response (201 Created)**: Similar to login response. Sends 'welcome_email'.

*   **Endpoint**: `GET /api/user`
    *   **Description**: Get details for the currently authenticated user.
    *   **Auth Required**: Yes (User).
    *   **Success Response (200 OK)**:
        ```json
        { "id": "user1", "email": "user@example.com", "name": "John Doe", "roles": ["user"], "created_at": "...", "updated_at": "..." }
        ```

*   **Endpoint**: `POST /api/logout`
    *   **Description**: Logs out the current user (invalidates session token).
    *   **Auth Required**: Yes (User, using session token).
    *   **Success Response (200 OK)**: `{ "message": "Logged out successfully" }`

### 2. Checkout & Payments

*   **Endpoint**: `POST /api/checkout`
    *   **Description**: Processes a payment for an adoption or product.
    *   **Auth Required**: Yes (User, typically JWT for client-side calls).
    *   **Request Body**:
        ```json
        {
          "sourceId": "cnon:card-nonce-ok", // Square payment nonce
          "amount": 120000, // Amount in cents
          "currency": "USD",
          "userId": "user123", // Optional, if user is logged in
          "puppyId": "pup456", // Optional
          "customerEmail": "guest@example.com" // Optional, for guests or if different from user's account
        }
        ```
    *   **Success Response (200 OK)**:
        ```json
        {
          "message": "Payment successful.",
          "payment": { "id": "sq_payment_id", "status": "COMPLETED", "amountMoney": {"amount": 120000, "currency": "USD"}, /* ... more Square payment details ... */ }
        }
        ```
        Sends 'payment_receipt' email.

### 3. User Transactions

*   **Endpoint**: `GET /api/my-transactions`
    *   **Description**: Get a paginated list of the authenticated user's transactions.
    *   **Auth Required**: Yes (User).
    *   **Query Parameters**:
        *   `page` (optional, number, default: 1)
        *   `limit` (optional, number, default: 10)
    *   **Success Response (200 OK)**:
        ```json
        {
          "transactions": [
            { "id": "txn1", "square_payment_id": "sq_payment_id", "amount": 120000, "currency": "USD", "status": "COMPLETED", "created_at": "...", "puppy_id": "pup456", "payment_method_details": {"brand": "Visa", "last4": "1111"} }
          ],
          "currentPage": 1,
          "totalPages": 3,
          "totalTransactions": 25,
          "limit": 10
        }
        ```

---

## Admin API Endpoints

Authentication: Requires Admin JWT (`Authorization: Bearer <admin_jwt_token>`).

### 1. User Management (Admin)

*   **Endpoint**: `GET /api/admin/users`
    *   **Description**: List all users with pagination.
    *   **Auth Required**: Yes (Admin).
    *   **Query Parameters**: `page`, `limit`.
    *   **Success Response (200 OK)**:
        ```json
        {
          "users": [ { "id": "user1", "email": "user@example.com", "name": "John Doe", "roles": ["user"], "created_at": "...", "updated_at": "..." } ],
          "currentPage": 1, "totalPages": 5, "totalUsers": 50, "limit": 10
        }
        ```

*   **Endpoint**: `GET /api/admin/users/:userId`
    *   **Description**: Get details for a specific user by ID.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `userId` (string, required).
    *   **Success Response (200 OK)**: User object.

*   **Endpoint**: `PUT /api/admin/users/:userId`
    *   **Description**: Update a user's details (e.g., name, roles).
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `userId` (string, required).
    *   **Request Body**: `{ "name": "New Name", "roles": ["user", "editor"] }` (Only fields to update).
    *   **Success Response (200 OK)**: Updated user object.

*   **Endpoint**: `DELETE /api/admin/users/:userId`
    *   **Description**: Delete a user.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `userId` (string, required).
    *   **Success Response (200 OK)**: `{ "message": "User deleted successfully" }`

### 2. Site Settings (Admin)

*   **Endpoint**: `GET /api/admin/settings`
    *   **Description**: Retrieve current site settings.
    *   **Auth Required**: Yes (Admin).
    *   **Success Response (200 OK)**:
        ```json
        {
          "siteName": "GDS Puppies", "contactEmail": "admin@example.com", "maintenanceMode": false,
          "logoUrl": "/logo.png", "defaultLanguage": "en-US", "currency": "USD",
          "socialMediaLinks": { "facebook": "...", "instagram": "...", "twitter": "..." },
          "seoDefaults": { "title": "...", "description": "...", "keywords": "..." }
        }
        ```

*   **Endpoint**: `POST /api/admin/settings`
    *   **Description**: Update site settings. Send the complete settings object.
    *   **Auth Required**: Yes (Admin).
    *   **Request Body**: Full site settings object (see GET response for structure).
    *   **Success Response (200 OK)**: `{ "message": "Site settings updated successfully.", "settings": { /* updated settings object */ } }`

### 3. Third-Party Integrations (Admin)

*   **Endpoint**: `GET /api/admin/integrations`
    *   **Description**: List all configured third-party integrations.
    *   **Auth Required**: Yes (Admin).
    *   **Success Response (200 OK)**:
        ```json
        [
          { "id": "int1", "service_name": "SendGrid", "other_config": "{\"region\":\"us-east-1\"}", "is_active": true, "created_at": "...", "updated_at": "..." }
        ]
        ```
        (Note: `api_key` is NOT returned).

*   **Endpoint**: `POST /api/admin/integrations`
    *   **Description**: Create a new third-party integration. API key is encrypted on the server.
    *   **Auth Required**: Yes (Admin).
    *   **Request Body**:
        ```json
        {
          "service_name": "SendGrid",
          "api_key": "plain_text_api_key_if_any", // Will be encrypted by server
          "other_config": { "setting": "value" }, // or JSON string
          "is_active": true
        }
        ```
    *   **Success Response (201 Created)**: Created integration object (without API key).

*   **Endpoint**: `PUT /api/admin/integrations/:integrationId`
    *   **Description**: Update an existing third-party integration. If `api_key` is provided (even empty string), it will be re-encrypted or cleared.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `integrationId` (string, required).
    *   **Request Body**: Fields to update (e.g., `{ "api_key": "new_plain_key", "is_active": false, "other_config": {"new_setting": "new_value"} }`).
    *   **Success Response (200 OK)**: Updated integration object (without API key).

*   **Endpoint**: `DELETE /api/admin/integrations/:integrationId`
    *   **Description**: Delete a third-party integration.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `integrationId` (string, required).
    *   **Success Response (200 OK)**: `{ "message": "Integration deleted successfully." }`

### 4. Email Templates (Admin)

*   **Endpoint**: `GET /api/admin/email-templates`
    *   **Description**: List all email templates.
    *   **Auth Required**: Yes (Admin).
    *   **Success Response (200 OK)**:
        ```json
        [
          { "id": "tpl1", "name": "welcome_email", "subject": "Welcome!", "is_editable_in_admin": false, "updated_at": "..." }
        ]
        ```
        (Note: `html_body` is omitted in list view).

*   **Endpoint**: `GET /api/admin/email-templates/:templateId`
    *   **Description**: Get details for a specific email template, including its HTML body.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `templateId` (string, required).
    *   **Success Response (200 OK)**: Full template object including `html_body`.

*   **Endpoint**: `PUT /api/admin/email-templates/:templateId`
    *   **Description**: Update an email template (only if `is_editable_in_admin` is true).
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `templateId` (string, required).
    *   **Request Body**: `{ "subject": "New Subject", "html_body": "<p>New Body</p>" }`
    *   **Success Response (200 OK)**: Updated template object.
    *   **Error Response (403 Forbidden)**: If `is_editable_in_admin` is false.

### 5. Transactions (Admin)

*   **Endpoint**: `GET /api/admin/transactions`
    *   **Description**: List all transactions with pagination and filtering.
    *   **Auth Required**: Yes (Admin).
    *   **Query Parameters**:
        *   `page` (optional, number, default: 1)
        *   `limit` (optional, number, default: 20)
        *   `status` (optional, string): Filter by transaction status.
        *   `searchQuery` (optional, string): Search by transaction ID or Square Payment ID.
        *   `startDate`, `endDate` (optional, string 'YYYY-MM-DD'): Filter by creation date range.
    *   **Success Response (200 OK)**:
        ```json
        {
          "transactions": [ /* array of transaction objects */ ],
          "currentPage": 1, "totalPages": 5, "totalTransactions": 100, "limit": 20
        }
        ```

### 6. Stud Dogs (Admin)

*   **Endpoint**: `GET /api/admin/stud-dogs`
    *   **Description**: List all stud dogs for admin view (includes more details and filters).
    *   **Auth Required**: Yes (Admin).
    *   **Query Parameters**: `page`, `limit`, `is_available` ("true"/"false"/"all"), `breed_id`, `owner_user_id`, `searchQuery` (name).
    *   **Success Response (200 OK)**:
        ```json
        {
          "studDogs": [
            {
              "id": "stud1", "name": "Champion Rex", "breed_name": "German Shepherd", "owner_name": "Admin User",
              "stud_fee": 1000, "is_available": true, "age": 3, /* ... all fields ... */
              "parsed_image_urls": ["/img.jpg"], "parsed_certifications": ["CH"]
            }
          ],
          "currentPage": 1, "totalPages": 1, "totalStudDogs": 1, "limit": 10
        }
        ```

*   **Endpoint**: `POST /api/admin/stud-dogs`
    *   **Description**: Create a new stud dog entry.
    *   **Auth Required**: Yes (Admin).
    *   **Request Body**:
        ```json
        {
          "name": "Sir Lancelot", "breed_id": "breed-001", "age": 3, "stud_fee": 1500,
          "description": "Proven stud with excellent temperament.", "temperament": "Calm, Intelligent",
          "certifications": "[\"OFA Good\", \"AKC CH\"]", // JSON string or array
          "image_urls": "[\"/path/lancelot1.jpg\"]", // JSON string or array
          "is_available": true
        }
        ```
    *   **Success Response (201 Created)**: The created stud dog object (with owner/breed details).

*   **Endpoint**: `PUT /api/admin/stud-dogs/:studDogId`
    *   **Description**: Update an existing stud dog entry.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `studDogId` (string, required).
    *   **Request Body**: Fields to update (subset of create body).
    *   **Success Response (200 OK)**: The updated stud dog object.

*   **Endpoint**: `DELETE /api/admin/stud-dogs/:studDogId`
    *   **Description**: Delete a stud dog entry.
    *   **Auth Required**: Yes (Admin).
    *   **Path Parameters**: `studDogId` (string, required).
    *   **Success Response (200 OK)**: `{ "message": "Stud dog deleted successfully." }`

---

## Webhooks

*   **Endpoint**: `POST /api/webhooks/square`
    *   **Description**: Handles incoming webhooks from Square (e.g., `payment.updated`).
    *   **Auth Required**: No (Signature verification performed by the handler).
    *   **Request Body**: Varies based on Square event type. Must be raw JSON from Square.
    *   **Headers**: Must include `X-Square-Signature`.
    *   **Success Response (200 OK)**: `{ "status": "success", "message": "Webhook processed" }`
    *   **Error Responses**:
        *   401 Unauthorized: If signature is missing or invalid.
        *   400 Bad Request: If event body is malformed or critical data is missing.
        *   500 Internal Server Error: If webhook key is not configured or other server errors.

---
*This documentation should be kept up-to-date with any API changes.*
