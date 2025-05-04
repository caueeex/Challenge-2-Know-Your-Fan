const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../config/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de imagens e documentos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.body.type ? './Uploads/Documents/' : './Uploads/ProfilePictures/';
    cb(null, uploadType);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens JPEG/JPG/PNG ou PDFs são permitidos!'));
  }
});

// Rota para obter o perfil do usuário
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('GET /profile chamado para userId:', req.user.id);
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('Usuário não encontrado para userId:', req.user.id);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    console.log('Perfil retornado:', { id: user.id, socialMedia: user.socialMedia });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      cpf: user.cpf,
      interests: user.interests ? JSON.parse(user.interests) : [],
      socialMedia: user.socialMedia ? JSON.parse(user.socialMedia) : {},
      esportsLinks: user.esportsLinks ? JSON.parse(user.esportsLinks) : {},
      points: user.points,
      badges: user.badges ? JSON.parse(user.badges) : [],
      isAdmin: user.isAdmin,
      profilePicture: user.profile_picture
    });
  } catch (error) {
    console.error('Erro em GET /profile:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para atualizar o perfil
router.post('/update', verifyToken, async (req, res) => {
  try {
    console.log('POST /update chamado para userId:', req.user.id, 'dados:', req.body);
    const { name, address, cpf, interests } = req.body;
    if (!name && !address && !cpf && !interests) {
      return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
    }
    
    const updateData = {
      name: name !== undefined ? name : undefined,
      address: address !== undefined ? address : undefined,
      cpf: cpf !== undefined ? cpf : undefined,
      interests: interests !== undefined ? interests : undefined
    };
    
    await User.updateProfile(req.user.id, updateData);
    
    const updatedUser = await User.findById(req.user.id);
    res.json({
      name: updatedUser.name,
      address: updatedUser.address,
      cpf: updatedUser.cpf,
      interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : [],
      profilePicture: updatedUser.profile_picture
    });
  } catch (error) {
    console.error('Erro em POST /update:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro ao atualizar perfil: ' + error.message });
  }
});

// Rota para upload de foto de perfil
router.post('/upload-profile-picture', verifyToken, upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('POST /upload-profile-picture chamado para userId:', req.user.id);
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem fornecida' });
    }
    
    const imagePath = `/Uploads/ProfilePictures/${req.file.filename}`;
    await User.updateProfilePicture(req.user.id, imagePath);
    
    res.json({ profilePicture: imagePath });
  } catch (error) {
    console.error('Erro em POST /upload-profile-picture:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro ao fazer upload da foto' });
  }
});

// Rota para obter documentos do usuário
router.get('/documents', verifyToken, async (req, res) => {
  try {
    console.log('GET /documents chamado para userId:', req.user.id);
    const documents = await User.getDocuments(req.user.id);
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Erro em GET /documents:', { message: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Erro ao obter documentos' });
  }
});

