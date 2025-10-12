## 🧾 Rechnung App (Next.js 15)

* A modern Next.js 15 application for generating professional invoices (PDF) compliant with German tax law.
* The app runs locally by design — ensuring full control and data privacy (Datenschutz).

## Features:

### Company management

* Save company legal form, tax numbers, contact and bank info.
* Handelsregister number required dynamically depending on legal form.

### Invoice creation

* Multiple line items with different tax rates.
* Automatic calculation of net, VAT, and total.
* Kleinunternehmerregelung support.

### PDF generation using pdf-lib

* Company info fixed in the footer (on every page).
* Page break support for long invoices.
* Page numbering.

### UI / UX niceties

* Smooth scroll to invoice form if company exists.
* Automatic error reset on legal form change.
* Dynamic select components with react-hook-form.
* PostgreSQL via docker-compose
* Prisma ORM with Next.js Server Actions

### Tech Stack

* Framework: Next.js 15 (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* Forms: react-hook-form + Zod
* PDF: pdf-lib
* ORM: Prisma
* Database: PostgreSQL (Docker)
* UI utils: Framer Motion

### Getting Started
* Clone the repo
* git clone https://github.com/ilguciems/rechnung-app.git
* cd rechnung-app

### Option 1: Local Development
### Run only PostgreSQL with Docker (recommended for dev)
 
The app uses a local Postgres database.
Start it via:
```bash
docker-compose up -d
```
* afterwards:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
Stop the database:
```bash
docker-compose down
```
Open http://localhost:3000
 in your browser.

Optional — open Prisma Studio (DB UI):
```bash
npx prisma studio
```
docker-compose.yml:
```yaml
services:
  postgres:
    image: postgres:18
    container_name: postgres-invoice
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: invoicedb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    container_name: next-invoice
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production

volumes:
  postgres_data:
```

#### Default connection:

Host: localhost
Port: 5432
User: myuser
Password: mypassword
DB: invoicedb

### Prisma ORM Setup
1. .env file

```bash
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/invoicedb?schema=public"
```
2. Example prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id                    String   @id @default(cuid())
  name                  String
  legalForm             String
  street                String
  houseNumber           String
  zipCode               String
  city                  String
  country               String
  phone                 String?
  email                 String?
  iban                  String?
  bic                   String?
  bank                  String?
  steuernummer          String?
  ustId                 String?
  handelsregisternummer String?
  isSubjectToVAT        Boolean  @default(false)
  invoices              Invoice[]
}

model Invoice {
  id               String   @id @default(cuid())
  invoiceNumber    String
  createdAt        DateTime @default(now())
  isPaid           Boolean  @default(false)
  paidAt           DateTime?
  customerName     String
  customerStreet   String
  customerHouseNumber String
  customerZipCode  String
  customerCity     String
  customerCountry  String
  items            Json
  companyId        String
  company          Company @relation(fields: [companyId], references: [id])
}
```
3. Generate & migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```
### Option 2 — Everything in Docker (both the application and the database)  (for production or test environments)

```bash
docker-compose up --build
```
.env file:
```bash
DATABASE_URL="postgresql://myuser:mypassword@postgres:5432/invoicedb?schema=public"
```
* Important! Here, host = postgres because the containers are on the same Docker network.

Open http://localhost:3000
 in your browser.

### PDF Generation

The app uses pdf-lib
 to generate invoices fully on the server.

### Features:

* Automatic page breaks
* Footer with company data
* Page numbering
* VAT calculations
* Handelsregister and Steuernummer handling
* PDF generation code lives in:
```ts
src/lib/pdf/generateInvoicePDF.ts
```
### Why Local Version?

* 🛡 Datenschutz — sensitive business data stays on your machine
* 🔐 No authentication required
* 🧰 Full control — local Postgres, local Prisma client
* 🌐 Easy to extend to a secure web version later

### Roadmap: Web Version

* Authentication & roles
* Encrypted cloud storage
* Multi-user access
* Invoice templates
* Email sending & tracking
* Dashboard with stats

### 📝 License

MIT License © 2025




