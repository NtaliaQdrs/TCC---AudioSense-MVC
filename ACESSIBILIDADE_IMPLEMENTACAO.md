# Acessibilidade no AudioSense

O projeto inclui suporte a preferências de acessibilidade (contraste, escala de fonte, sublinhado, fonte legível, guia de leitura e redução de movimento) e padrões para navegação por teclado e tecnologias assistivas. Essas funcionalidades ajudam no acesso, mas **não constituem certificação de conformidade nem garantem acessibilidade completa em todas as páginas e combinações de navegador/leitor de tela**.

## Padrões compartilhados

- O layout define o idioma da página, landmarks de cabeçalho, navegação, conteúdo principal e rodapé, além de um link para pular ao conteúdo.
- Controles interativos têm indicador de foco visível; elementos visuais de foco não dependem apenas de cor.
- Menus fechados são removidos da navegação por teclado e da árvore de acessibilidade. As abas do perfil aceitam setas, Home e End.
- Painéis laterais móveis fechados tornam-se inertes; Escape fecha o painel e devolve o foco ao botão que o abriu.
- Preferências de redução de movimento também respeitam a opção equivalente do sistema operacional.
- Caixas de diálogo de denúncia, perfil e conta mantêm o foco dentro do diálogo, escondem o conteúdo de fundo e devolvem o foco ao controle de abertura.
- Campos de arquivo podem ser acionados por teclado; o nome do arquivo selecionado é comunicado junto ao controle.
- Não há foco forçado no título ao abrir cada página, para evitar interromper o fluxo de navegação do leitor de tela.

## Ao criar ou editar conteúdo

- Imagens informativas precisam de texto alternativo que descreva seu propósito; imagens decorativas devem usar `alt=""`.
- Vídeos e áudios publicados precisam de legendas, transcrição ou roteiro textual adequado ao conteúdo. A plataforma não consegue gerar nem validar automaticamente essas alternativas.
- Use títulos em ordem lógica, rótulos visíveis associados aos campos, instruções antes dos formulários e mensagens de erro ligadas aos campos correspondentes.
- Controles criados por JavaScript devem expor seu nome e estado acessíveis, funcionar com teclado e anunciar atualizações importantes sem mover o foco indevidamente.

## Validação necessária

As verificações de código e compilação não substituem testes manuais. Antes de afirmar conformidade, percorra todos os fluxos principais somente com teclado e teste com leitores de tela em combinações representativas, como NVDA com Firefox/Chrome e VoiceOver com Safari. Verifique também zoom/refluxo, contraste, preferências do sistema, erros e estados dinâmicos, uploads e modais. Registre problemas encontrados e resolva-os antes de declarar o sistema completamente acessível.

## Integrações que dependem de configuração externa

- A inicialização aplica o tema salvo antes das folhas de estilo para evitar o flash de tema claro entre páginas. O layout compartilhado e as telas de autenticação que já oferecem preferências usam esse carregamento antecipado.
- Falhas ao criar tópicos e audiodescrições agora retornam mensagens no próprio formulário; a postagem preserva o texto digitado e indica o limite de 280 caracteres.
- Uploads dependem das variáveis de configuração do Cloudflare R2. Sem elas, a aplicação pode iniciar, mas mostra uma mensagem de indisponibilidade no formulário de audiodescrição em vez de uma resposta JSON genérica.
- Não há configuração de OAuth para Google/Facebook, URLs oficiais de redes sociais, links externos de streaming nas recomendações ou páginas de termos/privacidade no repositório. Esses destinos não devem ser inventados; precisam ser fornecidos antes de habilitar links ou integrações.
