import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../src/screens/RegisterScreen';
import { supabase } from '../src/supabase'; // Mock this import
import { AuthStackParamList } from '../src/navigation/AuthStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native'; // Import Alert

// Mock @supabase/supabase-js
jest.mock('../src/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(() => ({ data: { user: null, session: null }, error: null })),
    },
  },
}));

// Mock navigation
const mockNavigation: StackNavigationProp<AuthStackParamList, 'Register'> = {
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

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
    jest.spyOn(Alert, 'alert'); // Spy on Alert.alert
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigation} route={{ key: 'Register', name: 'Register' }} />);
    expect(getByText('Register Account')).toBeTruthy(); // Updated text
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('displays error messages for invalid input', async () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigation} route={{ key: 'Register', name: 'Register' }} />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const registerButton = getByText('Register');

    // Simulate empty email and password
    fireEvent.changeText(emailInput, '');
    fireEvent.changeText(passwordInput, '');
    fireEvent.press(registerButton);

    // Expect Alert.alert to be called
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email is required');
    });
    jest.clearAllMocks(); // Clear mock calls for the next assertion

    fireEvent.changeText(emailInput, 'valid@example.com');
    fireEvent.changeText(passwordInput, '');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password is required');
    });
    jest.clearAllMocks();

    // Simulate invalid email format
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid email format');
    });
    jest.clearAllMocks();

    // Simulate short password
    fireEvent.changeText(emailInput, 'valid@example.com');
    fireEvent.changeText(passwordInput, 'short');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password should be at least 6 characters long');
    });
  });

  it('calls supabase signUp on valid registration attempt', async () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigation} route={{ key: 'Register', name: 'Register' }} />);

    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('navigates to Login screen on successful registration', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: { user: { id: '123' }, session: null }, error: null });

    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigation} route={{ key: 'Register', name: 'Register' }} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'success@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Registration successful! Please check your email to confirm your account.');
      expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
    });
  });

  it('displays an alert on Supabase registration error', async () => {
    const errorMessage = 'Supabase registration failed';
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: errorMessage } });
    
    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={mockNavigation} route={{ key: 'Register', name: 'Register' }} />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'error@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
    });
  });
});