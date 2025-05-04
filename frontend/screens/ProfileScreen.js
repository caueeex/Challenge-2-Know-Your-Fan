import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const isFocused = useIsFocused();
  const { user, updateProfile, setUser } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [cpf, setCpf] = useState('');
  const [interests, setInterests] = useState([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_URL = 'http://192.168.0.10:5000/api';
  const BASE_URL = 'http://192.168.0.10:5000';

  useEffect(() => {
    console.log('ProfileScreen montado. Estado inicial:', { editing, userId: user?.userId, user });
  }, []);

  useEffect(() => {
    if (isFocused && user?.token && !user?.name) {
      console.log('User incompleto, buscando perfil');
      fetchUserProfile();
    }
  }, [isFocused, user?.token]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAddress(user.address || '');
      setCpf(user.cpf || '');
      setInterests(user.interests || []);
      console.log('Atualizando estados locais:', {
        name: user.name,
        email: user.email,
        address: user.address,
        cpf: user.cpf,
        interests: user.interests,
        points: user.points,
        badges: user.badges,
        profilePicture: user.profilePicture
      });
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      console.log('Iniciando fetchUserProfile', { userId: user.userId, token: user.token?.substring(0, 10) + '...' });
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Resposta de perfil:', {
        status: response.status,
        data: response.data
      });
      setUser(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Erro ao buscar perfil:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao carregar perfil. Verifique sua conexão.'
      });
    }
  };

  const getProfilePictureUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path}`;
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateProfile({
        name,
        address,
        cpf,
        interests: JSON.stringify(interests),
      });
      setEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Perfil atualizado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao atualizar perfil.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2: 'Permissão para acessar a galeria é necessária!'
      });
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['image'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!pickerResult.canceled) {
      await uploadProfilePicture(pickerResult);
    }
  };

  const uploadProfilePicture = async (pickerResult) => {
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: pickerResult.assets[0].uri,
        name: `profile.jpg`,
        type: 'image/jpeg',
      });

      console.log('Enviando upload de imagem:', {
        uri: pickerResult.assets[0].uri,
        userId: user.userId,
        token: user.token?.substring(0, 10) + '...'
      });

      const response = await axios.post(
        `${API_URL}/user/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      console.log('Resposta do upload:', {
        status: response.status,
        profilePicture: response.data.profilePicture
      });

      const profilePictureUrl = getProfilePictureUrl(response.data.profilePicture);
      setUser((prev) => ({ ...prev, profilePicture: profilePictureUrl }));
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Foto de perfil atualizada!'
      });
    } catch (error) {
      console.error('Erro no upload da imagem:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.response?.data?.message || 'Erro ao fazer upload da imagem'
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Animatable.View 
          animation="fadeInDown" 
          duration={600}
          style={styles.profileHeader}
        >
          <TouchableOpacity 
            onPress={editing ? handleImagePick : null}
            style={styles.profileImageWrapper}
          >
            <View style={styles.profileImageContainer}>
              {user?.profilePicture ? (
                <Image 
                  source={{ uri: getProfilePictureUrl(user.profilePicture) }} 
                  style={styles.profileImage} 
                  onError={(e) => console.error('Erro ao carregar imagem:', e.nativeEvent.error)}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={64} color="#E6E6E6" />
              )}
              {editing && (
                <View style={styles.editIcon}>
                  <Ionicons name="camera-outline" size={20} color="#0A0A0C" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.profilePoints}>{user?.points || 0} Pontos</Text>
          
          <View style={styles.badgesContainer}>
            {user?.badges?.map((badge, index) => (
              <Animatable.View 
                key={index}
                animation="fadeIn" 
                duration={400}
                delay={index * 100}
                style={styles.badge}
              >
                <Ionicons name="trophy-outline" size={16} color="#D4AF37" />
                <Text style={styles.badgeText}>{badge}</Text>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>
        
        {editing ? (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            style={styles.formContainer}
          >
            <Input
              label="Nome"
              placeholder="Digite seu nome"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              style={styles.input}
              inputStyle={styles.inputText}
              labelStyle={styles.inputLabel}
              iconStyle={styles.inputIcon}
            />
            
            <Input
              label="Endereço"
              placeholder="Digite seu endereço"
              value={address}
              onChangeText={setAddress}
              icon="location-outline"
              style={styles.input}
              inputStyle={styles.inputText}
              labelStyle={styles.inputLabel}
              iconStyle={styles.inputIcon}
            />
            
            <Input
              label="CPF"
              placeholder="Digite seu CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              icon="card-outline"
              style={styles.input}
              inputStyle={styles.inputText}
              labelStyle={styles.inputLabel}
              iconStyle={styles.inputIcon}
            />
            
            <View style={styles.buttonsContainer}>
              <Button
                title="Cancelar"
                onPress={() => {
                  console.log('Cancelando edição');
                  setEditing(false);
                }}
                style={[styles.button, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title="Salvar"
                onPress={handleUpdateProfile}
                loading={loading}
                style={[styles.button, styles.saveButton]}
                textStyle={styles.saveButtonText}
              />
            </View>
          </Animatable.View>
        ) : (
          <Animatable.View 
            animation="fadeInUp" 
            duration={600}
            style={styles.infoContainer}
          >
            <View style={styles.infoItem}>
              <Ionicons name="mail-outline" size={20} color="#D4AF37" style={styles.infoIcon} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoText}>{user?.email || 'email@exemplo.com'}</Text>
              </View>
            </View>
            
            {user?.name && (
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={20} color="#D4AF37" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoText}>{user.name}</Text>
                </View>
              </View>
            )}
            
            {user?.address && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color="#D4AF37" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Endereço</Text>
                  <Text style={styles.infoText}>{user.address}</Text>
                </View>
              </View>
            )}
            
            {user?.cpf && (
              <View style={styles.infoItem}>
                <Ionicons name="card-outline" size={20} color="#D4AF37" style={styles.infoIcon} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>CPF</Text>
                  <Text style={styles.infoText}>{user.cpf}</Text>
                </View>
              </View>
            )}
            
            <Button
              title="Editar Perfil"
              onPress={() => {
                console.log('Iniciando edição');
                setEditing(true);
              }}
              style={styles.editButton}
              textStyle={styles.editButtonText}
            />
          </Animatable.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C', // Dark tech background
  },
  content: {
    padding: 24,
    paddingBottom: 48,
    minHeight: '100%',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1A1E',
    borderWidth: 1,
    borderColor: '#D4AF37' + '26', // Subtle gold border
  },
  profileImageWrapper: {
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2A2A33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37' + '4D', // Gold accent border
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4AF37', // Gold edit icon
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A0A0C',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E6E6E6',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  profilePoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37', // Gold points
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A33',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    margin: 6,
    borderWidth: 1,
    borderColor: '#D4AF37' + '26', // Subtle gold border
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#E6E6E6',
  },
  formContainer: {
    marginTop: 24,
    padding: 24,
    backgroundColor: '#1A1A1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37' + '26', // Subtle gold border
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#2A2A33',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37' + '33', // Gold input border
    padding: 16,
    height: 56, // Larger touch area
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B5',
    marginBottom: 8,
    textTransform: 'capitalize', // Proper capitalization
  },
  inputText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6E6E6', // Light text for visibility
  },
  inputIcon: {
    color: '#D4AF37', // Gold icon
  },
  infoContainer: {
    marginTop: 24,
    padding: 24,
    backgroundColor: '#1A1A1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37' + '26', // Subtle gold border
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2A2A33',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B0B0B5',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E6E6E6',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelButton: {
    backgroundColor: '#2A2A33',
    borderWidth: 1,
    borderColor: '#D4AF37' + '33', // Gold border
  },
  cancelButtonText: {
    color: '#E6E6E6',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#D4AF37', // Gold button
  },
  saveButtonText: {
    color: '#0A0A0C',
    fontWeight: '600',
    fontSize: 16,
  },
  editButton: {
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: '#D4AF37', // Gold button
  },
  editButtonText: {
    color: '#0A0A0C',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;