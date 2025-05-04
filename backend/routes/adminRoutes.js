const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyAdmin } = require('../config/auth');

// Todas as rotas exigem admin
router.use(verifyAdmin);

// Estatísticas
router.get('/stats', async (req, res) => {
  try {
    // Total de usuários
    const [[{ totalUsers }]] = await pool.query(
      'SELECT COUNT(*) as totalUsers FROM users'
    );

    // Novos usuários (últimos 7 dias)
    const [[{ newUsers }]] = await pool.query(
      `SELECT COUNT(*) as newUsers FROM users 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    // Usuários com redes sociais conectadas
    const [[{ usersWithSocial }]] = await pool.query(
      `SELECT COUNT(*) as usersWithSocial FROM users
       WHERE JSON_EXTRACT(social_media, '$.twitter') IS NOT NULL
       OR JSON_EXTRACT(social_media, '$.instagram') IS NOT NULL`
    );

    res.json({
      totalUsers,
      newUsers,
      usersWithSocial
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: error.message });
  }
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, is_admin as isAdmin FROM users'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Alternar status de admin
router.put('/users/:id/toggle-admin', async (req, res) => {
  try {
    await pool.query(
      'UPDATE users SET is_admin = NOT is_admin WHERE id = ?',
      [req.params.id]
    );
    
    // Registrar ação
    await pool.query(
      'INSERT INTO logs (userId, action) VALUES (?, ?)',
      [req.user.userId, `Alterou privilégios de admin para usuário ${req.params.id}`]
    );
    
    res.json({ message: 'Status de admin alterado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter logs
router.get('/logs', async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT l.*, u.name as userName FROM logs l
       JOIN users u ON l.userId = u.id
       ORDER BY l.timestamp DESC
       LIMIT 50`
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;