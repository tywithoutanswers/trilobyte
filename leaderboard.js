import { db, collection, getDocs} from '@/firebase';;

export async function renderFishLeaderboard() {
  const app = document.getElementById('app');
  try {
    const response = await fetch('/public/pages/leaderboard.html');
    if (!response.ok) throw new Error('Failed to load leaderboard.html');
    app.innerHTML = await response.text();
  } catch (error) {
    console.error('Error loading leaderboard template:', error);
    app.innerHTML = '<p>Error loading leaderboard page.</p>';
    return;
  }


  fetchLeaderboardData();


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

async function fetchLeaderboardData() {
  try {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) {
      console.error('Leaderboard body not found in the DOM');
      return;
    }
    leaderboardBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let allPlayers = [];

    // For each user, fetch their playerData subcollection
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const playerDataSnapshot = await getDocs(collection(db, 'users', userId, 'playerData'));
      playerDataSnapshot.forEach((playerDoc) => {
        const playerData = playerDoc.data();
        allPlayers.push({
          name: playerData.name || 'Unknown',
          totalscore: playerData.totalscore || 0,
          totalfish: playerData.totalfish || 0,
          trilobites: playerData.trilobites || 0,
          cod: playerData.cod || 0,
          salmon: playerData.salmon || 0,
          trouts: playerData.trouts || 0,
        });
      });
    }

    // Sort players by totalscore in descending order
    allPlayers.sort((a, b) => b.totalscore - a.totalscore);

    // Display the leaderboard
    if (allPlayers.length === 0) {
      leaderboardBody.innerHTML = '<tr><td colspan="8">No players found.</td></tr>';
      return;
    }

    leaderboardBody.innerHTML = '';
    allPlayers.forEach((player, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.totalscore}</td>
        <td>${player.totalfish}</td>
        <td>${player.trilobites}</td>
        <td>${player.cod}</td>
        <td>${player.salmon}</td>
        <td>${player.trouts}</td>
      `;
      leaderboardBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (leaderboardBody) {
      leaderboardBody.innerHTML = '<tr><td colspan="8">Error loading leaderboard: ' + error.message + '</td></tr>';
    }
  }
}