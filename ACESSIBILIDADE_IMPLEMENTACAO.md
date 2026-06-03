# Implementação Completa de Acessibilidade - AudioSense

## Resumo das Melhorias

Este documento descreve as melhorias implementadas na seção de **Configurações de Acessibilidade** do projeto AudioSense-MVC, tornando-a totalmente funcional e integrada em toda a plataforma.

---

## 1. Variáveis CSS Globais

### Arquivo: `public/stylesheets/menu.css`

Foram adicionadas **variáveis CSS customizadas** (CSS Custom Properties) no `:root` para permitir temas dinâmicos:

```css
:root {
    /* Cores Padrão */
    --primary-color: #1f4677;
    --secondary-color: #5dade2;
    --bg-color: #f4f7f6;
    --text-color: #333333;
    --card-bg: #ffffff;
    --header-text: #1f4677;
    --divider-color: #e0e0e0;
    
    /* Fontes */
    --base-font-size: 16px;
    --h1-size: 2.5rem;
    --h2-size: 2rem;
    --h3-size: 1.5rem;
}
```

### Temas Implementados

#### Tema Escuro
```css
body.dark-theme {
    --primary-color: #1a1a1a;
    --secondary-color: #3498db;
    --bg-color: #121212;
    --text-color: #e0e0e0;
    --card-bg: #1e1e1e;
    --header-text: #ffffff;
    --divider-color: #333333;
}
```

#### Alto Contraste
```css
body.high-contrast {
    --primary-color: #000000;
    --secondary-color: #ffff00;
    --bg-color: #000000;
    --text-color: #ffffff;
    --card-bg: #000000;
    --header-text: #ffff00;
    --divider-color: #ffffff;
}
```

#### Tamanhos de Fonte Dinâmicos
```css
body.font-small { --base-font-size: 14px; }
body.font-medium { --base-font-size: 16px; }
body.font-large { --base-font-size: 20px; }
```

---

## 2. JavaScript de Configurações Melhorado

### Arquivo: `public/javascripts/configuracoes.js`

O arquivo foi completamente reescrito com as seguintes funcionalidades:

#### Funcionalidades Principais

1. **Carregamento de Configurações Salvas**
   - Ao carregar a página, as preferências do usuário são restauradas do `localStorage`
   - As classes CSS apropriadas são aplicadas automaticamente

2. **Aplicação de Configurações em Tempo Real**
   - Tamanho da fonte (Pequeno, Médio, Grande)
   - Contraste (Padrão, Alto contraste, Preto e branco)
   - Tema (Claro, Escuro, Sistema)
   - Velocidade de reprodução de áudio (0.5x a 2.0x)

3. **Persistência de Dados**
   - Todas as configurações são salvas no `localStorage` do navegador
   - As preferências persistem entre sessões

4. **Gerenciamento de Dicas**
   - A dica de acessibilidade pode ser fechada
   - A preferência de ocultar a dica é salva

#### Código Principal

```javascript
function applySetting(type, value) {
    const body = document.body;
    
    if (type.includes('fonte')) {
        body.classList.remove('font-small', 'font-medium', 'font-large');
        if (value === 'Pequeno') body.classList.add('font-small');
        else if (value === 'Médio') body.classList.add('font-medium');
        else if (value === 'Grande') body.classList.add('font-large');
    } 
    else if (type.includes('contraste')) {
        body.classList.remove('high-contrast', 'black-white');
        if (value === 'Alto contraste') body.classList.add('high-contrast');
        if (value === 'Preto e branco') body.style.filter = 'grayscale(100%)';
        else body.style.filter = 'none';
    }
    else if (type.includes('Tema')) {
        body.classList.remove('dark-theme', 'light-theme');
        if (value === 'Escuro') body.classList.add('dark-theme');
        else if (value === 'Claro') body.classList.add('light-theme');
        else if (value === 'Sistema') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-theme');
            }
        }
    }
}
```

---

## 3. Script de Acessibilidade Global

### Arquivo: `public/javascripts/accessibility.js`

Este script é carregado em **todas as páginas** (via `layout.pug`) e garante que:

1. **Anúncio de Título da Página**
   - O primeiro h1 ou h2 é focado automaticamente
   - Leitores de tela anunciam o título da página

2. **Aplicação de Preferências Globais**
   - Todas as configurações de acessibilidade são aplicadas em toda a plataforma
   - Funciona em todas as páginas do AudioSense

```javascript
function aplicarPreferenciasSalvas() {
  const fontSize = localStorage.getItem('fontSize');
  const contrast = localStorage.getItem('contrast');
  const theme = localStorage.getItem('theme');
  const body = document.body;

  if (fontSize) {
    body.classList.remove('font-small', 'font-medium', 'font-large');
    if (fontSize === 'Pequeno') body.classList.add('font-small');
    else if (fontSize === 'Médio') body.classList.add('font-medium');
    else if (fontSize === 'Grande') body.classList.add('font-large');
  }
  // ... resto das configurações
}
```

