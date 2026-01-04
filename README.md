# FocusFlow — Weapon of Math Destruction

FocusFlow is a web-based focus and task management tool that collects detailed
user interaction data on a session level.  
This data is processed in the backend to build behavioral profiles, which are
then used to subtly influence the user interface and user experience.

The project was created as an individual assignment for the course **Development V**
and explores the ethical and technical implications of behavioral profiling.

---

## Project Overview

FocusFlow consists of three main parts:

### 1. User-facing application
- Built with **React + Vite**
- Focus timer and task management
- Tracks user interactions such as:
  - timer usage
  - task creation and completion
  - navigation
  - tab focus/blur
  - idle behavior
- The UI adapts subtly based on session-level profiling
  (contextual tips, layout emphasis, button scaling)

### 2. Backend
- **Node.js + Express**
- **PostgreSQL** database using **Knex.js**
- Fully dockerized
- Responsibilities:
  - validate and store incoming events
  - group events per session
  - compute metrics, scores, and behavioral labels
  - expose profiling and data endpoints
  - authentication and authorization (admin vs user)

### 3. Admin dashboard
- Allows administrators to:
  - view users and sessions
  - inspect raw event data
  - analyze session profiles (metrics, scores, labels)
  - filter and understand behavioral patterns

---

## Profiling & Behavioral Influence

User behavior is analyzed **per session**, not per account.

### Collected data includes:
- interaction events (clicks, navigation, edits)
- timing and duration metrics
- focus and idle signals
- device and environment information

### Profiling pipeline:
Events → Metrics → Scores → Labels

### Example labels:
- Focused
- Distracted
- Procrastinator
- Indecisive
- Low Engagement

### User influence (subtle, non-manipulative):
- Contextual tips based on dominant session label
- Slight UI adjustments using CSS variables
  (button emphasis, background tone)
- No blocking, no forced behavior

---

## Tech Stack

**Frontend**
- React
- Vite
- react-router-dom

**Backend**
- Node.js
- Express
- Knex.js
- PostgreSQL

**Infrastructure**
- Docker
- Docker Compose

**Authentication**
- JWT-based authentication
- Role-based authorization (admin vs user)

---

## Getting Started (Clean Slate)

### Prerequisites
- Docker
- Docker Compose

### Setup

1. Clone the repository
```bash
git clone <repository-url>
cd focusflow
```
2. Create environment file
`cp .env.template .env`
3. Start the project
 `docker compose up --build`
4. Run database migrations
`docker compose exec backend npx knex migrate:latest`
5. (Optional) Seed the database
`docker compose exec backend npx knex seed:run`

The application will run completely locally, without any external APIs.

### Admin Access

The admin interface is protected via authentication and role-based authorization.
Admin users can inspect session data, profiles, and trends.

### Dummy Accounts (Seed Data)

After running the seed script, the following test accounts are available:

**Admin**
- Username: admin
- Password: adminpass

**User**
- Username: alice
- Password: password

## Data Quality & Ethics

This project intentionally reflects on the limitations and risks of behavioral data:
- incomplete or noisy data
- false assumptions based on limited sessions
- bias introduced by interpretation
- ethical concerns around nudging and profiling

These aspects are discussed in the accompanying written report.

## License

MIT License

## Sources
A list of sources and references can be found in `docs/sources.md`.