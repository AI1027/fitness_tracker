import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };

export default function Workouts() {
  const [items, setItems] = useState<Workout[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: Workout[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((result) => {
        if (active) setItems(result.suggestions);
      })
      .catch(() => {
        if (active) setError('Unable to load data');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <CapabilityCard<Workout>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyText="No workout suggestions"
      items={items}
      error={error}
      renderItem={(workout) => `${workout.title} - ${workout.reason}`}
    />
  );
}