// Rota para upload de documentos
router.post('/upload-document', verifyToken, upload.single('document'), async (req, res) => {
  try {
    console.log('POST /upload-document chamado para userId:', req.user.id, 'body:', req.body, 'file:', req.file);
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Nenhum arquivo foi enviado' });
    }

    const validTypes = ['rg_cnh', 'proof_of_address', 'cpf'];
    if (!req.body.type || !validTypes.includes(req.body.type)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Tipo de documento inválido. Use: rg_cnh, proof_of_address ou cpf' });
    }

    const documentData = {
      type: req.body.type,
      originalName: req.file.originalname,
      storedName: req.file.filename
    };

    const result = await User.saveDocument(req.user.id, documentData);

    res.json({
      success: true,
      message: `Documento ${result.action === 'created' ? 'cadastrado' : 'atualizado'} com sucesso!`,
      document: {
        id: result.id,
        type: req.body.type,
        name: req.file.originalname,
        url: `/documents/${req.file.filename}`,
        uploadedAt: new Date().toISOString(),
        verified: false
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Erro em POST /upload-document:', { message: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: error.message || 'Erro ao processar upload do documento' });
  }
});

// Rota para adicionar redes sociais
router.post('/add-social-media', verifyToken, async (req, res) => {
  try {
    console.log('POST /add-social-media chamado para userId:', req.user.id, 'dados:', req.body);
    const { platform, url } = req.body;
    if (!platform || !url) {
      console.log('Validação falhou: platform ou url ausente');
      return res.status(400).json({ message: 'Plataforma e URL são obrigatórios' });
    }
    
    await User.addSocialMedia(req.user.id, platform, url);
    const user = await User.findById(req.user.id);
    console.log('Sucesso em POST /add-social-media para userId:', req.user.id, 'platform:', platform);
    res.json({ 
      success: true, 
      message: 'Rede social adicionada com sucesso',
      user: {
        points: user.points,
        badges: user.badges ? JSON.parse(user.badges) : []
      }
    });
  } catch (error) {
    console.error('Erro em POST /add-social-media:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro ao adicionar rede social: ' + error.message });
  }
});

// Rota para remover redes sociais
router.delete('/remove-social-media', verifyToken, async (req, res) => {
  try {
    console.log('DELETE /remove-social-media chamado:', {
      userId: req.user.id,
      body: req.body
    });
    const { platform } = req.body;
    if (!platform) {
      console.log('Validação falhou: platform ausente');
      return res.status(400).json({ message: 'Plataforma é obrigatória' });
    }
    
    await User.removeSocialMedia(req.user.id, platform);
    const user = await User.findById(req.user.id);
    console.log('Sucesso em DELETE /remove-social-media para userId:', req.user.id, 'platform:', platform);
    res.json({ 
      success: true, 
      message: 'Rede social removida com sucesso',
      user: {
        points: user.points,
        badges: user.badges ? JSON.parse(user.badges) : []
      }
    });
  } catch (error) {
    console.error('Erro em DELETE /remove-social-media:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Erro ao remover rede social: ' + error.message });
  }
});

// Rota para adicionar links de esports
router.post('/add-esports-link', verifyToken, async (req, res) => {
  try {
    console.log('POST /add-esports-link chamado:', {
      userId: req.user.id,
      body: req.body,
      headers: { authorization: req.headers.authorization?.substring(0, 20) + '...' }
    });
    const { platform, url } = req.body;
    if (!platform || !url) {
      console.log('Validação falhou: platform ou url ausente');
      return res.status(400).json({ message: 'Plataforma e URL são obrigatórios' });
    }
    
    await User.addEsportsLink(req.user.id, platform, url);
    console.log('Sucesso em POST /add-esports-link para userId:', req.user.id, 'platform:', platform, 'url:', url);
    res.json({ message: 'Link de esports adicionado com sucesso' });
  } catch (error) {
    console.error('Erro em POST /add-esports-link:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Erro ao adicionar link de esports: ' + error.message });
  }
});

// Rota para remover links de esports
router.delete('/remove-esports-link', verifyToken, async (req, res) => {
  try {
    console.log('DELETE /remove-esports-link chamado:', {
      userId: req.user.id,
      body: req.body
    });
    const { platform } = req.body;
    if (!platform) {
      console.log('Validação falhou: platform ausente');
      return res.status(400).json({ message: 'Plataforma é obrigatória' });
    }
    
    await User.removeEsportsLink(req.user.id, platform);
    console.log('Sucesso em DELETE /remove-esports-link para userId:', req.user.id, 'platform:', platform);
    res.json({ message: 'Link de esports removido com sucesso' });
  } catch (error) {
    console.error('Erro em DELETE /remove-esports-link:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Erro ao remover link de esports: ' + error.message });
  }
});

// Rota para listar todos os usuários (admin)
router.get('/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('GET /all chamado por admin userId:', req.user.id);
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Erro em GET /all:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para alternar status de admin
router.post('/toggle-admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('POST /toggle-admin/:id chamado para userId:', req.params.id, 'por admin:', req.user.id);
    await User.toggleAdmin(req.params.id);
    res.json({ message: 'Status de admin alternado com sucesso' });
  } catch (error) {
    console.error('Erro em POST /toggle-admin/:id:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;