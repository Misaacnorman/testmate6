const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    // Connect to MySQL as root (you'll need to provide your root password)
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '12345678', // Updated with user's password
      port: 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS testmate6');
    console.log('Database "testmate6" created or already exists');

    // Create a dedicated user for the application (optional but recommended)
    try {
      await connection.execute(`
        CREATE USER IF NOT EXISTS 'testmate6_user'@'localhost' 
        IDENTIFIED BY 'testmate6_password'
      `);
      console.log('User "testmate6_user" created or already exists');

      // Grant privileges to the user
      await connection.execute(`
        GRANT ALL PRIVILEGES ON testmate6.* TO 'testmate6_user'@'localhost'
      `);
      console.log('Privileges granted to testmate6_user');

      // Flush privileges
      await connection.execute('FLUSH PRIVILEGES');
      console.log('Privileges flushed');
    } catch (error) {
      console.log('Note: Could not create dedicated user (this is optional):', error.message);
    }

    await connection.end();
    console.log('MySQL setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your .env file with the correct DATABASE_URL');
    console.log('2. Run: npx prisma migrate dev --name init');
    console.log('3. Run: npx prisma db seed');

  } catch (error) {
    console.error('Error setting up MySQL database:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Verify your MySQL root password');
    console.log('3. Check if MySQL is running on port 3306');
  }
}

setupDatabase(); 