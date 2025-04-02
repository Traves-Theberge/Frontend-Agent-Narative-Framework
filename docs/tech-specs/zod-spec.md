# Zod Technical Specification

## Index Header
This index provides quick navigation reference points for LLM readers to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- Core Features: Line ~40
- Basic Schema Types: Line ~60
- Complex Schemas: Line ~100
  - Objects: Line ~110
  - Arrays: Line ~150
  - Unions and Intersections: Line ~190
- Validation and Parsing: Line ~230
  - Schema Validation: Line ~240
  - Error Handling: Line ~280
- Integration with React: Line ~320
  - Form Validation: Line ~330
  - React Hook Form: Line ~370
- Advanced Features: Line ~420
  - Custom Validators: Line ~430
  - Transformations: Line ~470
  - Recursive Schemas: Line ~510
- TypeScript Integration: Line ~550
- Performance Considerations: Line ~600
- Testing: Line ~640

## References

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub Repository](https://github.com/colinhacks/zod)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Zod Examples](https://zod.dev/?id=basic-usage)
- [Zod Editor Plugin](https://github.com/colinhacks/zod-vscode)

## Overview

This document provides a technical overview of Zod implementation within our application. Zod is a TypeScript-first schema declaration and validation library designed to make data validation type-safe and developer-friendly.

## Version and Resources

- **Version**: Zod 3.x
- **Documentation**: [Zod Documentation](https://zod.dev/)
- **GitHub Repository**: [Zod GitHub](https://github.com/colinhacks/zod)

## Core Features

- **TypeScript Integration**: First-class TypeScript support with automatic type inference
- **Schema Definition**: Declarative schema creation with a fluent API
- **Validation**: Runtime data validation with detailed error messages
- **Type Inference**: Automatic TypeScript type generation from schemas
- **Composability**: Ability to compose and reuse schemas
- **Transformations**: Data transformation during validation
- **Error Handling**: Structured error reporting

## Implementation

### Installation

```bash
npm install zod
# or
yarn add zod
```

### Basic Schema Definition

```typescript
import { z } from 'zod';

// Define a schema for a user
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().datetime(),
});

// Infer the TypeScript type from the schema
type User = z.infer<typeof UserSchema>;
```

### Validation

```typescript
// Validate data against the schema
function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}

// Safe validation that returns a result object
function safeValidateUser(data: unknown): { success: boolean; data?: User; error?: z.ZodError } {
  const result = UserSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
```

### Form Validation with React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define the schema
const FormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof FormSchema>;

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = (data: FormValues) => {
    // Handle form submission
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm"
      >
        Sign Up
      </button>
    </form>
  );
}
```

### API Request Validation

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['user', 'admin']).default('user'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate with Zod
    const validatedData = UserCreateSchema.parse(body);
    
    // Process the validated data
    const user = await createUser(validatedData);
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      );
    }
    
    // Handle other errors
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Advanced Schema Patterns

### Nested Objects

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
});

const UserWithAddressSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  address: AddressSchema,
});

type UserWithAddress = z.infer<typeof UserWithAddressSchema>;
```

### Arrays

```typescript
const TagSchema = z.string().min(1).max(20);
const TagsSchema = z.array(TagSchema).min(1).max(10);

const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  tags: TagsSchema,
});

type Post = z.infer<typeof PostSchema>;
```

### Unions and Discriminated Unions

```typescript
// Union type
const StringOrNumber = z.union([z.string(), z.number()]);

// Discriminated union
const UserEvent = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('login'),
    userId: z.string(),
    timestamp: z.date(),
  }),
  z.object({
    type: z.literal('logout'),
    userId: z.string(),
    timestamp: z.date(),
  }),
  z.object({
    type: z.literal('purchase'),
    userId: z.string(),
    productId: z.string(),
    amount: z.number(),
    timestamp: z.date(),
  }),
]);

type Event = z.infer<typeof UserEvent>;
```

### Custom Validation

```typescript
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .refine(
    password => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    password => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    password => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    password => /[^A-Za-z0-9]/.test(password),
    'Password must contain at least one special character'
  );
```

### Transformations

```typescript
const DateStringSchema = z.string()
  .refine(str => !isNaN(Date.parse(str)), {
    message: 'Invalid date string',
  })
  .transform(str => new Date(str));

const UserWithDatesSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthDate: DateStringSchema,
  createdAt: DateStringSchema,
});

// The inferred type will have Date objects, not strings
type UserWithDates = z.infer<typeof UserWithDatesSchema>;
```

## Error Handling

### Formatting Errors

```typescript
function handleZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
}

// Usage
try {
  const data = UserSchema.parse(input);
  // Process valid data
} catch (error) {
  if (error instanceof z.ZodError) {
    const errors = handleZodError(error);
    // Handle validation errors
    console.error('Validation errors:', errors);
  }
}
```

### Custom Error Map

```typescript
// Set a custom error map globally
z.setErrorMap((issue, ctx) => {
  // Custom error messages based on error code
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string') {
        return { message: 'This field must be a text value' };
      }
      if (issue.expected === 'number') {
        return { message: 'This field must be a numeric value' };
      }
      break;
    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        return { message: `This field must be at least ${issue.minimum} characters` };
      }
      break;
  }
  
  // Fall back to default error message
  return { message: ctx.defaultError };
});
```

## Integration with Next.js

### Server-Side Validation

```typescript
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const PostCreateSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  tags: z.array(z.string()).min(1).max(10),
  published: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = PostCreateSchema.parse(body);
    
    // Create post in database
    const post = await db.post.create({
      data: validatedData,
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Form Validation in Server Actions

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function submitContactForm(formData: FormData) {
  // Extract data from FormData
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  };
  
  // Validate with Zod
  const validationResult = ContactFormSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    // Return validation errors
    return {
      success: false,
      errors: validationResult.error.format(),
    };
  }
  
  // Process the validated data
  try {
    await saveContactMessage(validationResult.data);
    revalidatePath('/contact');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: { _form: 'Failed to submit the form. Please try again.' },
    };
  }
}
```

## Best Practices

### Schema Organization

```typescript
// schemas/user.ts
import { z } from 'zod';

// Base schema with common fields
export const UserBaseSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

// Schema for creating a user
export const UserCreateSchema = UserBaseSchema.extend({
  password: z.string().min(8),
});

// Schema for updating a user
export const UserUpdateSchema = UserBaseSchema
  .partial() // Makes all fields optional
  .extend({
    password: z.string().min(8).optional(),
  });

// Schema for user with ID and timestamps
export const UserSchema = UserBaseSchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
```

### Reusable Validation Patterns

```typescript
// schemas/common.ts
import { z } from 'zod';

// Reusable validation patterns
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const uuidSchema = z.string().uuid('Invalid ID format');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Usage in other schemas
import { emailSchema, passwordSchema, uuidSchema } from './common';

const UserSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  password: passwordSchema,
  // ...other fields
});
```

### Error Handling Strategy

```typescript
// lib/validation.ts
import { z } from 'zod';

export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach(err => {
        const path = err.path.join('.') || '_form';
        errors[path] = err.message;
      });
      
      return { success: false, errors };
    }
    
    // For unexpected errors, return a generic error
    return {
      success: false,
      errors: { _form: 'An unexpected error occurred during validation' },
    };
  }
}

// Usage
const result = validate(UserSchema, userData);

if (result.success) {
  // Process valid data
  const user = result.data;
} else {
  // Handle validation errors
  const errors = result.errors;
}
```

## Testing

### Unit Testing Schemas

```typescript
// __tests__/schemas/user.test.ts
import { UserSchema, UserCreateSchema } from '@/schemas/user';

describe('User Schemas', () => {
  describe('UserCreateSchema', () => {
    it('should validate a valid user', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      };
      
      const result = UserCreateSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });
    
    it('should reject an invalid email', () => {
      const invalidUser = {
        email: 'not-an-email',
        name: 'Test User',
        password: 'Password123!',
      };
      
      const result = UserCreateSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.email?._errors).toBeDefined();
      }
    });
    
    it('should reject a short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      };
      
      const result = UserCreateSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const errors = result.error.format();
        expect(errors.password?._errors).toBeDefined();
      }
    });
  });
});
```

## Security Considerations

- **Input Validation**: Always validate user input before processing
- **Type Coercion**: Be cautious with automatic type coercion (use `strict()` when needed)
- **Error Messages**: Avoid exposing sensitive information in error messages
- **Performance**: Be mindful of complex schemas that might impact performance
- **Default Values**: Use defaults carefully to avoid security issues