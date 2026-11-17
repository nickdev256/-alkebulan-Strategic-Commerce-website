
import crypto from 'node:crypto';

const getSecret = () => {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      'UNSUBSCRIBE_TOKEN_SECRET is missing from backend environment variables.'
    );
  }

  return secret;
};

export const getPublicApiUrl = () => {
  const baseUrl = process.env.PUBLIC_API_URL || process.env.API_URL;

  if (!baseUrl) {
    throw new Error('PUBLIC_API_URL is not configured.');
  }

  return baseUrl.replace(/\/+$/, '');
};

export const buildUnsubscribeUrl = (subscriberId, email) => {
  if (!subscriberId || !email) {
    throw new Error('Subscriber ID and email are required.');
  }

  const payload = Buffer.from(
    JSON.stringify({
      id: subscriberId,
      email: String(email).toLowerCase(),
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');

  const url = new URL(
    '/api/newsletter/unsubscribe',
    `${getPublicApiUrl()}/`
  );

  url.searchParams.set('token', `${payload}.${signature}`);

  return url.toString();
};

export const verifyUnsubscribeToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getSecret())
      .update(payload)
      .digest('hex');

    const supplied = Buffer.from(signature, 'hex');
    const expected = Buffer.from(expectedSignature, 'hex');

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (!decoded.id || !decoded.email) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Unsubscribe token verification failed:', error);
    return null;
  }
};
