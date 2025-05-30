'use server';
import { getAuth } from 'firebase-admin/auth';
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

function withErrorHandling(fn) {
    return async (...args) => {
        try {
            const res = await fn(...args) || {};
            res.success = true;
            return res;
        } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
        }
    };
}

export const createUser = withErrorHandling(async (username, pinPass, displayName) => {
    const [email, password] = prepareEmailPassword(username, pinPass);
    const userRecord = await getAuth().createUser({ email, password, displayName });

    return { id: userRecord.uid };
});

export const resetPin = withErrorHandling(async (userId) => {
    await getAuth().updateUser(userId, {
        password: '000000',
    });
});

export const deleteUser = withErrorHandling(async (userId) => {
    await getAuth().deleteUser(userId);
});