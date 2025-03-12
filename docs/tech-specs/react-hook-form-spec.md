# React Hook Form Technical Specification

## Overview

This document provides a technical overview of our React Hook Form implementation, following the **Agent Narrative Framework** principles. React Hook Form serves as our form management solution, providing performant, flexible, and extensible forms with easy-to-use validation capabilities while minimizing unnecessary re-renders.

## React Hook Form Core Components

### Form Registration and Validation

Our implementation leverages React Hook Form's core functionality:

- **Minimal re-renders** for optimal performance
- **HTML standard validation** aligned with browser validation
- **Uncontrolled components** for better performance
- **Lightweight package** with zero dependencies
- **TypeScript support** for type safety
- **Flexible validation** with built-in and custom rules

### Validation Methods

Following the **Logos** principle of the Agent Narrative Framework, we implement robust validation:

| Validation Method | Description | Implementation |
|-------------------|-------------|----------------|
| Built-in Validation | HTML standard validation rules | Used for simple validations |
| Schema Validation | Integration with schema validation libraries | Implemented with Zod for complex forms |
| Custom Validation | Custom validation functions | Used for business-specific validations |

### Form State Management

React Hook Form provides comprehensive form state management:

- **Form values** tracking and management
- **Error state** handling and display
- **Touched/dirty fields** tracking
- **Form submission state** management
- **Form reset** capabilities
- **Field-level validation** and error reporting

### Advanced Features

Our implementation utilizes advanced React Hook Form features:

- **Field arrays** for dynamic form fields
- **Form context** for nested components
- **Controlled components** integration
- **Watch API** for reactive form updates
- **Form state subscription** for performance optimization
- **Focus management** for error fields

## Implementation in Next.js

### Basic Form Implementation

Following the **Operational Directives** for code implementation standards:

```typescript
// components/forms/BasicForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define form schema with Zod
const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'You must be at least 18 years old').optional(),
});

// Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

export default function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Process form data (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log(data);
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="firstName" className="block text-sm font-medium">
          First Name
        </label>
        <input
          id="firstName"
          {...register('firstName')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="lastName" className="block text-sm font-medium">
          Last Name
        </label>
        <input
          id="lastName"
          {...register('lastName')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="age" className="block text-sm font-medium">
          Age (optional)
        </label>
        <input
          id="age"
          type="number"
          {...register('age', { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.age && (
          <p className="text-sm text-red-500">{errors.age.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Dynamic Field Arrays

```typescript
// components/forms/DynamicForm.tsx
'use client';

import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

// Define form schema with Zod
const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  year: z.number().min(1900, 'Year must be valid').max(new Date().getFullYear(), 'Year cannot be in the future'),
});

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
});

// Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

