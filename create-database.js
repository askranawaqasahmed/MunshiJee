const { Client } = require('pg');

async function createDatabase() {
  // Connect to the default postgres database first
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'munshijee'"
    );

    if (result.rows.length > 0) {
      console.log('✓ Database "munshijee" already exists');
    } else {
      // Create the database
      await client.query('CREATE DATABASE munshijee');
      console.log('✓ Database "munshijee" created successfully');
    }

    await client.end();
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nPlease create the database manually:');
    console.error('1. Open pgAdmin or your PostgreSQL tool');
    console.error('2. Right-click on "Databases" → Create → Database');
    console.error('3. Name it: munshijee');
    await client.end();
    return false;
  }
}

createDatabase().then((success) => {
  process.exit(success ? 0 : 1);
});
