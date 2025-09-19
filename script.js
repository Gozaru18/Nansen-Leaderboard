
/*const apiUrl = "/api/leaderboard";

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


loadLeaderboard();*/

const apiUrl = "/api/leaderboard";

let currentPage = 1;
const limit = 50;
let loading = false;
let reachedEnd = false;
const loaderRow = document.getElementById("loader-row");

// Load summary + first batch
async function loadInitial() {
  const res = await fetch(`${apiUrl}?page=1&limit=${limit}`);
  const data = await res.json();

  renderSummary(data);
  renderRows(data.players);
  currentPage = 1;
}

// Render summary cards
function renderSummary(data) {
  const cardsDiv = document.getElementById("cards");
  cardsDiv.innerHTML = `
    <div class="card"><h2>${data.totalPlayers.toLocaleString()}</h2><p>Total Players</p></div>
    <div class="card"><h2>${data.totalNXP.toLocaleString()}</h2><p>Total NXP</p></div>
  `;

  Object.entries(data.ranges).forEach(([range, count]) => {
    if (count > 0) {
      cardsDiv.innerHTML += `
        <div class="card">
          <h2>${count.toLocaleString()}</h2>
          <p>${range}</p>
        </div>
      `;
    }
  });
}

// Render table rows
function renderRows(players) {
  const tbody = document.getElementById("leaderboard");
  tbody.innerHTML += players.map(entry => {
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
}

// Lazy load on scroll
async function loadMore() {
  if (loading || reachedEnd) return;
  loading = true;

  // Show loader
  loaderRow.style.display = "table-row";

  currentPage++;
  const res = await fetch(`${apiUrl}?page=${currentPage}&limit=${limit}`);
  const data = await res.json();

  if (data.players.length === 0) {
    reachedEnd = true;
  } else {
    renderRows(data.players);
  }

  // Hide loader
  loaderRow.style.display = "none";
  loading = false;
}

// Attach scroll listener
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMore();
  }
});

// Init
loadInitial();
// Search by EVM address
async function searchAddress() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const tbody = document.getElementById("leaderboard");

  if (!query) {
    alert("Please enter an EVM address to search.");
    return;
  }

  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">⏳ Searching...</td></tr>`;

  try {
    // fetch full dataset once (limit adjusted to cover all players)
    const res = await fetch(`${apiUrl}?page=1&limit=8000`); 
    const data = await res.json();

    const found = data.players.filter(entry =>
      (entry.evm_address || "").toLowerCase().includes(query)
    );

    if (found.length > 0) {
      tbody.innerHTML = found.map(entry => {
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
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">❌ No results found</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">⚠️ Error searching</td></tr>`;
  }
}

// Attach to button and Enter key
document.getElementById("searchBtn").addEventListener("click", searchAddress);
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchAddress();
});

