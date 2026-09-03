require('dotenv').config();
const path = require('path');
const express = require('express');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const methodOverride = require('method-override');
const morgan = require('morgan');
const connectDatabase = require('./backend/config/db');
const { loadAdmin } = require('./backend/middleware/auth');
const { ensureCsrfToken, verifyCsrf } = require('./backend/middleware/csrf');
const flashMiddleware = require('./backend/middleware/flash');
const { notFound, errorHandler } = require('./backend/middleware/errors');

const app = express();
if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error('SESSION_SECRET must contain at least 32 characters in production.');
}
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.googletagmanager.com', 'https://*.google-analytics.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com', 'https://*.googletagmanager.com', 'https://www.google-analytics.com', 'https://*.google-analytics.com'],
      connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com'],
      frameSrc: ["'self'", 'https://www.googletagmanager.com'],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(express.json({ limit: '200kb' }));
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'frontend', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.avif')) {
      res.setHeader('Content-Type', 'image/avif');
    }
  }
}));

const sessionOptions = {
  name: 'veloura.sid', secret: process.env.SESSION_SECRET || 'development-only-change-this-secret',
  resave: false, saveUninitialized: false, rolling: true,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 4 * 60 * 60 * 1000 }
};
if (process.env.MONGODB_URI) sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 4 * 60 * 60, touchAfter: 15 * 60 });
app.locals.sessionStore = sessionOptions.store || null;
app.use(session(sessionOptions));
app.use(ensureCsrfToken);
app.use(flashMiddleware);
app.use(loadAdmin);
const { globalWhatsappUrl, PRIMARY_WHATSAPP_NUMBER, DEFAULT_CALL_NUMBER } = require('./backend/utils/whatsapp');

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.siteName = 'Sanjana Malhotra';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.querystring = new URLSearchParams(req.query).toString();
  res.locals.globalWhatsappUrl = globalWhatsappUrl();
  res.locals.primaryWhatsApp = PRIMARY_WHATSAPP_NUMBER;
  res.locals.primaryPhone = DEFAULT_CALL_NUMBER;
  next();
});
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }));
app.use(verifyCsrf);
app.use('/admin', require('./backend/routes/admin'));
app.use('/', require('./backend/routes/public'));
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Veloura running at http://localhost:${port}`));
}

if (require.main === module) {
  start().catch((error) => { console.error(error); process.exit(1); });
}

module.exports = app;
// Ready on port 3000



