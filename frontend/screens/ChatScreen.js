import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import Button from '../components/Button';
import Toast from 'react-native-toast-message';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, socket } = useAuth();
  const scrollViewRef = useRef();

  useEffect(() => {
    console.log('Estado inicial:', { user: !!user, socket: !!socket, socketConnected: socket?.connected });
    
    if (!user || !socket) {
      setError('Usuário ou conexão não disponíveis. Tente fazer login novamente.');
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (loading) {
        setError(`Tempo esgotado ao conectar ao servidor. Socket conectado: ${socket.connected}`);
        setLoading(false);
      }
    }, 10000);

    socket.on('connect', () => {
      console.log('Socket conectado:', socket.id);
      setError(null);
      setLoading(false);
      clearTimeout(timeout);
    });

    socket.on('new_message', (msg) => {
      console.log('Nova mensagem recebida:', msg);
      setMessages(prev => [...prev, {
        ...msg,
        timestamp: new Date(msg.timestamp)
      }]);
    });

    socket.on('chat_history', (history) => {
      console.log('Histórico recebido:', history);
      setMessages(history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
      setLoading(false);
      clearTimeout(timeout);
    });

    socket.on('connect_error', (err) => {
      console.error('Erro de conexão com o socket:', err.message);
      setError(`Falha na conexão: ${err.message}`);
      setLoading(false);
      clearTimeout(timeout);
    });

    socket.on('error', (err) => {
      console.error('Erro do servidor:', err.message);
      setError(err.message);
      setLoading(false);
      clearTimeout(timeout);
    });

    if (!socket.connected) {
      console.log('Tentando conectar socket...');
      socket.connect();
    }

    return () => {
      clearTimeout(timeout);
      socket.off('connect');
      socket.off('new_message');
      socket.off('chat_history');
      socket.off('connect_error');
      socket.off('error');
    };
  }, [socket, user]);

  const sendMessage = () => {
    if (!message.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Mensagem vazia',
        text2: 'Digite uma mensagem para enviar.',
      });
      return;
    }

    if (!socket || !user || !user.userId) {
      console.error('Dados inválidos para envio:', { socket: !!socket, user: user });
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário ou conexão não disponível.',
      });
      return;
    }

    try {
      const msgData = {
        userId: Number(user.userId),
        userName: user.name || 'Usuário',
        message: message.trim(),
        isBot: false,
        timestamp: new Date().toISOString()
      };
      console.log('Enviando mensagem:', msgData);
      socket.emit('chat_message', msgData);
      setMessage('');
      Toast.show({
        type: 'success',
        text1: 'Mensagem enviada',
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar mensagem',
        text2: 'Tente novamente.',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Tentar novamente"
          onPress={() => {
            setLoading(true);
            setError(null);
            socket?.connect();
          }}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messagesContainer}
        >
          {messages.length === 0 ? (
            <Text style={styles.noMessagesText}>Nenhuma mensagem ainda. Comece a conversar!</Text>
          ) : (
            messages.map((msg, index) => (
              <View 
                key={msg.id || `msg-${index}`}
                style={[
                  styles.messageBubble,
                  msg.userId === user?.userId && styles.userMessage,
                  msg.isBot && styles.botMessage,
                ]}
              >
                {!msg.isBot && msg.userId !== user?.userId && (
                  <Text style={styles.senderName}>{msg.userName || 'Usuário'}</Text>
                )}
                <Text style={[
                  styles.messageText,
                  (msg.userId === user?.userId || msg.isBot) && styles.messageTextAlt,
                ]}>
                  {msg.message}
                </Text>
                <Text style={[
                  styles.messageTime,
                  (msg.userId === user?.userId || msg.isBot) && styles.messageTimeAlt,
                ]}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.gray}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <Button
            title="Enviar"
            onPress={sendMessage}
            style={styles.sendButton}
            textStyle={styles.sendButtonText}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  chatContainer: {
    flex: 1,
    padding: 15,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  messageBubble: {
    backgroundColor: colors.darkGray,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#333',
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  senderName: {
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
  },
  messageText: {
    color: colors.light,
    fontSize: 16,
  },
  messageTextAlt: {
    color: colors.dark,
  },
  messageTime: {
    color: colors.gray,
    fontSize: 10,
    textAlign: 'right',
    marginTop: 5,
  },
  messageTimeAlt: {
    color: colors.dark,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    color: colors.light,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  sendButtonText: {
    color: colors.dark,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark,
  },
  loadingText: {
    color: colors.light,
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark,
    padding: 20,
  },
  errorText: {
    color: colors.light,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  noMessagesText: {
    color: colors.gray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatScreen;