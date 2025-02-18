// Query data from the luckperms table

import mysql from 'mysql2/promise';

export async function getLuckPermsData() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM luckperms');
    return rows;
  } finally {
    connection.end();
  }
}
