import React, { useState, useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  InputItem,
  Button,
  WhiteSpace,
  WingBlank,
  View,
  Text
} from '@ant-design/react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '@modules/AuthContext';
import globalStyles from '@styles/globalStyles';
import styles from './styles';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isEmailValid = useMemo(() => email.includes('@'), [email]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Error', 'Email and Password cannot be empty.');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Invalid Email', 'Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login Failed', 'Check email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.logoContainer}>
          <Image source={require('@assets/h-logo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome to Scatterlink</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <WingBlank size="lg">
          <View style={styles.card}>
            <InputItem
              value={email}
              onChange={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="black"
              style={styles.input}
              clear={false}
              extra={
                email.length > 0 ? (
                  <Text onPress={() => setEmail('')}>
                    <Icon name="close" size={20} color="#666" />
                  </Text>
                ) : null
              }
            />
            <WhiteSpace size="lg" />
            <InputItem
              clear={false}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="black"
              extra={
                <View style={styles.passwordExtras}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#666"
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityIcon}
                  />
                  {password.length > 0 && (
                    <Icon
                      name="close"
                      size={20}
                      color="#666"
                      onPress={() => setPassword('')}
                    />
                  )}
                </View>
              }
            />
            <WhiteSpace size="lg" />
            <WhiteSpace size="lg" />
            {/* <Text
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              Forgot Password?
            </Text>
            <WhiteSpace size="xl" /> */}

            {loading ? (
              <ActivityIndicator size="large" color="#108ee9" />
            ) : (
              <Button type="primary" onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>Sign In</Text>
              </Button>
            )}

            <WhiteSpace size="xl" />
            {/* <View style={styles.signUpContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Text
                onPress={() => navigation.navigate('SignUp')}
                style={styles.signUpLink}
              >
                Sign Up
              </Text>
            </View> */}
          </View>
        </WingBlank>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
