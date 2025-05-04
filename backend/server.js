const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const path = require('path');
const { verifyToken, verifyAdmin } = require('./config/auth');

const pool = require('./config/db');
require('dotenv').config();

console.log('JWT_SECRET carregado:', !!process.env.JWT_SECRET);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:19006", "exp://192.168.0.10:19000", "http://192.168.0.10:19000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:19006', 'exp://192.168.0.10:19000', 'http://192.168.0.10:19000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', documentRoutes); // Adiciona as rotas de documentos


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Função para gerar respostas do bot
const generateBotResponse = async (message, socket) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return 'Mensagem inválida. Por favor, envie uma mensagem válida!';
  }

  const lowerMessage = message.toLowerCase().trim();
  
  const responses = [
    {
      keywords: ['oi', 'olá', 'eai', 'ei'],
      response: [
        'Oi! Sou o FuriaBot, pronto pra ajudar! 😎 Como posso te ajudar hoje?',
        'E aí! Tô aqui pra dar um gás na sua experiência! 🚀 O que quer saber?',
        'Olá! Bem-vindo ao chat da Furia! 😄 Qual é a boa?'
      ]
    },
    {
      keywords: ['quem é você', 'quem é furia', 'o que é furia'],
      response: 'Eu sou o FuriaBot, criado pela equipe FuriaApp! A Furia é uma comunidade apaixonada por jogos e tecnologia. Quer saber mais?'
    },
    {
      keywords: ['como jogar', 'jogo', 'games'],
      response: 'Quer dicas sobre jogos? 🎮 Me conta qual é o seu game favorito ou se quer sugestões!'
    },
    {
      keywords: ['pontos', 'badge', 'recompensa'],
      response: 'Os pontos e badges são conquistados participando da comunidade! Envie mensagens, conecte suas redes sociais ou complete desafios no app. Quer saber quantos pontos você tem?'
    },
    {
      keywords: ['perfil', 'editar perfil', 'foto de perfil'],
      response: 'Para editar seu perfil, vá até a tela de Perfil no app e clique em "Editar Perfil". Você pode mudar seu nome, endereço, CPF, interesses e até adicionar uma foto! 📸'
    },
    {
      keywords: ['ajuda', 'suporte', 'problema'],
      response: 'Precisa de ajuda? Me conta o que tá acontecendo que eu te oriento! 😊'
    },
    {
      keywords: ['?'],
      response: 'Hmm, parece uma pergunta interessante! 🤔 Pode mandar mais detalhes que eu te respondo direitinho!'
    },
    {
      keywords: ['obrigado', 'valeu', 'agradeço'],
      response: 'De nada! 😄 Tô aqui pra ajudar sempre que precisar!'
    },
    {
      keywords: ['/pontos'],
      response: async (socket) => {
        const [user] = await pool.query('SELECT points FROM users WHERE id = ?', [socket.userId]);
        return `Você tem ${user[0].points || 0} pontos! Continue participando para ganhar mais!`;
      }
    },
    {
      keywords: ['/perfil'],
      response: async (socket) => {
        const [user] = await pool.query('SELECT name, points, badges FROM users WHERE id = ?', [socket.userId]);
        return `Seu perfil: Nome: ${user[0].name}, Pontos: ${user[0].points}, Badges: ${JSON.parse(user[0].badges || '[]').join(', ') || 'Nenhum'}`;
      }
    },
    {
      keywords: ['/ajuda', '/comandos'],
      response: 'Comandos disponíveis: /pontos (ver pontos), /perfil (ver perfil), /ajuda (lista de comandos).'
    }
  ];

  for (const { keywords, response } of responses) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      if (typeof response === 'function') {
        return await response(socket);
      }
      return Array.isArray(response) ? response[Math.floor(Math.random() * response.length)] : response;
    }
  }

  return 'Não entendi direito, mas tô aqui pra ajudar! 😄 Pode mandar sua dúvida de novo ou perguntar algo diferente!';
};

// Socket.IO com MySQL
io.on('connection', (socket) => {
  console.log('Novo cliente conectado:', socket.id);
  
  socket.on('authenticate', async (token) => {
    try {
      if (!token) {
        throw new Error('Token não fornecido');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Payload do JWT:', decoded);
      socket.userId = decoded.id;
      if (!socket.userId) {
        throw new Error('ID do usuário não encontrado no token');
      }
      console.log('Usuário autenticado:', socket.userId);
      
      const [messages] = await pool.query(`
        SELECT cm.*, u.name as userName 
        FROM chat_messages cm
        LEFT JOIN users u ON cm.userId = u.id
        WHERE cm.userId = u.id OR cm.isBot = 1
        ORDER BY cm.timestamp DESC
        LIMIT 50
      `);
      
      socket.emit('chat_history', messages.reverse());
    } catch (error) {
      console.error('Erro na autenticação do socket:', error.message);
      socket.emit('error', { message: `Autenticação falhou: ${error.message}` });
    }
  });

  socket.on('chat_message', async (msgData) => {
    try {
      console.log('Mensagem recebida:', msgData);
      const { userId, userName = 'Usuário', message, isBot = false } = msgData;
      
      if (!userId || !message) {
        console.error('Dados de mensagem inválidos:', { userId, message });
        socket.emit('error', { message: `Dados de mensagem inválidos: userId=${userId}, message=${message}` });
        return;
      }
      
      // Para mensagens do bot, usamos userId = 0
      const actualUserId = isBot ? 0 : userId;
      
      await pool.query(
        'INSERT INTO chat_messages (userId, message, isBot) VALUES (?, ?, ?)',
        [actualUserId, message, isBot]
      );
      
      const [[newMessage]] = await pool.query(`
        SELECT cm.*, COALESCE(u.name, 'FuriaBot') as userName 
        FROM chat_messages cm
        LEFT JOIN users u ON cm.userId = u.id
        WHERE cm.id = LAST_INSERT_ID()
      `);
      
      io.emit('new_message', {
        ...newMessage,
        timestamp: new Date(newMessage.timestamp)
      });
      
      if (!isBot) {
        const botResponseMessage = await generateBotResponse(message, socket);
        const botResponse = {
          userId: 0,
          userName: 'FuriaBot',
          message: botResponseMessage,
          isBot: true,
          timestamp: new Date()
        };
        
        await pool.query(
          'INSERT INTO chat_messages (userId, message, isBot) VALUES (?, ?, ?)',
          [0, botResponse.message, true]
        );
        
        io.emit('new_message', botResponse);
      }
    } catch (error) {
      console.error('Erro no processamento da mensagem:', error.message);
      socket.emit('error', { message: `Erro ao processar mensagem: ${error.message}` });
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('FuriaApp Backend está rodando');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});