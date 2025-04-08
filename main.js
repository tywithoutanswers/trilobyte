import { renderFishWelcome } from '/public/pages/welcome';
import { renderFishLogin } from '/public/pages/login';
import { renderFishSignUp } from '/public/pages/signUp';
import { renderFishLeaderboard } from '/public/pages/leaderboard';
import './public/assets/firebase';async function renderFishGame() {
  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      window.renderPage();
    });
  } 
}window.renderPage = async () => {
  const path = window.location.pathname;
  const app = document.getElementById('app');
  let htmlFile = '';
  let initFunction = null;  if (path === '/' || path === '') {
    htmlFile = '/pages/welcome.html';
    initFunction = renderFishWelcome;
  } else if (path === '/login') {
    htmlFile = '/pages/login.html';
    initFunction = renderFishLogin;
  } else if (path === '/signUp') {
    htmlFile = '/pages/signUp.html';
    initFunction = renderFishSignUp;
  } else if (path === '/game') {
    htmlFile = '/pages/game.html';
    initFunction = renderFishGame;
  } else if (path === '/leaderboard') {
    htmlFile = '/pages/leaderboard.html';
    initFunction = renderFishLeaderboard;
  } else {
    window.history.pushState({}, '', '/');
    htmlFile = '/pages/welcome.html';
    initFunction = renderFishWelcome;
  }  try {
    const response = await fetch(htmlFile, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error("Failed to load ${htmlFile}: ${response.status} ${response.statusText}");
    }
    const html = await response.text();
    app.innerHTML = html;
    if (initFunction) {
      initFunction();
    }
  } catch (error) {
    console.error('Error loading page:', error);
    app.innerHTML = '<p>Error loading page. Please try again.</p>';
  }
};window.renderPage();
window.addEventListener('popstate', () => {
  window.renderPage();
});

