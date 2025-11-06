# Database Troubleshooting Guide

This guide helps you resolve common database connection and configuration issues with AgroInsight.

## Common Issues

### 1. "Prepared Statement Does Not Exist" Error (PostgreSQL Error 26000)

**Error Message:**

```
ConnectorError: prepared statement "s10" does not exist
PostgresError { code: "26000", message: "prepared statement \"s10\" does not exist" }
```

**Cause:**
This error occurs when using PostgreSQL connection poolers (like PgBouncer or Supabase's pooler) in transaction or statement pooling mode. Prisma uses prepared statements by default, but poolers can route requests to different backend connections where the prepared statement doesn't exist.

**Solution for Supabase Users:**

Add `?pgbouncer=true` to your pooled DATABASE_URL:

```env
# Before (causes error):
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# After (fixed):
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Keep your direct URL as-is for migrations:
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

**Alternative Solutions:**

1. **Use Direct Connection for Development** (Recommended for local dev):

   ```env
   # Use the direct connection (port 5432) instead of pooler (port 6543)
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

2. **Disable Prepared Statements** (if you can't modify the connection string):

   ```env
   PRISMA_DISABLE_PREPARED_STATEMENTS=true
   ```

3. **Use SQLite for Local Development** (Simplest option):
   ```env
   DATABASE_URL="file:./dev.db"
   ```
   Then run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### 2. Module Resolution Errors After npm install

**Error Message:**

```
Module not found: Can't resolve '@radix-ui/react-label'
```

**Cause:**
Stale Next.js cache or corrupted node_modules.

**Solution:**

**On Linux/Mac:**

```bash
rm -rf .next node_modules
npm ci
npm run dev
```

**On Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force .next, node_modules
npm ci
npm run dev
```

**On Windows (Command Prompt):**

```cmd
rmdir /s /q .next node_modules
npm ci
npm run dev
```

### 3. Database Connection Refused

**Error Message:**

```
Error: Can't reach database server at `localhost:5432`
```

**Solutions:**

1. **Check if PostgreSQL is running:**

   ```bash
   # Linux/Mac
   sudo systemctl status postgresql

   # Windows (check services)
   services.msc
   ```

2. **Verify connection string:**
   - Check host, port, username, password, and database name
   - Ensure no extra spaces in .env.local

3. **For Supabase users:**
   - Verify your project is not paused
   - Check if your IP is allowed in Supabase dashboard
   - Confirm you're using the correct connection string from Supabase settings

### 4. Migration Errors

**Error Message:**

```
Error: P3009: migrate found failed migrations
```

**Solution:**

1. **Reset the database** (⚠️ This will delete all data):

   ```bash
   npm run db:push -- --force-reset
   npm run db:seed
   ```

2. **Or resolve migrations manually:**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   npx prisma migrate deploy
   ```

### 5. Prisma Client Out of Sync

**Error Message:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**

```bash
npm run db:generate
```

Or if that doesn't work:

```bash
rm -rf node_modules/.prisma node_modules/@prisma/client
npm run db:generate
```

## Environment Setup Checklist

Before running the application, ensure:

- [ ] `.env.local` file exists and is properly configured
- [ ] `DATABASE_URL` is set correctly
- [ ] For Supabase: `DIRECT_URL` is also set
- [ ] For Supabase pooler: `?pgbouncer=true` is added to DATABASE_URL
- [ ] All required API keys are configured (NEXTAUTH_SECRET, etc.)
- [ ] Dependencies are installed: `npm ci`
- [ ] Prisma client is generated: `npm run db:generate`
- [ ] Database is migrated: `npm run db:push`
- [ ] Database is seeded: `npm run db:seed`

## Quick Start Commands

**Fresh Setup:**

```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npm run db:generate

# 3. Push schema to database
npm run db:push

# 4. Seed the database
npm run db:seed

# 5. Start development server
npm run dev
```

**Clean Restart (when things go wrong):**

```bash
# Remove cache and dependencies
rm -rf .next node_modules

# Fresh install
npm ci

# Regenerate Prisma client
npm run db:generate

# Start dev server
npm run dev
```

## Getting Help

If you're still experiencing issues:

1. Check the [main README](../README.md) for setup instructions
2. Review your `.env.local` against `.env.example`
3. Check the [Prisma documentation](https://www.prisma.io/docs)
4. For Supabase issues, see [Supabase documentation](https://supabase.com/docs)

## Security Note

⚠️ **Never commit your `.env.local` file to version control!**

If you accidentally exposed your credentials:

1. Rotate all API keys immediately
2. Change database passwords
3. Regenerate NEXTAUTH_SECRET: `openssl rand -base64 32`
4. Update your `.env.local` with new credentials
