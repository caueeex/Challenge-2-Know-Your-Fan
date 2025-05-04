const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/auth');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Verifica se o usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Cria o usuário
    const userId = await User.create({ email, password: hashedPassword, name });
    
    // Gera token JWT
    const token = generateToken(userId);
    console.log('Token gerado (register):', token);
    
    // Log da ação
    await User.logAction(userId, 'Usuário registrado');
    
    res.status(201).json({ token, userId });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifica se o usuário existe
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verifica a senha
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gera token JWT
    const token = generateToken(user.id, user.is_admin);
    console.log('Token gerado (login):', token);
    
    // Log da ação
    await User.logAction(user.id, 'Usuário fez login');
    
    console.log('Resposta do login:', {
      token,
      userId: user.id,
      isAdmin: user.is_admin,
      name: user.name,
      profilePicture: user.profile_picture
    });
    
    res.json({ 
      token, 
      userId: user.id,
      isAdmin: user.is_admin,
      name: user.name,
      profilePicture: user.profile_picture
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};