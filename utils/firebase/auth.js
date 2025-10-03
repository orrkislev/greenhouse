import { EmailAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

export const prepareEmail = (username) => {
  return username.split('@')[0] + '@chamama.org'
}
export const getUsernameFromEmail = (email) => {
  return email.split('@')[0]
}
export const preparePassword = (pinPass) => {
  return pinPass
  // return pinPass.toString().padStart(6, '0')
}

export const onGotUser = (callback) => {
  onAuthStateChanged(auth, callback);
}

export class AuthService {
  static async signIn(username, pinPass) {
    const email = prepareEmail(username);
    const password = preparePassword(pinPass);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  static async signInWithGoogle() {
    try {
      const googleProvider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, googleProvider);
      return { user: userCredential.user };
    } catch (error) {
      return { error: this.getErrorMessage(error) };
    }
  }

  static getErrorMessage(error) {
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-credential':
          return 'שם משתמש או סיסמא שגויים';
        case 'auth/user-not-found':
          return 'שם משתמש או סיסמא שגויים';
        case 'auth/wrong-password':
          return 'שם משתמש או סיסמא שגויים';
        case 'auth/email-already-in-use':
          return 'משתמש זה כבר קיים';
        case 'auth/weak-password':
          return 'סיסמא חלשה';
        case 'auth/invalid-email':
          return 'שם משתמש לא תקין';
        case 'auth/too-many-requests':
          return 'יותר מדי ניסיונות. נסו שוב מאוחר יותר';
        default:
          return error.message || 'שגיאה בהתחברות';
      }
    }
    return error.message || 'שגיאה בהתחברות';
  }
}
