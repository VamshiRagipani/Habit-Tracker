I’m starting by inspecting the current app architecture and the existing habit/auth/database wiring so I can patch the right pieces in place without replacing the project.

## Modify My Existing Habit Tracker Project

I already have an existing Habit Tracker application/project.

Do not create a new project from scratch. Do not replace the existing application with a disconnected implementation.

First, inspect the existing codebase, understand its current architecture, identify the existing screens/components/API/database structure, and then modify and extend the current project in place.

The goal is to transform the existing application into a fully API-driven, database-backed, CRUD habit tracker while preserving and improving the existing functionality and UI where appropriate.

---

1. First Inspect the Existing Project

Before making changes:

- Inspect the entire project structure.
- Identify the frontend framework and existing components.
- Identify the backend/API implementation, if one exists.
- Identify the database and existing schema/models.
- Identify existing authentication/user functionality.
- Identify existing habit-related functionality.
- Identify existing API calls/services.
- Identify existing state management.
- Identify existing dashboard/statistics logic.
- Identify reusable components.
- Identify what is currently hardcoded or mocked.

Do not blindly rewrite existing code.

Reuse existing architecture, components, styling, utilities, authentication, and infrastructure whenever they are appropriate.

---

2. Main Objective

Modify the existing application so that users can manage their own habits through real CRUD operations.

Users should be able to:

- Create habits
- View habits
- Edit habits
- Delete/archive habits
- Mark habits as completed
- View completion history
- View progress
- View statistics
- Manage their active habits

All of this must be backed by the database through APIs.

The database must be the source of truth.

The frontend must never be the permanent source of truth for user/habit data.

---

3. Do NOT Hardcode Application Data

This is one of the most important requirements.

Remove hardcoded/mock user-specific data from the UI.

For example, do not keep code like:

const habits = [
  {
    name: "Drink Water",
    completed: true
  },
  {
    name: "Exercise",
    completed: false
  }
];

Instead, retrieve the habits from the existing/new backend API.

For example:

GET /api/habits

The UI should render whatever the API returns.

The same rule applies to:

- Habit names
- Habit descriptions
- Completion status
- Streaks
- Statistics
- Progress
- Dashboard numbers
- Calendar data
- User information
- Habit counts
- Recent activity

If the database is empty, the UI should show an empty state rather than fake data.

---

4. Modify the Existing Architecture

Do not introduce unnecessary technologies if the current project already has suitable technologies.

Follow the project’s existing stack.

Use this architecture where applicable:

Existing Frontend
     ↓
Existing/API Layer
     ↓
Backend Services
     ↓
Database/Repository Layer
     ↓
Database

If the project already has an API layer, extend it.

If the project already has a database layer, extend the existing models/schema.

If the project already has authentication, integrate with it rather than creating a second authentication system.

---

5. Habit Data Model

Inspect the existing database first.

If a habit model/table already exists, extend it rather than creating a duplicate.

The habit model should support fields such as:

- id
- user_id
- name
- description
- category
- frequency
- target
- unit
- start_date
- is_active
- created_at
- updated_at

Use the project’s existing naming conventions and database conventions.

Add a completion/history model if one does not already exist.

For example:

HabitCompletion

- id
- habit_id
- user_id
- completion_date
- completed
- value
- created_at
- updated_at

Add appropriate:

- Foreign keys
- Indexes
- Unique constraints
- Relationships
- Timestamps

A user must only be able to access their own habits and completion records.

---

6. Implement Real CRUD APIs

Inspect the existing API conventions and implement the following functionality using the project’s existing patterns.

Habits

- GET /api/habits
- POST /api/habits
- GET /api/habits/:id
- PUT /api/habits/:id
- DELETE /api/habits/:id

If the existing API uses PATCH instead of PUT, follow the existing convention.

For example:

Create

POST /api/habits

The backend should:

1. Authenticate the user.
2. Validate the request.
3. Create the database record.
4. Return the created habit.
5. Allow the frontend to update its state from the API response.

Read

GET /api/habits

Return the authenticated user’s habits from the database.

Update

PUT/PATCH /api/habits/:id

Update the actual database record.

Delete

DELETE /api/habits/:id

