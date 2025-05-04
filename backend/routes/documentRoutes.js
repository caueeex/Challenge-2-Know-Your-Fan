const express = require('express');
const router = express.Router();
const { verifyToken } = require('../config/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Adicionado import do db

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/documents');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, uniqueSuffix + '-' + sanitizedName);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Apenas imagens (JPEG/JPG/PNG) e PDFs são permitidos!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
}).single('document'); // Alterado para usar .single() diretamente

// Middleware para tratamento de erros do multer
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'O arquivo é muito grande (máximo 5MB)' 
        : 'Erro no upload do arquivo'
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Rota GET para listar documentos
router.get('/', verifyToken, async (req, res) => {
  try {
    const documents = await User.getDocuments(req.user.id);
    
    res.json({
      success: true,
      documents: documents.reduce((acc, doc) => {
        acc[doc.type] = {
          id: doc.id,
          name: doc.name,
          url: doc.url,
          uploadedAt: doc.uploadedAt,
          verified: Boolean(doc.verified)
        };
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao buscar documentos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rota POST para upload
router.post('/upload', verifyToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return handleUploadErrors(err, req, res);
    }

    try {
      // Validação do arquivo
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nenhum arquivo foi enviado' 
        });
      }

      // Validação do tipo de documento
      const validTypes = ['rg_cnh', 'proof_of_address', 'cpf'];
      if (!req.body.type || !validTypes.includes(req.body.type)) {
        // Remove o arquivo enviado se o tipo for inválido
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false, 
          message: 'Tipo de documento inválido. Use: rg_cnh, proof_of_address ou cpf' 
        });
      }

      // Salva no banco de dados
      const documentId = await User.saveDocument(req.user.id, {
        type: req.body.type,
        originalName: req.file.originalname,
        storedName: req.file.filename
      });

      // Resposta de sucesso
      res.json({
        success: true,
        message: 'Documento enviado com sucesso!',
        document: {
          id: documentId,
          type: req.body.type,
          name: req.file.originalname,
          url: `/documents/${req.file.filename}`,
          uploadedAt: new Date().toISOString(),
          verified: false
        }
      });

    } catch (error) {
      // Remove o arquivo em caso de erro
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Erro no upload:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar upload do documento',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

module.exports = router;