import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [items, setItems] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((result) => {
        if (active) setItems(result.leaderboard);
      })
      .catch(() => {
        if (active) setError('Unable to load data');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      emptyText="No leaderboard rankings"
      items={items}
      error={error}
      renderItem={(entry) => `#${entry.rank} ${entry.teamName} - ${entry.totalPoints}`}
    />
  );
}
