import { test } from "node:test";
import assert from "node:assert/strict";
import { receitaPublica, lojaPublica, fontesPublicas, limparTexto, nomeDoDono } from "./privacidade.js";

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
};

test("MEI: a resposta não tem nome do dono, CPF, rua nem link da ficha", () => {
  const p = receitaPublica(mei);
  const json = JSON.stringify(p);
  assert.ok(!json.includes("SILVA"), json);
  assert.ok(!json.includes("12345678909"), json);
  assert.ok(!json.includes("FLORES"), json);
  assert.ok(!json.includes("123,"), json);
  assert.equal(p.razao_social, undefined);
  assert.equal(p.endereco, undefined);
  assert.equal(p.fonte, null);
  assert.equal(p.bairro, "VILA MADALENA");
  assert.equal(p.municipio, "SAO PAULO");
  assert.equal(p.nome_fantasia, "PASTEL DO JOÃO");
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
  assert.equal(lojaPublica("João da Silva", { ...mei, nome_fantasia: null }), "Pequeno negócio (MEI)");
  assert.equal(lojaPublica("Pastel do João", mei), "Pastel do João");
});

test("tira nome do dono (com ou sem acento) e CPF da explicação", () => {
  const t = limparTexto("A loja é de João da Silva, CPF 123.456.789-09, e de JOAO DA  SILVA.", "JOÃO DA SILVA");
  assert.equal(t, "A loja é de [nome escondido], CPF [CPF escondido], e de [nome escondido].");
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
