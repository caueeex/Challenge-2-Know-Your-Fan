const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_pictures/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('profilePicture');

exports.uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    try {
      const imagePath = req.file.path;
      await User.updateProfilePicture(req.user.userId, imagePath);
      
      // Adiciona badge se for o primeiro upload
      await User.addBadge(req.user.userId, 'Foto do Perfil');
      await User.addPoints(req.user.userId, 15);
      
      // Log da ação
      await User.logAction(req.user.userId, 'Foto de perfil atualizada');
      
      res.json({ profilePicture: imagePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao atualizar foto de perfil' });
    }
  });
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Converter campos JSON para objetos
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      address: user.address,
      cpf: user.cpf,
      interests: user.interests ? JSON.parse(user.interests) : [],
      profilePicture: user.profile_picture,
      socialMedia: user.socialMedia ? JSON.parse(user.socialMedia) : {},
      esportsLinks: user.esportsLinks ? JSON.parse(user.esportsLinks) : {},
      points: user.points,
      badges: user.badges ? JSON.parse(user.badges) : [],
      isAdmin: user.isAdmin
    };
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, address, cpf, interests } = req.body;
    await User.updateProfile(req.user.userId, { name, address, cpf, interests });
    
    // Log da ação
    await User.logAction(req.user.userId, 'Perfil atualizado');
    
    res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar perfil' });
  }
};

exports.addSocialMedia = async (req, res) => {
  try {
    const { platform, url } = req.body;
    await User.addSocialMedia(req.user.userId, platform, url);
    
    // Adiciona badge se for a primeira rede social
    await User.addBadge(req.user.userId, 'Rede Social Vinculada');
    await User.addPoints(req.user.userId, 10);
    
    // Log da ação
    await User.logAction(req.user.userId, `Rede social adicionada: ${platform}`);
    
    res.json({ message: 'Rede social adicionada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar rede social' });
  }
};

exports.addEsportsLink = async (req, res) => {
  try {
    const { platform, url } = req.body;
    await User.addEsportsLink(req.user.userId, platform, url);
    
    // Adiciona badge se for o primeiro link
    await User.addBadge(req.user.userId, 'Link de E-sports');
    
    // Log da ação
    await User.logAction(req.user.userId, `Link de e-sports adicionado: ${platform}`);
    
    res.json({ message: 'Link de e-sports adicionado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao adicionar link de e-sports' });
  }
};