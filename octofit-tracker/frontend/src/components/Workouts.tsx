import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; reason: string };

export default function Workouts() {
  return (
    <CapabilityCard<Workout>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona%40example.com"
      resultKey="suggestions"
      emptyText="No workout suggestions"
      renderItem={(workout) => `${workout.title} - ${workout.reason}`}
    />
  );
}
