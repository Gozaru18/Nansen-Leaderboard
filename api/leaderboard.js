export default async function handler(req, res) {
  try {
    const response = await fetch("https://app.nansen.ai/api/points-leaderboard", {
      headers: { "accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const data = await response.json();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
