# TCC---AudioSense---Ver.-MVC
Repositório do Audiosense - Versão com mvc 

## Executar localmente

1. Copie `.env.example` para `.env` na raiz do projeto.
2. Preencha as variáveis do PostgreSQL (`DB_*`), do Cloudflare R2 (`R2_*`) e `JWT_SECRET` com os valores do seu ambiente. Uploads dependem do R2; não use valores de exemplo como credenciais.
3. Instale as dependências com `npm ci` e inicie o servidor com `npm start`.

O `.env` contém segredos e está ignorado pelo Git. Não publique nem envie esses valores em mensagens. Sem configuração do banco e do bucket R2, o servidor não inicia corretamente.

### Login e cadastro discente com Google/Facebook

Configure as credenciais OAuth no `.env` e cadastre estas URLs de callback nos consoles dos provedores:

```env
APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/usuario/oauth/google/callback
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:3000/usuario/oauth/facebook/callback
FACEBOOK_GRAPH_VERSION=vXX.0
```

Use a versão do Graph API atualmente suportada pela Meta no lugar de `vXX.0`. As variáveis individuais de callback podem ser omitidas se `APP_BASE_URL` estiver definida. Em produção, use callbacks HTTPS e cadastre exatamente a mesma URL em cada provedor. O Google precisa permitir os escopos `openid`, `email` e `profile`; o Facebook precisa permitir `email` e `public_profile`. O cadastro social aparece apenas na tela de cadastro discente; a escolha inicial entre discente e docente permanece inalterada. O modelo cria a tabela `oauth_identity` durante o `sequelize.sync()`.

Uma identidade social já cadastrada pode entrar pela tela de login. Contas existentes não são vinculadas automaticamente por e-mail; se o endereço já pertencer a uma conta local, entre com e-mail e senha. O projeto não contém credenciais de provedor, portanto cada instalação precisa configurá-las antes de usar OAuth.

## Funcionalidades e informações pendentes

- A pesquisa da navegação consulta tópicos do fórum, materiais didáticos e obras audiovisuais; em materiais, ignora acentos e tolera a omissão de uma letra duplicada. Ela não pesquisa páginas institucionais ou conteúdo de arquivos enviados.
- O conteúdo de novos tópicos no fórum tem limite de 280 caracteres, com contador no formulário e validação também no servidor.
- O painel `/admin/moderacao` reúne posts e materiais com denúncias pendentes, exibe a quantidade de denúncias por conteúdo e permite enviar aviso ao autor ou remover o conteúdo. O acesso exige sessão administrativa; a notificação interna é imediata e o e-mail é enviado em segundo plano quando configurado.
- As tags de tópicos são armazenadas em `publicacao_tag`. O `sequelize.sync()` da aplicação cria essa tabela em bancos existentes; instalações que usam `database.sql` devem aplicar também o bloco `CREATE TABLE publicacao_tag`.
- O repositório não informa URLs oficiais de redes sociais, o nome do grupo/instituição responsável, telefone de contato nem páginas de política de privacidade, termos de uso, perguntas frequentes ou suporte. Por isso, destinos sem confirmação foram removidos do rodapé; a atribuição identifica apenas o projeto AudioSense até que a instituição forneça o nome oficial.
