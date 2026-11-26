import { test } from "node:test";
import assert from "node:assert/strict";
import { receitaPublica, lojaPublica, fontesPublicas, limparTexto, nomeDoDono, nomeCurto } from "./privacidade.js";

// Dados inventados, no formato que as fontes da Receita devolvem para um MEI.
const mei = {
  cnpj: "11222333000181",
  razao_social: "JOÃO DA SILVA 12345678909",
  nome_fantasia: "PASTEL DO JOÃO",
  situacao: "ATIVA",
  atividade: "Lanchonetes, casas de chá, de sucos e similares",
  mei: true,
  endereco: "RUA DAS FLORES, 123, VILA MADALENA, SAO PAULO, SP",
  bairro: "VILA MADALENA",
  municipio: "SAO PAULO",
  uf: "SP",
  fonte: "https://brasilapi.com.br/api/cnpj/v1/11222333000181",
  fonte_nome: "BrasilAPI",
  telefone: "(11) 99123-4567",
};

test("MEI: a resposta não tem nome do dono, CPF nem rua (só o link da fonte pública)", () => {
  const p = receitaPublica(mei);
  const json = JSON.stringify({ ...p, fonte: null });
  assert.ok(!json.includes("SILVA"), json);
  assert.ok(!json.includes("12345678909"), json);
  assert.ok(!json.includes("FLORES"), json);
  assert.ok(!json.includes("123,"), json);
  assert.ok(!json.includes("99123"), json);
  assert.equal(p.telefone, undefined);
  assert.equal(p.razao_social, undefined);
  assert.equal(p.endereco, undefined);
  assert.equal(p.fonte, "https://brasilapi.com.br/api/cnpj/v1/11222333000181");
  assert.equal(p.bairro, "VILA MADALENA");
  assert.equal(p.municipio, "SAO PAULO");
  assert.equal(p.nome_fantasia, "PASTEL DO JOÃO");
  assert.equal(p.nome_dono, "João Silva");
  assert.equal(p.dados_protegidos, true);
});

test("empresa que não é MEI continua igual", () => {
  const ltda = { ...mei, mei: false, razao_social: "PADARIA BOA LTDA" };
  assert.deepEqual(receitaPublica(ltda), ltda);
  assert.equal(lojaPublica("Padaria Boa", ltda), "Padaria Boa");
});

test("nome do dono sai do nome oficial sem números", () => {
  assert.equal(nomeDoDono("JOÃO DA SILVA 12345678909"), "JOÃO DA SILVA");
  assert.equal(nomeDoDono("12.345.678 MARIA SOUZA"), "MARIA SOUZA");
  assert.equal(nomeDoDono("FULANO"), null);
});

test("nome fantasia igual ao nome do dono também é escondido", () => {
  const p = receitaPublica({ ...mei, nome_fantasia: "Joao da Silva" });
  assert.equal(p.nome_fantasia, null);
});

test("se a IA usou o nome do dono como nome da loja, troca", () => {
  assert.equal(lojaPublica("JOAO DA SILVA 12345678909", mei), "PASTEL DO JOÃO");
  assert.equal(lojaPublica("João da Silva", { ...mei, nome_fantasia: null }), "João Silva (MEI)");
  assert.equal(lojaPublica("Pastel do João", mei), "Pastel do João");
});

test("tira sobrenomes (com ou sem acento) e CPF da explicação", () => {
  const dono = "SEBASTIÃO JOSÉ MARTINS DE SOUZA";
  const t = limparTexto("Dono: Sebastião José Martins de Souza, CPF 123.456.789-09. Ou SEBASTIAO JOSE MARTINS.", dono);
  assert.equal(t, "Dono: Sebastião José, CPF [CPF escondido]. Ou Sebastião José.");
});

test("pega o nome cortado da fatura", () => {
  assert.equal(limparTexto("Vendedor DIOGO MARTIN.", "DIOGO MARTINS DA SILVA"), "Vendedor Diogo Martins.");
});

test("nome curto: os 2 primeiros nomes, pulando da/de/do", () => {
  assert.equal(nomeCurto("SEBASTIÃO JOSÉ MARTINS DE SOUZA"), "Sebastião José");
  assert.equal(nomeCurto("JOÃO DA SILVA"), "João Silva");
  assert.equal(nomeCurto("DIOGO MARTIN SOUZA"), "Diogo Martin");
});

test("empresário individual (não MEI) também é protegido", () => {
  const ei = { ...mei, mei: false, individual: true, razao_social: "SEBASTIAO JOSE MARTINS DE SOUZA", nome_fantasia: "BAR E RESTAURANTE DO TIAO" };
  const p = receitaPublica(ei);
  const json = JSON.stringify(p);
  assert.ok(!json.includes("SOUZA") && !json.includes("MARTINS") && !json.includes("FLORES"), json);
  assert.equal(p.nome_dono, "Sebastiao Jose");
  assert.equal(p.individual, true);
  assert.equal(p.mei, false);
  assert.equal(lojaPublica("Sebastião José Martins de Souza", { ...ei, nome_fantasia: null }), "Sebastiao Jose (empresa individual)");
});

test("CPF no fim da frase também é escondido", () => {
  assert.equal(limparTexto("Dono: CPF 123.456.789-09.", null), "Dono: CPF [CPF escondido].");
  assert.equal(limparTexto("12345678909", null), "[CPF escondido]");
});

test("CNPJ não é confundido com CPF", () => {
  assert.equal(limparTexto("CNPJ 11.222.333/0001-81 e 11222333000181", null), "CNPJ 11.222.333/0001-81 e 11222333000181");
});

test("tira links que abrem a ficha do CNPJ ou têm o nome do dono", () => {
  const fontes = [
    "https://cnpj.biz/11222333000181",
    "https://site.com/empresa/11.222.333/0001-81",
    "https://empresas.com/joao-da-silva-pastel",
    "https://instagram.com/pasteldojoao",
  ];
  assert.deepEqual(fontesPublicas(fontes, mei), ["https://instagram.com/pasteldojoao"]);
});
