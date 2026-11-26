# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the four capabilities as routed React views, using a shared API client for relative `/api` requests and Vite's proxy. Each view should own only rendering and request-state presentation; loading, empty, API error, and successful response states must be accessible.
- Logic tier decision: Keep Express route handlers thin and delegate record validation, aggregation, and recommendation behavior to TypeScript services. Return deliberate 4xx responses for invalid input or missing resources instead of allowing Mongoose cast errors to become 500s.
- Data tier decision: Define required Mongoose schemas and links for users, teams, activities, and workouts; use seed data that is representative and idempotent while preserving unrelated existing records.
- Activity tracking approach: Validate `userId`, `teamId`, `type`, and `minutes`; verify that both ObjectIds exist, compute positive points from the submitted activity, and store the linked user/team with an `occurredAt` timestamp.
- Team management approach: Reject teams without a name, require both `name` and `mascot`, default `members` to an empty array, and preserve submitted members while keeping user/team references consistent.
- Leaderboard approach: Aggregate activity `points` by team, sort descending, attach a 1-based rank, and return `teamName`, `totalPoints`, and `rank` only in the public leaderboard shape.
- Workout suggestions approach: Resolve the exact seeded user's email, inspect recent activity and the user's fitness goal, then return matching workout(s) with a focus and reason that explain the recommendation. Return a deliberate 404 for unknown emails.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
  - Failure means a Mongoose schema, required field, default, reference, or seed/idempotency contract is incomplete.
  - Current result: 4 of 5 tests fail: user validation, team validation/defaults, activity validation, and workout validation. The seed/idempotency test passes.
- API command: `npm run test:api --prefix octofit-tracker/backend`
  - Failure means route validation, service behavior, data persistence, aggregation, or response formatting is incomplete.
  - Current result: all 4 tests fail. Activity/team handlers return implementation `501` responses, leaderboard data is empty, and workout suggestions lack the required matched recommendation reason.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
  - Failure means routed presentation, shared API integration, or accessible loading/empty/error state behavior is incomplete.
  - Current result: all 15 tests fail across activities, teams, leaderboard, and workouts.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
  - Failure means the Express/TypeScript implementation has compile, import, or type errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
  - Failure means the React/Vite implementation has compile, import, bundling, or type errors.
