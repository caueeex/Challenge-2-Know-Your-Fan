const User = require('../models/User');

// Respostas pré-definidas do bot
const BOT_RESPONSES = {
  'jogo': 'O próximo jogo da FURIA será hoje às 20h contra MIBR.',
  'horário': 'Os jogos geralmente acontecem às 19h ou 20h. Confira nosso calendário oficial!',
  'ingresso': 'Os ingressos podem ser comprados no site oficial da FURIA ou na bilheteria do estádio.',
  'time': 'A FURIA tem times competitivos em CS:GO, Valorant, League of Legends e outros jogos.',
  'loja': 'Nossa loja oficial está disponível em https://furiashop.com.br',
  'default': 'Olá! Sou o FuriaBot. Posso te ajudar com informações sobre jogos, horários, ingressos e mais. Pergunte algo como "Quando é o próximo jogo?"'
};

exports.getChatHistory = async (req, res) => {
  try {
    const history = await User.getChatHistory();
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar histórico do chat' });
  }
};

exports.handleMessage = async (io, socket, message, userId) => {
  try {
    // Salva a mensagem do usuário
    await User.saveChatMessage(userId, message);
    
    // Envia a mensagem para todos
    const user = await User.findById(userId);
    io.emit('chat message', {
      userId: user.id,
      userName: user.name,
      message,
      isBot: false,
      timestamp: new Date()
    });
    
    // Verifica se a mensagem contém palavras-chave para o bot responder
    const lowerMessage = message.toLowerCase();
    let response = BOT_RESPONSES.default;
    
    for (const [keyword, botResponse] of Object.entries(BOT_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        response = botResponse;
        break;
      }
    }
    
    // Salva e envia a resposta do bot
    await User.saveChatMessage(0, response, true);
    io.emit('chat message', {
      userId: 0,
      userName: 'FuriaBot',
      message: response,
      isBot: true,
      timestamp: new Date()
    });
    
    // Adiciona pontos por interação no chat
    await User.addPoints(userId, 5);
    
    // Log da ação
    await User.logAction(userId, 'Enviou mensagem no chat');
  } catch (error) {
    console.error('Erro no handleMessage:', error);
  }
};