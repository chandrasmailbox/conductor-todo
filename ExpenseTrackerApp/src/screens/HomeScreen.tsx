import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppStack'; // Assuming AppStack for main app flow

type HomeScreenProps = StackScreenProps<AppStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // Placeholder for user logout functionality
  const handleLogout = () => {
    // Implement logout logic here later
    console.log('Logging out...');
    // After logout, navigate to the authentication flow
    // navigation.replace('Auth'); // This would typically be a replace on the root navigator
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text>Welcome! Your expenses will be here.</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;