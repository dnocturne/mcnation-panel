// Retrieve data from the librelogin table (librepremium_data)

import { pool } from '@/lib/db'
import { RowDataPacket } from 'mysql2';

interface LibreLoginUser extends RowDataPacket {
  algo: string;
  hashed_password: string;
  salt: string;
  last_nickname: string;
}

export async function getLibreLoginUser(username: string): Promise<LibreLoginUser | null> {
  try {
    const [rows] = await pool.execute<LibreLoginUser[]>(
      'SELECT algo, hashed_password, salt, last_nickname FROM librepremium_data WHERE last_nickname = ?',
      [username]
    );
    
    return rows[0] || null;
  } catch (error) {
    console.error('Error fetching LibreLogin user:', error);
    return null;
  }
}