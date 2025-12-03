# Testing Setup

## Configuration

Jest is configured with `jest-expo` preset for React Native testing.

## Notes

- Testing framework is installed and configured
- Component tests will be added incrementally as features are developed
- Each future task will include tests for the specific components created

## Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Test Structure

Tests will be organized as:

- `/app/**/__tests__/` - Component tests colocated with components
- `/app/**/*.test.tsx` - Inline test files

## Mocks

Common mocks for native modules are configured in `jest.setup.js`:

- AsyncStorage
- SecureStore