Delete or archive the actual database record according to the project’s existing data model.

Do not implement fake frontend-only CRUD.

---

7. Habit Completion

Add or modify the existing completion functionality so completion data is persisted.

For example:

POST /api/habits/:id/completions

Request:

{
  "completion_date": "2026-08-15",
  "completed": true
}

If the habit supports measurable goals:

{
  "completion_date": "2026-08-15",
  "completed": true,
  "value": 8
}

Prevent inappropriate duplicate completion records.

Use the existing project’s date/time conventions.

---

8. Dashboard Must Be API/Data Driven

Modify the existing dashboard rather than creating a new unrelated dashboard.

Any existing dashboard values that are hardcoded must be replaced with real API/database data.

For example:

- Today’s Progress
- Active Habits
- Completed Today
- Remaining Today
- Current Streak
- Best Streak
- Weekly Progress
- Monthly Progress
- Recent Activity

These values must be calculated from actual database records.

Do not do:

const completedToday = 4;
const totalHabits = 7;
const progress = 57;

Instead, retrieve these values from the backend/API.

If the existing project already has dashboard APIs, modify them to return real data.

---

9. Existing UI

Keep the existing visual identity and useful components where possible.

Do not redesign everything unnecessarily.

Improve the existing UI where needed to support:

- Real habit creation
- Habit editing
- Habit deletion/archive
- Completion tracking
- Loading states
- Empty states
- Error states
- API synchronization
- Dynamic statistics

The existing screens should become functional rather than merely visual.

---

10. Add/Improve Habit Management UI

Use the existing design system/components if available.

The user should have a clear way to:

Add Habit

Open the existing/new habit form and enter:

- Name
- Description
- Category
- Frequency
- Target
- Unit
- Start date

Submitting the form must call the real API.

Edit Habit

The existing habit data should populate the form.

Saving must update the database through the API.

Delete/Archive Habit

Use the existing project’s preferred delete/archive behavior.

The UI must reflect the server response.

Complete Habit

Clicking the completion control must persist the completion through the API.

---

11. Frontend Data Layer

Inspect how the existing project communicates with APIs.

If an API/service layer already exists, extend it.

If not, create a clean one.

For example:

services/
  auth
  habits
  completions
  dashboard

Avoid putting raw API calls throughout individual UI components.

Components should consume the application’s data layer.

---

12. State Synchronization

After a user:

- Creates a habit
- Updates a habit
- Deletes a habit
- Archives a habit
- Completes a habit
- Uncompletes a habit

the UI should immediately reflect the server state.

Use the existing project’s state management/data-fetching approach.

Do not introduce another state-management library unless necessary.

The server/database remains the source of truth.

---

13. Authentication and User Isolation

Inspect the existing authentication implementation.

If authentication already exists, use it.

Every private habit API must identify the authenticated user.

A user must never be able to:

- Read another user’s habits
- Update another user’s habits
- Delete another user’s habits
- Read another user’s completion history

Do not trust user_id values supplied directly by the frontend when the authenticated user identity is already available from the session/token.

---

14. Loading, Empty and Error States

Replace fake data with proper states.

Loading

Display the existing project’s loading/skeleton UI while API data is loading.

Empty

If a user has no habits:

You don't have any habits yet.
Create your first habit to get started.

Provide a clear “Add Habit” action.

Error

If an API request fails, show an appropriate error state.

Do not silently display fake data when the API fails.

---

15. Database Migrations

If database changes are required:

- Create proper migrations.
- Preserve existing data.
- Do not drop existing tables/data unnecessarily.
- Extend existing models where possible.
- Make migrations safe to run.
- Follow the project’s existing migration tooling.

Do not use an in-memory database as the final implementation.

---

16. Existing Data

If the current application already contains habit data:

- Do not destroy it.
- Identify the current data format.
- Migrate it into the new structure if necessary.
- Preserve existing users and habits whenever possible.

If there is currently mock/static data, replace it with database-backed data.

---

17. API Error Handling

Follow the existing project’s API response/error conventions.

Return appropriate HTTP status codes.

Handle:

- Unauthorized requests
- Forbidden resources
- Missing habits
- Invalid input
- Database failures
- Validation errors
- Network errors

