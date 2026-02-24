# BMI Calculator

BMI calculator built with Next.js and TypeScript.

## Features

- BMI calculation based on height and weight
- English and Indonesian language support
- Personalized health tips by BMI category
- Result page with progress tracking for tips

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open:

`http://localhost:3000`

## API

### POST `/api/bmi`

Request body:

```json
{
  "name": "John Doe",
  "gender": "male",
  "age": 30,
  "height": 175,
  "weight": 70
}
```

Response:

```json
{
  "bmi": 22.86,
  "category": "Normal",
  "healthTip": "Great job! Maintain your healthy weight through balanced nutrition and regular physical activity. Keep up the good work!",
  "gender": "male",
  "height": 175,
  "weight": 70,
  "age": 30,
  "name": "John Doe"
}
```

### GET `/api/health`

Response:

```json
{
  "status": "healthy",
  "service": "bmi-calculator",
  "timestamp": "2026-02-24T00:00:00.000Z"
}
```
