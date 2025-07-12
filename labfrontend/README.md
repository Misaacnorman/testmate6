# Testmate LIMS Frontend

This is the frontend for Testmate LIMS, a Laboratory Information Management System. It provides a modern, responsive user interface for all laboratory workflows.

---

## Features
- React (with Vite) + TypeScript
- Dynamic sample registration with per-set fields
- Material-specific log books and sample receipts
- User, client, and project management
- Role-based access and secure authentication
- Modern, responsive UI/UX

---

## Project Structure
- `src/pages/` — Main pages (RegisterSample, Logs, SampleReceiptsTab, etc.)
- `src/components/` — Reusable UI components
- `src/api/` — API request logic
- `App.tsx`, `main.tsx` — App entry points
- `package.json` — Scripts and dependencies

---

## Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)

### 1. Install Dependencies
```sh
npm install
```

### 2. Start the Development Server
```sh
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## Configuration
- Update API URLs and environment variables in `.env` as needed to point to your backend server.

---

## Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

---

## Development
- Edit pages and components in `src/`
- Use the API layer in `src/api/` for backend communication

---

## License
MIT

---

## Contact
For issues or contributions, open an issue or pull request on GitHub.
