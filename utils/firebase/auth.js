import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, } from './firebase';


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
      return userCredential.user;
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
