# Code Quality and Developer Experience Setup

This document describes the code quality tools and best practices configured for the AgroInsight project.

## Overview

The following tools and configurations have been implemented to enhance code quality and developer experience:

1. **ESLint** - Robust linting rules to catch common errors and enforce coding standards
2. **Prettier** - Automatic code formatting for consistent style
3. **Husky** - Pre-commit hooks to ensure code quality before commits
4. **TypeScript Strict Mode** - Enhanced type checking for better type safety
5. **Environment Variable Validation** - Runtime validation of required environment variables

## ESLint Configuration

ESLint is configured with comprehensive rules in `.eslintrc.json`:

### Key Rules

- `@typescript-eslint/no-explicit-any`: Error - Prevents use of `any` type
- `@typescript-eslint/no-unused-vars`: Error - Catches unused variables (with `_` prefix exception)
- `@typescript-eslint/no-floating-promises`: Error - Ensures promises are properly handled
- `@typescript-eslint/await-thenable`: Error - Prevents awaiting non-promises
- `@typescript-eslint/prefer-nullish-coalescing`: Warning - Suggests `??` over `||`
- `no-console`: Warning - Flags console statements (except `console.warn` and `console.error`)
- `prefer-const`: Error - Enforces const for non-reassigned variables
- `eqeqeq`: Error - Requires strict equality (`===`)
- React-specific rules for hooks and JSX best practices

### Running ESLint

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues where possible
```

## Prettier Configuration

Prettier is configured in `.prettierrc` with the following settings:

- No semicolons
- Single quotes for strings
- 100 character line width
- 2 space indentation
- Trailing commas in ES5-compatible locations

### Running Prettier

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without modifying files
```

## Husky Pre-commit Hooks

Husky is configured to run quality checks before each commit using `lint-staged`:

- **TypeScript/TSX files**: ESLint auto-fix + Prettier formatting
- **JavaScript/JSON/CSS/Markdown files**: Prettier formatting

The hooks run automatically on `git commit`. Only staged files are checked, making commits fast.

### Setup

Husky is initialized automatically via the `prepare` script in `package.json`. If you need to reinstall:

```bash
npm install
```

## TypeScript Configuration

### Standard Configuration (`tsconfig.json`)

TypeScript strict mode is enabled with:

- `"strict": true` - Enables all strict type checking options
- `"forceConsistentCasingInFileNames": true` - Enforces consistent file naming

This configuration is used for builds and ensures the codebase compiles without errors.

### Strict Configuration (`tsconfig.strict.json`)

An optional stricter configuration is available for progressive adoption:

```bash
npm run typecheck:strict
```

This enables additional checks:

- `noUncheckedIndexedAccess` - Treats indexed access as potentially undefined
- `noImplicitOverride` - Requires explicit `override` keyword
- `noUnusedLocals` - Flags unused local variables
- `noUnusedParameters` - Flags unused function parameters
- `noFallthroughCasesInSwitch` - Prevents fallthrough in switch statements

These stricter checks can be adopted gradually as the codebase is refactored.

### Running Type Checks

```bash
npm run typecheck         # Standard type checking
npm run typecheck:strict  # Strict type checking
```

## Environment Variable Validation

Environment variables are validated at runtime using Zod schemas in `lib/env.ts`.

### Required Variables

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - NextAuth base URL
- `NEXTAUTH_SECRET` - NextAuth secret (min 32 characters)
- `UPSTASH_REDIS_REST_URL` - Redis connection URL
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token

### Optional Variables

- `GOOGLE_GEMINI_API_KEY` - For AI-powered diagnostics
- `OPENAI_API_KEY` - Alternative AI provider
- `SERPAPI_API_KEY` - For Google Scholar integration
- `DEVIN_API_KEY` - Devin AI integration
- `DB_PROVIDER` - Database provider (sqlite/postgresql)
- `DIRECT_URL` - Direct database connection (PostgreSQL only)

### Usage

The validation utility is available for use in your application code. You can manually validate or access environment variables in API routes or other runtime code:

```typescript
import { validateEnv, getEnv, isProduction } from '@/lib/env'

// Validate and get all env vars
const env = validateEnv()

// Get cached env vars (validates if not already done)
const env = getEnv()

// Helper functions
if (isProduction()) {
  // Production-only logic
}
```

## Workflow

### For New Code

1. Write your code
2. Run `npm run format` to format it
3. Run `npm run lint:fix` to fix linting issues
4. Commit your changes - Husky will automatically check staged files
5. If checks pass, commit succeeds; otherwise, fix issues and try again

### For Existing Code

The pre-commit hooks only check files you're modifying, so you won't be blocked by issues in other files. This allows for gradual improvement of the codebase.

## Benefits

- **Consistency**: Prettier ensures uniform code style across the team
- **Quality**: ESLint catches common bugs and anti-patterns before they reach production
- **Type Safety**: TypeScript strict mode prevents type-related runtime errors
- **Fast Feedback**: Pre-commit hooks catch issues immediately, not in CI
- **Progressive Enhancement**: Stricter checks can be adopted gradually via `tsconfig.strict.json`
- **Reliability**: Environment validation prevents runtime failures due to missing configuration

## Troubleshooting

### Pre-commit Hook Fails

If the pre-commit hook fails:

1. Review the error messages
2. Run `npm run lint:fix` to auto-fix issues
3. Run `npm run format` to format code
4. Stage the fixed files and commit again

### Bypassing Hooks (Not Recommended)

In rare cases where you need to bypass hooks:

```bash
git commit --no-verify
```

**Note**: This should only be used in exceptional circumstances and is generally discouraged.

### Type Errors After Enabling Strict Mode

If you encounter type errors in existing code:

1. The main `tsconfig.json` should compile without errors
2. Use `npm run typecheck:strict` to see additional potential issues
3. Fix issues gradually as you work on different parts of the codebase

## Next Steps

Consider these future enhancements:

- Increase test coverage with automated testing in pre-commit hooks
- Add commit message linting with commitlint
- Configure CI/CD to run all quality checks
- Gradually adopt stricter TypeScript settings from `tsconfig.strict.json`
