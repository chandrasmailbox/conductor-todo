import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthStack';

type RegisterScreenProps = StackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
      {/* Placeholder for registration form */}
      <Text>Registration Form Goes Here</Text>
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

export default RegisterScreen;