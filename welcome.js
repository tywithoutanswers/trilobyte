import { auth, signOut, onAuthStateChanged } from '@/firebase';
import { renderUploadJSON } from '@/UploadJSON';
export function renderFishWelcome() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="welcome">
      <h1>Welcome to Trilobyte Trawling!</h1>
      <h2>A browser fishing game developed by Trilobyte Studios</h2>
      <div class="nav-links">
        <a href="#" id="login-link">Login</a>
        <a href="#" id="game-link">Play Game</a>
        <a href="#" id="leaderboard-link">LeaderBoard</a>
        <button id="signout-button" style="display: none;">Sign Out</button>
      </div>
    </div>
    <div class="upload-json" id="upload-section"></div>
  `;


  document.getElementById('login-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/login');
    renderPage();
  });
  document.getElementById('game-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/game');
    renderPage();
  });
  document.getElementById('leaderboard-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.history.pushState({}, '', '/leaderboard');
    renderPage();
  });

  
  const signOutButton = document.getElementById('signout-button');
  onAuthStateChanged(auth, (user) => {
    if (user) {
      signOutButton.style.display = 'inline-block';
    } else {
      signOutButton.style.display = 'none';
      window.history.pushState({}, '', '/login');
      renderPage();
    }
  });

  signOutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      alert('Signed out successfully!');
      window.history.pushState({}, '', '/login');
      renderPage();
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Sign out failed: ' + error.message);
    }
  });

  
  renderUploadJSON();
}