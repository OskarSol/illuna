# GardenPlaner (Example SPA)

## Run the project locally

1. Clone the repository with Git:
   ```bash
   git clone <REPO_URL>
   ```
2. Change into the project directory:
   ```bash
   cd illuna
   ```
3. Start a local static server (Python 3):
   ```bash
   python3 -m http.server 8080
   ```
4. Open in your browser:
   - `http://localhost:8080/examples/gardenplaner/`

## Manual Test Checklist

- Enter and save garden details.
- Add 1–2 plants.
- Add reminders in different months.
- Reload the browser tab.
- Confirm all data remains available (persistence via `localStorage`).

## Persistence

The app stores its state in the browser under the key:
- `gardenplaner-state-v1`

This keeps garden details, plants, and monthly reminders after reload.
