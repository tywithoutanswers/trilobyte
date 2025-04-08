import { auth, db, doc, setDoc, createUserWithEmailAndPassword } from '../assets/firebase';

export async function renderFishSignUp() {
  const app = document.getElementById('app');
  try {
    const response = await fetch('/pages/signUp.html');
    if (!response.ok) throw new Error('Failed to load signUp.html');
    app.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading sign-up template:', error);
    app.innerHTML = '<p>Error loading sign-up page.</p>';
    return;
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      // Client-side validation
      if (!username || username.length < 3) {
        alert('Username must be at least 3 characters long.');
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }

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
        window.renderPage();
      } catch (error) {
        console.error('Sign up error:', error);
        let errorMessage = 'An unexpected error occurred during sign up.';
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use. Please use a different email.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. It must be at least 6 characters long.';
            break;
          default:
            errorMessage = error.message;
        }
        alert('Sign up failed: ' + errorMessage);
      }
    });
  } else {
    console.error('Signup form not found in the DOM. Ensure signUp.html includes <form id="signup-form">.');
  }

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      window.renderPage();
    });
  } else {
    console.error('Back link not found in the DOM. Ensure signUp.html includes <a id="back-link">.');
  }
}