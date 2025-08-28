import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { getConfigParameters, getLoginInfo, getAppId } from "./services/larkService.js";
import { createEmbedUrl } from "./services/embedService.js";
import { LarkUserInfo } from "@shared/types/lark.js";

// ES Module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false // set true when behind HTTPS/proxy with trust proxy
  }
}));

// Health check
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));



// API endpoints
app.get('/get_config_parameters', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const result = await getConfigParameters(url);
    res.json(result);
  } catch (error) {
    console.error('Config parameters error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/get_user_info', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const result = await getLoginInfo(code);
    res.json(result);
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/get_app_id', async (_req: Request, res: Response) => {
  res.end(getAppId());
});

// Simplified embed URL endpoint - get user info from code directly
app.post("/api/embed-url", async (req: Request, res: Response) => {
  try {
    const userInfo = req.body.userInfo as LarkUserInfo;

    if (!userInfo) {
      return res.status(400).json({ error: "Missing user info. Please provide 'userInfo' parameter." });
    }

    const response = createEmbedUrl({ email: userInfo.email || "" });
    res.json(response);
  } catch (error) {
    console.error('Embed URL generation error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Static files
app.use(express.static(path.join(__dirname, "../../public")));

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`🚀 Lark Embed Server running at http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 App ID: ${getAppId()}`);
});
