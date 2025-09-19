<?php
// Allow bigger JSON (7k+ players)
ini_set('memory_limit', '512M');

// Fetch the leaderboard once
$apiUrl = "https://app.nansen.ai/api/points-leaderboard";

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$allData = json_decode($response, true);

// Stats
$totalNXP = 0;
$totalPlayers = is_array($allData) ? count($allData) : 0;

$ranges = [
  "1K – 10K" => 0,
  "10K – 100K" => 0,
  "100K – 1M" => 0,
  "1M+" => 0
];

if (is_array($allData)) {
    foreach ($allData as $entry) {
        $points = $entry["points_balance"] ?? 0;
        $totalNXP += $points;

        if ($points >= 1000 && $points < 10000) {
            $ranges["1K – 10K"]++;
        } elseif ($points < 100000) {
            $ranges["10K – 100K"]++;
        } elseif ($points < 1000000) {
            $ranges["100K – 1M"]++;
        } else {
            $ranges["1M+"]++;
        }
    }
}

// Only show top 500 players for performance
$maxDisplay = 500;
$displayData = array_slice($allData, 0, $maxDisplay);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nansen Leaderboard</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f4f6f8; margin:0; padding:20px; }
    .leaderboard-container {
      max-width: 900px; margin:0 auto; background:#fff; border-radius:10px;
      box-shadow:0px 2px 10px rgba(0,0,0,0.1); padding:20px;
    }
    h1 { text-align:center; margin-bottom:20px; color:#333; }
    .cards { display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px; justify-content:center; }
    .card {
      flex:1 1 150px; background:#007bff; color:white; padding:15px;
      border-radius:8px; text-align:center;
    }
    .card h2 { margin:0; font-size:22px; }
    .card p { margin:5px 0 0; font-size:14px; opacity:0.9; }
    table { width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; }
    thead { background:#007bff; color:white; }
    th, td { padding:12px 15px; border-bottom:1px solid #ddd; }
    tr:nth-child(even) { background:#f9f9f9; }
    tr:hover { background:#f1f1f1; }
    td:first-child { font-weight:bold; }
    .address { font-family:monospace; }
    .note { margin-top:10px; text-align:center; color:#666; font-size:14px; }
  </style>
</head>
<body>
  <div class="leaderboard-container">
    <h1>Nansen NXP Leaderboard</h1>

    <!-- Summary Cards -->
    <div class="cards">
      <div class="card">
        <h2><?= number_format($totalPlayers) ?></h2>
        <p>Total Players</p>
      </div>
      <div class="card">
        <h2><?= number_format($totalNXP) ?></h2>
        <p>Total NXP</p>
      </div>
      <?php foreach ($ranges as $range => $count): ?>
        <?php if ($count > 0): // hide empty ranges ?>
          <div class="card">
            <h2><?= number_format($count) ?></h2>
            <p><?= $range ?></p>
          </div>
        <?php endif; ?>
      <?php endforeach; ?>
    </div>

    <!-- Leaderboard Table -->
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>EVM Address</th>
          <th>NXP</th>
          <th>Tier</th>
        </tr>
      </thead>
      <tbody>
        <?php if ($totalPlayers > 0): ?>
          <?php foreach ($displayData as $entry): ?>
            <tr>
              <td><?= htmlspecialchars($entry["rank"] ?? "-") ?></td>
              <td class="address">
                <?php
                  $addr = $entry["evm_address"] ?? "Unknown";
                  echo substr($addr, 0, 6) . "..." . substr($addr, -4);
                ?>
              </td>
              <td><?= number_format($entry["points_balance"] ?? 0) ?></td>
              <td><?= htmlspecialchars($entry["tier"] ?? "-") ?></td>
            </tr>
          <?php endforeach; ?>
        <?php else: ?>
          <tr><td colspan="4">Failed to load leaderboard data</td></tr>
        <?php endif; ?>
      </tbody>
    </table>

    <div class="note">
      Showing top <?= $maxDisplay ?> players out of <?= number_format($totalPlayers) ?>.
    </div>
  </div>
</body>
</html>