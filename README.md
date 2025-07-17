# Testmate LIMS Backend

This is the backend service for Testmate LIMS, a Laboratory Information Management System. It provides RESTful APIs, authentication, business logic, and database management for the platform.

---

## Features
- Node.js + Express REST API
- Prisma ORM with MySQL
- JWT authentication and role-based access control
- Dynamic sample registration and per-set details
- Material-specific log books (concrete, pavers, blocks, cylinders, water absorption, projects)
- Project, client, user, and finance management
- PDF generation for sample receipts and logs

---

## Project Structure
- `src/index.js` — Main server entry
- `src/controllers/` — API controllers (samples, logs, users, receipts, etc.)
- `src/routes/` — Express route definitions
- `prisma/schema.prisma` — Database schema
- `prisma/seed.js` — Seed data script
- `package.json` — Scripts and dependencies

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL server

### 1. Environment Setup
Copy `.env.example` to `.env` and update with your MySQL credentials and JWT secret.

### 2. Install Dependencies
```sh
npm install
```

### 3. Database Setup
```sh
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # (Optional) Seed initial data
npm run db:studio        # (Optional) Open Prisma Studio
```

### 4. Start the Server
```sh
npm run dev
```

---

## API Endpoints
- `/api/samples` — Sample registration, retrieval, update
- `/api/logs` — Log book management
- `/api/users` — User management
- `/api/clients` — Client management
- `/api/projects` — Project management
- `/api/receipts` — Sample receipts
- `/api/finance` — Invoices, payments, transactions

(See code for full endpoint list and details.)

---

## Database Schema
See `prisma/schema.prisma` for full schema. Key models:
- User, Role, Permission
- Client, Project, Sample, SampleSet
- Log, SampleLog, ConcreteCubeLog, BricksBlocksLog, PaversLog, ConcreteCylinderLog, WaterAbsorptionLog, ProjectsLog
- Invoice, Payment, ClientAccount, FinancialTransaction
- Report, SystemSetting, InventoryItem

---

## Development
- Use `npm run dev` for development
- Use `npm run db:studio` to inspect the database
- Update `.env` for environment variables

---

## License
MIT

---

## Contact
For issues or contributions, open an issue or pull request on GitHub.
