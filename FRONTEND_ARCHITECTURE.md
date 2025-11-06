# Frontend Architecture Improvements

This document describes the frontend architecture improvements implemented in the AgroInsight application.

## Overview

The frontend has been enhanced with modern state management, form handling, and UI components to improve developer experience, code maintainability, and user experience.

## Key Improvements

### 1. State Management with Zustand

**Location**: `lib/stores/`

We've implemented global state management using Zustand, a lightweight and performant state management solution.

#### Stores

- **Auth Store** (`lib/stores/auth-store.ts`): Manages user authentication state
  - User information (id, name, email, role)
  - Authentication status
  - Loading states
  - Persisted to localStorage for session persistence

- **Analysis Store** (`lib/stores/analysis-store.ts`): Manages analysis data
  - List of analyses
  - Current analysis selection
  - Loading and error states
  - CRUD operations for analyses

- **References Store** (`lib/stores/references-store.ts`): Manages scientific references
  - Saved references
  - Search results
  - Loading and error states
  - Reference management operations

#### Usage Example

```typescript
import { useAuthStore } from '@/lib/stores'

function MyComponent() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  
  // Use the store...
}
```

### 2. Form Management with React Hook Form + Zod

**Location**: `lib/validations/`

Forms are now managed using React Hook Form with Zod schema validation for type-safe, performant form handling.

#### Validation Schemas

- **Auth Schemas** (`lib/validations/auth.ts`):
  - `signInSchema`: Email and password validation
  - `signUpSchema`: Registration with password confirmation
  - `forgotPasswordSchema`: Email validation for password reset
  - `resetPasswordSchema`: New password with confirmation

#### Benefits

- Type-safe form data with TypeScript inference
- Automatic validation with clear error messages
- Better performance with minimal re-renders
- Cleaner component code

#### Usage Example

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInFormData } from '@/lib/validations/auth'

function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    // Handle form submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      {/* ... */}
    </form>
  )
}
```

### 3. UI Components with Shadcn/ui

**Location**: `components/ui/`

We've integrated Shadcn/ui, a collection of accessible and customizable UI components built with Radix UI and Tailwind CSS.

#### Available Components

- **Button** (`components/ui/button.tsx`): Accessible button with variants
- **Input** (`components/ui/input.tsx`): Styled input field
- **Label** (`components/ui/label.tsx`): Accessible form label
- **Card** (`components/ui/card.tsx`): Container component
- **Form** (`components/ui/form.tsx`): Form wrapper with context

#### Configuration

- **components.json**: Shadcn/ui configuration
- **lib/utils.ts**: Utility functions for className merging
- **Tailwind Config**: Extended with Shadcn/ui theme variables

#### Benefits

- Consistent design system
- Accessible by default (WCAG compliant)
- Fully customizable with Tailwind
- Dark mode support out of the box

### 4. Enhanced Data Visualization with Recharts

**Location**: `components/charts/`

New chart components have been created to provide better data visualization capabilities.

#### New Chart Components

- **TimeSeriesChart** (`components/charts/TimeSeriesChart.tsx`):
  - Line or area charts for time-series data
  - Multiple series support
  - Customizable colors
  - Responsive design

- **ComposedMetricsChart** (`components/charts/ComposedMetricsChart.tsx`):
  - Combines bars and lines in one chart
  - Flexible metric configuration
  - Ideal for comparing different metric types

- **RadarMetricsChart** (`components/charts/RadarMetricsChart.tsx`):
  - Radar/spider chart for performance metrics
  - Shows multiple dimensions at once
  - Great for comparative analysis

#### Usage Example

```typescript
import { TimeSeriesChart } from '@/components/charts'

function AnalysisResults() {
  const data = [
    { date: '2024-01', weight: 450, feed: 120 },
    { date: '2024-02', weight: 480, feed: 125 },
    // ...
  ]

  return (
    <TimeSeriesChart
      data={data}
      xKey="date"
      yKeys={['weight', 'feed']}
      title="Growth and Feed Consumption"
      type="line"
    />
  )
}
```

## Refactored Components

### Authentication Forms

- **Sign In** (`app/auth/signin/page.tsx`):
  - Refactored with React Hook Form + Zod
  - Integrated with Zustand auth store
  - Uses Shadcn/ui components
  - Improved error handling and validation

- **Sign Up** (`app/auth/signup/page.tsx`):
  - Refactored with React Hook Form + Zod
  - Password confirmation validation
  - Uses Shadcn/ui components
  - Better UX with inline validation errors

## Migration Guide

### Using Zustand Stores

Replace local useState with Zustand stores for shared state:

**Before:**
```typescript
const [user, setUser] = useState(null)
```

**After:**
```typescript
import { useAuthStore } from '@/lib/stores'
const user = useAuthStore((state) => state.user)
```

### Converting Forms to React Hook Form

**Before:**
```typescript
const [email, setEmail] = useState('')
const handleSubmit = (e) => {
  e.preventDefault()
  // Manual validation
  if (!email) return
  // Submit
}
```

**After:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
const onSubmit = (data) => {
  // Data is already validated
}
```

### Using Shadcn/ui Components

**Before:**
```typescript
<button className="px-4 py-2 bg-blue-500...">
  Submit
</button>
```

**After:**
```typescript
import { Button } from '@/components/ui/button'
<Button>Submit</Button>
```

## Best Practices

1. **State Management**:
   - Use Zustand stores for global state
   - Keep component-specific state local with useState
   - Use selectors to prevent unnecessary re-renders

2. **Form Handling**:
   - Always use Zod schemas for validation
   - Define TypeScript types from schemas with `z.infer`
   - Handle errors gracefully with inline error messages

3. **UI Components**:
   - Prefer Shadcn/ui components over custom implementations
   - Customize with className prop when needed
   - Maintain consistent spacing and sizing

4. **Charts**:
   - Use appropriate chart types for data
   - Keep charts responsive with ResponsiveContainer
   - Use theme colors for consistency

## Future Improvements

- Add more Shadcn/ui components (Dialog, Select, Dropdown, etc.)
- Extend Zustand stores with middleware (devtools, immer)
- Create more specialized chart components
- Add form field components for common patterns
- Implement optimistic updates in stores
- Add loading skeletons for better UX

## Dependencies

- **zustand**: ^4.x - State management
- **react-hook-form**: ^7.48.2 - Form handling
- **zod**: ^3.22.4 - Schema validation
- **@hookform/resolvers**: ^3.3.2 - Zod resolver for RHF
- **recharts**: ^2.8.0 - Data visualization
- **@radix-ui/***: Various - Accessible UI primitives
- **tailwindcss**: ^3.3.5 - Styling
- **class-variance-authority**: ^0.7.0 - Component variants
- **tailwind-merge**: ^2.0.0 - className merging

## Resources

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [Recharts Documentation](https://recharts.org/)
