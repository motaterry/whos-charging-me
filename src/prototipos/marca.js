// MARCA DOS PROTÓTIPOS: troque aqui o nome, a letra do logo e as cores.
// Tudo nos 2 protótipos lê daqui. Não precisa mexer em outro arquivo.

// Cenário 2: o nosso app (a Aline vai definir o branding).
export const MARCA = {
  nome: "Quem me cobrou?",
  letraLogo: "?",          // letra ou símbolo dentro do quadrado do logo
  cor: "#f5c518",          // cor principal (botões, destaques). Amarelo, com gradiente sutil nos botões.
  corFoco: "#ffdb4d",      // tom mais claro: topo do gradiente e mouse por cima
  corSobre: "#151515",     // cor do texto em cima da cor principal
  corLink: "#f5c518",      // cor dos links de texto
  frase: "Ache as compras de nome estranho em todos os seus cartões. Num lugar só.",
};

// Cenário 1: o protótipo imita o app do C6 Bank (decisão da Terry em 27/11).
// Imitamos layout, cores e estrutura. O logo (src/assets/prototipos/c6-logo-branco.png) entrou com aprovação da Terry em 27/11.
// Para voltar a um banco inventado, troque nome e sigla aqui.
export const BANCO_FICTICIO = {
  nome: "C6 Bank",
  sigla: "C6",
  cor: "#ffd100",          // cor de destaque (botão principal, aba ativa). Troque aqui para mudar tudo.
  corFoco: "#ffdd3d",
  corSobre: "#121212",     // cor do texto em cima da cor de destaque
  corLink: "#ffd100",      // cor dos links de texto (igual ao destaque: sem azul)
};

// Transforma as cores em variáveis de CSS para o "style" do app.
export function coresCss(m) {
  const css = { "--cor-destaque": m.cor, "--cor-destaque-foco": m.corFoco };
  if (m.corSobre) css["--cor-sobre-destaque"] = m.corSobre;
  if (m.corLink) css["--cor-link"] = m.corLink;
  return css;
}
