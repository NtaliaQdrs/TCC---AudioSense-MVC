# TCC---AudioSense---Ver.-MVC
Repositório do Audiosense - Versão com mvc 

## Executar localmente

1. Copie `.env.example` para `.env` na raiz do projeto.
2. Preencha as variáveis do PostgreSQL (`DB_*`), do Cloudflare R2 (`R2_*`) e `JWT_SECRET` com os valores do seu ambiente. Uploads dependem do R2; não use valores de exemplo como credenciais.
3. Instale as dependências com `npm ci` e inicie o servidor com `npm start`.

O `.env` contém segredos e está ignorado pelo Git. Não publique nem envie esses valores em mensagens. Sem configuração do banco e do bucket R2, o servidor não inicia corretamente.

### Login e cadastro discente com Google

Configure as credenciais OAuth no `.env` e cadastre estas URLs de callback nos consoles dos provedores:

```env
APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/usuario/oauth/google/callback
```

`GOOGLE_CALLBACK_URL` pode ser omitida se `APP_BASE_URL` estiver definida. Em produção, use callback HTTPS e cadastre exatamente a mesma URL no Google Cloud. O cliente Google precisa permitir os escopos `openid`, `email` e `profile`. O cadastro social aparece apenas na tela de cadastro discente; a escolha inicial entre discente e docente permanece inalterada. O modelo cria a tabela `oauth_identity` durante o `sequelize.sync()`.

Uma identidade Google já cadastrada pode entrar pela tela de login. Se ainda não houver vínculo, um e-mail confirmado pelo Google pode ser associado à conta existente com o mesmo endereço; contas docentes continuam sujeitas às regras de aprovação existentes. Se não existir uma conta com esse endereço, o fluxo de cadastro cria uma conta discente. O projeto não contém credenciais do Google, portanto cada instalação precisa configurá-las antes de usar OAuth.

## Funcionalidades e informações pendentes

- A pesquisa da navegação consulta tópicos do fórum, materiais didáticos e obras audiovisuais; em materiais, ignora acentos e tolera a omissão de uma letra duplicada. Ela não pesquisa páginas institucionais ou conteúdo de arquivos enviados.
- O conteúdo de novos tópicos no fórum tem limite de 280 caracteres, com contador no formulário e validação também no servidor.
- O painel `/admin/moderacao` reúne posts e materiais com denúncias pendentes, exibe a quantidade de denúncias por conteúdo e permite enviar aviso ao autor ou remover o conteúdo. O acesso exige sessão administrativa; a notificação interna é imediata e o e-mail é enviado em segundo plano quando configurado.
- As tags de tópicos são armazenadas em `publicacao_tag`. O `sequelize.sync()` da aplicação cria essa tabela em bancos existentes; instalações que usam `database.sql` devem aplicar também o bloco `CREATE TABLE publicacao_tag`.
- O repositório não informa URLs oficiais de redes sociais, o nome do grupo/instituição responsável, telefone de contato nem páginas de política de privacidade, termos de uso, perguntas frequentes ou suporte. Por isso, destinos sem confirmação foram removidos do rodapé; a atribuição identifica apenas o projeto AudioSense até que a instituição forneça o nome oficial.
