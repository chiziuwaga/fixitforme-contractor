# FixItForMe: Contractor Login & Authentication Rationale

## 1. The Core Principle: Security & Data Integrity

The entire FixItForMe platform is built on a foundation of trust. For contractors, this trust begins with the certainty that their business data, bids, and financial information are secure and accessible only to them. Our authentication strategy is designed to be both highly secure and user-friendly for a professional audience.

## 2. Why SMS (Magic Link) Authentication?

We have intentionally chosen a passwordless, SMS-based "magic link" login flow for several key reasons:

*   **Enhanced Security:** Passwordless authentication eliminates the risks associated with password reuse, phishing, and brute-force attacks. By relying on a one-time code sent to a device the contractor owns, we create a robust two-factor authentication system by default.

*   **Reduced User Friction:** Contractors do not need to remember another password. This simplifies the login process, reduces support requests for password resets, and gets them into their dashboard faster.

*   **Verified Point of Contact:** Using a phone number as the primary identifier ensures we have a verified, direct line of communication for critical alerts, such as high-value lead notifications or payment confirmations.

*   **Session Management:** Authentication via Supabase JWTs with a 48-hour expiry strikes a balance between security and convenience. It ensures that a contractor remains logged in on their trusted device (like a work tablet) for a reasonable period, but requires re-authentication if the device is inactive, preventing unauthorized access.

## 3. Data Isolation through Row Level Security (RLS)

The login process is intrinsically linked to Supabase's Row Level Security (RLS). When a contractor authenticates, their unique `user_id` from the JWT is used in all subsequent database queries. 

**This is not just a feature; it is our core security promise.**

RLS policies on every critical table (`contractor_profiles`, `bids`, `payments`, `leads`) ensure that a logged-in user can **only** see and manipulate data that belongs to them. This architectural choice makes it impossible for one contractor to accidentally or maliciously view another contractor's sensitive information.

## 4. The Login Page: The Gateway to Professional Tools

The login page at `/login` is intentionally clean and professional. It serves a single, critical purpose: to securely verify the contractor's identity before granting them access to their business command center. 

It is the digital equivalent of unlocking the door to their office. The design reinforces the brand's core values of professionalism, security, and trust from the very first interaction.
