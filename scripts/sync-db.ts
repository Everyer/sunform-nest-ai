import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function syncDatabase() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: false,
  });

  try {
    console.log('🔄 开始同步 Component 表...');
    
    // 检查字段是否已存在
    const [results]: any = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'tb_components' 
        AND column_name = 'operatorids'
    `);
    
    if (results.length > 0) {
      console.log('⚠️  字段 operatorIds 已存在，跳过添加');
    } else {
      // 添加 operatorIds 字段
      await sequelize.query(`
        ALTER TABLE tb_components 
        ADD COLUMN "operatorIds" JSONB NULL
      `);
      console.log('✅ 成功添加字段: operatorIds (JSONB)');
    }
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();
