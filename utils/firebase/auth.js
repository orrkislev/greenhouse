import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User as FirebaseUser, } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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

  static async signUp(username, pinPass, userData) {
    const [email, password] = prepareEmailPassword(username, pinPass);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // await updateProfile(userCredential.user, { displayName: userData.firstName + ' ' + userData.lastName });
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      userData.id = userCredential.user.uid; // Add user ID to the data
      return userData;
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
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return { id: firebaseUser.uid, ...data };
    } else {
      console.error('No user data found for this user ID:', firebaseUser.uid);
      throw new Error('User data not found');
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
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