Do not expose database internals or sensitive information to the frontend.

---

18. Keep It Data Driven

The final application should work regardless of how many habits exist.

For example:

Database:
User A
 ├── Habit 1
 ├── Habit 2
 ├── Habit 3
 └── Habit 4
User B
 ├── Habit 5
 └── Habit 6

The UI must automatically render the correct data for the authenticated user.

Adding another habit must not require changing frontend code.

Adding another user must not require changing frontend code.

Adding another category must not require changing frontend code.

The application should be driven by database/API data rather than hardcoded assumptions.

---

19. Multiple APIs

Use separate API responsibilities rather than putting everything into one giant endpoint.

For example:

Authentication API
        ↓
Habit API
        ↓
Completion API
        ↓
Dashboard/Statistics API

These APIs can communicate through shared backend services/repositories where appropriate.

Avoid duplicating business logic between endpoints.

For example, streak calculation should exist in one appropriate backend service rather than being independently implemented in multiple frontend screens.

---

20. Statistics

Modify the existing statistics/progress functionality to use actual completion data.

Calculate things such as:

- Daily completion rate
- Weekly completion rate
- Monthly completion rate
- Current streak
- Longest streak
- Habit completion history

Do not hardcode these values.

Where calculations are expensive or reusable, perform them on the backend rather than duplicating the calculations across frontend components.

---

21. Testing

Inspect the project’s existing testing setup.

Add/update tests for the most important flows:

- Create habit
- Read habits
- Update habit
- Delete/archive habit
- Complete habit
- Retrieve completion history
- Dashboard statistics
- User authorization

At minimum, verify that one user cannot access another user’s data.

---

22. Important: Do Not Break Existing Features

Before changing anything, identify existing functionality.

Preserve:

- Existing authentication
- Existing navigation
- Existing design system
- Existing useful components
- Existing routes
- Existing database data
- Existing working APIs

Only change/refactor what is necessary to achieve the new requirements.

If an existing implementation is already good, reuse it.

---

23. Implementation Process

Follow this sequence:

Step 1 — Analyze

Inspect the existing repository and understand how it works.

Step 2 — Identify

Find:

- Hardcoded data
- Mock APIs
- Existing habit models
- Existing API endpoints
- Existing database tables
- Existing dashboard calculations
- Existing authentication

Step 3 — Plan

Determine the smallest set of changes required to make the application properly data-driven.

Step 4 — Implement Backend

Modify the existing backend/database/API architecture.

Step 5 — Implement Frontend Data Layer

Connect existing UI components to real APIs.

Step 6 — Implement CRUD

Make create/read/update/delete operations fully functional.

Step 7 — Implement Completion

Persist completion history.

Step 8 — Update Dashboard

Replace hardcoded values with API-driven statistics.

Step 9 — Handle States

Add loading, empty and error states.

Step 10 — Test

Test the complete flow from:

UI
 ↓
API
 ↓
Database
 ↓
API
 ↓
UI

---

24. Final Acceptance Criteria

The modification is complete only when:

- The existing project is modified rather than replaced.
- Existing useful functionality is preserved.
- Users can create habits from the existing UI.
- Created habits are persisted in the real database.
- Users can retrieve their habits through an API.
- Users can edit habits.
- Users can delete/archive habits.
- Users can mark habits complete.
- Completion data is persisted.
- Habit history comes from the database.
- Dashboard statistics come from real data.
- No user/habit information is hardcoded in the UI.
- No fake/mock API responses remain in production functionality.
- Multiple users can use the application independently.
- Users cannot access each other’s data.
- The application works correctly when there are zero habits.
- Reloading the browser does not lose data.
- CRUD operations work end-to-end.
- Existing project functionality is not unnecessarily broken.

Most Important Instruction

Use my existing project as the starting point. Inspect it first, then modify it in place.

Do not generate a generic new Habit Tracker.

Do not replace the existing UI with a mockup.

Do not use hardcoded data to make the screens look complete.

Make the existing screens functional by connecting them to real APIs and the existing/new database models.

The final result should feel like the same application upgraded into a real, scalable, database-backed, API-driven product, not a completely separate application.