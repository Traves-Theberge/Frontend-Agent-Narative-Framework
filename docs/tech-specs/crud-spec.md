# CRUD Operations Technical Specification

## Index Header
This index provides quick navigation reference points for Agents to locate specific information in this document.

### Document Structure
- Overview: Line ~30
- CRUD Architecture: Line ~40
- Implementation: Line ~50
  - Create Operations: Line ~60
  - Read Operations: Line ~90
  - Update Operations: Line ~120
  - Delete Operations: Line ~150

### Database Integration
- SQL Databases: Line ~180
- NoSQL Databases: Line ~210
- ORM Integration: Line ~240

### API Integration
- RESTful CRUD: Line ~270
- GraphQL CRUD: Line ~300
- Next.js API Routes: Line ~330

### Additional Information
- Security Considerations: Line ~360
- Performance Optimization: Line ~390

## References

- [RESTful Web Services](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [Prisma ORM Documentation](https://www.prisma.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [MongoDB CRUD Operations](https://docs.mongodb.com/manual/crud/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [GraphQL Mutations](https://graphql.org/learn/queries/#mutations)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Overview

This document provides a technical overview of CRUD (Create, Read, Update, Delete) operations implementation within our application. CRUD operations form the foundation of data manipulation and persistence, enabling users to interact with and manage application data effectively.

## Core CRUD Operations

### Create

The Create operation allows users to add new records to the application's data store.

#### Implementation Pattern

```typescript
/**
 * Generic create function for adding new records
 * @param data The data to create a new record with
 * @returns The newly created record with generated ID and metadata
 */
async function createRecord<T extends Record<string, any>>(
  collection: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<T> {
  // Validate input data against schema
  const validatedData = validateSchema(collection, data);
  
  // Add metadata
  const record = {
    ...validatedData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as T;
  
  // Persist to database
  const result = await db.collection(collection).add(record);
  
  // Return the created record
  return result;
}
```

#### Security Considerations

- Input validation must be performed on all user-provided data
- Authorization checks must verify the user has permission to create records
- Sensitive fields must be sanitized before storage
- Rate limiting should be applied to prevent abuse

#### Usage Example

```typescript
// Creating a new research query
const newQuery = await createRecord<ResearchQuery>('queries', {
  title: 'Impact of AI on healthcare',
  description: 'Exploring how artificial intelligence is transforming healthcare delivery and outcomes',
  userId: currentUser.id,
  status: 'draft',
  tags: ['ai', 'healthcare', 'technology'],
});
```

### Read

The Read operation retrieves existing records from the application's data store.

#### Implementation Patterns

##### Single Record Retrieval

```typescript
/**
 * Retrieve a single record by ID
 * @param collection The collection/table name
 * @param id The unique identifier of the record
 * @returns The requested record or null if not found
 */
async function getRecordById<T>(
  collection: string,
  id: string
): Promise<T | null> {
  // Retrieve from database
  const record = await db.collection(collection).findById(id);
  
  // Return null if not found
  if (!record) {
    return null;
  }
  
  // Apply any field-level access control
  const filteredRecord = applyFieldLevelSecurity(record, currentUser);
  
  return filteredRecord as T;
}
```

##### Multiple Records Retrieval

```typescript
/**
 * Retrieve multiple records with filtering, sorting, and pagination
 * @param collection The collection/table name
 * @param options Query options including filters, sort, and pagination
 * @returns Paginated results with metadata
 */
async function queryRecords<T>(
  collection: string,
  options: {
    filters?: Record<string, any>;
    sort?: { field: string; direction: 'asc' | 'desc' };
    page?: number;
    limit?: number;
  }
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const {
    filters = {},
    sort = { field: 'createdAt', direction: 'desc' },
    page = 1,
    limit = 10,
  } = options;
  
  // Build query
  let query = db.collection(collection).find(filters);
  
  // Apply sorting
  query = query.sort(sort.field, sort.direction);
  
  // Get total count for pagination
  const total = await db.collection(collection).countDocuments(filters);
  
  // Apply pagination
  query = query.skip((page - 1) * limit).limit(limit);
  
  // Execute query
  const data = await query.exec();
  
  // Apply field-level security to each record
  const secureData = data.map(record => 
    applyFieldLevelSecurity(record, currentUser)
  );
  
  return {
    data: secureData as T[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```

#### Security Considerations

- Records should only be accessible to authorized users
- Field-level security should filter sensitive data based on user permissions
- Query parameters should be validated to prevent injection attacks
- Rate limiting should be applied to prevent abuse

#### Usage Example

```typescript
// Fetching a single research query
const query = await getRecordById<ResearchQuery>('queries', queryId);

// Fetching multiple research queries with filtering and pagination
const userQueries = await queryRecords<ResearchQuery>('queries', {
  filters: { userId: currentUser.id, status: 'published' },
  sort: { field: 'updatedAt', direction: 'desc' },
  page: 1,
  limit: 20,
});
```

### Update

The Update operation modifies existing records in the application's data store.

#### Implementation Pattern

```typescript
/**
 * Update an existing record
 * @param collection The collection/table name
 * @param id The unique identifier of the record to update
 * @param data The partial data to update the record with
 * @returns The updated record
 */
async function updateRecord<T>(
  collection: string,
  id: string,
  data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<T> {
  // Validate input data against schema
  const validatedData = validateSchema(collection, data, 'update');
  
  // Add metadata
  const updateData = {
    ...validatedData,
    updatedAt: new Date().toISOString(),
  };
  
  // Check if record exists
  const existingRecord = await db.collection(collection).findById(id);
  if (!existingRecord) {
    throw new Error(`Record with ID ${id} not found`);
  }
  
  // Update in database
  const updatedRecord = await db.collection(collection)
    .findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return the updated document
    );
  
  return updatedRecord as T;
}
```

#### Security Considerations

- Input validation must be performed on all user-provided data
- Authorization checks must verify the user has permission to update the specific record
- Immutable fields should be protected from modification
- Optimistic concurrency control should be implemented for high-contention resources

#### Usage Example

```typescript
// Updating a research query
const updatedQuery = await updateRecord<ResearchQuery>(
  'queries',
  queryId,
  {
    title: 'Updated: Impact of AI on modern healthcare',
    tags: ['ai', 'healthcare', 'technology', 'medicine'],
    status: 'published',
  }
);
```

### Delete

The Delete operation removes records from the application's data store.

#### Implementation Patterns

##### Hard Delete

```typescript
/**
 * Permanently delete a record
 * @param collection The collection/table name
 * @param id The unique identifier of the record to delete
 * @returns Boolean indicating success
 */
async function deleteRecord(
  collection: string,
  id: string
): Promise<boolean> {
  // Check if record exists
  const existingRecord = await db.collection(collection).findById(id);
  if (!existingRecord) {
    throw new Error(`Record with ID ${id} not found`);
  }
  
  // Delete from database
  await db.collection(collection).findByIdAndDelete(id);
  
  return true;
}
```

##### Soft Delete

```typescript
/**
 * Soft delete a record by marking it as deleted
 * @param collection The collection/table name
 * @param id The unique identifier of the record to soft delete
 * @returns The updated record with deleted flag
 */
async function softDeleteRecord<T>(
  collection: string,
  id: string
): Promise<T> {
  // Check if record exists
  const existingRecord = await db.collection(collection).findById(id);
  if (!existingRecord) {
    throw new Error(`Record with ID ${id} not found`);
  }
  
  // Update with deleted flag
  const deletedRecord = await db.collection(collection)
    .findByIdAndUpdate(
      id,
      {
        $set: {
          deleted: true,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      },
      { new: true }
    );
  
  return deletedRecord as T;
}
```

#### Security Considerations

- Authorization checks must verify the user has permission to delete the specific record
- Soft delete should be preferred for data that may need to be recovered
- Cascading deletes should be handled carefully to maintain data integrity
- Audit logs should record deletion events for compliance and recovery

#### Usage Example

```typescript
// Soft deleting a research query
const deletedQuery = await softDeleteRecord<ResearchQuery>('queries', queryId);

// Hard deleting a temporary record
const success = await deleteRecord('temporaryData', tempId);
```

## Client-Side Implementation

### React Hooks for CRUD Operations

Following the **Operational Directives** for code implementation standards, we provide custom hooks for CRUD operations:

```typescript
// useCreate hook
function useCreate<T, K extends Omit<T, 'id' | 'createdAt' | 'updatedAt'>>(
  collection: string
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const create = async (data: K): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create record');
      }
      
      const result = await response.json();
      return result as T;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { create, isLoading, error };
}

// Similar hooks for read, update, and delete operations
```

### Form Handling with CRUD Operations

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreate } from '@/hooks/crud';
import { ResearchQuerySchema } from '@/schemas/researchQuery';

function CreateResearchQueryForm() {
  const { create, isLoading, error } = useCreate<ResearchQuery, CreateResearchQueryInput>('queries');
  const { register, handleSubmit, formState: { errors } } = useForm<CreateResearchQueryInput>({
    resolver: zodResolver(ResearchQuerySchema),
  });
  
  const onSubmit = async (data: CreateResearchQueryInput) => {
    const result = await create(data);
    if (result) {
      // Handle successful creation
      toast.success('Research query created successfully');
      router.push(`/queries/${result.id}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('title')}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        {/* Additional form fields */}
        
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isLoading ? 'Creating...' : 'Create Query'}
        </button>
      </div>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error creating research query
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
```

## Server-Side Implementation

### API Route Handlers

Following the **Agent Narrative Framework's** focus on security and maintainability:

```typescript
// Create handler
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = ResearchQuerySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Create record
    const data = {
      ...validationResult.data,
      userId: session.user.id,
    };
    
    const result = await db.collection('queries').add(data);
    
    // Return created record
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Similar handlers for GET, PUT/PATCH, and DELETE methods
```

## Data Validation

Following the **Logos** principle of the Agent Narrative Framework, we implement strict data validation:

```typescript
// Using Zod for schema validation
import { z } from 'zod';

export const ResearchQuerySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  status: z.enum(['draft', 'published', 'archived']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

export type ResearchQuery = z.infer<typeof ResearchQuerySchema> & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deleted?: boolean;
};

export type CreateResearchQueryInput = z.infer<typeof ResearchQuerySchema>;
```

## Error Handling

Following the **Ethos** principle of the Agent Narrative Framework, we implement comprehensive error handling:

```typescript
// Error types
export enum CrudErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Error class
export class CrudError extends Error {
  type: CrudErrorType;
  details?: any;
  statusCode: number;
  
  constructor(
    message: string,
    type: CrudErrorType,
    statusCode: number,
    details?: any
  ) {
    super(message);
    this.name = 'CrudError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
  
  static validation(message: string, details?: any): CrudError {
    return new CrudError(
      message,
      CrudErrorType.VALIDATION_ERROR,
      400,
      details
    );
  }
  
  static notFound(message: string): CrudError {
    return new CrudError(
      message,
      CrudErrorType.NOT_FOUND,
      404
    );
  }
  
  // Additional static methods for other error types
}

// Error handler middleware
export function handleCrudError(error: unknown) {
  if (error instanceof CrudError) {
    return NextResponse.json(
      {
        error: error.message,
        type: error.type,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }
  
  console.error('Unhandled error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Testing Strategy

Following the **Agent Narrative Framework's** emphasis on code quality:

### Unit Tests

```typescript
// Testing create function
describe('createRecord', () => {
  it('should create a new record with valid data', async () => {
    // Arrange
    const mockData = {
      title: 'Test Query',
      description: 'Test description',
      status: 'draft',
      tags: ['test'],
    };
    
    // Act
    const result = await createRecord<ResearchQuery>('queries', mockData);
    
    // Assert
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('updatedAt');
    expect(result.title).toBe(mockData.title);
  });
  
  it('should throw validation error with invalid data', async () => {
    // Arrange
    const mockData = {
      // Missing required fields
      status: 'invalid-status',
    };
    
    // Act & Assert
    await expect(
      createRecord<ResearchQuery>('queries', mockData as any)
    ).rejects.toThrow();
  });
});

// Similar tests for read, update, and delete functions
```

### Integration Tests

```typescript
// Testing API endpoints
describe('Research Queries API', () => {
  it('should create a new query', async () => {
    // Arrange
    const mockData = {
      title: 'Test Query',
      description: 'Test description',
      status: 'draft',
      tags: ['test'],
    };
    
    // Act
    const response = await fetch('/api/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
    });
    
    // Assert
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
  
  // Similar tests for GET, PUT/PATCH, and DELETE endpoints
});
```

## Performance Considerations

- Implement database indexes for frequently queried fields
- Use pagination for large data sets
- Consider caching strategies for read-heavy operations
- Implement optimistic UI updates for better user experience
- Use batch operations for bulk updates or deletes

## Security Best Practices

Following the **Security Principles** from the **Agent Narrative Framework**:

- Implement proper authentication and authorization for all CRUD operations
- Validate all input data against schemas
- Use parameterized queries to prevent injection attacks
- Implement rate limiting to prevent abuse
- Log all write operations for audit purposes
- Apply field-level security to filter sensitive data
- Use HTTPS for all API requests
- Implement CSRF protection for form submissions