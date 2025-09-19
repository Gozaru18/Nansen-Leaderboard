export default async function handler(req, res) {
  try {
    const apiUrl = "https://app.nansen.ai/api/points-leaderboard";
    const response = await fetch(apiUrl);

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
