'use server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { prepareEmailPassword } from '@/utils/firebase/auth';

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const createUser = async (username, firstName, lastName) => {
    const db = getFirestore();
    const userDoc = db.collection('users').doc(username);
    const userSnapshot = await userDoc.get();
    if (userSnapshot.exists) {
        throw new Error("Username already exists. Please choose a different username.");
    }

    const usernameRegex = /^[A-Za-z][A-Za-z0-9._-]*$/;
    if (!usernameRegex.test(username)) {
        throw new Error("Username must start with a letter and contain only English letters, numbers, dots, underscores, or hyphens.");
    }

    const [email, password] = prepareEmailPassword(username, '0000');
    const userRecord = await getAuth().createUser({ email, password, displayName: `${firstName} ${lastName}`, emailVerified: true, });

    if (!userRecord) {
        throw new Error('Failed to create user');
    }

    userDoc.set({
        uid: userRecord.uid,
        firstName,
        lastName,
        roles: [],
    });
}

export const resetPin = async (userId) => {
    await getAuth().updateUser(userId, {
        password: '000000',
    });
}

export const deleteUser = async (userId) => {
    await getAuth().deleteUser(userId);
}