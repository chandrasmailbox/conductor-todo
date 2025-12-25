import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../src/screens/LoginScreen';
import { supabase } from '../src/supabase'; // Mock this import
import { AuthStackParamList } from '../src/navigation/AuthStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native'; // Import Alert

// Mock @supabase/supabase-js
jest.mock('../src/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(() => ({ data: { user: null, session: null }, error: null })),
    },
  },
}));

// Mock navigation
const mockNavigation: StackNavigationProp<AuthStackParamList, 'Login'> = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    jest.spyOn(Alert, 'alert'); // Spy on Alert.alert
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />);
    expect(getByText('Login to Your Account')).toBeTruthy(); // Updated text
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('displays error messages for invalid input', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    // Simulate empty email and password
    fireEvent.changeText(emailInput, '');
    fireEvent.changeText(passwordInput, '');
    fireEvent.press(loginButton);

    // Expect Alert.alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email is required');
    });
    jest.clearAllMocks();

    fireEvent.changeText(emailInput, 'valid@example.com');
    fireEvent.changeText(passwordInput, '');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password is required');
    });
    jest.clearAllMocks();

    // Simulate invalid email format
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email format');
    });
  });

  it('calls supabase signInWithPassword on valid login attempt', async () => {
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('navigates to Home screen on successful login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: { user: { id: '123' }, session: { access_token: 'abc', refresh_token: 'xyz' } }, error: null });

    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'success@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockNavigation.replace).not.toHaveBeenCalled(); // RootNavigator handles navigation to Home
    });
  });

  it('displays an alert on Supabase login error', async () => {
    const errorMessage = 'Supabase login failed';
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: errorMessage } });
    
    const { getByText, getByPlaceholderText } = render(<LoginScreen navigation={mockNavigation} route={{ key: 'Login', name: 'Login' }} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'error@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
    });
  });
});