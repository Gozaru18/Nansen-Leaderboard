// api/leaderboard.js
/*export default async function handler(req, res) {
  try {
    const target = "https://app.nansen.ai/api/points-leaderboard";

    const response = await fetch(target, {
      headers: {
        "accept": "application/json",
        "user-agent": "Mozilla/5.0 (compatible; LeaderboardBot/1.0)" // helps avoid blocks
      }
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const data = await response.json();

    // Add CORS so browser can use it
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: error.message });
  }
}
*/
export default async function handler(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Fetch all data once (⚠️ if API supports pagination, loop instead of single call)
    const response = await fetch("https://app.nansen.ai/api/points-leaderboard", {
      headers: {
        "accept": "application/json",
        "user-agent": "Mozilla/5.0"
      }
    });

    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);

    const allData = await response.json();

    // --- Stats ---
    let totalNXP = 0;
    const ranges = { "1K – 10K": 0, "10K – 100K": 0, "100K – 1M": 0, "1M+": 0 };

    allData.forEach(entry => {
      const points = entry.points_balance || 0;
      totalNXP += points;

      if (points >= 1000 && points < 10000) ranges["1K – 10K"]++;
      else if (points < 100000) ranges["10K – 100K"]++;
      else if (points < 1000000) ranges["100K – 1M"]++;
      else if (points >= 1000000) ranges["1M+"]++;
    });

    const totalPlayers = allData.length;

    // --- Pagination ---
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const players = allData.slice(start, end);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      totalPlayers,
      totalNXP,
      ranges,
      page: parseInt(page),
      limit: parseInt(limit),
      players
    });

  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: error.message });
  }
}
