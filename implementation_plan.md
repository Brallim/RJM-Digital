# Implementação do Termômetro Espiritual

O objetivo é criar um componente visual e interativo chamado **Termômetro Espiritual**, focado em encorajar os jovens a manterem a constância e participação nas atividades da igreja, de forma leve, respeitosa e sem comparações.

## User Review Required

> [!IMPORTANT]
> **Definição de Níveis e Pontuação**
> Para que a chama evolua (Nível 1 ao 5), precisamos definir a lógica de pontuação. Atualmente, o sistema registra as **Presenças nas Reuniões** e as **Visitas à Família**.
> 
> **Minha proposta inicial de cálculo (ajustável futuramente):**
> - Cada Presença em Reunião = 2 pontos
> - Cada Visita recebida pela Família = 1 ponto
>
> **Thresholds (Limites) propostos para os Níveis:**
> - Nível 1 (Luz começando): 0 a 2 pontos
> - Nível 2 (Luz crescendo): 3 a 5 pontos
> - Nível 3 (Luz constante): 6 a 10 pontos
> - Nível 4 (Luz forte): 11 a 20 pontos
> - Nível 5 (Luz que inspira): 21+ pontos
> 
> Você aprova esta lógica inicial para dar vida ao componente? O código será estruturado para permitir alterações fáceis de pesos e regras no futuro.

> [!IMPORTANT]
> **Onde exibir o Perfil?**
> Atualmente, quando clicamos em um morador na aba da Família, ele abre direto a **tela de Edição** (Formulário). Para exibir o Termômetro com todo o destaque que ele merece, proponho criarmos uma nova tela de **Visualização de Perfil** (apenas leitura, com a foto grande, o termômetro e um botão de editar caso o cooperador queira alterar os dados). Você aprova a criação dessa tela intermediária de Perfil?

## Open Questions

> [!WARNING]
> Para calcular as visitas na pontuação do jovem, devo considerar apenas as visitas em que o nome dele está marcado na lista de "Presentes na Visita" ou considero a visita para a família inteira (todos recebem os pontos da visita familiar)?

## Proposed Changes

### Componente Visual Principal
#### [NEW] `src/components/irmandade/TermometroEspiritual.tsx`
- Componente que recebe o ID do jovem.
- Busca assincronamente as frequências e visitas.
- Calcula a pontuação total e define o Nível (1 a 5) e o Percentual (para a próxima meta).
- Renderiza o Card de Perfil com cantos arredondados, cor de fundo e textos baseados no gênero (Azul pastel para meninos, Rosa pastel para meninas).
- Ícone dinâmico da Chama da Casa de Oração que evolui (usando SVG) de acordo com o nível.
- Ao clicar, abre o modal de Detalhes.

### Modal de Detalhes e Incentivo
#### [NEW] `src/components/irmandade/TermometroDetalhesModal.tsx`
- Modal que se abre ao clicar no termômetro.
- Mostra a mensagem de incentivo sorteada ("Continue firme!", "Que alegria ter você conosco!").
- Exibe a tabela ou lista de atividades que geraram a pontuação atual (Ex: 4 presenças, 1 visita).
- Design minimalista, sem termos competitivos ou julgamentos de fé.

### Tela de Perfil Individual
#### [NEW] `src/components/irmandade/PessoaPerfilModal.tsx`
- Nova tela exibida ao clicar em um morador na lista de Famílias.
- Exibe os dados do jovem de forma limpa (somente leitura).
- Integra o `<TermometroEspiritual />` no topo do card, caso a pessoa seja da categoria (menino, moca, menino, moco).
- Botão "Editar" que abre o `PessoaFormModal` atual.

### Adaptação de Navegação
#### [MODIFY] `src/components/irmandade/FamiliaDetalheModal.tsx`
- Modificar o clique no card do morador para abrir o `PessoaPerfilModal` em vez do form de edição direto.

## Verification Plan

### Manual Verification
1. Abrir uma família e clicar em um jovem.
2. Verificar se o novo **Perfil do Jovem** é aberto, contendo a cor correta (azul ou rosa).
3. Avaliar se o componente do **Termômetro Espiritual** está renderizando a pontuação e a chama no nível correto baseado no histórico do banco de dados daquele jovem.
4. Clicar no termômetro e verificar se o modal de detalhes se abre com a mensagem de incentivo positiva.
5. Garantir que não há linguagem competitiva ou de julgamento espiritual.
