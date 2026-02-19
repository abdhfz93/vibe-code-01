import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be 32 characters (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    if (!text) return '';
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error('Encryption key must be at least 32 characters long');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text) return '';
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error('Encryption key must be at least 32 characters long');
    }

    const textParts = text.split(':');
    const ivSnippet = textParts.shift();
    if (!ivSnippet) return '';

    const iv = Buffer.from(ivSnippet, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
