# PI220 COMMUNICATIONS
### Independent Communication Platform | Parallel Industries 220

**Version:** 1.2  
**Platform:** PI220  
**Project:** PI220 COMMUNICATIONS  
**Repository:** PI220-COM-CHAT  
**Deployment:** GitHub Pages  
**Backend Infrastructure:** Supabase  
**Project Status:** Operational Release Candidate

---

## 1. PROJECT DECLARATION

PI220 COMMUNICATIONS is an independent digital communication platform developed as part of the Parallel Industries 220 (PI220) technological environment.

Designed as a dedicated, lightweight and responsive communication application, PI220 COMMUNICATIONS provides authenticated users with access to public discussion rooms, persistent message history and real-time messaging.

The platform combines a purpose-built frontend interface with Supabase infrastructure for authentication, database persistence, access control and real-time event delivery.

PI220 COMMUNICATIONS is designed to operate independently while remaining compatible with the broader PI220 digital ecosystem, including integration into the official PI220 corporate website.

This project represents the development of a dedicated communication environment rather than a conventional embedded third-party chat service.

**Its objective is to provide PI220 with an independent, maintainable and extensible communication infrastructure.**

---

## 2. CORE CAPABILITIES

The current release includes:

- Email and password registration.
- User authentication and session persistence.
- Sign-in and sign-out functionality.
- Password recovery.
- User profile display names.
- Public communication room directory.
- Channel and room selection.
- Persistent message history.
- Retrieval of the latest 100 messages per selected room.
- Real-time message delivery through Supabase Realtime.
- Duplicate-message protection and database rate-limit feedback.
- Message submission error handling.
- Independent message-history scrolling.
- Conditional automatic scrolling to the latest message.
- New-message notification when the reader is viewing older messages.
- Responsive interface designed for standalone and embedded environments.

---

## 3. TECHNICAL ARCHITECTURE

PI220 COMMUNICATIONS follows a separated frontend/backend architecture.

### Frontend

- HTML5 — application structure.
- CSS3 — interface design and responsive layout.
- JavaScript — application logic and interaction.
- Supabase JavaScript Client — communication with backend services.

### Backend

Supabase provides:

- Authentication.
- PostgreSQL database infrastructure.
- Row Level Security (RLS).
- Database permissions and constraints.
- Database triggers and protected functions.
- Message persistence.
- Realtime subscriptions.

The frontend communicates with Supabase through its public client interface.

Database authorization and security enforcement remain the responsibility of the backend.

### Infrastructure principle

The application is independently hosted and maintained.

Its separation from the main PI220 website allows independent deployment, maintenance and future development without requiring the entire corporate website to be redeployed.

---

## 4. SECURITY AND ACCESS CONTROL

Security is a fundamental architectural requirement.

The current implementation incorporates:

- Supabase authentication.
- Database Row Level Security.
- Restricted database permissions.
- Server-side message validation.
- Message rate-limiting controls.
- Duplicate-message protection.
- Protected database functions.
- A separate global administrator authorization foundation.

The global administrator identity is registered within the Supabase backend.

Administrative authorization must be enforced by backend permissions and protected operations. Frontend interface controls alone do not constitute authorization.

**Credential protection:**

Only Supabase publishable keys (or legacy anon public keys where applicable) may be included in browser-side configuration.

Supabase secret keys and service-role keys must never be included in this repository's frontend files.

The application does not replace, bypass or independently guarantee the security of its backend infrastructure.

---

## 5. DEPLOYMENT AND CONFIGURATION

### Requirements

- A GitHub repository.
- GitHub Pages hosting.
- A configured Supabase project.
- A valid Supabase publishable key.
- Supabase Authentication URL configuration.

### Configuration

The public client configuration is located at:

`js/config.js`

The configuration contains the Supabase project URL and publishable key.

Never place privileged credentials in this file.

### Local development

The application can be served through Visual Studio Code with Live Server.

Example:

`http://127.0.0.1:5500/index.html`

