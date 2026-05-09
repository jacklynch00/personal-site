import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const secret = process.env.PROJECT_SECRET_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('PROJECT_SECRET_ENCRYPTION_KEY is required to store Stripe keys');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptSecret(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    value: encrypted.toString('base64'),
  });
}

export function decryptSecret(payload: string) {
  const parsed = JSON.parse(payload) as { iv: string; tag: string; value: string };
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(parsed.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(parsed.value, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
