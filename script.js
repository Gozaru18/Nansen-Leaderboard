
//const apiUrl = "/api/leaderboard";
const apiUrl = "https://cors-anywhere.herokuapp.com/https://app.nansen.ai/api/points-leaderboard";
async function loadLeaderboard() {
  try {
    const res = await fetch(apiUrl);
    const allData = await res.json();
    

    let totalNXP = 0;
    const totalPlayers = Array.isArray(allData) ? allData.length : 0;

    const ranges = {
      "1K – 10K": 0,
      "10K – 100K": 0,
      "100K – 1M": 0,
      "1M+": 0
    };

    if (Array.isArray(allData)) {
      allData.forEach(entry => {
        const points = entry.points_balance || 0;
        totalNXP += points;

        if (points >= 1000 && points < 10000) ranges["1K – 10K"]++;
        else if (points < 100000) ranges["10K – 100K"]++;
        else if (points < 1000000) ranges["100K – 1M"]++;
        else ranges["1M+"]++;
      });
    }

    // Build summary cards
    const cardsDiv = document.getElementById("cards");
    cardsDiv.innerHTML = `
      <div class="card">
        <h2>${totalPlayers.toLocaleString()}</h2>
        <p>Total Players</p>
      </div>
      <div class="card">
        <h2>${totalNXP.toLocaleString()}</h2>
        <p>Total NXP</p>
      </div>
    `;

    Object.entries(ranges).forEach(([range, count]) => {
      if (count > 0) {
        cardsDiv.innerHTML += `
          <div class="card">
            <h2>${count.toLocaleString()}</h2>
            <p>${range}</p>
          </div>
        `;
      }
    });

    // Build leaderboard table
    const tbody = document.getElementById("leaderboard");
    const maxDisplay = 500;
    const displayData = allData.slice(0, maxDisplay);

    if (displayData.length > 0) {
      tbody.innerHTML = displayData.map(entry => {
        const addr = entry.evm_address || "Unknown";
        const shortAddr = addr.slice(0, 6) + "..." + addr.slice(-4);
        return `
          <tr>
            <td>${entry.rank ?? "-"}</td>
            <td class="address">${shortAddr}</td>
            <td>${(entry.points_balance ?? 0).toLocaleString()}</td>
            <td>${entry.tier ?? "-"}</td>
          </tr>
        `;
      }).join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="4">Failed to load leaderboard data</td></tr>`;
    }

    // Note
    document.getElementById("note").innerText =
      `Showing top ${maxDisplay} players out of ${totalPlayers.toLocaleString()}.`;

  } catch (err) {
    console.error(err);
    document.getElementById("leaderboard").innerHTML =
      `<tr><td colspan="4">Error loading data</td></tr>`;
  }
}


loadLeaderboard();

