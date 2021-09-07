const mongo = require('../mongo');
const coll = mongo.db.collection('users');

const {
    verifyPassword, generateSalt, hash
} = require('../auth');

/**
 * Represents a User
 */
class User {
    constructor(username, hashedPassword, publicKey, salt) {
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.publicKey = publicKey;
        this.salt = salt;
    }

    getUsername() {
        return this.username;
    }

    getHashedPassword() {
        return this.hashedPassword;
    }

    getPublicKey() {
        return this.publicKey;
    }

    getSalt() {
        return this.salt;
    }
}

// Functions with Mongo
/**
 * Logs in a user
 * @param {string} username 
 * @param {string} password 
 * @returns User
 */
async function loginUser(username, password) {
    // find user by username
    const result = await coll.findOne({ username });

    if (result) {
        const {
            hashedPassword,
            salt,
        } = result;

        // verify given password against user
        if(verifyPassword(password, salt, hashedPassword)) {
            return result;
        }
    }
}

/**
 * Fetches a User by ID
 * @param {string} username 
 * @param {string} password 
 * @returns User
 */
 async function getUserById(_id) {
    // find user by _id
    return await coll.findOne({ _id });
}

/**
 * Fetches a User by username
 * @param {string} username 
 * @param {string} password 
 * @returns User
 */
 async function getUserByUsername(username) {
    // find user by username
    return await coll.findOne({ username });
}

/**
 * Registers a user. Returns true if register was successful.
 * @param {string} username username
 * @param {string} password password
 * @returns Boolean
 */
async function registerUser(newUser) {
    const {
        username,
        password,
        isHealthcareProvider,
        healthcareProvider,
    } = newUser ?? {};

    if (username) {
        // find user by username
        const found = await coll.findOne({ username });

        // register user only if no other user has username
        if (!found) {
            const salt = generateSalt();
            const hashedPassword = hash(password, salt)

            const result = await coll.insertOne({
                username,
                hashedPassword,
                salt,
                isHealthcareProvider: Boolean(isHealthcareProvider),
                ...(healthcareProvider && { healthcareProvider }),
            });

            if (result?.acknowledged) {
                return await getUserById(result.insertedId)
            }
        }
    }
}

module.exports = {
    User,
    loginUser,
    registerUser,
    getUserById,
    getUserByUsername,
}