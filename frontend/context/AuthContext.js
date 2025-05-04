import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

const API_URL = 'http://192.168.0.10:5000/api';
const SOCKET_URL = 'http://192.168.0.10:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        console.log('Token carregado:', token ? 'Presente' : 'Ausente');
        if (token) {
          const response = await axios.get(`${API_URL}/user/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Dados do perfil:', response.data);
          setUser({
            userId: response.data.id,
            name: response.data.name,
            email: response.data.email,
            address: response.data.address,
            cpf: response.data.cpf,
            interests: response.data.interests,
            socialMedia: response.data.socialMEDIA,
            esportsLinks: response.data.esportsLinks,
            points: response.data.points,
            badges: response.data.badges,
            isAdmin: response.data.isAdmin,
            profilePicture: response.data.profilePicture,
            token
          });
          
          setupSocket(token);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        await AsyncStorage.removeItem('userToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const setupSocket = (token) => {
    const newSocket = require('socket.io-client')(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    newSocket.on('connect', () => {
      console.log('Conectado ao socket:', newSocket.id);
      newSocket.emit('authenticate', token);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Desconectado do socket');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão com o socket:', error.message);
    });
    
    newSocket.on('error', (error) => {
      console.error('Erro do servidor Socket.IO:', error.message);
    });
    
    setSocket(newSocket);
  };

  const login = async (email, password) => {
    try {
      console.log('Iniciando login', { email });
      const loginResponse = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      const { token, userId } = loginResponse.data;
      await AsyncStorage.setItem('userToken', token);
      
      // Buscar perfil completo
      const profileResponse = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Dados do perfil após login:', profileResponse.data);
      const userData = {
        userId,
        name: profileResponse.data.name,
        email: profileResponse.data.email,
        address: profileResponse.data.address,
        cpf: profileResponse.data.cpf,
        interests: profileResponse.data.interests,
        socialMedia: profileResponse.data.socialMedia,
        esportsLinks: profileResponse.data.esportsLinks,
        points: profileResponse.data.points,
        badges: profileResponse.data.badges,
        isAdmin: profileResponse.data.isAdmin,
        profilePicture: profileResponse.data.profilePicture,
        token
      };
      
      console.log('Dados do usuário após login:', userData);
      setUser(userData);
      setupSocket(token);
      
      Toast.show({
        type: 'success',
        text1: 'Login realizado com sucesso!',
      });
      
      return true;
    } catch (error) {
      console.error('Erro no login:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Toast.show({
        type: 'error',
        text1: 'Erro no login',
        text2: error.response?.data?.message || 'Credenciais inválidas',
      });
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      
      Toast.show({
        type: 'success',
        text1: 'Registro realizado com sucesso!',
        text2: 'Faça login para continuar',
      });
      
      return true;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error);
      Toast.show({
        type: 'error',
        text1: 'Erro no registro',
        text2: error.response?.data?.message || 'Erro ao criar conta',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      
      await AsyncStorage.removeItem('userToken');
      setUser(null);
      
      Toast.show({
        type: 'success',
        text1: 'Logout realizado',
      });
      
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateProfile = async (data) => {
    try {
      console.log('Enviando dados para atualização:', data);
      
      // Garante que os campos sejam enviados, mesmo que vazios
      const updateData = {
        name: data.name || undefined,
        address: data.address || undefined,
        cpf: data.cpf || undefined,
        interests: data.interests || undefined
      };
      
      const response = await axios.post(`${API_URL}/user/update`, updateData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Atualizar todos os campos retornados
      setUser(prev => ({
        ...prev,
        name: response.data.name,
        address: response.data.address,
        cpf: response.data.cpf,
        interests: response.data.interests,
        profilePicture: response.data.profilePicture
      }));
      
      Toast.show({
        type: 'success',
        text1: 'Perfil atualizado com sucesso!',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Toast.show({
        type: 'error',
        text1: 'Erro ao atualizar perfil',
        text2: error.response?.data?.message || 'Tente novamente',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        socket,
        login,
        register,
        logout,
        setUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);