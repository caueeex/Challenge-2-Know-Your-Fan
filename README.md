# FuriaApp 🎮

![FuriaApp Banner](frontend/assets/furia-banner.png)

FuriaApp é uma plataforma mobile completa desenvolvida para a comunidade de e-sports da FURIA, oferecendo uma experiência integrada de interação, gamificação e conexão social.

## 🚀 Visão Geral

FuriaApp é uma aplicação full-stack que conecta fãs de e-sports, oferecendo recursos de chat em tempo real, sistema de pontos e badges, integração com redes sociais, e muito mais. A plataforma foi desenvolvida com foco na experiência do usuário e na construção de uma comunidade engajada.

## ✨ Funcionalidades Principais

### 🏆 Sistema de Gamificação
- Pontos por participação
- Badges por conquistas
- Rankings e estatísticas
- Desafios diários

### 👤 Perfil Personalizado
- Upload de foto de perfil
- Informações pessoais
- Histórico de atividades
- Conquistas e badges

### 🔗 Integrações Sociais
- Conexão com redes sociais
- Links de perfis de e-sports
- Compartilhamento de conquistas
- Interação com outros fãs

### 📱 Interface Moderna
- Design responsivo
- Animações fluidas
- Tema escuro
- Navegação intuitiva

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MySQL
- Socket.IO
- JWT Authentication
- Multer (Upload de arquivos)
- Bcrypt (Criptografia)

### Frontend
- React Native
- Expo
- React Navigation
- Context API
- Socket.IO Client
- React Native Animatable
- React Native Chart Kit

## 📦 Estrutura do Projeto

```
furia-app/
├── backend/                 # Backend Node.js/Express
│   ├── config/             # Configurações
│   ├── controllers/        # Controladores
│   ├── models/            # Modelos
│   ├── routes/            # Rotas
│   ├── services/          # Serviços
│   ├── uploads/           # Arquivos uploadados
│   └── server.js          # Ponto de entrada
│
└── frontend/              # Frontend React Native
    ├── assets/           # Recursos estáticos
    ├── components/       # Componentes reutilizáveis
    ├── constants/        # Constantes e configurações
    ├── context/          # Contexto global
    ├── navigation/       # Configuração de navegação
    ├── screens/          # Telas da aplicação
    ├── services/         # Serviços de API
    └── App.js           # Ponto de entrada
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v14 ou superior)
- MySQL
- Expo CLI (para desenvolvimento mobile)

### Backend
1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure o banco de dados:
- Crie um arquivo `.env` com as configurações do banco
- Execute os scripts SQL necessários

3. Inicie o servidor:
```bash
npm run dev
```

### Frontend
1. Instale as dependências:
```bash
cd frontend
npm install
```

2. Inicie o aplicativo:
```bash
npm start
```

3. Escaneie o QR code com o app Expo Go

## 🔒 Segurança

- Autenticação JWT
- Criptografia de senhas
- Validação de tokens
- CORS configurado
- Proteção de rotas
- Sanitização de inputs

## 📈 Próximos Passos

- [ ] Implementação de notificações push
- [ ] Sistema de eventos ao vivo
- [ ] Integração com mais plataformas de e-sports
- [ ] Melhorias no sistema de gamificação
- [ ] Análise de dados e métricas

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para [seu-email@exemplo.com] ou abra uma issue no GitHub.

---

Desenvolvido com ❤️ pela equipe FuriaApp 
