import crypto from 'node:crypto';

// ==========================================
// CONFIGURATION
// ==========================================

// People open old newsletters months later, and the unsubscribe link must
// still work. Links are already revoked whenever token_version changes
// (unsubscribe / resubscribe), so a long lifetime is safe.
const TOKEN_EXPIRY_DAYS = 365;
const TOKEN_EXPIRY_SECONDS = TOKEN_EXPIRY_DAYS * 24 * 60 * 60;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ==========================================
// SECRET
// ==========================================

const getSecret = () => {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET?.trim();

  if (!secret) {
    throw new Error(
      'UNSUBSCRIBE_TOKEN_SECRET is missing from backend environment variables.'
    );
  }

  if (Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('UNSUBSCRIBE_TOKEN_SECRET must contain at least 32 bytes.');
  }

  return secret;
};

// ==========================================
// PUBLIC API URL
// ==========================================

export const getPublicApiUrl = () => {
  const baseUrl = (process.env.PUBLIC_API_URL || process.env.API_URL || '').trim();

  if (!baseUrl) {
    throw new Error('PUBLIC_API_URL is not configured.');
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('PUBLIC_API_URL is not a valid URL.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('PUBLIC_API_URL must use HTTP or HTTPS.');
  }

  if (process.env.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:') {
    throw new Error('PUBLIC_API_URL must use HTTPS in production.');
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error('PUBLIC_API_URL must not contain credentials.');
  }

  return parsedUrl.origin;
};

// ==========================================
// HELPERS
// ==========================================

const isValidEmail = (email) =>
  typeof email === 'string' && email.length <= 254 && EMAIL_PATTERN.test(email);

const createSignature = (payload) =>
  crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');

// ==========================================
// BUILD UNSUBSCRIBE URL
// ==========================================

export const buildUnsubscribeUrl = (subscriberId, email, tokenVersion = 0) => {
  if (
    subscriberId === undefined ||
    subscriberId === null ||
    !String(subscriberId).trim() ||
    typeof email !== 'string'
  ) {
    throw new Error('Subscriber ID and email are required to build an unsubscribe URL.');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    throw new Error('A valid subscriber email is required.');
  }

  const version = Number(tokenVersion);

  if (!Number.isSafeInteger(version) || version < 0) {
    throw new Error('Invalid unsubscribe token version.');
  }

  const payload = Buffer.from(
    JSON.stringify({
      id: String(subscriberId),
      email: cleanEmail,
      version,
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    })
  ).toString('base64url');

  const token = `${payload}.${createSignature(payload)}`;

  const url = new URL('/api/newsletter/unsubscribe', `${getPublicApiUrl()}/`);
  url.searchParams.set('token', token);

  return url.toString();
};

// ==========================================
// VERIFY UNSUBSCRIBE TOKEN
// ==========================================

export const verifyUnsubscribeToken = (token) => {
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;

  if (
    !payload ||
    !signature ||
    !/^[a-f0-9]{64}$/i.test(signature) ||
    !/^[A-Za-z0-9_-]+$/.test(payload)
  ) {
    return null;
  }

  try {
    const supplied = Buffer.from(signature, 'hex');
    const expected = Buffer.from(createSignature(payload), 'hex');

    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));

    if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
      return null;
    }

    if (
      typeof decoded.id !== 'string' ||
      !decoded.id.trim() ||
      !isValidEmail(decoded.email) ||
      !Number.isSafeInteger(decoded.exp)
    ) {
      return null;
    }

    const version = decoded.version ?? 0;

    if (!Number.isSafeInteger(version) || version < 0) {
      return null;
    }

    if (decoded.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email.trim().toLowerCase(),
      version,
      exp: decoded.exp,
    };
  } catch (error) {
    console.error('Unsubscribe token verification failed:', error.message);
    return null;
  }
};