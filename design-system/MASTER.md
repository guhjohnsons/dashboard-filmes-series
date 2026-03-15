# CineGu Design System & UX Rules

Este documento define o sistema de design e as regras de experiência do usuário para o CineGu Dashboard, baseado na skill **UI/UX Pro Max**.

## 🎨 Identidade Visual
- **Estilo**: Glassmorphism (Painéis translucidos com desfoque).
- **Cores**:
  - Primária: Indigo (#6366f1)
  - Fundo: Dark (#0a0a0f)
  - Acento Sucesso: Emerald (#10b981)
  - Acento Erro/Perigo: Rose/Red (#ef4444)
- **Tipografia**: Outfit (Google Fonts). Base 16px. Peso 400/600/700.

## 🛠️ Regras de UX Implementadas

### 1. Acessibilidade (CRITICAL)
- [x] Contraste de cor verificado para texto e ícones.
- [x] Navegação por teclado: Todos os botões e inputs possuem `:focus-visible` com anel de destaque.
- [x] Atributos ARIA: `aria-label` em botões de ícone e `aria-current` no menu lateral.
- [x] Relação Label-Input: Todos os formulários usam o atributo `for` corretamente.
- [x] Suporte a `prefers-reduced-motion` para desativar animações pesadas.

### 2. Interação & Touch (CRITICAL)
- [x] Alvos de Toque: Mínimo de 44x44px garantido no mobile.
- [x] Bottom Nav: Sidebar se transforma em barra de navegação inferior no mobile para facilitar o alcance do polegar.
- [x] FAB (Floating Action Button): Botão de adicionar fica fixo no canto inferior direito no mobile.
- [x] Feedback de Toque: Efeito de `scale(0.97)` ao clicar em qualquer elemento interativo.
- [x] ESC Key: Fechamento de modais com a tecla Escape.

### 3. Layout Responsivo (HIGH)
- [x] Breakpoint: Mobile-first abordagem para telas abaixo de 768px.
- [x] Sem scroll horizontal no mobile.
- [x] Grid adaptativa: Cards ajustam o tamanho automaticamente.

### 4. Feedback do Sistema (MEDIUM)
- [x] Toasts: Notificações visuais após cada ação (Salvar, Deletar, Backup).
- [x] Modais Customizados: Substituição de `confirm()` do navegador por modal de vidro estilizado.
- [x] Loading States: Spinner animado durante a busca na API TMDB.

## 🚫 Anti-Patterns Evitados
- Não usar Emojis como ícones estruturais (usamos FontAwesome/SVG).
- Não usar cores puras (Red/Blue), usamos paleta HSL/Glassmorphism.
- Não usar transformações que quebrem o layout durante o hover.
