-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 04/05/2025 às 09:53
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `furiaapp`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `message` text NOT NULL,
  `isBot` tinyint(1) DEFAULT 0,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `userId`, `message`, `isBot`, `timestamp`) VALUES
(1, 1, 'Oi', 0, '2025-05-03 22:41:10'),
(3, 1, 'Oi', 0, '2025-05-03 23:27:03');

-- --------------------------------------------------------

--
-- Estrutura para tabela `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `logs`
--

INSERT INTO `logs` (`id`, `userId`, `action`, `timestamp`) VALUES
(1, 1, 'Usuário registrado', '2025-05-03 22:09:14'),
(2, 1, 'Usuário fez login', '2025-05-03 22:09:21'),
(3, 1, 'Usuário fez login', '2025-05-03 22:25:08'),
(4, 1, 'Usuário fez login', '2025-05-03 22:32:23'),
(5, 1, 'Usuário fez login', '2025-05-03 22:36:48'),
(6, 1, 'Usuário fez login', '2025-05-03 22:38:02'),
(7, 1, 'Usuário fez login', '2025-05-03 22:41:50'),
(8, 1, 'Usuário fez login', '2025-05-03 22:51:10'),
(9, 1, 'Usuário fez login', '2025-05-03 23:10:31'),
(10, 1, 'Usuário fez login', '2025-05-03 23:17:11'),
(11, 1, 'Usuário fez login', '2025-05-03 23:23:18'),
(12, 1, 'Usuário fez login', '2025-05-03 23:24:09'),
(13, 1, 'Usuário fez login', '2025-05-03 23:27:29'),
(14, 1, 'Usuário fez login', '2025-05-03 23:34:01'),
(15, 1, 'Usuário fez login', '2025-05-03 23:35:01'),
(16, 3, 'Usuário registrado', '2025-05-04 00:00:51'),
(17, 1, 'Usuário fez login', '2025-05-04 00:03:53'),
(18, 1, 'Usuário fez login', '2025-05-04 00:16:53'),
(19, 1, 'Usuário fez login', '2025-05-04 01:33:34'),
(20, 1, 'Usuário fez login', '2025-05-04 01:44:28'),
(21, 1, 'Usuário fez login', '2025-05-04 01:52:49'),
(22, 3, 'Usuário fez login', '2025-05-04 01:58:08'),
(23, 3, 'Usuário fez login', '2025-05-04 02:01:00'),
(24, 3, 'Usuário fez login', '2025-05-04 02:02:43'),
(25, 1, 'Usuário fez login', '2025-05-04 02:04:01'),
(26, 1, 'Usuário fez login', '2025-05-04 02:09:26'),
(27, 1, 'Usuário fez login', '2025-05-04 02:17:09'),
(28, 1, 'Usuário fez login', '2025-05-04 02:36:09'),
(29, 1, 'Usuário fez login', '2025-05-04 02:48:53'),
(30, 1, 'Usuário fez login', '2025-05-04 03:00:01'),
(31, 1, 'Usuário fez login', '2025-05-04 03:07:19'),
(32, 1, 'Usuário fez login', '2025-05-04 03:08:12'),
(33, 1, 'Usuário fez login', '2025-05-04 03:14:39'),
(34, 1, 'Usuário fez login', '2025-05-04 03:16:38'),
(35, 1, 'Usuário fez login', '2025-05-04 03:19:38'),
(36, 1, 'Usuário fez login', '2025-05-04 03:19:58'),
(37, 1, 'Usuário fez login', '2025-05-04 03:23:05'),
(38, 1, 'Usuário fez login', '2025-05-04 03:35:13'),
(39, 1, 'Usuário fez login', '2025-05-04 03:41:04'),
(40, 1, 'Usuário fez login', '2025-05-04 03:41:38'),
(41, 1, 'Usuário fez login', '2025-05-04 03:43:00'),
(42, 3, 'Usuário fez login', '2025-05-04 03:43:13'),
(43, 1, 'Usuário fez login', '2025-05-04 03:44:05'),
(44, 1, 'Usuário fez login', '2025-05-04 03:44:36'),
(45, 4, 'Usuário registrado', '2025-05-04 03:45:51'),
(46, 4, 'Usuário fez login', '2025-05-04 03:46:01'),
(47, 4, 'Usuário fez login', '2025-05-04 03:46:26'),
(48, 5, 'Usuário registrado', '2025-05-04 04:45:59'),
(49, 5, 'Usuário fez login', '2025-05-04 04:46:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `profile_picture` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `interests` text DEFAULT NULL,
  `socialMedia` text DEFAULT NULL,
  `esportsLinks` text DEFAULT NULL,
  `badges` text DEFAULT NULL,
  `points` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `is_admin`, `profile_picture`, `address`, `cpf`, `interests`, `socialMedia`, `esportsLinks`, `badges`, `points`) VALUES
(1, 'teste@gmail.com', '$2a$12$R9ALro0I2kNDs1pqdqNht.eIhzKO9/ZKX76AV1jIFaizbXlmmKIO2', 'testes', 1, '/Uploads/ProfilePictures/1746334401858-profile.jpg', 'Taubate', '123456789', '\"\\\"[]\\\"\"', '{\"facebook\":\"https://facebook.com/teste\",\"youtube\":\"https://youtube.com/furia\",\"instagram\":\"https://instagram.com/furia\"}', '{\"riot\":\"caueeex\"}', '[\"Foto do Perfil\"]', 35),
(2, 'bot@furia.com', 'bot_password', 'FuriaBot', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(3, 'Opa@gmail.com', '$2a$12$zVMDcaKujSuTiP8rAQqCte9cdt97Gn6HKwrp9.vj/UfbxOvwcQjYe', 'Opa', 0, '/Uploads/ProfilePictures/1746334695329-profile.jpg', 'Rua do Monique ', '12345689', '\"[]\"', '{}', '{}', NULL, 10),
(4, 'adm@furia.com', '$2a$12$AcnBvlsNZpYNbkCPdNgeA.YZINvyRSfwHY/dLMEA1fGd0oCHdMebC', 'adm', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0),
(5, 'furia@gmail.com', '$2a$12$Hi1Z9qedsa/EliqYZOxg4OeQNGDgbHSQ/1.NWLuqC.fR83Qlk7d5m', 'Furioso', 0, NULL, 'São Paulo', '123456789', '\"[]\"', '{\"youtube\":\"https://youtube.com/furia\"}', '{\"steam\":\"Cauê fúria\"}', NULL, 10);

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_actions`
--

CREATE TABLE `user_actions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `user_documents`
--

CREATE TABLE `user_documents` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `user_documents`
--

INSERT INTO `user_documents` (`id`, `user_id`, `document_type`, `file_name`, `file_path`, `verified`, `uploaded_at`) VALUES
(1, 1, 'proof_of_address', 'IMG-20241216-WA0148.jpg', '1746332043966-IMG-20241216-WA0148.jpg', 0, '2025-05-04 04:14:04'),
(2, 3, 'rg_cnh', 'IMG-20241216-WA0148.jpg', '1746335010886-IMG-20241216-WA0148.jpg', 0, '2025-05-04 05:03:30'),
(3, 5, 'rg_cnh', 'IMG-20241216-WA0148.jpg', '1746344828835-IMG-20241216-WA0148.jpg', 0, '2025-05-04 07:47:08');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Índices de tabela `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `user_actions`
--
ALTER TABLE `user_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `user_actions`
--
ALTER TABLE `user_actions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `user_actions`
--
ALTER TABLE `user_actions`
  ADD CONSTRAINT `user_actions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `user_documents`
--
ALTER TABLE `user_documents`
  ADD CONSTRAINT `user_documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
