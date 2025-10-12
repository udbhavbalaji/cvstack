# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CVStack is a CLI tool for tracking job applications, built with Bun, TypeScript, and SQLite. The application manages job application data with automatic setup and database migrations.

## Common Commands

### Development
```bash
# Run in development mode with hot reload
bun run dev

# Run the application normally
bun run app

# Build the CLI binary
bun run build
```

### Database Operations
```bash
# Generate new database migrations
bun run db:generate

# Apply database migrations
bun run db:migrate
```

### Running Tests
No test suite is currently set up in this project.

## Architecture Overview

### Core Structure
- **Entry Point**: `index.ts` - Main CLI bootstrap that loads environment and initializes the CLI
- **CLI Logic**: `src/index.ts` - Creates Commander.js CLI instance with auto-setup middleware
- **Setup System**: `src/core/setup.ts` - Handles automatic app initialization (directories, env file, database, migrations)

### Data Layer
- **Database**: SQLite with Drizzle ORM
- **Schema**: `src/external/db/schema.ts` - Single `jobsTable` with comprehensive job application fields
- **Client**: `src/external/db/client.ts` - Database connection management and migration runner

### Error Handling
- Uses `neverthrow` library for functional error handling with `Result<T, E>` types
- Custom error system in `src/core/errors.ts` with categorized error types:
  - File system errors with user-friendly messages
  - Database errors with SQLite-specific handling
  - Shell command errors
  - Unknown error fallbacks

### Configuration & Environment
- **Constants**: `src/consts.ts` - App directories, environment validation with Zod
- **App Directory**: `~/.cvstack/` with subdirectories for resources, logs, and database
- **Required Environment**: `OPENROUTER_API_KEY` (currently required but unused in current implementation)

### Logging System
- Structured logging with `chalk` for colored output
- File logging capability to `~/.cvstack/.logs/`
- Debug/info/warn/error levels with context tracking

## Development Patterns

### Error Handling Pattern
All functions that can fail use `neverthrow` Result types:
```typescript
const result = someOperation();
if (result.isErr()) {
  return err(result.error);
}
// Use result.value
```

### Auto-Setup Middleware
The CLI automatically checks setup status before commands and runs setup if needed. Setup involves:
1. Creating required directories (`~/.cvstack/`, `~/.cvstack/resources/`, `~/.cvstack/.logs/`)
2. Creating environment file with default content
3. Initializing SQLite database
4. Running migrations

### Database Schema
The `jobsTable` includes comprehensive job tracking fields:
- Basic job info (title, company, work arrangement, job type)
- Location and description
- Skills and qualifications (stored as JSON arrays)
- Salary information with currency support
- Application tracking (status, method, dates)
- Metadata (created/updated timestamps, starred flag)

### Path Aliases
TypeScript path mapping configured for `@/*` → `src/*` imports.

## Technology Stack
- **Runtime**: Bun (JavaScript runtime and package manager)
- **Language**: TypeScript with strict configuration
- **CLI Framework**: Commander.js
- **Database**: SQLite with Drizzle ORM
- **Error Handling**: neverthrow for functional error handling
- **Validation**: Zod for environment and data validation
- **Styling**: chalk for terminal colors
- **Environment**: @t3-oss/env-core for type-safe environment variables