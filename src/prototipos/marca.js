// MARCA DOS PROTÓTIPOS: troque aqui o nome, a letra do logo e as cores.
// Tudo nos 2 protótipos lê daqui. Não precisa mexer em outro arquivo.

// Cenário 2: o nosso app (a Aline vai definir o branding).
export const MARCA = {
  nome: "Quem me cobrou?",
  letraLogo: "?",          // letra ou símbolo dentro do quadrado do logo
  cor: "#0066cc",          // cor principal (botões, destaques)
  corFoco: "#0071e3",      // cor do botão quando o mouse passa por cima
  frase: "Ache as compras de nome estranho em todos os seus cartões. Num lugar só.",
};

// Cenário 1: banco fictício. Nunca usar nome nem cor de banco real.
export const BANCO_FICTICIO = {
  nome: "Banco Exemplo",
  sigla: "BE",
  cor: "#0b6e6e",
  corFoco: "#0a8a8a",
};

// Transforma as cores em variáveis de CSS para o "style" do app.
export function coresCss(m) {
  return { "--cor-destaque": m.cor, "--cor-destaque-foco": m.corFoco };
}
