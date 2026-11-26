import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [items, setItems] = useState<Activity[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((result) => {
        if (active) setItems(result.activities);
      })
      .catch(() => {
        if (active) setError('Unable to load data');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      emptyText="No activities"
      items={items}
      error={error}
      renderItem={(activity) => `${activity.type} - ${activity.minutes} minutes - ${activity.points} points`}
    />
  );
}
