import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Input from '../components/Input';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const API_URL = 'http://192.168.0.10:5000/api';

const esportsPlatforms = [
  { id: 1, name: 'Steam', key: 'steam', icon: 'logo-steam' },
  { id: 2, name: 'Riot Games', key: 'riot', icon: 'game-controller' },
  { id: 3, name: 'Epic Games', key: 'epic', icon: 'logo-tux' },
  { id: 4, name: 'Battle.net', key: 'battlenet', icon: 'logo-buffer' },
  { id: 5, name: 'Origin', key: 'origin', icon: 'logo-dropbox' },
  { id: 6, name: 'Ubisoft', key: 'ubisoft', icon: 'logo-ubuntu' },
];

const EsportsLinksScreen = ({ navigation }) => {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [esportsLinks, setEsportsLinks] = useState({});

  useEffect(() => {
    if (isFocused && user?.token) {
      fetchEsportsLinks();
    } else {
      console.log('Não carregando links: user ou token ausente', { userId: user?.id, hasToken: !!user?.token });
    }
  }, [isFocused]);

  const fetchEsportsLinks = async () => {
    try {
      console.log('Iniciando fetchEsportsLinks', { userId: user.id, token: user.token.substring(0, 10) + '...' });
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      console.log('Resposta de perfil:', {
        status: response.status,
        esportsLinks: response.data.esportsLinks
      });
      setEsportsLinks(response.data.esportsLinks || {});
    } catch (error) {
      console.error('Erro ao buscar links de esports:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Alert.alert('Erro', 'Falha ao carregar links. Verifique sua conexão.');
    }
  };

  const handleAddLink = async () => {
    if (!selectedPlatform || !username.trim()) {
      Alert.alert('Erro', 'Selecione uma plataforma e insira um nome de usuário');
      return;
    }
    
    if (!user?.token) {
      console.error('Token de autenticação ausente');
      Alert.alert('Erro', 'Faça login novamente.');
      return;
    }

    setLoading(true);
    try {
      const payload = { platform: selectedPlatform, url: username.trim() };
      console.log('Enviando POST /add-esports-link:', {
        url: `${API_URL}/user/add-esports-link`,
        payload,
        userId: user.id,
        token: user.token.substring(0, 10) + '...'
      });

      const response = await axios.post(
        `${API_URL}/user/add-esports-link`,
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      console.log('Resposta de adicionar link:', {
        status: response.status,
        data: response.data
      });

      setEsportsLinks(prev => ({
        ...prev,
        [selectedPlatform]: username.trim()
      }));
      Alert.alert('Sucesso', 'Link adicionado com sucesso!');
      setEditing(false);
      setSelectedPlatform(null);
      setUsername('');
    } catch (error) {
      console.error('Erro ao adicionar link:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao adicionar o link.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLink = async (platform) => {
    if (!user?.token) {
      console.error('Token de autenticação ausente');
      Alert.alert('Erro', 'Faça login novamente.');
      return;
    }

    Alert.alert(
      'Confirmar',
      `Deseja desconectar sua conta de ${esportsPlatforms.find(p => p.key === platform)?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('Enviando DELETE /remove-esports-link:', {
                platform,
                userId: user.id,
                token: user.token.substring(0, 10) + '...'
              });
              const response = await axios.delete(
                `${API_URL}/user/remove-esports-link`,
                {
                  headers: { Authorization: `Bearer ${user.token}` },
                  data: { platform }
                }
              );
              
              console.log('Resposta de remover link:', {
                status: response.status,
                data: response.data
              });

              setEsportsLinks(prev => {
                const newLinks = { ...prev };
                delete newLinks[platform];
                return newLinks;
              });
              Alert.alert('Sucesso', 'Link removido com sucesso!');
            } catch (error) {
              console.error('Erro ao remover link:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
              });
              Alert.alert('Erro', error.response?.data?.message || 'Falha ao remover o link.');
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
        <Text style={styles.title}>Links de E-sports</Text>
        <Text style={styles.subtitle}>Adicione seus perfis de jogos para conectar com outros fãs</Text>
        
        {!editing ? (
          <>
            <View style={styles.linksList}>
              {esportsPlatforms.map((platform) => {
                const isConnected = !!esportsLinks[platform.key];
                
                return (
                  <Animatable.View 
                    key={platform.id}
                    animation="fadeInUp"
                    duration={500}
                    delay={platform.id * 50}
                    style={[
                      styles.linkItem,
                      isConnected && styles.connectedItem,
                    ]}
                  >
                    <View style={styles.linkIcon}>
                      <Ionicons 
                        name={platform.icon} 
                        size={24} 
                        color={isConnected ? colors.primary : colors.light} 
                      />
                    </View>
                    
                    <View style={styles.linkInfo}>
                      <Text style={styles.linkName}>{platform.name}</Text>
                      {isConnected && (
                        <Text style={styles.linkUsername}>
                          {esportsLinks[platform.key]}
                        </Text>
                      )}
                    </View>
                    
                    {isConnected ? (
                      <TouchableOpacity onPress={() => handleRemoveLink(platform.key)}>
                        <Ionicons name="trash-outline" size={24} color={colors.danger} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPlatform(platform.key);
                          setEditing(true);
                        }}
                      >
                        <Text style={styles.addLinkText}>Adicionar</Text>
                      </TouchableOpacity>
                    )}
                  </Animatable.View>
                );
              })}
            </View>
            
            <Button
              title="Voltar"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
          </>
        ) : (
          <Animatable.View 
            animation="fadeInUp" 
            duration={500}
            style={styles.formContainer}
          >
            <Text style={styles.formTitle}>
              Adicionar {esportsPlatforms.find(p => p.key === selectedPlatform)?.name}
            </Text>
            
            <Input
              placeholder={`Nome de usuário no ${esportsPlatforms.find(p => p.key === selectedPlatform)?.name}`}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <View style={styles.formButtons}>
              <Button
                title="Cancelar"
                onPress={() => {
                  setEditing(false);
                  setSelectedPlatform(null);
                  setUsername('');
                }}
                style={[styles.button, styles.cancelButton]}
                textStyle={styles.cancelButtonText}
              />
              <Button
                title="Salvar"
                onPress={handleAddLink}
                loading={loading}
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
  },
  linksList: {
    marginBottom: 30,
  },
  linkItem: {
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
  linkIcon: {
    width: 40,
    alignItems: 'center',
  },
  linkInfo: {
    flex: 1,
    marginLeft: 10,
  },
  linkName: {
    fontSize: 16,
    color: colors.light,
  },
  linkUsername: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 5,
  },
  addLinkText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  formContainer: {
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    color: colors.light,
    marginBottom: 20,
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
  },
  cancelButtonText: {
    color: colors.light,
  },
  backButton: {
    marginTop: 20,
  },
});

export default EsportsLinksScreen;