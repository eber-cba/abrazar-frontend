# Storage & Auth Hooks

## Storage Utility (`app/utils/storage.ts`)

### Overview

Type-safe wrapper around AsyncStorage for secure token and data management.

### Features

- ✅ **Token Management**: Save, get, remove access tokens
- ✅ **Refresh Token Support**: Separate handling for refresh tokens
- ✅ **User Data Persistence**: Store/retrieve user objects
- ✅ **Session Management**: Clear all auth data on logout
- ✅ **Generic Storage**: Save any JSON-serializable data
- ✅ **Type-Safe**: Full TypeScript support

### Usage

#### Token Management

```typescript
import { saveToken, getToken, removeToken, hasValidToken } from "@/app/utils";

// Save token after login
await saveToken(data.accessToken);

// Get token for API calls (done automatically by axios)
const token = await getToken();

// Check if logged in
const isLoggedIn = await hasValidToken();

// Remove token on logout
await removeToken();
```

#### Session Management

```typescript
import { clearAuthData } from "@/app/utils";

// Clear all auth data (tokens + user data)
await clearAuthData();
```

#### User Data

```typescript
import { saveUserData, getUserData } from "@/app/utils";

// Save user object
await saveUserData({ id: "123", name: "Juan", role: "ADMIN" });

// Get user object
const user = await getUserData<User>();
```

---

## Auth Hooks (`app/hooks/useAuth.ts`)

### Overview

React Query hooks for authentication that provide automatic app-wide synchronization.

### Available Hooks

#### 1. `useCurrentUser()`

Get current authenticated user with automatic sync.

```typescript
import { useCurrentUser } from "@/app/hooks";

function ProfileScreen() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <Text>Hola, {user.name}</Text>;
}
```

**Features:**

- ✅ Fetches `/api/auth/me`
- ✅ Cached for 5 minutes
- ✅ Auto-syncs across all components
- ✅ No retry on 401 (invalid auth)

#### 2. `useLogin()`

Login mutation with automatic cache update.

```typescript
import { useLogin } from "@/app/hooks";

function LoginScreen() {
  const login = useLogin();

  const handleLogin = async () => {
    try {
      await login.mutateAsync({
        email: "user@example.com",
        password: "password123",
      });
      // Token saved automatically
      // User cached automatically
      // Navigate to home
    } catch (error) {
      // Error handled automatically
      alert(error.message);
    }
  };

  return (
    <Button onPress={handleLogin} loading={login.isPending}>
      Iniciar Sesión
    </Button>
  );
}
```

**What it does:**

1. Calls `/api/auth/login`
2. Saves access token to storage
3. Updates user cache
4. Invalidates queries to trigger refetch
5. All screens update automatically

#### 3. `useLogout()`

Logout mutation with cache clearing.

```typescript
import { useLogout } from "@/app/hooks";

function SettingsScreen() {
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    // Token removed automatically
    // All cache cleared automatically
    // Navigate to login
  };

  return <Button onPress={handleLogout}>Cerrar Sesión</Button>;
}
```

**What it does:**

1. Calls `/api/auth/logout`
2. Clears all tokens and user data
3. Clears entire React Query cache
4. Entire app resets to logged-out state

#### 4. `useRegister()`

Registration mutation (if supported).

```typescript
import { useRegister } from "@/app/hooks";

function RegisterScreen() {
  const register = useRegister();

  const handleRegister = async (data) => {
    await register.mutateAsync(data);
    // Auto-logged in after registration
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
```

#### 5. `useIsAuthenticated()`

Helper to check authentication status.

```typescript
import { useIsAuthenticated } from "@/app/hooks";

function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();

  if (isLoading) return <SplashScreen />;

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
```

---

## Integration with Axios

The auth hooks work seamlessly with the axios configuration:

### Automatic Token Injection

```typescript
// In api.ts
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Result:** Every API call automatically includes the token! No manual headers needed.

### Base URL Configuration

```typescript
// In api.ts
api.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL + "/api";
```

**Result:** Use relative URLs everywhere:

```typescript
// ✅ Good
api.get("/personas");

// ❌ Not needed anymore
api.get("http://backend.com/api/personas");
```

---

## Complete Auth Flow Example

```typescript
import { useLogin, useLogout, useCurrentUser } from "@/app/hooks";
import { handleError } from "@/app/utils";

function AuthExample() {
  // Get current user
  const { data: user, isLoading } = useCurrentUser();

  // Login mutation
  const login = useLogin();

  // Logout mutation
  const logout = useLogout();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login.mutateAsync({ email, password });
      // ✅ Token saved
      // ✅ User cached
      // ✅ All screens updated automatically
    } catch (error) {
      const message = handleError(error);
      Alert.alert("Error", message);
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    // ✅ Token removed
    // ✅ Cache cleared
    // ✅ App resets
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm onSubmit={handleLogin} />;
  }

  return (
    <View>
      <Text>Bienvenido, {user.name}</Text>
      <Button onPress={handleLogout}>Cerrar Sesión</Button>
    </View>
  );
}
```

---

## Benefits

### Developer Experience

✅ **No boilerplate**: Hooks handle all the complex logic  
✅ **Type-safe**: Full TypeScript support  
✅ **Auto-sync**: Changes propagate automatically  
✅ **Clean code**: No manual token/cache management

### User Experience

✅ **Fast**: Cached data loads instantly  
✅ **Consistent**: Same data everywhere  
✅ **Reliable**: Automatic error handling  
✅ **Smooth**: No flash of loading states

### Security

✅ **Secure storage**: AsyncStorage for tokens  
✅ **Auto token injection**: Never forget headers  
✅ **Auto cleanup**: Logout clears everything

---

## Next Steps with Auth Context

When creating AuthContext (Task 1.3), you can simply use these hooks:

```typescript
// Simplified AuthContext using hooks
export const AuthProvider = ({ children }) => {
  const { data: user, isLoading } = useCurrentUser();
  const login = useLogin();
  const logout = useLogout();

  const authValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: login.mutateAsync,
    logout: logout.mutateAsync,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
};
```

**Much simpler than managing state manually!**
