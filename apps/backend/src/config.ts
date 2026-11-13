import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current dir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  botToken: process.env.BOT_TOKEN || '9017987595:AAGIbitXCfk-i5eZf_dpvetwL4yvUjMV54k',
  webAppUrl: process.env.WEBAPP_URL || 'https://moonweb-lab.github.io/moonweb-leadgen/',
  dbPath: path.resolve(__dirname, '../../backend/data/leadgen.sqlite'),
  studio: {
    name: process.env.STUDIO_NAME || 'MoonWeb Lab',
    telegram: process.env.STUDIO_TELEGRAM || 'moonweb_labs',
    instagram: process.env.STUDIO_INSTAGRAM || 'moonweb_labs',
    portfolioUrl: process.env.STUDIO_PORTFOLIO_URL || 'https://moonweb-lab.github.io/botanica-bistro/'
  }
};
