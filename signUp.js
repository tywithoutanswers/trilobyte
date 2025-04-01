
import { auth, db, doc, setDoc,  createUserWithEmailAndPassword } from '@/firebase';

export async function renderFishSignUp() {
  const app = document.getElementById('app');
  try {
    const response = await fetch('/pages/signUp.html');
    if (!response.ok) throw new Error('Failed to load signUp.html');
    app.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading login template:', error);
    app.innerHTML = '<p>Error loading login page.</p>';
    return;
  }const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          username,
          email,
          createdAt: new Date().toISOString(),
        });
        alert('Sign up successful! You are now logged in.');
        window.history.pushState({}, '', '/');
        renderPage();
      } catch (error) {
        console.error('Sign up error:', error);
        alert('Sign up failed: ' + (error.message || 'An unexpected error occurred during sign up'));
      }
    });
  } else {
    console.error('Signup form not found in the DOM');
  }
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      renderPage();
    });
  } else {
    console.error('Back link not found in the DOM');
  }
}