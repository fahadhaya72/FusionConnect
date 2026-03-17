# FusionConnect — Frontend

FusionConnect is a modern React + TypeScript frontend built with Create React App. It uses Tailwind CSS for styling, Redux Toolkit for state management, React Router for routing, Socket.IO for realtime features, Axios for HTTP requests, and EmailJS for email-based flows (e.g., verification/notifications).

This document explains the project, how to set it up, and how to run it locally and in production.

## Tech Stack

- React 19 (CRA) with TypeScript
- Tailwind CSS 3
- Redux Toolkit + React Redux
- React Router DOM
- Socket.IO Client
- Axios
- EmailJS Browser SDK

## Prerequisites

- Node.js LTS (16+ recommended; tested with Node 16+)
- npm (comes with Node)
- A running backend API and Socket.IO server at `http://localhost:5000` (configurable via `.env`)

Check versions:

```bash
node -v
npm -v
```

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create or review `.env` at the project root. The project currently expects:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# EmailJS configuration
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

- Set the EmailJS values from your EmailJS dashboard.
- If your backend runs on a different host/port, update the URLs accordingly.

3) Start the development server

```bash
npm start
```

Then open http://localhost:3000.

The app will hot-reload on changes and show lint errors in the console.

## Styling (Tailwind CSS)

Tailwind is already wired via PostCSS. In most cases, CRA will build styles automatically. If you need to manually (re)generate the Tailwind output file used by the app, you can run:

```bash
# one-time build
npm run build:css

# watch mode (rebuild on file changes)
npm run watch:css
```

These commands read `src/index.css` and emit `src/tailwind.css`.

## Available Scripts

- `npm start` — Start the dev server on port 3000.
- `npm test` — Run tests in watch mode.
- `npm run build` — Build for production to the `build/` folder.
- `npm run eject` — Eject CRA (irreversible).
- `npm run build:css` — Build Tailwind CSS once.
- `npm run watch:css` — Watch and rebuild Tailwind CSS on changes.

## Project Structure

Key files and directories in `fusion-connect/`:

```
fusion-connect/
├─ .env                      # Frontend environment variables
├─ package.json              # Dependencies & scripts
├─ public/                   # Static assets
├─ src/                      # Application source (TypeScript/React)
│  ├─ index.css              # Tailwind input file
│  └─ ...                    # Components, pages, store, types, etc.
├─ tailwind.config.js        # Tailwind configuration
├─ postcss.config.js         # PostCSS/Tailwind pipeline
└─ tsconfig.json             # TypeScript configuration
```

## Integrating with the Backend

- API base URL is read from `REACT_APP_API_URL` (default `http://localhost:5000/api`).
- Socket.IO connects using `REACT_APP_SOCKET_URL` (default `http://localhost:5000`).

Ensure your backend is running and CORS is configured to allow the frontend origin (http://localhost:3000 during development).

## Testing

Run tests:

```bash
npm test
```

This uses CRA’s Jest configuration with `@testing-library/*` utilities.

## Production Build

Create an optimized production build:

```bash
npm run build
```

The output goes to `build/`, ready to be deployed to any static hosting provider or served by your production server.

## Troubleshooting

- If styles don’t apply:
  - Make sure Tailwind classes exist in the JSX/TSX you expect to render.
  - Run `npm run build:css` (or `npm run watch:css` during active development).
- If the app can’t reach the backend:
  - Confirm the backend is running at the URL in `.env`.
  - Check CORS on the backend and browser console for errors.
- If Socket.IO doesn’t connect:
  - Verify `REACT_APP_SOCKET_URL`.
  - Confirm the backend Socket.IO server is reachable and not blocked by a firewall.
- EmailJS errors:
  - Verify your Service ID, Template ID, and Public Key.

## Notes

- This project was originally bootstrapped with CRA, then extended with Tailwind, Redux Toolkit, Router, Socket.IO and EmailJS.
- Do not commit secrets; use `.env` locally and environment variables in CI/CD.

## License

Licensed confirmed by MIT

