# Testmate6 - Laboratory Management System

A comprehensive laboratory management system built with Node.js backend and React frontend for managing test samples, clients, projects, and financial operations.

## Features

- **Sample Management**: Register and track test samples with detailed information
- **Client Management**: Manage client accounts and project relationships
- **Project Management**: Organize samples by projects and track progress
- **Financial Management**: Handle invoices, payments, and financial reporting
- **User Management**: Role-based access control with admin and regular user roles
- **Reporting**: Generate comprehensive reports for samples, finances, and operations
- **PDF Generation**: Generate receipts and invoices in PDF format

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Prisma ORM** for database management
- **SQLite** database (can be configured for MySQL/PostgreSQL)
- **JWT** for authentication
- **PDF-lib** for PDF generation
- **Multer** for file uploads

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **CSS** for styling

## Project Structure

```
Testmate6/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication middleware
│   │   └── auth/          # JWT strategy
│   ├── prisma/            # Database schema and migrations
│   └── uploads/           # File uploads directory
├── labfrontend/           # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── api/          # API integration
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Testmate6
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../labfrontend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd ../backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Create admin user**
   ```bash
   node create-admin-user.js
   ```

## Running the Application

### Backend
```bash
cd backend
npm start
```
The backend will run on `http://localhost:3000`

### Frontend
```bash
cd labfrontend
npm run dev
```
The frontend will run on `http://localhost:5173`

## Environment Variables

Create a `.env` file in the backend directory:

```env
JWT_SECRET=your_jwt_secret_here
PORT=3000
DATABASE_URL="file:./dev.db"
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Samples
- `GET /api/samples` - Get all samples
- `POST /api/samples` - Create new sample
- `GET /api/samples/:id` - Get sample by ID
- `PUT /api/samples/:id` - Update sample
- `DELETE /api/samples/:id` - Delete sample

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID

### Finance
- `GET /api/finance` - Get financial data
- `POST /api/finance/invoice` - Create invoice
- `POST /api/finance/payment` - Record payment

## Database Schema

The application uses Prisma ORM with the following main entities:

- **User**: System users with roles
- **Client**: Client information
- **Project**: Project details
- **Sample**: Test samples with metadata
- **SampleLog**: Sample processing logs
- **Invoice**: Financial invoices
- **Payment**: Payment records

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
