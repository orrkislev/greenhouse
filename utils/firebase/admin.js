const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Optionally, add databaseURL or other config here
  });
}

/**
 * Creates a new Firebase Auth user.
 * @param {Object} userData - The user data object.
 * @param {string} userData.email - The user's email.
 * @param {string} userData.password - The user's password.
 * @param {string} [userData.displayName] - The user's display name.
 * @param {string} [userData.phoneNumber] - The user's phone number.
 * @returns {Promise<admin.auth.UserRecord>} The created user record.
 */
async function createFirebaseUser(userData) {
  return admin.auth().createUser(userData);
}

module.exports = { createFirebaseUser };