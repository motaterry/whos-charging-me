// Dados de exemplo dos protótipos. Tudo é inventado: lojas, CNPJs, bancos e pessoas.
// Os CNPJs começam com 00.000 para deixar claro que não são de verdade.

import { BANCO_FICTICIO } from "./marca.js";

export const BANCO = BANCO_FICTICIO.nome; // banco fictício (troque em marca.js)

export const COMPRAS_FATURA = [
  { id: "mercado", nome: "SUPERMERCADO IDEAL", valor: "R$ 187,40", data: "25/11", categoria: "Mercado", estranho: false },
  { id: "padaria", nome: "MP*PADARIABOMDIA", valor: "R$ 32,50", data: "24/11", categoria: "Outros", estranho: true },
  { id: "posto", nome: "POSTO AVENIDA", valor: "R$ 150,00", data: "23/11", categoria: "Transporte", estranho: false },
  { id: "lanches", nome: "PAG*LANCHESDOZE", valor: "R$ 24,00", data: "22/11", categoria: "Outros", estranho: true },
  { id: "farmacia", nome: "FARMACIA SAUDE MAIS", valor: "R$ 58,90", data: "21/11", categoria: "Saúde", estranho: false },
];

// O que a nossa API devolveria para a padaria (cenário 1: o banco manda o local).
export const RESPOSTA_PADARIA = {
  loja: "Padaria Bom Dia",
  certeza: "alta",
  porque: "O CNPJ está ativo na Receita. O endereço da loja fica a 24 m de onde o cartão foi usado.",
  cnpj: "00.000.123/0001-45",
  endereco: "Rua das Flores, 120, Centro, Cidade Exemplo",
  atividade: "Padaria e confeitaria",
  categoria: "Alimentação",
  distancia: "24 m",
  fontes: ["Receita Federal (dados públicos do CNPJ)", "Site da loja", "Mapa aberto (OpenStreetMap)"],
};

// O que o banco manda e o que recebe (para mostrar ao júri, em "ver por trás").
export const API_PEDIDO = {
  nome_fatura: "MP*PADARIABOMDIA",
  valor: 32.5,
  data: "2026-11-24",
  local: { cidade: "Cidade Exemplo", lat: -10.0001, lon: -40.0002 },
};
export const API_RESPOSTA = {
  consulta: "c_8f3a21",
  loja: "Padaria Bom Dia",
  cnpj: "00000123000145",
  certeza: "alta",
  distancia_m: 24,
  categoria: "Alimentação",
  fontes: 3,
};

// Cenário 2: compras que o app achou nas faturas conectadas.
export const COMPRAS_PAINEL = [
  { id: "padaria", nome: "MP*PADARIABOMDIA", valor: "R$ 32,50", data: "24/11", banco: BANCO, loja: "Padaria Bom Dia", certeza: "alta" },
  { id: "lanches", nome: "PAG*LANCHESDOZE", valor: "R$ 24,00", data: "22/11", banco: "Banco Horizonte", loja: "Lanches do Zé (MEI)", certeza: "media" },
  { id: "xqz", nome: "INT*XQZ7 SERVICOS", valor: "R$ 89,90", data: "20/11", banco: BANCO, loja: null, certeza: "baixa" },
];

export const GASTOS = [
  { nome: "Mercado", valor: 612, cor: "#0066cc" },
  { nome: "Alimentação", valor: 348, cor: "#1e7b34" },
  { nome: "Transporte", valor: 290, cor: "#8a5a00" },
  { nome: "Saúde", valor: 120, cor: "#6e4fb3" },
  { nome: "Outros", valor: 114, cor: "#6e6e73" },
];

export const BANCOS_FICTICIOS = [BANCO, "Banco Horizonte", "Banco Ipê", "Cooperativa Vale"];
