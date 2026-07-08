# OpnameBuddy

Recovery participation platform for hospitalized patients — built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Documentation

- [Project context](docs/project-context.md) — product overview, architecture, and roadmap
- [Domain model](docs/domain-model.md) — entities, relationships, and database blueprint
- [Branch plans](docs/branch-plans/) — implementation history per feature branch

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and configure Supabase credentials before running against a database.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
