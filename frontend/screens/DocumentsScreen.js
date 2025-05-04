import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const API_URL = 'http://192.168.0.10:5000/api';

const documentTypes = [
  { id: 1, name: 'RG ou CNH', key: 'rg_cnh', icon: 'id-card', mimeTypes: ['image/*', 'application/pdf'] },
  { id: 2, name: 'Comprovante de Residência', key: 'proof_of_address', icon: 'home', mimeTypes: ['image/*', 'application/pdf'] },
  { id: 3, name: 'CPF', key: 'cpf', icon: 'document', mimeTypes: ['image/*', 'application/pdf'] },
];

const DocumentsScreen = () => {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState({});
  const [progress, setProgress] = useState(0);


  const pickDocument = async (docKey) => {
    setSelectedDoc(docKey);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: documentTypes.find(doc => doc.key === docKey).mimeTypes,
      });
      
      if (!result.canceled) {
        await uploadDocument(docKey, result.assets[0]);
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o documento');
    }
  };

  // Carrega os documentos ao focar na tela
  useEffect(() => {
    if (isFocused) {
      fetchDocuments();
    }
  }, [isFocused]);

  // Buscar documentos
const fetchDocuments = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/documents`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    
    if (response.data.success) {
      setDocuments(response.data.documents);
    }
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    // Não mostra erro para 404 (primeiro acesso)
    if (error.response?.status !== 404) {
      Alert.alert('Erro', 'Não foi possível carregar os documentos');
    }
  }
};

// Upload de documento
const uploadDocument = async (docKey, file) => {
  setUploading(true);
  setProgress(0);

  try {
    const formData = new FormData();
    formData.append('document', {
      uri: file.uri,
      name: file.name,  // originalName
      type: file.mimeType || 'application/octet-stream'
    });
    formData.append('type', docKey); // 'rg_cnh', 'proof_of_address' ou 'cpf'

    const response = await axios.post(
      `${API_URL}/user/upload-document`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        },
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      }
    );

    if (response.data.success) {
      await fetchDocuments();
      Alert.alert('Sucesso', response.data.message);
    }
  } catch (error) {
    let errorMessage = 'Falha no upload';
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }
    Alert.alert('Erro', errorMessage);
  } finally {
    setUploading(false);
  }
};

  const viewDocument = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o documento');
      });
    }
  };

  const getDocumentStatus = (doc) => {
    if (!doc) return null;
    
    if (doc.verified) {
      return { text: 'Verificado', color: colors.success };
    } else if (doc.url) {
      return { text: 'Em análise', color: colors.warning };
    }
    return null;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Documentos</Text>
        <Text style={styles.subtitle}>Envie seus documentos para validação</Text>
        
        <View style={styles.documentsList}>
          {documentTypes.map((doc) => {
            const document = documents[doc.key];
            const isUploading = uploading && selectedDoc === doc.key;
            const status = getDocumentStatus(document);
            
            return (
              <Animatable.View 
                key={doc.id}
                animation="fadeInUp"
                duration={500}
                delay={doc.id * 100}
                style={[
                  styles.documentItem,
                  document?.url && styles.uploadedItem,
                ]}
              >
                <View style={styles.documentIcon}>
                  <Ionicons 
                    name={doc.icon} 
                    size={24} 
                    color={document?.url ? colors.primary : colors.light} 
                  />
                </View>
                
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>{doc.name}</Text>
                  
                  {document?.url && (
                    <>
                      <TouchableOpacity onPress={() => viewDocument(document.url)}>
                        <Text style={styles.documentLink} numberOfLines={1}>
                          {document.name}
                        </Text>
                      </TouchableOpacity>
                      <Text style={styles.documentDate}>
                        Enviado em: {document.uploadedAt}
                      </Text>
                    </>
                  )}
                  
                  {status && (
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  )}
                </View>
                
                {isUploading ? (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>{progress}%</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                  </View>
                ) : document?.url ? (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : (
                  <TouchableOpacity
                    onPress={() => pickDocument(doc.key)}
                    style={styles.uploadButton}
                    disabled={uploading}
                  >
                    <Text style={styles.uploadButtonText}>Enviar</Text>
                  </TouchableOpacity>
                )}
              </Animatable.View>
            );
          })}
        </View>
        
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.noteText}>
            Documentos aceitos: JPG, PNG ou PDF (máx. 5MB). Seus dados estão seguros conosco.
          </Text>
        </View>
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
  documentsList: {
    marginBottom: 30,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  uploadedItem: {
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  documentIcon: {
    width: 40,
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  documentName: {
    fontSize: 16,
    color: colors.light,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  documentLink: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
    marginBottom: 3,
  },
  documentDate: {
    fontSize: 12,
    color: colors.gray,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  statusText: {
    fontSize: 12,
    color: colors.light,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  uploadButtonText: {
    color: colors.dark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  progressText: {
    fontSize: 12,
    color: colors.light,
    marginBottom: 3,
  },
  progressBar: {
    height: 4,
    width: 60,
    backgroundColor: colors.gray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.light,
  },
});

export default DocumentsScreen;