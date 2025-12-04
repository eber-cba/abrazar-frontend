# Error Handler & React Query Setup

## Error Handler (`app/utils/error-handler.ts`)

### Features

- ✅ **40+ error message mappings** in Spanish
- ✅ **Smart error detection** (network, auth, validation)
- ✅ **Multiple error format support** (Axios, standard Error, strings)
- ✅ **Context-aware errors** from backend responses
- ✅ **Development logging** with context

### Usage

```typescript
import { handleError, handleAndLogError, isAuthError } from "@/app/utils";

try {
  await api.post("/auth/login", credentials);
} catch (error) {
  // Get friendly message
  const message = handleError(error);
  // "Email o contraseña incorrectos"

  // Or log + get message
  const msg = handleAndLogError(error, "Login");

  // Check error type
  if (isAuthError(error)) {
    // Redirect to login
  }
}
```

### Error Messages Examples

- `"Invalid credentials"` → `"Email o contraseña incorrectos"`
- `"Token expired"` → `"Tu sesión ha expirado. Por favor inicia sesión nuevamente"`
- `"User already exists"` → `"Ya estás registrado. Intenta iniciar sesión"`
- `"Network Error"` → `"Sin conexión a Internet. Verifica tu conexión"`
- `"Service unavailable"` → `"Servidor no disponible. Intenta más tarde"`
- `"Missing required fields"` → `"Datos incompletos. Por favor completa todos los campos"`

---

## React Query Configuration (`app/config/react-query.ts`)

### Advanced Features

#### 1. Smart Caching

```typescript
staleTime: 5 * 60 * 1000,  // Data fresh for 5 minutes
gcTime: 10 * 60 * 1000,     // Cache for 10 minutes
```

#### 2. Intelligent Retry Logic

- **Network errors:** Retry once with 1s delay
- **Client errors (4xx):** No retry (except 408 timeout)
- **Server errors (5xx):** Retry 3 times with exponential backoff (1s, 2s, 4s)
- **Mutations:** Retry only network errors, once

#### 3. Offline Support

```typescript
networkMode: 'offlineFirst',  // Try cache first, then network
refetchOnReconnect: true,     // Auto-refetch when back online
```

#### 4. Auto Refetch

- ✅ On window focus (tab switch)
- ✅ On network reconnect
- ❌ On component mount (if data is fresh)

#### 5. Centralized Query Keys

```typescript
import { queryKeys } from "@/app/config";

// Auth
queryKeys.auth.me; // ['auth', 'me']
queryKeys.auth.user("123"); // ['auth', 'user', '123']

// Personas
queryKeys.personas.all; // ['personas']
queryKeys.personas.list({ search }); // ['personas', 'list', { search }]
queryKeys.personas.detail("abc"); // ['personas', 'detail', 'abc']

// Service Points
queryKeys.servicePoints.nearby(lat, lng, 5);
// ['service-points', 'nearby', { lat, lng, radius: 5 }]
```

### Usage Examples

#### Basic Query

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.personas.all,
  queryFn: () => personasService.getAll(),
});

if (error) {
  const message = handleError(error);
  // Show user-friendly message
}
```

#### Query with Filters

```typescript
const filters = { search: "Juan", page: 1 };
const { data } = useQuery({
  queryKey: queryKeys.personas.list(filters),
  queryFn: () => personasService.getAll(filters),
});
```

#### Mutation with Error Handling

```typescript
const mutation = useMutation({
  mutationFn: (data) => personasService.create(data),
  onSuccess: () => {
    invalidateQueries(queryKeys.personas.all);
  },
  onError: (error) => {
    const message = handleAndLogError(error, "Create Persona");
    alert(message);
  },
});
```

#### Prefetch Data

```typescript
import { prefetchQuery, queryKeys } from "@/app/config";

// Prefetch before user navigates
await prefetchQuery(queryKeys.personas.detail("123"), () =>
  personasService.getById("123")
);
```

#### Invalidate Cache

```typescript
import { invalidateQueries, queryKeys } from "@/app/config";

// After creating a persona
invalidateQueries(queryKeys.personas.all);

// After updating
invalidateQueries(queryKeys.personas.detail(id));
```

---

## Benefits

### User Experience

✅ **Clear error messages** in Spanish
✅ **No confusing technical errors** shown to users  
✅ **Automatic retries** for transient failures
✅ **Works offline** with cached data
✅ **Fast UI** with smart caching

### Developer Experience

✅ **Centralized error handling**
✅ **Type-safe query keys**
✅ **Automatic cache management**
✅ **Simple invalidation patterns**
✅ **Context logging** in development

### Performance

✅ **Reduced API calls** (5min cache)
✅ **Background refetching** (smart invalidation)
✅ **Optimistic updates** ready
✅ **Prefetching support**
✅ **Garbage collection** (10min unused)

---

## Next Steps

When creating components with React Query:

1. **Import query keys**

   ```typescript
   import { queryKeys } from "@/app/config";
   ```

2. **Use error handler**

   ```typescript
   import { handleError } from "@/app/utils";
   ```

3. **Show friendly errors**

   ```typescript
   const message = handleError(error);
   Alert.alert("Error", message);
   ```

4. **Invalidate after mutations**
   ```typescript
   invalidateQueries(queryKeys.personas.all);
   ```
