const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create({ email, password, name }) {
    console.log('create chamado:', { email, name });
    const [result] = await db.execute(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, password, name]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    console.log('findByEmail chamado:', { email });
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    console.log('findById chamado:', { id });
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateProfile(id, data) {
    console.log('updateProfile chamado:', { id, data });
    const { name, address, cpf, interests } = data;
    
    const safeName = name !== undefined ? name : null;
    const safeAddress = address !== undefined ? address : null;
    const safeCpf = cpf !== undefined ? cpf : null;
    const safeInterests = interests !== undefined ? JSON.stringify(interests) : null;
    
    const [result] = await db.execute(
      'UPDATE users SET name = COALESCE(?, name), address = COALESCE(?, address), cpf = COALESCE(?, cpf), interests = COALESCE(?, interests) WHERE id = ?',
      [safeName, safeAddress, safeCpf, safeInterests, id]
    );
    console.log('Resultado de updateProfile:', result);
  }

  static async updateProfilePicture(id, imagePath) {
    console.log('updateProfilePicture chamado:', { id, imagePath });
    const [result] = await db.execute('UPDATE users SET profile_picture = ? WHERE id = ?', [imagePath, id]);
    console.log('Resultado de updateProfilePicture:', result);
  }

  static async addSocialMedia(id, platform, url) {
    console.log('addSocialMedia chamado:', { id, platform, url });
    const user = await this.findById(id);
    if (!user) {
      console.log('Usuário não encontrado:', { id });
      throw new Error('Usuário não encontrado');
    }
    let socialMedia = user.socialMedia ? JSON.parse(user.socialMedia || '{}') : {};
    socialMedia[platform] = url;
    
    const [result] = await db.execute('UPDATE users SET socialMedia = ? WHERE id = ?', 
      [JSON.stringify(socialMedia), id]);
    console.log('Resultado de addSocialMedia:', result);
  }

  static async removeSocialMedia(id, platform) {
    try {
      console.log('removeSocialMedia chamado:', { id, platform });
      const user = await this.findById(id);
      if (!user) {
        console.log('Usuário não encontrado:', { id });
        throw new Error('Usuário não encontrado');
      }
      let socialMedia = user.socialMedia ? JSON.parse(user.socialMedia || '{}') : {};
      console.log('socialMedia atual:', socialMedia);
      delete socialMedia[platform];
      const newSocialMedia = JSON.stringify(socialMedia);
      console.log('Novo socialMedia:', newSocialMedia);
      
      const [result] = await db.execute(
        'UPDATE users SET socialMedia = ? WHERE id = ?', 
        [newSocialMedia, id]
      );
      console.log('Resultado da query UPDATE em removeSocialMedia:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
    } catch (error) {
      console.error('Erro em removeSocialMedia:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async addEsportsLink(id, platform, url) {
    try {
      console.log('addEsportsLink chamado:', { id, platform, url });
      const user = await this.findById(id);
      if (!user) {
        console.log('Usuário não encontrado:', { id });
        throw new Error('Usuário não encontrado');
      }
      let esportsLinks = user.esportsLinks ? JSON.parse(user.esportsLinks || '{}') : {};
      console.log('esportsLinks atual:', esportsLinks);
      esportsLinks[platform] = url;
      const newEsportsLinks = JSON.stringify(esportsLinks);
      console.log('Novo esportsLinks:', newEsportsLinks);
      
      const [result] = await db.execute(
        'UPDATE users SET esportsLinks = ? WHERE id = ?', 
        [newEsportsLinks, id]
      );
      console.log('Resultado da query UPDATE em addEsportsLink:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
      
      await this.addPoints(id, 10);
      console.log('Pontos adicionados para userId:', id);
    } catch (error) {
      console.error('Erro em addEsportsLink:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async removeEsportsLink(id, platform) {
    try {
      console.log('removeEsportsLink chamado:', { id, platform });
      const user = await this.findById(id);
      if (!user) {
        console.log('Usuário não encontrado:', { id });
        throw new Error('Usuário não encontrado');
      }
      let esportsLinks = user.esportsLinks ? JSON.parse(user.esportsLinks || '{}') : {};
      console.log('esportsLinks atual:', esportsLinks);
      delete esportsLinks[platform];
      const newEsportsLinks = JSON.stringify(esportsLinks);
      console.log('Novo esportsLinks:', newEsportsLinks);
      
      const [result] = await db.execute(
        'UPDATE users SET esportsLinks = ? WHERE id = ?', 
        [newEsportsLinks, id]
      );
      console.log('Resultado da query UPDATE em removeEsportsLink:', {
        affectedRows: result.affectedRows,
        changedRows: result.changedRows
      });
    } catch (error) {
      console.error('Erro em removeEsportsLink:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  static async addPoints(id, points) {
    console.log('addPoints chamado:', { id, points });
    const [result] = await db.execute('UPDATE users SET points = points + ? WHERE id = ?', [points, id]);
    console.log('Resultado de addPoints:', {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    });
  }

  static async addBadge(id, badgeName) {
    console.log('addBadge chamado:', { id, badgeName });
    const user = await this.findById(id);
    if (!user) {
      console.log('Usuário não encontrado:', { id });
      throw new Error('Usuário não encontrado');
    }
    let badges = user.badges ? JSON.parse(user.badges) : [];
    if (!badges.includes(badgeName)) {
      badges.push(badgeName);
      const [result] = await db.execute('UPDATE users SET badges = ? WHERE id = ?', 
        [JSON.stringify(badges), id]);
      console.log('Resultado de addBadge:', result);
    }
  }

  static async getAllUsers() {
    console.log('getAllUsers chamado');
    const [rows] = await db.execute('SELECT id, name, email, isAdmin FROM users');
    return rows;
  }

  static async toggleAdmin(id) {
    console.log('toggleAdmin chamado:', { id });
    const [result] = await db.execute('UPDATE users SET isAdmin = !isAdmin WHERE id = ?', [id]);
    console.log('Resultado de toggleAdmin:', result);
  }

  static async logAction(userId, action) {
    console.log('logAction chamado:', { userId, action });
    const [result] = await db.execute(
      'INSERT INTO logs (userId, action) VALUES (?, ?)',
      [userId, action]
    );
    console.log('Resultado de logAction:', result);
  }

  static async getLogs() {
    console.log('getLogs chamado');
    const [rows] = await db.execute(
      'SELECT l.*, u.name as userName FROM logs l JOIN users u ON l.userId = u.id ORDER BY l.timestamp DESC LIMIT 50'
    );
    return rows;
  }

  static async saveChatMessage(userId, message, isBot = false) {
    console.log('saveChatMessage chamado:', { userId, isBot });
    const [result] = await db.execute(
      'INSERT INTO chat_messages (userId, message, isBot) VALUES (?, ?, ?)',
      [userId, message, isBot]
    );
    console.log('Resultado de saveChatMessage:', result);
    return result.insertId;
  }

  static async getChatHistory(limit = 50) {
    console.log('getChatHistory chamado:', { limit });
    const [rows] = await db.execute(
      'SELECT cm.*, u.name as userName FROM chat_messages cm JOIN users u ON cm.userId = u.id ORDER BY cm.timestamp DESC LIMIT ?',
      [limit]
    );
    return rows.reverse();
  }

  static async getDocuments(userId) {
    console.log('getDocuments chamado:', { userId });
    const [rows] = await db.execute(
      `SELECT 
        id,
        document_type AS type,
        file_name AS name,
        CONCAT('/documents/', file_path) AS url,
        uploaded_at AS uploadedAt,
        verified
      FROM user_documents 
      WHERE user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async saveDocument(userId, documentData) {
    console.log('saveDocument chamado:', { userId, documentData });
    if (!userId || typeof userId !== 'number') {
      throw new Error('ID do usuário inválido');
    }
  
    const { type, originalName, storedName } = documentData;
  
    if (!type || !['rg_cnh', 'proof_of_address', 'cpf'].includes(type)) {
      throw new Error('Tipo de documento inválido');
    }
  
    if (!originalName || typeof originalName !== 'string') {
      throw new Error('Nome original do documento inválido');
    }
  
    if (!storedName || typeof storedName !== 'string') {
      throw new Error('Nome de armazenamento do documento inválido');
    }
  
    try {
      const [existing] = await db.execute(
        'SELECT id FROM user_documents WHERE user_id = ? AND document_type = ?',
        [userId, type]
      );
  
      if (existing.length > 0) {
        const [result] = await db.execute(
          'UPDATE user_documents SET file_name = ?, file_path = ?, verified = 0, uploaded_at = CURRENT_TIMESTAMP WHERE id = ?',
          [originalName, storedName, existing[0].id]
        );
        console.log('Resultado de saveDocument (atualização):', result);
        return {
          id: existing[0].id,
          action: 'updated'
        };
      } else {
        const [result] = await db.execute(
          'INSERT INTO user_documents (user_id, document_type, file_name, file_path) VALUES (?, ?, ?, ?)',
          [userId, type, originalName, storedName]
        );
        console.log('Resultado de saveDocument (inserção):', result);
        return {
          id: result.insertId,
          action: 'created'
        };
      }
    } catch (error) {
      console.error('Erro em saveDocument:', { message: error.message, stack: error.stack });
      throw new Error('Falha ao salvar documento no banco de dados');
    }
  }

  static async verifyDocument(documentId) {
    console.log('verifyDocument chamado:', { documentId });
    const [result] = await db.execute(
      'UPDATE user_documents SET verified = TRUE WHERE id = ?',
      [documentId]
    );
    console.log('Resultado de verifyDocument:', result);
  }

  static async deleteDocument(documentId) {
    console.log('deleteDocument chamado:', { documentId });
    const [result] = await db.execute(
      'DELETE FROM user_documents WHERE id = ?',
      [documentId]
    );
    console.log('Resultado de deleteDocument:', result);
  }
}

module.exports = User;