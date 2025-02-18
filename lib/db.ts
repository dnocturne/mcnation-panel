import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// MySQL connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Create MySQL connection pool
export const pool = mysql.createPool(dbConfig);

// Add this interface
interface WebSocketConfig extends RowDataPacket {
  host: string;
  port: string;
  auth_token: string;
}

// Function to ensure table exists
async function ensureWebSocketConfigTable() {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS websocket_config (
        id INT PRIMARY KEY,
        host VARCHAR(255) NOT NULL,
        port VARCHAR(10) NOT NULL,
        auth_token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  } finally {
    connection.release();
  }
}

// Function to get WebSocket configuration
export async function getWebSocketConfig(): Promise<WebSocketConfig | null> {
  await ensureWebSocketConfigTable();
  const [rows] = await pool.execute<WebSocketConfig[]>(
    'SELECT host, port, auth_token FROM websocket_config LIMIT 1'
  );
  
  if (rows.length === 0) {
    return null;
  }
  
  return rows[0];
}

// Function to save WebSocket configuration
export async function saveWebSocketConfig(host: string, port: string, authToken: string) {
  await ensureWebSocketConfigTable();
  
  const [result] = await pool.execute(
    'UPDATE websocket_config SET host = ?, port = ?, auth_token = ? WHERE id = 1',
    [host, port, authToken]
  );
  
  if ((result as any).affectedRows === 0) {
    await pool.execute(
      'INSERT INTO websocket_config (id, host, port, auth_token) VALUES (1, ?, ?, ?)',
      [host, port, authToken]
    );
  }
  
  return true;
} 