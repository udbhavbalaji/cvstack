# CVStack

A simple CLI tool to help track job applications! Built with Bun, TypeScript, and SQLite. Automatically scrapes job details from LinkedIn and uses AI to analyze job requirements.

## Features

- 🚀 **Automatic Job Scraping**: Extract job details from LinkedIn URLs using a bundled Python scraper
- 🤖 **AI-Powered Analysis**: Uses OpenRouter API to analyze job descriptions and extract key information
- 📊 **Comprehensive Tracking**: Track application status, referrals, salaries, and more
- ⭐ **Star Favorite Jobs**: Mark jobs you're excited about
- 📈 **Detailed Statistics**: Get insights into your job search with comprehensive stats
- 🔍 **Powerful Search**: Find and manage jobs with interactive search
- ✏️ **Easy Editing**: Update job details with an interactive form
- 📋 **Status Management**: Track application progress from "NOT APPLIED" to "OFFER RECEIVED"

## Installation

### Prerequisites

- **Bun** (>= 1.1.0) - [Install Bun](https://bun.sh/)

### Install from npm

```bash
npm install -g cvstack
# (or)
bun install -g cvstack
```

### Build from source

```bash
git clone https://github.com/udbhavbalaji/cvstack.git
cd cvstack
bun install
bun run build
bun link  # or npm link
```

## Quick Start

1. **First Run Setup**: CVStack automatically sets up on first use
2. **Configure AI**: Set up your OpenRouter API key for job analysis
   ```bash
   cvstack ai-auth # allows you to add your openrouter API key
   ```
3. **Add Your First Job**:
   ```bash
   cvstack add https://www.linkedin.com/jobs/view/1234567890
   ```
4. **Apply for Jobs**:
   ```bash
   cvstack apply -u https://www.linkedin.com/jobs/view/1234567890
   ```
5. **View Your Applications**:
   ```bash
   cvstack list
   ```

## Commands

### Core Commands

#### `cvstack|cvs add <job_url>`

Add a new job to your tracker from a LinkedIn URL.

```bash
cvstack add https://www.linkedin.com/jobs/view/1234567890
```

#### `cvstack|cvs apply [options]`

Apply for a job and update its status.

```bash
# Apply using URL
cvstack apply -u https://www.linkedin.com/jobs/view/1234567890

# Apply using job ID
cvstack apply -i 1234567890

# Interactive mode (no options)
cvstack apply
```

#### `cvstack|cvs list|ls [options]`

List your job applications with filtering options.

```bash
# List all jobs
cvstack list

# Filter by status
cvstack list --status applied

# Show only starred jobs
cvstack list --star

# Get detailed view of a single job
cvstack list --search --detailed
```

#### `cvstack|cvs search`

Search through your jobs and perform actions on them.

```bash
cvstack search
```

Actions available:

- Copy Job ID to clipboard
- Copy LinkedIn URL to clipboard
- Copy application link
- Edit application details

#### `cvstack|cvs edit [options]`

Edit the details of an existing job application.

```bash
# Edit by job ID
cvstack edit -i 1234567890

# Interactive mode
cvstack edit
```

#### `cvstack|cvs star -i <job_id>`

Star or unstar a job application.

```bash
cvstack star -i 1234567890
```

#### `cvstack|cvs stats [options]`

Display comprehensive statistics about your job applications.

```bash
# Basic stats
cvstack stats

# Detailed stats with top skills
cvstack stats --detailed

# Show top 10 items instead of 5
cvstack stats --top 10
```

#### `cvstack|cvs reset [options]`

Completely reset your tracker (deletes all data).

```bash
# With confirmation
cvstack reset

# Skip confirmation
cvstack reset -n
```

#### `cvstack|cvs ai-auth`

Configure your OpenRouter API key for AI-powered job analysis.

```bash
cvstack ai-auth
```

## Configuration

CVStack stores configuration in `~/.cvstack/`:

- **Database**: SQLite database at `~/.cvstack/cvstack.db`
- **Environment**: API keys in `~/.cvstack/.env`
- **Logs**: Application logs in `~/.cvstack/.logs/`
- **Resources**: Scraped data in `~/.cvstack/resources/`

### Environment Variables

- `OPENROUTER_API_KEY`: Required for AI job analysis (set via `cvstack ai-auth`)

## How It Works

### Job Scraping

CVStack includes a bundled Python scraper using Playwright that:

- Launches a headless Chromium browser
- Navigates to LinkedIn job pages
- Extracts job details, requirements, and company information
- Returns structured data for storage

### AI Analysis

Using OpenRouter API, CVStack analyzes job descriptions to extract:

- Job title and company
- Location and work arrangement
- Salary information
- Required technical and non-technical skills
- Job type and application details

### Data Storage

All job data is stored locally in SQLite with the following schema:

- Basic job info (title, company, location)
- Application tracking (status, dates, methods)
- Skills and qualifications
- Salary information
- Metadata (starred, timestamps)

## Development

### Setup Development Environment

```bash
git clone https://github.com/udbhavbalaji/cvstack.git
cd cvstack
bun install
```

### Development Commands

```bash
# Run in development mode
bun run dev

# Build the CLI
bun run build

# Run tests (when implemented)
bun run test

# Database operations
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
```

### Project Structure

```
cvstack/
├── bin/                 # CLI entry points
├── src/
│   ├── commands/        # CLI commands
│   ├── core/           # Core functionality
│   ├── external/       # External integrations (AI, DB)
│   ├── types/          # TypeScript types
│   └── consts.ts       # Constants and configuration
├── cvstack-scraper/    # Python scraper
├── scripts/            # Build scripts
└── package.json
```

### Building the Scraper

The Python scraper is bundled using PyInstaller:

```bash
cd cvstack-scraper
# Install dependencies
pip install -r requirements.txt
# Build executable
pyinstaller cvstack-scraper.spec
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Use TypeScript for type safety
- Follow functional programming patterns with `neverthrow`
- Handle errors gracefully with custom error types
- Write comprehensive tests (when test suite is implemented)
- Follow existing code conventions

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/udbhavbalaji/cvstack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/udbhavbalaji/cvstack/discussions)

---

**Happy job hunting! 🎯**
