import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(userId) ||
    typeof teamId !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(teamId) ||
    typeof type !== 'string' ||
    type.trim().length === 0 ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity requires valid userId, teamId, type, and positive minutes'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    name.trim().length === 0 ||
    typeof mascot !== 'string' ||
    mascot.trim().length === 0
  ) {
    throw Object.assign(new Error('Team requires a name and mascot'), { status: 400 });
  }

  const memberIds: string[] = [];
  if (members !== undefined) {
    if (!Array.isArray(members)) {
      throw Object.assign(new Error('Team members must be an array of user IDs'), { status: 400 });
    }
    for (const memberId of members) {
      if (typeof memberId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(memberId)) {
        throw Object.assign(new Error('Team members must contain valid user IDs'), { status: 400 });
      }
      memberIds.push(memberId);
    }
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMemberCount = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
  if (existingMemberCount !== uniqueMemberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('_id name').lean(),
    Activity.aggregate([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(
    activityTotals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]),
  );

  return teams
    .map(({ _id, name }) => ({
      teamName: name,
      totalPoints: pointsByTeam.get(_id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const latestActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const goalFocus = user.fitnessGoal.trim().toLowerCase();
  const activityFocus = latestActivity
    ? focusForActivity(latestActivity.type)
    : undefined;
  const preferredFocuses = [...new Set([goalFocus, activityFocus].filter((focus): focus is string => Boolean(focus)))];
  const workouts = await Workout.find({ focus: { $in: preferredFocuses } }).lean();

  return workouts
    .sort((left, right) =>
      preferredFocuses.indexOf(left.focus.toLowerCase()) - preferredFocuses.indexOf(right.focus.toLowerCase()) ||
      left.title.localeCompare(right.title))
    .map((workout) => {
      const matchesGoal = workout.focus.toLowerCase() === goalFocus;
      const reason = matchesGoal
        ? activityFocus === goalFocus && latestActivity
          ? `Matches your ${user.fitnessGoal} goal and recent ${latestActivity.type} activity.`
          : `Matches your ${user.fitnessGoal} fitness goal.`
        : `Matches your recent ${latestActivity?.type} activity.`;
      return { ...workout, reason };
    });
}

function focusForActivity(type: string) {
  const normalizedType = type.trim().toLowerCase();
  if (['run', 'cycle', 'walk'].includes(normalizedType)) return 'endurance';
  return normalizedType;
}

export { User };
