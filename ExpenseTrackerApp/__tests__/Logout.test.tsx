import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { supabase } from '../src/supabase'; // Mock this import
import { AppStackParamList } from '../src/navigation/AppStack';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native'; // Import Alert

// Mock @supabase/supabase-js
jest.mock('../src/supabase', () => ({
  supabase: {
    auth: {
      signOut: jest.fn(() => ({ error: null })),
    },
  },
}));

// Mock navigation
const mockNavigation: StackNavigationProp<AppStackParamList, 'Home'> = {
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

describe('HomeScreen Logout Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert'); // Spy on Alert.alert
  });

  it('calls supabase signOut when logout button is pressed', async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation} route={{ key: 'Home', name: 'Home' }} />);

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  it('displays an alert if signOut fails', async () => {
    const errorMessage = 'Logout failed';
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: { message: errorMessage } });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} route={{ key: 'Home', name: 'Home' }} />);

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
    });
  });

  it('does not navigate away on successful logout (handled by AuthContext/RootNavigator)', async () => {
    (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} route={{ key: 'Home', name: 'Home' }} />);

    fireEvent.press(getByText('Logout'));

    await waitFor(() => {
      expect(mockNavigation.replace).not.toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });
});