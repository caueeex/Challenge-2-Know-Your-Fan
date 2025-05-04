import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const API_URL = 'http://192.168.0.10:5000/api';

const socialPlatforms = [
  { key: 'twitter', name: 'Twitter', icon: 'logo-twitter' },
  { key: 'instagram', name: 'Instagram', icon: 'logo-instagram' },
  { key: 'facebook', name: 'Facebook', icon: 'logo-facebook' },
  { key: 'youtube', name: 'YouTube', icon: 'logo-youtube' },
  { key: 'twitch', name: 'Twitch', icon: 'logo-twitch' },
];

const SocialScreen = () => {
  const isFocused = useIsFocused();
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [socialUrl, setSocialUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Atualiza os dados quando a tela recebe foco
  useEffect(() => {
    if (isFocused && user?.token) {
      fetchUserProfile();
    } else {
      console.log('Não carregando perfil: user ou token ausente', { userId: user?.id, hasToken: !!user?.token });
    }
  }, [isFocused]);

  const fetchUserProfile = async () => {
    try {
      console.log('Iniciando fetchUserProfile', { userId: user.id, token: user.token.substring(0, 10) + '...' });
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Resposta de perfil:', {
        status: response.status,
        socialMedia: response.data.socialMedia
      });
      setUser(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Erro ao buscar perfil:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Alert.alert('Erro', 'Falha ao carregar perfil. Verifique sua conexão.');
    }
  };

  const validateUrl = (url, platform) => {
    const patterns = {
      twitter: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.+/i,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i,
      youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/.+/i,
      twitch: /^(https?:\/\/)?(www\.)?twitch\.tv\/.+/i
    };
    
    return patterns[platform].test(url);
  };

  const handleAddSocial = async () => {
    if (!selectedPlatform || !socialUrl) {
      Alert.alert('Erro', 'Por favor, insira uma URL válida');
      return;
    }

    if (!validateUrl(socialUrl, selectedPlatform)) {
      Alert.alert('URL Inválida', `Por favor, insira uma URL válida do ${socialPlatforms.find(p => p.key === selectedPlatform)?.name}`);
      return;
    }

    if (!user?.token) {
      console.error('Token de autenticação ausente');
      Alert.alert('Erro', 'Faça login novamente.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Enviando POST /add-social-media:', {
        url: `${API_URL}/user/add-social-media`,
        payload: { platform: selectedPlatform, url: socialUrl },
        userId: user.id,
        token: user.token.substring(0, 10) + '...'
      });

      const response = await axios.post(
        `${API_URL}/user/add-social-media`,
        { platform: selectedPlatform, url: socialUrl },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      console.log('Resposta de adicionar rede social:', {
        status: response.status,
        data: response.data
      });

      setUser(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [selectedPlatform]: socialUrl
        },
        badges: response.data.user.badges,
        points: response.data.user.points
      }));

      Alert.alert(
        'Sucesso', 
        `${socialPlatforms.find(p => p.key === selectedPlatform)?.name} conectado com sucesso!`,
        [{ text: 'OK', onPress: () => fetchUserProfile() }]
      );
    } catch (error) {
      console.error('Erro ao conectar rede social:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível conectar');
    } finally {
      setLoading(false);
      setEditing(false);
      setSelectedPlatform(null);
      setSocialUrl('');
    }
  };

  const handleDisconnect = async (platform) => {
    if (!user?.token) {
      console.error('Token de autenticação ausente');
      Alert.alert('Erro', 'Faça login novamente.');
      return;
    }

    Alert.alert(
      'Confirmar',
      `Deseja desconectar sua conta de ${socialPlatforms.find(p => p.key === platform)?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('Enviando DELETE /remove-social-media:', {
                platform,
                userId: user.id,
                token: user.token.substring(0, 10) + '...'
              });
              const response = await axios.delete(
                `${API_URL}/user/remove-social-media`,
                {
                  headers: { Authorization: `Bearer ${user.token}` },
                  data: { platform }
                }
              );

              console.log('Resposta de remover rede social:', {
                status: response.status,
                data: response.data
              });

              setUser(prev => {
                const { [platform]: _, ...remainingSocials } = prev.socialMedia || {};
                return {
                  ...prev,
                  socialMedia: remainingSocials,
                  badges: response.data.user.badges,
                  points: response.data.user.points
                };
              });

              Alert.alert('Sucesso', 'Rede social desconectada com sucesso!');
            } catch (error) {
              console.error('Erro ao desconectar rede social:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
              });
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível desconectar');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Redes Sociais</Text>
        <Text style={styles.subtitle}>Conecte suas redes sociais para ganhar pontos e badges</Text>
        
        {!editing ? (
          <>
            <View style={styles.socialList}>
              {socialPlatforms.map((platform) => {
                const isConnected = user?.socialMedia?.[platform.key];
                
                return (
                  <Animatable.View 
                    key={platform.key}
                    animation="fadeInUp"
                    duration={500}
                    delay={platform.key.charCodeAt(0) * 5}
                    style={[
                      styles.socialItem,
                      isConnected && styles.connectedItem,
                    ]}
                  >
                    <View style={styles.socialIconContainer}>
                      <Ionicons 
                        name={platform.icon} 
                        size={24} 
                        color={isConnected ? colors.primary : colors.light} 
                      />
                    </View>
                    <Text style={styles.socialName}>{platform.name}</Text>
                    
                    {isConnected ? (
                      <View style={styles.connectedContainer}>
                        <View style={styles.connectedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                          <Text style={styles.socialStatus}>Conectado</Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => Linking.openURL(user.socialMedia[platform.key])}
                        >
                          <Text style={styles.socialUrl} numberOfLines={1}>
                            {user.socialMedia[platform.key].replace(/^https?:\/\//, '')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.disconnectButton}
                          onPress={() => handleDisconnect(platform.key)}
                        >
                          <Text style={styles.disconnectText}>Desconectar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPlatform(platform.key);
                          setEditing(true);
                        }}
                      >
                        <Text style={styles.connectText}>Conectar</Text>
                      </TouchableOpacity>
                    )}
                  </Animatable.View>
                );
              })}
            </View>
          </>
        ) : (
          <Animatable.View 
            animation="fadeInUp" 
            duration={500}
            style={styles.formContainer}
          >
            <Text style={styles.formTitle}>
              Conectar {socialPlatforms.find(p => p.key === selectedPlatform)?.name}
            </Text>
            
            <Input
              placeholder={`https://${socialPlatforms.find(p => p.key === selectedPlatform)?.name.toLowerCase()}.com/seu-usuario`}
              value={socialUrl}
              onChangeText={setSocialUrl}
              autoCapitalize="none"
              keyboardType="url"
              autoCorrect={false}
            />
            
            <View style={styles.formButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditing(false);
                  setSelectedPlatform(null);
                  setSocialUrl('');
                }}
                style={[styles.button, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title={loading ? "Conectando..." : "Conectar"}
                onPress={handleAddSocial}
                loading={loading}
                disabled={loading}
                style={styles.button}
              />
            </View>
          </Animatable.View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 30,
    opacity: 0.8,
  },
  socialList: {
    marginBottom: 30,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  connectedItem: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  socialIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  socialName: {
    flex: 1,
    fontSize: 16,
    color: colors.light,
    marginLeft: 10,
  },
  connectedContainer: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  socialStatus: {
    color: colors.primary,
    fontSize: 12,
    marginLeft: 5,
  },
  socialUrl: {
    color: colors.light,
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 3,
  },
  connectText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  disconnectButton: {
    marginTop: 3,
  },
  disconnectText: {
    color: colors.danger,
    fontSize: 12,
  },
  formContainer: {
    marginTop: 20,
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    color: colors.light,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  cancelButtonText: {
    color: colors.light,
  },
});

export default SocialScreen;