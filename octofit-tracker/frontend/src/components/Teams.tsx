import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const [items, setItems] = useState<Team[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then((result) => {
        if (active) setItems(result.teams);
      })
      .catch(() => {
        if (active) setError('Unable to load data');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      emptyText="No teams"
      items={items}
      error={error}
      renderItem={(team) => `${team.name} - ${team.members.join(', ')}`}
    />
  );
}
