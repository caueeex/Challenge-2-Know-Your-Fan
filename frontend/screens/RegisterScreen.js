import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return;
    }
    
    if (password !== confirmPassword) {
      return;
    }
    
    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);
    
    if (success) {
      navigation.navigate('Login');
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
          style={styles.header}
        >
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Junte-se à comunidade FURIA</Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          style={styles.formContainer}
        >
          <Input
            label="Nome completo"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            icon="person"
          />
          
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
          
          <Input
            label="Confirmar senha"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon="lock-closed"
          />
          
          <Button
            title="Registrar"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.navigate('Login')}
            >
              Faça login
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
  header: {
    marginBottom: 40,
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

export default RegisterScreen;