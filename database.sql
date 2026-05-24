CREATE DATABASE audiosense_db;

USE audiosense_db;

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    nome_completo VARCHAR(100),
    email VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(24) NOT NULL,
    tipo_usuario ENUM('admin', 'docente', 'discente') NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    descricao VARCHAR(100),
    foto_perfil VARCHAR(255)
);

CREATE TABLE plataforma_streaming (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE obra_audiovisual (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    sinopse TEXT,
    poster_url VARCHAR(255),
    genero VARCHAR(100),
    tipo_obra ENUM('filme', 'serie', 'documentario', 'outro') NOT NULL,
    data_lancamento DATE
);

CREATE TABLE usuario_docente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL UNIQUE,
    comprovante_vinculo VARCHAR(255) NOT NULL,
    is_admin TINYINT(1) DEFAULT 0,                                                          
    status_aprovacao ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    informacao_adicional VARCHAR(300),
    motivo_rejeicao VARCHAR(500),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE recomendacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_docente_id INT NOT NULL,
    obra_audiovisual_id INT NOT NULL,
    plataforma_streaming_id INT NOT NULL,
    data_recomendacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_docente_id) REFERENCES usuario_docente(id),
    FOREIGN KEY (obra_audiovisual_id) REFERENCES obra_audiovisual(id),
    FOREIGN KEY (plataforma_streaming_id) REFERENCES plataforma_streaming(id)
);

CREATE TABLE solicitacao_admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_docente_id INT NOT NULL,
    status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_decisao DATETIME,
    admin_aprovador_id INT,
    motivo_rejeicao TEXT,
    justificativa TEXT,
    FOREIGN KEY (usuario_docente_id) REFERENCES usuario_docente(id),
    FOREIGN KEY (admin_aprovador_id) REFERENCES usuario(id)
);

CREATE TABLE disciplina (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE docente_disciplina (
    docente_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    PRIMARY KEY (docente_id, disciplina_id),
    FOREIGN KEY (docente_id) REFERENCES usuario_docente(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplina(id)
);

CREATE TABLE material_didatico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    tipo_material ENUM('texto', 'audio', 'video', 'imagem') NOT NULL,
    caminho_arquivo VARCHAR(255),
    caminho_audio_descricao VARCHAR(255),
    descricao TEXT,
    docente_id INT NOT NULL,
    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES usuario_docente(id)
);

CREATE TABLE usuario_discente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL UNIQUE,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE projeto_audiodescricao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    imagem_url VARCHAR(255),
    roteiro_texto TEXT,
    audio_final_url BLOB,
    status ENUM('pendente', 'em_revisao', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    discente_id INT NOT NULL,
    docente_id INT,
    data_submissao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_aprovacao DATETIME,
    descricao VARCHAR(100),
    FOREIGN KEY (discente_id) REFERENCES usuario_discente(id),
    FOREIGN KEY (docente_id) REFERENCES usuario_docente(id)
);

CREATE TABLE correcao_roteiro (
    id INT PRIMARY KEY AUTO_INCREMENT,
    texto_sugestao TEXT NOT NULL,
    data_correcao DATETIME DEFAULT CURRENT_TIMESTAMP,
    projeto_id INT NOT NULL,
    docente_id INT NOT NULL,
    FOREIGN KEY (projeto_id) REFERENCES projeto_audiodescricao(id),
    FOREIGN KEY (docente_id) REFERENCES usuario_docente(id)
);

CREATE TABLE avaliacao_material (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_didatico_id INT NOT NULL,
    discente_id INT NOT NULL,
    nota TINYINT NOT NULL,
    comentario TEXT,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_didatico_id) REFERENCES material_didatico(id),
    FOREIGN KEY (discente_id) REFERENCES usuario_discente(id)
);

CREATE TABLE publicacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    corpo_texto TEXT NOT NULL,
    imagem_url VARCHAR(255),
    video_url VARCHAR(255),
    usuario_id INT NOT NULL,
    data_postagem DATETIME DEFAULT CURRENT_TIMESTAMP,
    curtidas INT DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE comentario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    publicacao_id INT NOT NULL,
    usuario_id INT NOT NULL,
    texto_comentario TEXT NOT NULL,
    data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    resposta_a_comentario_id INT,
    FOREIGN KEY (publicacao_id) REFERENCES publicacao(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (resposta_a_comentario_id) REFERENCES comentario(id)
);

CREATE TABLE redefinicao_senha (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_em DATETIME NOT NULL,
  usado TINYINT(1) DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE notificacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  link VARCHAR(255) NULL,
  lida TINYINT(1) DEFAULT 0,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);