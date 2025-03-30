import { auth, signOut, onAuthStateChanged } from '@/firebase';

const welcomeModule = {
  user: ref(null),
  init() {
    onAuthStateChanged(auth, (currentUser) => {
      welcomeModule.user.value = currentUser;
    });
  },
  async signOutUser() {
    try {
      await signOut(auth);
      alert('Signed out successfully!');
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Sign out failed: ' + error.message);
    }
  },
};
welcomeModule.init();