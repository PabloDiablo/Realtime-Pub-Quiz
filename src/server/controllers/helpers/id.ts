import crypto from 'crypto';

export const generateRandomId = () => crypto.randomBytes(16).toString('base64');
