import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch to simulate backend response for tests
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ message: 'Welcome' }),
    })
  );
});

afterAll(() => {
  global.fetch && (global.fetch = undefined);
});

test('renders welcome message from backend', async () => {
  render(<App />);
  const messageEl = await screen.findByTestId('welcome-message');
  expect(messageEl).toHaveTextContent(/Welcome/i);
});
