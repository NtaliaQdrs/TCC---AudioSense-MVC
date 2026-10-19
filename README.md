# TCC---AudioSense---Ver.-MVC
Repositório do Audiosense - Versão com mvc 

## Executar localmente

1. Copie `.env.example` para `.env` na raiz do projeto.
2. Preencha as variáveis do PostgreSQL (`DB_*`), do Cloudflare R2 (`R2_*`) e `JWT_SECRET` com os valores do seu ambiente. Uploads dependem do R2; não use valores de exemplo como credenciais.
3. Instale as dependências com `npm ci` e inicie o servidor com `npm start`.

O `.env` contém segredos e está ignorado pelo Git. Não publique nem envie esses valores em mensagens. Sem configuração do banco e do bucket R2, o servidor não inicia corretamente.

### Login e cadastro com Google/Facebook

Para habilitar OAuth, crie clientes OAuth nas plataformas Google Cloud e Meta for Developers e configure no `.env`:

```env
APP_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/usuario/oauth/google/callback
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:3000/usuario/oauth/facebook/callback
FACEBOOK_GRAPH_VERSION=
```

Cadastre as URLs de callback exatamente como configuradas nos dois provedores; em produção, use o domínio HTTPS real (callbacks HTTP são aceitos apenas fora de produção). As variáveis `*_CALLBACK_URL` podem ser omitidas quando `APP_BASE_URL` estiver configurada. Solicite os escopos `openid`, `email` e `profile` ao Google e `email` e `public_profile` ao Facebook. No Facebook, configure o app para permitir os usuários previstos e revise as permissões exigidas pela Meta para o modo de produção. As credenciais são obrigatórias para habilitar cada provedor e nunca devem ser commitadas.

O cadastro social cria contas do tipo discente. Uma conta existente com o mesmo e-mail verificado é vinculada ao provedor; as regras atuais de status e aprovação de docentes continuam valendo. O Sequelize cria a tabela `oauth_identity` no próximo `sequelize.sync()` após a implantação. O servidor também precisa permitir conexões HTTPS de saída às APIs dos provedores.

## Funcionalidades e informações pendentes

- A pesquisa da navegação consulta tópicos do fórum, materiais didáticos e obras audiovisuais; em materiais, ignora acentos e tolera a omissão de uma letra duplicada. Ela não pesquisa páginas institucionais ou conteúdo de arquivos enviados.
- O conteúdo de novos tópicos no fórum tem limite de 280 caracteres, com contador no formulário e validação também no servidor.
- O painel `/admin/moderacao` reúne posts e materiais com denúncias pendentes, exibe a quantidade de denúncias por conteúdo e permite enviar aviso ao autor ou remover o conteúdo. O acesso exige sessão administrativa; a notificação interna é imediata e o e-mail é enviado em segundo plano quando configurado.
- As tags de tópicos são armazenadas em `publicacao_tag`. O `sequelize.sync()` da aplicação cria essa tabela em bancos existentes; instalações que usam `database.sql` devem aplicar também o bloco `CREATE TABLE publicacao_tag`.
- O repositório não informa URLs oficiais de redes sociais, o nome do grupo/instituição responsável, telefone de contato nem páginas de política de privacidade, termos de uso, perguntas frequentes ou suporte. Por isso, destinos sem confirmação foram removidos do rodapé; a atribuição identifica apenas o projeto AudioSense até que a instituição forneça o nome oficial.
