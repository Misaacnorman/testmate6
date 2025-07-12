# Testmate LIMS (Laboratory Information Management System)

Testmate LIMS is a modern, full-stack Laboratory Information Management System designed for efficient sample tracking, user management, project coordination, and secure communication within laboratory environments. It supports dynamic sample registration, per-set details for concrete-like materials, and robust logging by material category.

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Backend](#backend)
- [Frontend](#frontend)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Development & Usage](#development--usage)
- [Contribution](#contribution)
- [License](#license)
- [Contact](#contact)

---

## Features
- **Sample Registration**: Register samples with dynamic, per-set fields for concrete, pavers, bricks, blocks, cylinders, and more.
- **Project & Client Management**: Link samples to projects and clients, manage project status, and client accounts.
- **User Management**: Role-based access control (Admin, Technician, Manager, Client, etc.), user status, and permissions.
- **Dynamic Log Books**: Automatic log creation per material category (concrete, pavers, blocks/bricks, cylinders, water absorption, projects).
- **Sample Receipts & PDF Generation**: Generate sample receipts and logs with consistent formatting.
- **Secure Authentication**: JWT-based authentication and authorization.
- **Modern UI/UX**: Responsive React frontend with dynamic forms and tables.

---

## Architecture Overview
- **Backend**: Node.js, Express, Prisma ORM, MySQL
- **Frontend**: React (with Vite), TypeScript
- **Database**: MySQL (schema managed by Prisma)

---

## Backend
- **Location**: `backend/`
- **Main Tech**: Node.js, Express, Prisma ORM, MySQL
- **Key Files**:
  - `src/index.js`: Main server entry point
  - `src/controllers/`: API controllers (samples, logs, users, receipts, etc.)
  - `prisma/schema.prisma`: Database schema
  - `prisma/seed.js`: Seed data script
  - `package.json`: Scripts and dependencies
- **API Structure**:
  - RESTful endpoints for samples, users, projects, logs, receipts, finance, etc.
  - JWT authentication middleware
  - Dynamic log routing by material category
- **Scripts**:
  - `npm run dev` — Start backend server
  - `npm run db:migrate` — Run Prisma migrations
  - `npm run db:seed` — Seed the database
  - `npm run db:studio` — Open Prisma Studio

---

## Frontend
- **Location**: `labfrontend/`
- **Main Tech**: React, Vite, TypeScript
- **Key Files**:
  - `src/pages/`: Main pages (RegisterSample, Logs, SampleReceiptsTab, etc.)
  - `src/components/`: Reusable UI components
  - `src/api/`: API request logic
  - `App.tsx`, `main.tsx`: App entry points
  - `package.json`: Scripts and dependencies
- **Scripts**:
  - `npm run dev` — Start frontend dev server
  - `npm run build` — Build for production
  - `npm run preview` — Preview production build

---

## Database Schema
- **Location**: `backend/prisma/schema.prisma`
- **Highlights**:
  - `User`, `Role`, `Permission`: User management and RBAC
  - `Client`, `Project`, `Sample`, `SampleSet`: Core LIMS entities
  - `SampleSet`: Per-set details for concrete-like materials
  - `Log`, `SampleLog`, `ConcreteCubeLog`, `BricksBlocksLog`, `PaversLog`, `ConcreteCylinderLog`, `WaterAbsorptionLog`, `ProjectsLog`: Material-specific logs
  - `Invoice`, `Payment`, `ClientAccount`, `FinancialTransaction`: Finance
  - `Report`, `SystemSetting`, `InventoryItem`: Reporting and inventory

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL server

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd Testmate6
```

### 2. Backend Setup
```sh
cd backend
cp .env.example .env # Edit .env with your MySQL credentials
npm install
npm run db:generate
npm run db:migrate
npm run db:seed # Optional: seed initial data
npm run dev
```

### 3. Frontend Setup
```sh
cd ../labfrontend
npm install
npm run dev
```

---

## Development & Usage
- **Backend** runs on [http://localhost:3000](http://localhost:3000) by default
- **Frontend** runs on [http://localhost:5173](http://localhost:5173) by default
- Update API URLs in frontend `.env` if needed
- Use Prisma Studio (`npm run db:studio` in backend) for DB inspection

---

## Contribution
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

---

## License
This project is licensed under the MIT License.

---

## Contact
For questions, issues, or contributions, please contact the maintainer or open an issue on GitHub.
