import { createApp } from '../../../../backend/dist/app';
import { connectDB } from '../../../../backend/dist/config/database';

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
    responseLimit: false,
  },
};

export const maxDuration = 60;

const app = createApp();
let dbReady = null;

function ensureDb() {
  if (!dbReady) {
    dbReady = connectDB();
  }
  return dbReady;
}

export default async function handler(req, res) {
  await ensureDb();

  await new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req, res);
  });
}