---

## 4. Estilos CSS Atualizados

### Arquivo: `public/stylesheets/configuracoes.css`

Os estilos foram atualizados para usar as variáveis CSS globais:

```css
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-size: var(--base-font-size);
    transition: background-color 0.3s, color 0.3s, font-size 0.3s;
}

.main-config-card {
    background: var(--card-bg);
    border: 1px solid var(--divider-color);
}

.group-btn.active {
    background: var(--card-bg);
    border: 1px solid var(--secondary-color);
    color: var(--secondary-color);
}
```

---

## 5. Fluxo de Funcionamento

### Sequência de Operação

1. **Página de Configurações é Carregada**
   - `configuracoes.js` é executado
   - Configurações salvas são carregadas do `localStorage`
   - Botões são atualizados para refletir o estado salvo

2. **Usuário Altera uma Configuração**
   - Clica em um botão (fonte, contraste, tema)
   - A classe CSS correspondente é adicionada ao `<body>`
   - A configuração é salva no `localStorage`
   - A interface é atualizada em tempo real

3. **Usuário Navega para Outra Página**
   - `accessibility.js` é carregado (em todas as páginas)
   - As preferências salvas são aplicadas automaticamente
   - A página exibe com as configurações do usuário

4. **Usuário Retorna à Página de Configurações**
   - As configurações salvas são restauradas
   - Os botões mostram o estado correto

---

## 6. Configurações Suportadas

### Tamanho da Fonte
- **Pequeno**: 14px
- **Médio**: 16px (padrão)
- **Grande**: 20px

### Contraste
- **Padrão**: Cores normais
- **Alto Contraste**: Preto e amarelo
- **Preto e Branco**: Filtro grayscale

### Tema
- **Claro**: Fundo claro, texto escuro
- **Escuro**: Fundo escuro, texto claro
- **Sistema**: Segue a preferência do SO

### Velocidade de Áudio
- **Intervalo**: 0.5x a 2.0x
- **Padrão**: 1.0x
- **Persistência**: Salva no `localStorage`

---

## 7. Compatibilidade

### Navegadores Suportados
- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Tecnologias Utilizadas
- CSS Custom Properties (variáveis CSS)
- localStorage API
- Media Queries
- Classes CSS dinâmicas

---

## 8. Próximos Passos Recomendados

### Backend (Opcional)
Para persistência em banco de dados, considere:

1. **Criar Tabela de Preferências**
```sql
CREATE TABLE preferencias_acessibilidade (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tamanho_fonte VARCHAR(20),
    contraste VARCHAR(20),
    tema VARCHAR(20),
    velocidade_audio DECIMAL(3,1),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
```

2. **Criar Endpoints API**
- `GET /api/acessibilidade` - Obter preferências do usuário
- `POST /api/acessibilidade` - Salvar preferências do usuário

3. **Atualizar JavaScript**
- Fazer requisições à API ao salvar configurações
- Carregar preferências da API ao inicializar

### Frontend (Melhorias Futuras)
- Adicionar mais opções de tema (alto contraste com cores personalizadas)
- Implementar atalhos de teclado para alternar configurações
- Adicionar suporte a leitura de tela mais completa
- Criar preview em tempo real das configurações

---

## 9. Testes Recomendados

1. **Teste de Persistência**
   - Alterar configurações
   - Recarregar a página
   - Verificar se as configurações foram mantidas

2. **Teste de Globalização**
   - Alterar configurações na página de Configurações
   - Navegar para outras páginas
   - Verificar se as configurações se aplicam globalmente

3. **Teste de Acessibilidade**
   - Usar leitor de tela (NVDA, JAWS, VoiceOver)
   - Verificar se os títulos são anunciados corretamente
   - Testar navegação por teclado

4. **Teste de Responsividade**
   - Testar em diferentes tamanhos de tela
   - Verificar se os controles se adaptam corretamente

---

## 10. Arquivos Modificados

| Arquivo | Alterações |
|---------|-----------|
| `public/stylesheets/menu.css` | Adicionadas variáveis CSS globais e temas |
| `public/javascripts/configuracoes.js` | Reescrito com persistência e aplicação de configurações |
| `public/javascripts/accessibility.js` | Atualizado para aplicar preferências globalmente |
| `public/stylesheets/configuracoes.css` | Atualizado para usar variáveis CSS |

---

## Conclusão

A seção de acessibilidade do AudioSense agora está **totalmente funcional** e **integrada em toda a plataforma**. Os usuários podem personalizar sua experiência com diferentes tamanhos de fonte, contrastes e temas, e essas preferências são mantidas em todas as páginas da aplicação.

