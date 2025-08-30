# Changelog: "Reply-To" Functionality for Emails

**Date:** 2025-08-30
**Time:** 14:06

## Overview of Request

The user requested the ability to set different "reply-to" email addresses for various categories of transactional emails to better manage incoming replies.

## Summary of Changes

I have enhanced the email sending service to support a custom "reply-to" address. This allows the application to specify a different email address for replies than the "from" address, which is useful for directing user responses to the correct department (e.g., support, privacy, billing).

### Files Edited

*   **`src/worker/utils/emailService.ts`**
    *   Updated the `MailChannelsRequestBody` interface to include an optional `reply_to` object.
    *   Modified the `sendEmail` function to accept an optional `replyTo` string parameter and add it to the MailChannels API payload.
    *   Updated the `sendTemplatedEmail` function to also accept the `replyTo` parameter and pass it down to the `sendEmail` function.

*   **`src/worker/controllers/privacyController.ts`**
    *   The call to `sendTemplatedEmail` for data deletion request notifications has been updated to include `'privacy@gdspuppies.com'` as the `replyTo` address.

*   **`src/worker/controllers/users.ts`**
    *   The call to `sendTemplatedEmail` for new user welcome emails has been updated to include `'support@gdspuppies.com'` as the `replyTo` address.

### Files Deleted

*   None.

### Files Added

*   None.

### Email Categories and "Reply-To" Addresses

Here is the list of email categories and the "reply-to" addresses that have been implemented. Please ensure these email aliases are configured in your email service provider (e.g., Google Workspace).

*   **Privacy / Data Deletion:** `privacy@gdspuppies.com`
*   **User Welcome / General Support:** `support@gdspuppies.com`
*   **Billing:** `billing@gdspuppies.com`
    *   *Note: While the system is now capable of sending billing-related emails with this "reply-to" address, no billing emails are currently being sent by the application.*
