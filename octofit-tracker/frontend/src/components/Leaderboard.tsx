import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      resultKey="leaderboard"
      emptyText="No leaderboard rankings"
      renderItem={(entry) => `#${entry.rank} ${entry.teamName} - ${entry.totalPoints}`}
    />
  );
}
