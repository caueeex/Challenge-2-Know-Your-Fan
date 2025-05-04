import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      navigation.navigate('Main');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Animatable.View 
          animation="fadeInDown" 
          duration={1000}
          style={styles.logoContainer}
        >
          <Image 
            source={require('../assets/furia-logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.title}>FuriaApp</Text>
          <Text style={styles.subtitle}>Conecte-se ao universo FURIA</Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          style={styles.formContainer}
        >
          <Input
            label="Email"
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
          />
          
          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed"
          />
          
          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta? </Text>
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.navigate('Register')}
            >
              Registre-se
            </Text>
          </View>
        </Animatable.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light,
    opacity: 0.8,
  },
  formContainer: {
    marginTop: 20,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.light,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;