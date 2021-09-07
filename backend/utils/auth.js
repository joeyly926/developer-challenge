const crypto = require("crypto");
const { HASH_SECRET } = require('../config');

/**
 * base64 encode a string
 * @param {String} s 
 * @returns String
 */
function b64Encode(s) {
    return Buffer.from(s, "utf-8").toString("base64");
}

/**
 * base64 decode a string
 * @param {String} s 
 * @returns String
 */
function b64Decode(s) {
    return Buffer.from(s, "base64").toString("utf-8");
}

/**
 * Generates a salt
 * @returns Salt
 */
function generateSalt() {
    return crypto.randomBytes(16);
}

/**
 * Hashes a given string using SHA256. If a salt is provided, it is
 * appended to the string before hashing.
 * @param {String} str 
 * @param {Salt} salt 
 * @returns 
 */
function hash(str, salt = '') {
    const sha256Hasher = crypto.createHmac("sha256", HASH_SECRET);

    return sha256Hasher.update(str + salt).digest('hex');
}

/**
 * Verify a given password with a hashed password.
 * @param {String} password 
 * @param {String|Buffer} salt 
 * @param {String} hashedPassword 
 * @returns 
 */
function verifyPassword(password, salt, hashedPassword) {
    return hashedPassword == hash(password + salt);
}

/**
 * Generates an RSA keypair
 */
function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'top secret'
        }
    });
}

module.exports = {
    b64Encode,
    b64Decode,
    generateKeyPair,
    generateSalt,
    hash,
    verifyPassword,
}