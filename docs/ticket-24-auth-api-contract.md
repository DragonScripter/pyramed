# Ticket 24 authentication API contract

This contract is the integration boundary between the authentication backend and
the React authentication state. The API is the authorization source of truth;
the UI only uses the returned role to choose an experience.

## Role values

`role` must be one of the exact values below. These match
`frontend/src/config/roles.ts`.

```text
Clerk | Provider | Analyst | Administrator
```

A profile with no recognised role must not be granted a default role or
permission by either the API or the UI.

## POST /api/auth/login

### Request

```json
{
  "email": "clinician@example.com",
  "password": "user-entered-secret"
}
```

### Successful response: 200

```json
{
  "accessToken": "signed-JWT",
  "expiresAt": "2026-11-19T18:30:00Z",
  "user": {
    "id": "uuid",
    "email": "clinician@example.com",
    "fullName": "Example Clinician",
    "role": "Provider"
  }
}
```

`accessToken` is a signed, expiring token. Its claims must include the subject
and role. `expiresAt` is the same instant as the token's `exp` claim, in UTC
ISO-8601 format, so the client can expire the session without parsing the JWT.
The React app retains it in memory only; it must never persist the password.

### Error responses

| Status | Response | Use |
| --- | --- | --- |
| 400 | `{ "message": "Email and password are required." }` | Missing or malformed input. |
| 401 | `{ "message": "Invalid email or password." }` | Invalid credentials; do not reveal which field failed. |
| 423 | `{ "message": "Account is unavailable." }` | Optional disabled/locked account response. |

## POST /api/auth/logout

Requires `Authorization: Bearer <accessToken>` and returns `204 No Content`.
The endpoint invalidates the active server-side session/token when revocation is
supported. The browser clears local authentication state even if this request
fails, preventing a failed network request from retaining access in the UI.

## GET /api/users/me

Requires `Authorization: Bearer <accessToken>`. The existing endpoint returns
the authoritative current profile and role:

```json
{
  "id": "uuid",
  "fullName": "Example Clinician",
  "avatarUrl": null,
    "role": "Provider"
}
```

The frontend adds the email from the successful login response to this profile.
This endpoint is called after login to confirm the profile and its current role.

## Authenticated API failures

All protected endpoints use these semantics:

| Status | Meaning | Client behavior |
| --- | --- | --- |
| 401 | Missing, invalid, revoked, or expired token. | Clear auth state and redirect to `/login`. |
| 403 | Valid identity without the needed role/permission. | Preserve session and show the not-authorized page. |

The server must make authorization decisions from validated claims/current
authorization data, not from any role value sent by the browser.