Opening the application directly through the `file://` protocol is not recommended.

### GitHub Pages deployment

1. Upload the application files to the dedicated repository.
2. Configure GitHub Pages to publish from the selected deployment branch and directory.
3. Obtain the resulting production URL.
4. Register the exact production URL in Supabase Authentication URL Configuration.
5. Retain the appropriate local development redirect URL.
6. Test authentication, messaging and Realtime functionality on the deployed application.

### PI220 website integration

PI220 COMMUNICATIONS is intended to remain independently hosted.

Integration into the main PI220 website can be achieved through an embedded application interface, such as an iframe.

The embedding environment should preserve responsive dimensions, application usability and the independent operation of the communication platform.

---

## 6. CURRENT RELEASE SCOPE

Version 1.2 establishes the operational foundation of PI220 COMMUNICATIONS.

The current release focuses on authenticated access, public communication rooms, message persistence and real-time communication.

The following capabilities remain outside the current release scope:

- Dedicated administrator dashboard.
- Full room creation and administration interface.
- Private-room membership management.
- Moderator management interface.
- Message editing and deletion.
- Expanded administrative reporting and moderation tools.

These capabilities may be introduced through subsequent development releases.

Their absence does not prevent the current public-room communication functionality from operating.

---

## 7. DEVELOPMENT ROADMAP

Future development may include:

**Phase II — Administration**
- Dedicated administrator interface.
- Room creation and management.
- Membership administration.
- Moderator permissions and management.

**Phase III — Advanced Communication**
- Private communication rooms.
- Message editing and deletion.
- Expanded moderation controls.
- Improved notification capabilities.

**Phase IV — PI220 Ecosystem Integration**
- Deeper integration with PI220 NEXT.
- Consistent corporate identity.
- Additional cross-platform communication capabilities.

The roadmap describes potential development objectives and does not imply that these features are already available.

---

## 8. COPYRIGHT DECLARATION

Copyright © 2026 Prof. DSC Jesse Jessen / Parallel Industries 220 (PI220).

**All rights reserved.**

PI220 COMMUNICATIONS, including its original application source code, interface design, visual identity, project documentation, original architectural arrangements and associated materials, is protected by applicable copyright and intellectual property laws.

Unless expressly stated otherwise, the original materials in this repository are proprietary intellectual property.

The PI220 name, branding, logos and associated identity elements are reserved to their respective rights holders.

Publication of this repository on GitHub does not constitute a transfer of ownership or an implied licence to reproduce, modify, distribute, commercialize or create derivative works from the proprietary materials.

---

## 9. LICENSE AND USAGE CONDITIONS

**License: Proprietary — All Rights Reserved.**

No open-source licence is granted for the original PI220 COMMUNICATIONS application materials.

Without prior written authorization from the rights holder, no person or organization is granted permission to:

- Reproduce or redistribute the proprietary application source code.
- Publish modified or derivative versions.
- Repackage the application for commercial or non-commercial distribution.
- Use PI220 branding or identity materials as their own.
- Claim authorship or ownership of the original PI220 COMMUNICATIONS project.

Access to the publicly visible GitHub repository is provided for inspection and reference purposes only.

Any additional permission must be granted explicitly and in writing by the rights holder.

Third-party software and services remain subject to their respective owners' licences and terms. In particular, Supabase and its JavaScript client are independent third-party technologies and are not claimed as proprietary PI220 software.

**This declaration applies to the original proprietary materials of PI220 COMMUNICATIONS and does not supersede third-party licence obligations.**

---

## 10. PROJECT IDENTITY

**PI220 COMMUNICATIONS**  
An independent communication infrastructure of Parallel Industries 220.

Developed for integration into the PI220 digital environment.

**Independent architecture.  
Controlled infrastructure.  
Real-time communication.  
Parallel Industries 220.**

---

*Official project documentation — PI220 COMMUNICATIONS v1.2*  
*Copyright © 2026 Prof. DSC Jesse Jessen / Parallel Industries 220. All rights reserved.*
