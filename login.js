import { auth, signInWithEmailAndPassword} from '@/firebase';
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
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
        window.history.pushState({}, '', '/');
        renderPage();
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.message || 'An unexpected error occurred during login'));
      }
    });
  } else {
    console.error('Login form not found in the DOM');
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