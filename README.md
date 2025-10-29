# Cloudy Countdown Landing

Simple Node/Express site with an animated cloud hero background, a countdown to November 25, a small FAQ, and a Name+Email subscribe form that writes to a local CSV.

## Quick start

1) Ensure you have Node 18+ installed.

2) Install dependencies:

```bash
npm install
```

3) Add your cloud image:

- Save the attached clouds image as `public/assets/clouds.jpg`.

4) Run locally:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## CSV output

Submissions append to `data/subscribers.csv` with headers: `timestamp,name,email`.

## Notes

- Theme is baby blue and white; font is Quicksand from Google Fonts.
- The countdown rolls over to next Nov 25 once the date passes.