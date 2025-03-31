import { auth, db, doc, setDoc, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@/firebase';

export function renderFishLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login">
      <h2>Login here!</h2>
      <form id="login-form">
        <label for="email">Email:</label>
        <input type="email" id="email" required />
        <br />
        <label for="password">Password:</label>
        <input type="password" id="password" required />
        <br />
        <button type="submit">Login</button>
      </form>

      <h2>Sign Up</h2>
      <form id="signup-form">
        <label for="signup-username">Username:</label>
        <input type="text" id="signup-username" required />
        <br />
        <label for="signup-email">Email:</label>
        <input type="email" id="signup-email" required />
        <br />
        <label for="signup-password">Password:</label>
        <input type="password" id="signup-password" required />
        <br />
        <button type="submit">Sign Up</button>
      </form>

      <br />
      <a href="#" id="back-link">Go back</a>
    </div>
  `;


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
    console.error('Login form Error: Element with ID "login-form" not found.');
  }

  const signupForm = document.getElementById('signup-form');
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
        alert('Sign up successful You are now logged in.');
        window.history.pushState({}, '', '/');
        renderPage();
      } catch (error) {
        console.error('Sign up error:', error);
        alert('Sign up failed: ' + (error.message || 'An unexpected error occurred during sign up'));
      }
    });
  } else {
    console.error('Signup form Error');
  }

  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      renderPage();
    });
  } else {
    console.error('Back link Error');
  }
}