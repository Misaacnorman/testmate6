# MySQL Migration Guide

## Prerequisites

1. **Install MySQL Server** (if not already installed)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for Windows
   - Or use Homebrew for Mac: `brew install mysql`

2. **Start MySQL Service**
   - Windows: Start MySQL service from Services
   - Mac/Linux: `sudo service mysql start` or `brew services start mysql`

## Migration Steps

### Step 1: Setup MySQL Database

1. **Update the setup script** with your MySQL root password:
   ```bash
   # Edit setup-mysql.js and change the password
   password: 'your_mysql_root_password'
   ```

2. **Run the setup script**:
   ```bash
   node setup-mysql.js
   ```

3. **Update your .env file** with the correct DATABASE_URL:
   ```env
   # If using root user:
   DATABASE_URL="mysql://root:your_password@localhost:3306/testmate6"
   
   # If using dedicated user (recommended):
   DATABASE_URL="mysql://testmate6_user:testmate6_password@localhost:3306/testmate6"
   ```

### Step 2: Generate and Run Migrations

1. **Generate the initial migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed the database** (if you have seed data):
   ```bash
   npx prisma db seed
   ```

### Step 3: Verify Migration

1. **Check database connection**:
   ```bash
   npx prisma studio
   ```

2. **Test your application**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Make sure MySQL is running
   - Check if port 3306 is available
   - Verify firewall settings

2. **Access Denied**
   - Check username/password in DATABASE_URL
   - Ensure user has proper privileges
   - Try connecting with MySQL client first

3. **Database Not Found**
   - Run the setup script first
   - Check if database name matches in DATABASE_URL

### MySQL Commands for Debugging

```sql
-- Connect to MySQL
mysql -u root -p

-- Show databases
SHOW DATABASES;

-- Use the database
USE testmate6;

-- Show tables
SHOW TABLES;

-- Check user privileges
SHOW GRANTS FOR 'testmate6_user'@'localhost';
```

## Rollback (if needed)

If you need to go back to SQLite:

1. **Revert schema.prisma**:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update .env**:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Reset migrations**:
   ```bash
   npx prisma migrate reset
   ```

## Performance Benefits

- **Better concurrent access** for multiple users
- **Improved performance** for complex queries
- **Better data integrity** with foreign key constraints
- **Scalability** for larger datasets 