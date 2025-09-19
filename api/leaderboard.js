// api/leaderboard.js
export default async function handler(req, res) {
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
