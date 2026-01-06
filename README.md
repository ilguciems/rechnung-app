## 🧾 Rechnung App (Next.js 16)

A modern Next.js 16 application for creating professional PDF invoices compliant with German tax law (DE).

The application is designed with data privacy (Datenschutz) and local-first development in mind, while being fully extensible towards a secure multi-user web application.

.env example:
```bash
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/invoicedb?schema=public"
PORT=3000
DB_ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY

# Auth
BETTER_AUTH_SECRET=YOUR_ENCRYPTION_KEY
BETTER_AUTH_URL=http://localhost:3000

# Mailjet
MAILJET_API_KEY=YOUR_ENCRYPTION_KEY
MAILJET_API_SECRET=YOUR_ENCRYPTION_KEY
EMAIL_FROM=YOUR_EMAIL

# App
APP_URL=http://localhost:3000
```

## ✨ Key Features

### 🏢 Organization & Company Management

* Users belong to exactly one organization

* Each organization owns one company profile

* Store complete company information:

* Legal form

* Tax numbers (Steuernummer, USt-ID)

* Contact and bank details

### Dynamic validation:

* Handelsregister number required depending on legal form

## 🧑‍🤝‍🧑 User Management & Invitations

* User registration

* Global admin role

* Organization admin role

* Email-based authentication

* Email verification required

* Organization invites via secure token links

### Session Management:

* Automatic logout after a certain period of time with modal warning

### Invite flow supports:

* Existing users

* New users (registration via invite)

* One user can only belong to one organization (by design)

### 🧾 Invoice and payment reminder(three levels) Creation

- Multiple line items per invoice

- Support for different VAT rates per item

- Automatic calculation of:

   - Net amount

   - VAT

   - Total amount

- Kleinunternehmerregelung support

- Paid / unpaid invoice status

- 📄 PDF Generation (pdf-lib)

- Fully server-side PDF generation

### Features:

- Automatic page breaks

- Footer with company data on every page

- Page numbering

- Correct VAT display

- PDF logic lives in:
```bash
src/lib/pdf/generateInvoicePDF.ts
```

## 🎨 UI / UX Highlights

- Clean, minimal UI (Tailwind CSS)

- Smooth scrolling to invoice form when company exists

- Dynamic form behavior with react-hook-form

- Automatic error reset on legal form changes

- Animated UI elements via Framer Motion

- Context-aware onboarding hints for new users

## 🧰 Tech Stack

- Framework: Next.js 16 (App Router)

- Language: TypeScript

- Styling: Tailwind CSS

- Forms & Validation: react-hook-form + Zod

- Authentication: Email-based with **better-auth** lib & email verification with **Mailjet**

- PDF: pdf-lib

- ORM: Prisma

- Database: PostgreSQL (Docker)

- UI Utilities: Framer Motion

- Testing: Vitest

State / Data Fetching: TanStack Query

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/ilguciems/rechnung-app.git
cd rechnung-app
```

### 🐘 Option 1 — Local Development (recommended)

Run PostgreSQL only via Docker:
```bash
docker-compose up -d
```

Then:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open:
```bash
http://localhost:3000
```

Stop database:
```bash
docker-compose down
```

Optional — Prisma Studio:
```bash
npx prisma studio
```

### 🐳 Option 2 — Full Docker Setup (App + DB)

Suitable for testing or production-like environments:
```bash
docker-compose up --build
```

.env:
```bash
DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/invoicedb?schema=public"
```
> Important: postgres is used as host because both services run in the same Docker network.

### 🗄 Database & Prisma
Default local DB connection
```bash
Host: localhost

Port: 5432

User: myuser

Password: mypassword

Database: invoicedb
```

Prisma Setup
```bash
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/invoicedb?schema=public"
```
```bash
npx prisma generate
npx prisma migrate dev --name init
```

Prisma schema includes:

- Users

- Organizations

- Organization members

- Company

- Invoices

- Invoice items

- Organization invites

### 🔐 Authentication Notes

- Email verification is required before login

- A Mailjet account (app.mailjet.com) is required (free for up to 6 000 emails per month, sufficient for testing and small businesses).

- Invite links handle:

  - Login

  - Registration

  - Email verification

Invite tokens are validated server-side

No localStorage hacks — everything works via URLs & server validation

### 🛡 Why Local-First?

1. 🛡 Datenschutz — sensitive business data stays under your control

2. 🔐 Secure authentication & access control

3. 🧰 Full control over database & schema

4. 🌱 Easy transition to hosted SaaS later

## 🛣 Roadmap
### Planned / In Progress

Email sending & invoice delivery

Invoice templates

Dashboard & statistics

Organization role management

Audit logs

Cloud deployment options

📝 License

MIT License © 2025
