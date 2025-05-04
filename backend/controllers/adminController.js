const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

exports.toggleAdmin = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  try {
    await User.toggleAdmin(req.params.id);
    
    // Log da ação
    await User.logAction(req.user.userId, `Alterou privilégios de admin para usuário ${req.params.id}`);
    
    res.json({ message: 'Privilégios de admin alterados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao alterar privilégios' });
  }
};

exports.getLogs = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  
  try {
    const logs = await User.getLogs();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar logs' });
  }
};