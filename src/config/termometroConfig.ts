export const termometroConfig = {
  // Pesos das atividades
  pesos: {
    presencaReuniao: 2,
    participacaoVisita: 1, // Apenas para os moradores presentes
  },
  
  // Janela de cálculo em dias
  diasJanelaCalculo: 90,

  // Limites para cada nível (pontuação necessária)
  niveis: [
    { nivel: 1, maxPontos: 2, nome: 'Luz começando' },
    { nivel: 2, maxPontos: 5, nome: 'Luz crescendo' },
    { nivel: 3, maxPontos: 10, nome: 'Luz constante' },
    { nivel: 4, maxPontos: 20, nome: 'Luz forte' },
    { nivel: 5, maxPontos: Infinity, nome: 'Luz que inspira' },
  ],

  // Textos de incentivo aleatórios
  mensagensIncentivo: [
    "Continue firme!",
    "Sua participação está crescendo!",
    "Que alegria ter você conosco!",
    "Continue participando e fortalecendo os bons vínculos."
  ],

  // Categorias elegíveis para exibir o Termômetro
  categoriasElegiveis: ['menina', 'moca', 'menino', 'moco']
};
