# AI Product Scout

Demo-ready full-stack project for identifying profitable ecommerce opportunities using mock Amazon/Alibaba datasets.

## Stack
- Frontend: Next.js
- Backend: Express
- Data: local JSON mock datasets

## Setup
```bash
npm install
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## API
`POST /api/analyze`

Request body:
```json
{
  "category": "earrings"
}
```

Response follows the strict portfolio JSON structure defined in the project brief.
