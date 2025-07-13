import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';


export const prepareEmailPassword = (username, pinPass) => {
  const email = username.split('@')[0] + '@chamama.org'
  const password = pinPass.toString().padStart(6, '0')
  return [email, password]
}

export class AuthService {
  static async signIn(username, pinPass) {
    const [email, password] = prepareEmailPassword(username, pinPass);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.getUserData(userCredential.user);
      return user;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async getUserData(firebaseUser) {
    const username = firebaseUser.email ? firebaseUser.email.split('@')[0] : null;
    if (!username) {
      throw new Error('Username not found in Firebase user data');
    }

    const userDoc = await getDoc(doc(db, 'users', username));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { id: username, ...data };
    } else {
      console.error('No user data found for this username:', username);
      throw new Error('User data not found');
    }
  }

  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await this.getUserData(firebaseUser);
          callback(user);
        } catch (error) {
          console.error('Error getting user data:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  static subscribeToUserDoc(username, callback) {
    const userRef = doc(db, 'users', username);
    return onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) callback({ username, ...docSnap.data() });
      else callback(null);
    });
  }

  static getErrorMessage(error) {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No user found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
          return 'Invalid email address.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        default:
          return error.message || 'An error occurred during authentication.';
      }
    }
    return error.message || 'An unexpected error occurred.';
  }
}
