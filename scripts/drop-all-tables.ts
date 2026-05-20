import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function drop() {
  const client = new Client({
    host: process.env.DATABASE_HOST || '150.158.93.154',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '8uYabCRurjW2iXRH9IMZ',
    database: process.env.DATABASE_NAME || 'postgres',
  });
  await client.connect();
  console.log('🗑️ 正在清空 PostgreSQL public 模式下的所有表...');
  await client.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO postgres;
    GRANT ALL ON SCHEMA public TO public;
    COMMENT ON SCHEMA public IS 'standard public schema';
  `);
  console.log('✅ 清空完成！');
  await client.end();
}
drop();
