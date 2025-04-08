import { db, collection, getDocs} from '../assets/firebase';;

export async function renderFishLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');
  if (!leaderboardBody) {
    document.getElementById('app').innerHTML = '<p>Error: Leaderboard body not found.</p>';
    return;
  }


  const backLink = document.getElementById('back-link');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/');
      renderPage();
    });
  }
  await fetchLeaderboardData();
}

async function fetchLeaderboardData() {
  try {
    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardBody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

    const usersSnapshot = await getDocs(collection(db, 'users'));
    let allPlayers = [];

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const playerDataSnapshot = await getDocs(collection(db, 'users', userId, 'playerData'));
      playerDataSnapshot.forEach((playerDoc) => {
        const playerData = playerDoc.data();
        allPlayers.push({
          name: playerData.name || 'Unknown',
          totalscore: playerData.totalscore || 0,
          totalfish: playerData.totalfish || 0,
        });
      });
    }

    allPlayers.sort((a, b) => b.totalscore - a.totalscore);

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