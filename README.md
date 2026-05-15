# AI CV Reviewer

AI CV Reviewer analyzes PDF CVs with OpenAI, scores them, identifies skills and gaps, and suggests improvements. It can also match identified skills to job listings.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup](#setup)
- [Running Locally](#running-locally)
- [API Endpoints (backend)](#api-endpoints-backend)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- Upload a PDF CV and receive an AI-powered analysis
- Stores analysis history in a PostgreSQL database
- Simple frontend for uploading and viewing results
- Job-matching using Adzuna API (optional)

## Project Structure

- `backend/` — Express API, controllers, and DB connection
- `frontend/` — Static web UI (HTML, CSS, JS)
- `utils/` — helper modules for OpenAI and Adzuna integrations
- `database.sql` — schema for the `cv_analyses` table

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL
- (Optional) Cloudinary account for file uploads
- OpenAI API key
- Adzuna app ID/key (optional for job matching)

## Environment Variables

Create a `.env` file at the project root (an example `.env.example` is included). Required vars used by the app:

- `PORT` — port for the backend (default example: `5000`)
- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@localhost:5432/cvdb`)
- `OPENAI_API_KEY` — OpenAI API key for analyses
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — for Cloudinary uploads
- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` — for job search (optional)

Do not commit your `.env` file or API keys to source control.

## Setup

1. Install dependencies

```bash
npm install
```

2. Initialize the database

- Create a Postgres database and run the SQL in `database.sql` to create required tables.

3. Add your `.env` values (see "Environment Variables").

## Running Locally

- Start the backend (from project root):

```bash
npm start
```

This runs `node backend/server.js` and the server will listen on the `PORT` defined in `.env` (commonly `5000`).

- Open the frontend

The frontend is static files inside `frontend/`. For development you can open `frontend/index.html` directly in your browser, or serve it using a simple static server, e.g.: 

```bash
# from the frontend folder
npx http-server -c-1 .  # or use Live Server extension
```

Then visit `http://localhost:8080` (or the port shown by the static server).

## API Endpoints (backend)

All endpoints are mounted under `/cv`.

- `POST /cv/upload` — multipart form upload of `cv` (PDF). Returns extracted `text`.
- `POST /cv/analyse` — accepts `{ text }` to run OpenAI analysis and returns structured result.
- `POST /cv/match-jobs` — accepts `{ skills }` to search for matching jobs (uses Adzuna).
- (Other endpoints) — history retrieval and internal controllers can be found in `backend/controllers`.

## Troubleshooting

- If the frontend fails to call the API, verify the `API` base URL in `frontend/app.js` matches the backend `PORT` in `.env`.
- Ensure Postgres is running and `DATABASE_URL` is correct.
- Check server logs when starting the backend for missing env vars or errors.

## Contributing

Contributions welcome. Open an issue or create a PR describing the change.
