# Ruthie Quotes

A small web app for **Travels with Ruthie** to manage holiday requests and send quotes to clients by WhatsApp or email.

## What it does

- **Dashboard** of bookings, filtered to open jobs by default (Open, Quote issued, Quote accepted, Booked), with filters for every status and a search box.
- **New booking**: client name, holiday request summary and optional holiday dates.
- **Booking page**: edit details, set the status manually, and add / edit / delete holiday options.
  - Option types: ✈️ Flights, 🏨 Accommodation, 🚗 Hire Car
  - Each option has a cost (free text — plain numbers are shown as £), a free-text summary, and start / end dates.
- **WhatsApp quote**: preview formatted for WhatsApp (bold, italics, emoji), a Copy button, and an "Open in WhatsApp" shortcut.
- **Email quote**: branded email preview; Copy puts formatted HTML on the clipboard so it pastes into Gmail / Outlook / Apple Mail with styling intact. Subject line and plain-text version can be copied separately.
- Statuses: Open, Quote issued, Quote accepted, Quote rejected, Booked, Holiday completed.

## Tech

- Next.js (App Router), plain JavaScript and CSS.
- Data is stored as one JSON document in a **private Vercel Blob store** (`data/bookings.json`), with a daily backup copy under `backups/`.
- Access is protected by a single password.

## Environment variables

| Name | Purpose |
| --- | --- |
| `APP_PASSWORD` | The password Ruth uses to log in |
| `AUTH_SECRET` | Random string used to sign the login cookie |
| `BLOB_READ_WRITE_TOKEN` | Added automatically when a **private** Blob store is connected to the Vercel project |

Changing `APP_PASSWORD` or `AUTH_SECRET` logs everyone out.

## Changing the business details

Name, phone, email and website used in the quotes are in `lib/constants.js` (`BRAND`).
