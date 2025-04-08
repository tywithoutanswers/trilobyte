import { auth, signInWithEmailAndPassword} from '../assets/firebase';
export async function renderFishLogin() {
  const app = document.getElementById('app');
  try {
    const response = await fetch('/pages/login.html');
    if (!response.ok) throw new Error('Failed to load login.html');
    app.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading login template:', error);
    app.innerHTML = '<p>Error loading login page.</p>';
    return;
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
        window.history.pushState({}, '', '/');
        renderPage();
      } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'An unexpected error occurred during login.';
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format.';
            break;
          default:
            errorMessage = error.message;
        }
        alert('Login failed: ' + errorMessage);
      }
    });
  } 
  const signupLink = document.getElementById('signup-link');
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/signUp');
      window.renderPage();
    });
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