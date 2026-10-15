import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Session cache for InfinityFree bot challenge resolver (if ever needed to proxy live)
let cachedCookie = '';
let cookieExpires = 0;

async function getInfinityFreeCookie(): Promise<string> {
  if (cachedCookie && Date.now() < cookieExpires) {
    return cachedCookie;
  }
  try {
    const aesRes = await fetch('https://targetboard.free.nf/aes.js', { signal: AbortSignal.timeout(5000) });
    const aesJs = await aesRes.text();
    const initRes = await fetch('https://targetboard.free.nf/?i=1', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
      signal: AbortSignal.timeout(5000)
    });
    const initHtml = await initRes.text();
    const scriptMatch = initHtml.match(/<script>(.*?)<\/script>/s);
    if (!scriptMatch) throw new Error('No challenge script found');

    let cookieVal = '';
    const sandbox = {
      document: { set cookie(val: string) { cookieVal = val.split(';')[0]; } },
      location: { set href(_v: string) {} }
    };
    vm.createContext(sandbox);
    vm.runInContext(aesJs, sandbox);
    vm.runInContext(scriptMatch[1], sandbox);

    if (cookieVal) {
      cachedCookie = cookieVal;
      cookieExpires = Date.now() + 10 * 60 * 1000;
      return cookieVal;
    }
  } catch (err) {
    console.warn('Failed to obtain fresh challenge cookie:', err);
  }
  return cachedCookie;
}

// Exact Video Token XOR Encryption Key from previous website
const _K = [0x4B, 0x72, 0x1a, 0x5e, 0x33, 0x6d, 0x0f, 0x41, 0x28, 0x59];

function encodeAssetId(id: string): string {
  if (!id) return '';
  const ts = Date.now().toString(36);
  const payload = `${ts}.${id}`;
  const bytes: number[] = [];
  for (let i = 0; i < payload.length; i++) {
    bytes.push(payload.charCodeAt(i) ^ _K[i % _K.length]);
  }
  const b64 = Buffer.from(String.fromCharCode(...bytes)).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// 1. Get all courses
app.get('/api/courses', async (_req, res) => {
  try {
    const filePath = path.join(__dirname, 'public/data/courses_list.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json({ status: 'success', courses: data });
    }
    return res.status(404).json({ error: 'Courses list not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Get specific course details & folder tree
app.get('/api/course/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const filePath = path.join(__dirname, `public/data/courses/${courseId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Course detail not found' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Resolve video streaming URL for asset ID (Exact previous website system)
app.get('/api/video', async (req, res) => {
  const assetId = (req.query.asset as string) || '';
  const title = (req.query.title as string) || '';

  if (!assetId) {
    return res.status(400).json({ error: 'asset query param is required' });
  }

  // Calculate official video token for this exact asset ID
  const token = encodeAssetId(assetId);
  const videoUrl = `https://targetboard.co.in/dashboard/video?v=${token}`;

  return res.json({
    status: 'success',
    code: 200,
    action: 'get_video_url',
    asset_id: assetId,
    token: token,
    video_url: videoUrl,
    embed_url: videoUrl,
    title: title || 'GB STUDY Lecture'
  });
});

// 4. Exact api.php route from previous website for 100% full compatibility
app.get('/api.php', async (req, res) => {
  if (req.query.courses !== undefined) {
    const filePath = path.join(__dirname, 'public/data/courses_list.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Courses not found' });
  }

  if (req.query.courseid) {
    const courseId = req.query.courseid as string;
    const filePath = path.join(__dirname, `public/data/courses/${courseId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Course detail not found' });
  }

  if (req.query.video) {
    const assetId = req.query.video as string;
    const token = encodeAssetId(assetId);
    const videoUrl = `https://targetboard.co.in/dashboard/video?v=${token}`;
    return res.json({
      status: 'success',
      code: 200,
      action: 'get_video_url',
      asset_id: assetId,
      token: token,
      video_url: videoUrl
    });
  }

  return res.json({
    status: 'ok',
    message: 'GB STUDY Free Courses API Proxy',
    usage: {
      'Load all courses': 'api.php?courses',
      'Load course details': 'api.php?courseid=<ID>',
      'Load video stream': 'api.php?video=<ASSET_ID>'
    }
  });
});

// Serve frontend in dev or prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GB STUDY Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
