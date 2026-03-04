import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenFile = path.join(__dirname, '.tokens.enc');

const getKey = () => {
  const secret = process.env.TOKEN_ENCRYPTION_KEY || 'dev-only-insecure-key-change-me';
  return crypto.createHash('sha256').update(secret).digest();
};

export async function saveTokens(tokens) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()]);
  const payload = `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  await fs.writeFile(tokenFile, payload, 'utf8');
}

export async function readTokens() {
  try {
    const payload = await fs.readFile(tokenFile, 'utf8');
    const [ivHex, encryptedHex] = payload.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), Buffer.from(ivHex, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }
}
