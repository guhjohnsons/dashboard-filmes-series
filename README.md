# Cine - Dashboard de Filmes e Séries 🎬

Cine é um dashboard moderno e intuitivo para gerenciar sua lista pessoal de filmes e séries. O projeto foca em oferecer uma experiência premium (Glassmorphism), alta performance e total privacidade, mantendo todos os seus dados localmente no navegador.


## ✨ Funcionalidades Principais

- **📊 Dashboard de Estatísticas**: Visualize rapidamente o total de títulos assistidos, média de avaliação e progresso por status (Assistindo, Concluído, Desisti).
- **🔍 Integração com TMDB API**: Preenchimento automático de dados (capa, título original, ano, temporadas) através do código IMDB.
- **📱 Responsividade "Mobile-First"**:
  - **Bottom Navigation**: Menu inferior para fácil acesso com polegar em celulares.
  - **FAB (Floating Action Button)**: Botão de ação rápida para adicionar títulos no mobile.
  - **Layout Fluído**: Cards e formulários se adaptam a qualquer tamanho de tela.
- **🎨 Design System Premium**:
  - Interface baseada em **Glassmorphism** (efeitos de desfoque e transparência).
  - Micro-animações para feedback visual instantâneo.
  - Suporte a `prefers-reduced-motion`.
- **💾 Gestão de Dados & Backup**:
  - **Exportar**: Baixe sua lista nos formatos JSON (backup) ou CSV (Excel).
  - **Restaurar**: Recupere seus dados a partir de um arquivo JSON anteriormente salvo.
  - **Privacidade**: 100% dos dados são salvos no `localStorage` do seu navegador.
- **♿ Acessibilidade (A11y)**:
  - Navegação completa por teclado com anéis de foco visíveis.
  - Atributos ARIA e semântica HTML corretos.
  - Atalho `ESC` para fechar modais.

## 🚀 Como Rodar o Projeto

Como o Cine é um projeto de frontend estático, não há necessidade de um servidor de backend ou instalação complexa.

### Pré-requisitos
- Um navegador moderno (Chrome, Firefox, Edge ou Safari).
- (Opcional) Uma chave de API do [TMDB](https://www.themoviedb.org/documentation/api) para habilitar a busca automática.

### Passo a Passo
1. **Clonar ou Baixar**:
   ```bash
   git clone https://github.com/nextlevelbuilder/cinegu-dashboard.git
   ```
2. **Abrir**:
   Navegue até a pasta do projeto e abra o arquivo `index.html` diretamente no seu navegador.

3. **Configurar API (Opcional)**:
   - Vá para a aba **Backup & Dados**.
   - No campo "Integração TMDB", cole sua Chave de API v3.
   - Clique em **Salvar Chave**. Agora você pode usar códigos IMDB (ex: `tt4154664`) para adicionar títulos instantaneamente.

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível.
- **CSS3 (Custom Properties)**: Estilização moderna com variáveis e Glassmorphism.
- **JavaScript (Vanilla)**: Lógica de estado, manipulação de DOM e integração com API.
- **FontAwesome**: Ícones vetoriais de alta qualidade.
- **Google Fonts (Outfit)**: Tipografia otimizada para legibilidade.

## 📂 Estrutura de Arquivos

```text
├── css/
│   └── style.css      # Estilos globais e responsividade
├── js/
│   ├── api.js         # Comunicação com o TMDB
│   ├── storage.js     # Gerenciamento do LocalStorage
│   ├── ui.js          # Renderização de componentes e lógica de interface
│   └── main.js        # Orquestrador da aplicação
├── design-system/
│   └── MASTER.md      # Documentação das regras de design (UI/UX Pro Max)
└── index.html         # Arquivo principal
```

## 📜 Licença
Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.

---
Desenvolvido com ❤️ e foco em UI/UX.
