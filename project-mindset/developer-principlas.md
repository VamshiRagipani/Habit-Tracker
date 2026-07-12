# Development Mindset & Engineering Principles

## Project Goal

Build this application as a scalable, dynamic, API-driven system.

The frontend should be a rendering layer.

The database and backend should control the application data and business state.

Think:

DB → Backend/API → JSON → React UI

Avoid:

Hardcoded Data → React UI

---

# 1. No Hardcoded Business Data in React

Do not hardcode habits, titles, descriptions, icons, limits, or counts directly in React components.

Bad:

const habits = [
  "Solve DSA",
  "Go to Gym",
  "Read 5 Pages"
];

Good:

const habits = await getHabits();

The frontend should dynamically render whatever the API returns.

If the database has 5 habits, display 5 habits.

If the database has 16 habits, display 16 habits.

If a habit is removed from the database, it should disappear from the UI without requiring a frontend code change.

---

# 2. Database-Driven Design

Habit definitions should live in the database.

Example habit structure:

{
  "id": "habit_001",
  "title": "Solve 1 DSA Problem",
  "description": "Complete at least one coding problem.",
  "icon": "🧠",
  "order": 1,
  "isActive": true
}

Daily completion state should be stored separately from the habit definition.

Example:

{
  "habitId": "habit_001",
  "date": "2025-07-12",
  "completed": true
}

Do not mix permanent habit configuration with daily completion state.

---

# 3. API-First Thinking

Before building a UI feature, ask:

1. What data does the UI need?
2. Where does this data come from?
3. What should the API JSON look like?
4. What is the unique ID?
5. What state can change?
6. How should errors be handled?

Design the API contract first.

Then build the React UI around the API response.

Example:

GET /api/habits/today

Response:

{
  "date": "2025-07-12",
  "habits": [
    {
      "id": "habit_001",
      "title": "Solve 1 DSA Problem",
      "description": "Complete one coding problem.",
      "icon": "🧠",
      "completed": true,
      "order": 1
    }
  ]
}

---

# 4. React Should Render Dynamically

React components should be reusable.

Example:

{habits.map((habit) => (
  <HabitCard
    key={habit.id}
    habit={habit}
  />
))}

Do not create separate JSX for every habit.

Bad:

<DSAHabit />
<GymHabit />
<ReadingHabit />
<CodingHabit />

Good:

<HabitCard habit={habit} />

One reusable component should support all habits.

---

# 5. Never Depend on Array Index for Identity

Do not use the array index to identify a habit.

Bad:

key={index}

updateHabit(index)

Good:

key={habit.id}

updateHabit(habit.id)

Every database entity should have a stable unique ID.

All update, delete, and checkbox operations should use that ID.

---

# 6. Optimistic UI for Checkbox Actions

Checkbox interactions should feel instant.

Flow:

User Click
    ↓
Update Local UI Immediately
    ↓
Send API Request
    ↓
Success → Keep State
Error → Rollback State + Show Error

Do not wait for the API before visually updating the checkbox.

Do not replace the entire habit list after one checkbox API response.

Update only the affected habit.

---

# 7. Prevent Race Conditions

Assume the user can click multiple checkboxes very quickly.

Example:

Habit A → Click
Habit B → Click
Habit C → Click

Multiple API requests may run simultaneously.

API responses may return in a different order.

The application must not allow an old API response to overwrite newer UI state.

Each update should be scoped to a specific habit ID.

Never blindly replace the entire checklist from a single checkbox update response.

Test rapid user interactions.

---

# 8. Never Hardcode Counts

Bad:

completed / 16

Good:

completed / habits.length

Progress should always be calculated dynamically.

Example:

const total = habits.length;
const completed = habits.filter(
  habit => habit.completed
).length;

const percentage = total > 0
  ? Math.round((completed / total) * 100)
  : 0;

The system should continue working if the number of habits changes.

---

# 9. Every API State Must Have UI Handling

For every API call, think about four states:

1. Idle
2. Loading
3. Success
4. Error

Example:

Saving reflection...

Success:
"Reflection saved successfully."

Error:
"Unable to save reflection. Please try again."

Never silently fail.

Never clear user-entered data when an API request fails.

---

# 10. Form Validation Must Be Intentional

Buttons should reflect whether an action is valid.

Example: Save Reflection

Empty input:
Button disabled

Only spaces:
Button disabled

Valid text:
Button enabled

API request in progress:
Button disabled + loading state

API error:
Show error message
Keep user text
Enable retry

API success:
Show success feedback

---

# 11. Backend Is the Source of Truth

React state is temporary UI state.

The backend/database is the persistent source of truth.

On page refresh:

Frontend
    ↓
Calls API
    ↓
Backend reads DB
    ↓
Returns JSON
    ↓
React renders response

Do not depend on hardcoded frontend values to rebuild application state.

---

# 12. Separate Responsibilities

Frontend Responsibilities:

- Render UI
- Handle user interaction
- Manage temporary local state
- Display loading states
- Display success/error feedback
- Call APIs

Backend Responsibilities:

- Business logic
- Validation
- Database operations
- Authentication/authorization
- Data consistency
- API response structure

Database Responsibilities:

- Persistent data
- Habit definitions
- Daily habit completion
- Reflections
- User-specific state

Do not move backend business logic into React just because it is easier.

---

# 13. Design for Change

Before writing code, ask:

"What happens if this changes tomorrow?"

Examples:

What if 16 habits become 25?

What if a habit title changes?

What if a habit is disabled?

What if habits have different icons?

What if habit order changes?

What if we add categories?

What if different users have different habits?

Good architecture should handle these changes with minimal frontend modification.

---

# 14. Build Reusable Components

Prefer:

HabitCard
ProgressCard
ReflectionForm
ErrorMessage
LoadingState
EmptyState

Avoid large components containing the entire page logic.

Each component should have one clear responsibility.

---

# 15. Think About Failure Before Success

Do not only test the happy path.

Test:

- Slow internet
- API timeout
- API 500 error
- Empty API response
- Duplicate clicks
- Rapid checkbox clicks
- Page refresh during save
- Invalid data
- Missing habit ID
- Zero habits
- 100 habits
- User double-clicking Save

A feature is not complete until failure states are handled.

---

# 16. Development Rule

Before implementing any feature, follow this process:

Requirement
    ↓
Understand User Behavior
    ↓
Define Data Model
    ↓
Define API Contract
    ↓
Identify Edge Cases
    ↓
Build Backend
    ↓
Build Dynamic UI
    ↓
Handle Loading/Error States
    ↓
Test Rapid Interactions
    ↓
Test Failure Cases
    ↓
Refactor

Do not start by immediately writing JSX.

---

# Core Engineering Mindset

Do not build for today's static screenshot.

Build a system that can generate today's screenshot from dynamic data.

Do not ask:

"How do I display these 16 habits?"

Ask:

"How do I build a habit rendering system that can display any habits returned by the API?"

Do not ask:

"How do I fix this checkbox?"

Ask:

"How should checkbox state synchronization work correctly under rapid concurrent user interaction?"

Do not patch symptoms.

Find the state, data-flow, or architecture problem causing the symptom.

---

# Final Principle

Build dynamic systems, not static screens.

Database controls data.

API defines the contract.

Frontend renders the contract.

Components stay reusable.

State updates stay isolated.

Errors stay visible.

User actions stay responsive.

No unnecessary hardcoded business values.

Always design for change.