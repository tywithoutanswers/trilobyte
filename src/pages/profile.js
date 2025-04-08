import { auth, signOut, onAuthStateChanged } from '../../public/assets/firebase';
import { renderUploadJSON } from '../../public/UploadJSON';

export function renderFishWelcome() {
  const loginLink = document.getElementById('login-link');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/login');
      renderPage();
    });
  }

  const gameLink = document.getElementById('game-link');
  if (gameLink) {
    gameLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/game');
      renderPage();
    });
  }

  const leaderboardLink = document.getElementById('leaderboard-link');
  if (leaderboardLink) {
    leaderboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/leaderboard');
      renderPage();
    });
  }

  const signOutButton = document.getElementById('signout-button');
  if (signOutButton) {
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
  }
  const waitForUploadSection = () => {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      renderUploadJSON();
    } else {
      console.log('Waiting for upload-section to be available...');
      setTimeout(waitForUploadSection, 100); 
    }
  };

  waitForUploadSection();
}