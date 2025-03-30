import { auth, db, doc, setDoc } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const loginModule = {
  data: {
    email: '',
    password: '',
    signupUsername: '',
    signupEmail: '',
    signupPassword: '',
  },
  async login() {
    try {
      await signInWithEmailAndPassword(auth, this.data.email, this.data.password);
      alert('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
    }
  },
  async signUp() {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, this.data.signupEmail, this.data.signupPassword);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: this.data.signupUsername,
        email: this.data.signupEmail,
        createdAt: new Date().toISOString(),
      });

      alert('Sign up successful! You are now logged in.');
    } catch (error) {
      console.error('Sign up failed:', error);
      alert('Sign up failed: ' + error.message);
    }
  },
};