export default function DynamicForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      education: [{ institution: '', degree: '', year: new Date().getFullYear() }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Process form data (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log(data);
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="name"
          {...register('name')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Education</h3>
          <button
            type="button"
            onClick={() => append({ institution: '', degree: '', year: new Date().getFullYear() })}
            className="flex items-center px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Education
          </button>
        </div>
        
        {errors.education?.message && (
          <p className="text-sm text-red-500">{errors.education.message}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Education #{index + 1}</h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  <TrashIcon className="w-4 h-4 mr-1" />
                  Remove
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor={`education.${index}.institution`} className="block text-sm font-medium">
                Institution
              </label>
              <input
                id={`education.${index}.institution`}
                {...register(`education.${index}.institution`)}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.education?.[index]?.institution && (
                <p className="text-sm text-red-500">{errors.education[index]?.institution?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor={`education.${index}.degree`} className="block text-sm font-medium">
                Degree
              </label>
              <input
                id={`education.${index}.degree`}
                {...register(`education.${index}.degree`)}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.education?.[index]?.degree && (
                <p className="text-sm text-red-500">{errors.education[index]?.degree?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor={`education.${index}.year`} className="block text-sm font-medium">
                Year
              </label>
              <input
                id={`education.${index}.year`}
                type="number"
                {...register(`education.${index}.year`, { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.education?.[index]?.year && (
                <p className="text-sm text-red-500">{errors.education[index]?.year?.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Integration with UI Libraries

Following the **Pathos** principle of the Agent Narrative Framework, we integrate with popular UI libraries:

```typescript
// components/forms/ChakraForm.tsx
'use client';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Checkbox,
  Button,
  VStack,
  Box,
} from '@chakra-ui/react';

// Define form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.string().min(1, 'Please select a role'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

// Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

export default function ChakraForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      agreeToTerms: false,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Process form data (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log(data);
      
      // Reset form after successful submission
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%" maxWidth="md">
      <VStack spacing={4} align="flex-start">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input id="name" {...field} />}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.email}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <Input id="email" type="email" {...field} />}
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.role}>
          <FormLabel htmlFor="role">Role</FormLabel>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select id="role" placeholder="Select role" {...field}>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="other">Other</option>
              </Select>
            )}
          />
          <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.agreeToTerms}>
          <Controller
            name="agreeToTerms"
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <Checkbox 
                id="agreeToTerms" 
                isChecked={value} 
                onChange={onChange} 
                ref={ref}
              >
                I agree to the terms and conditions
              </Checkbox>
            )}
          />
          <FormErrorMessage>{errors.agreeToTerms?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isSubmitting}
          loadingText="Submitting"
        >
          Submit
        </Button>
      </VStack>
    </Box>
  );
}
```

### Form Context for Nested Components

```typescript
// components/forms/NestedForm.tsx
'use client';

import { useForm, FormProvider, useFormContext, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define form schema with Zod
const formSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  }),
  contactInfo: z.object({
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
  }),
});

// Infer TypeScript type from schema
type FormValues = z.infer<typeof formSchema>;

// Personal Info Component
function PersonalInfoFields() {
  const { register, formState: { errors } } = useFormContext<FormValues>();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      
      <div className="space-y-2">
        <label htmlFor="personalInfo.firstName" className="block text-sm font-medium">
          First Name
        </label>
        <input
          id="personalInfo.firstName"
          {...register('personalInfo.firstName')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.personalInfo?.firstName && (
          <p className="text-sm text-red-500">{errors.personalInfo.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="personalInfo.lastName" className="block text-sm font-medium">
          Last Name
        </label>
        <input
          id="personalInfo.lastName"
          {...register('personalInfo.lastName')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.personalInfo?.lastName && (
          <p className="text-sm text-red-500">{errors.personalInfo.lastName.message}</p>
        )}
      </div>
    </div>
  );
}

// Contact Info Component
function ContactInfoFields() {
  const { register, formState: { errors } } = useFormContext<FormValues>();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contact Information</h3>
      
      <div className="space-y-2">
        <label htmlFor="contactInfo.email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="contactInfo.email"
          type="email"
          {...register('contactInfo.email')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.contactInfo?.email && (
          <p className="text-sm text-red-500">{errors.contactInfo.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="contactInfo.phone" className="block text-sm font-medium">
          Phone (optional)
        </label>
        <input
          id="contactInfo.phone"
          type="tel"
          {...register('contactInfo.phone')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.contactInfo?.phone && (
          <p className="text-sm text-red-500">{errors.contactInfo.phone.message}</p>
        )}
      </div>
    </div>
  );
}

// Main Form Component
export default function NestedForm() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
      },
      contactInfo: {
        email: '',
        phone: '',
      },
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Process form data (e.g., API call)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log(data);
      
      // Reset form after successful submission
      methods.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields />
        <ContactInfoFields />

        <button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {methods.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </FormProvider>
  );
}
```

## Form Validation Strategies

Following the **Ethos** principle of the Agent Narrative Framework, we implement multiple validation strategies:

### Built-in Validation

```typescript
// Example of built-in validation rules
<input
  {...register('username', {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters',
    },
    maxLength: {
      value: 20,
      message: 'Username must not exceed 20 characters',
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: 'Username can only contain letters, numbers, and underscores',
    },
  })}
/>
```

### Schema Validation with Zod

```typescript
// Example of Zod schema validation
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### Custom Validation

```typescript
// Example of custom validation
<input
  {...register('customField', {
    validate: {
      notAdmin: value => value !== 'admin' || 'Cannot use reserved name "admin"',
      notExisting: async value => {
        // Simulate API call to check if username exists
        const response = await fetch(`/api/check-username?username=${value}`);
        const { exists } = await response.json();
        return !exists || 'Username already exists';
      },
    },
  })}
/>
```

## Performance Optimization

- **Controlled vs. Uncontrolled Components**: Prefer uncontrolled components for better performance
- **Form State Subscription**: Subscribe only to needed form state properties
- **Memoization**: Use React.memo and useCallback for form components
- **Conditional Rendering**: Optimize rendering of conditional form elements
- **Field Arrays**: Optimize rendering of dynamic field arrays with proper keys

```typescript
// Example of optimized field array rendering
{fields.map((field, index) => (
  <div key={field.id}> {/* Use field.id, not index */}
    <input {...register(`items.${index}.name`)} />
    <button type="button" onClick={() => remove(index)}>Remove</button>
  </div>
))}
```

## Error Handling and Display

Following the **Mythos** principle of the Agent Narrative Framework, we implement consistent error handling:

```typescript
// Example of error handling and display
<div className="space-y-2">
  <label htmlFor="email" className="block text-sm font-medium">
    Email
  </label>
  <input
    id="email"
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
    className={`w-full px-3 py-2 border rounded-md ${
      errors.email ? 'border-red-500' : 'border-gray-300'
    }`}
    {...register('email', {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    })}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-red-500" role="alert">
      {errors.email.message}
    </p>
  )}
</div>
```

## Accessibility Considerations

- **Proper labeling**: Use `<label>` elements with `htmlFor` attributes
- **ARIA attributes**: Include `aria-invalid`, `aria-describedby`, and `role="alert"`
- **Focus management**: Automatically focus on the first field with an error
- **Keyboard navigation**: Ensure all form elements are keyboard accessible
- **Error announcements**: Use ARIA live regions for error announcements

```typescript
// Example of accessibility implementation
const { register, handleSubmit, formState: { errors }, setFocus } = useForm({
  shouldFocusError: true, // Automatically focus on the first field with an error
});
```

## Testing Strategy

```typescript
// __tests__/components/forms/BasicForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BasicForm from '@/components/forms/BasicForm';

describe('BasicForm', () => {
  it('renders the form correctly', () => {
    render(<BasicForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays validation errors when submitting an empty form', async () => {
    render(<BasicForm />);
    
    // Submit the form without filling any fields
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<BasicForm />);
    
    // Fill in the form
    userEvent.type(screen.getByLabelText(/first name/i), 'John');
    userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Wait for form submission
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
    });
    
    consoleSpy.mockRestore();
  });
});
```

## References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [React Hook Form with UI Libraries](https://react-hook-form.com/get-started#IntegratingwithUIlibraries)
- [React Hook Form Performance](https://react-hook-form.com/advanced-usage#FormStatePerformance)
- [React Hook Form Accessibility](https://react-hook-form.com/advanced-usage#AccessibilityA11y)
- [Testing React Hook Form](https://react-hook-form.com/advanced-usage#TestingForm)
