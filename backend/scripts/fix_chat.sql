-- Adiciona o usuário bot se não existir
INSERT IGNORE INTO users (id, name, email, password, isAdmin) 
VALUES (0, 'FuriaBot', 'bot@furia.com', 'bot_password', 0);

-- Atualiza as mensagens existentes do bot para usar o userId correto
UPDATE chat_messages SET userId = 0 WHERE isBot = 1; 