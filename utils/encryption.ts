import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const IV_LENGTH = 16; // For AES, this is always 16
const GCM_TAG_LENGTH = 16;

function getEncryptionKeyBytes(): Buffer {
    if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key is required');
    }

    // Allow a 64-char hex key or a 32-char raw key for compatibility.
    if (/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
        return Buffer.from(ENCRYPTION_KEY, 'hex');
    }

    if (ENCRYPTION_KEY.length === 32) {
        return Buffer.from(ENCRYPTION_KEY, 'utf8');
    }

    throw new Error('Encryption key must be 32 characters or 64 hex characters');
}

function decryptLegacyCbc(payload: string, key: Buffer): string {
    const textParts = payload.split(':');
    const ivSnippet = textParts.shift();
    if (!ivSnippet) return '';

    const iv = Buffer.from(ivSnippet, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export function encrypt(text: string): string {
    if (!text) return '';
    const key = getEncryptionKeyBytes();

    // AES-256-GCM provides authenticated encryption (confidentiality + integrity).
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `v2:${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
}

export function decrypt(text: string): string {
    if (!text) return '';
    const key = getEncryptionKeyBytes();

    if (text.startsWith('v2:')) {
        const parts = text.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid encrypted payload format');
        }

        const iv = Buffer.from(parts[1], 'hex');
        const encryptedText = Buffer.from(parts[2], 'hex');
        const authTag = Buffer.from(parts[3], 'hex');
        if (authTag.length !== GCM_TAG_LENGTH) {
            throw new Error('Invalid auth tag');
        }

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }

    // Backward compatibility for existing values stored as "<ivHex>:<cipherHex>".
    return decryptLegacyCbc(text, key);
}
