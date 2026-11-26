import { test } from "node:test";
import assert from "node:assert/strict";
import { conferirCnpj, cnpjValido, deBrasilApi, deCnpjWs, deCnpja } from "./receita.js";

// CNPJ público do Banco do Brasil (matriz), usado só como exemplo.
const BB = "00000000000191";

// Respostas reais das 3 fontes, cortadas para os campos que usamos (consultadas em 26/11/2026).
const brasilApi = {
  razao_social: "BANCO DO BRASIL SA", nome_fantasia: "DIRECAO GERAL", descricao_situacao_cadastral: "ATIVA",
  cnae_fiscal_descricao: "Bancos múltiplos, com carteira comercial", opcao_pelo_mei: false,
  descricao_tipo_de_logradouro: "QUADRA", logradouro: "SAUN QUADRA 5 BLOCO B TORRE I, II, III", numero: "SN",
  bairro: "ASA NORTE", municipio: "BRASILIA", uf: "DF",
};
const cnpjWs = {
  razao_social: "BANCO DO BRASIL SA",
  simples: { mei: "Não" },
  estabelecimento: {
    nome_fantasia: "DIRECAO GERAL", situacao_cadastral: "Ativa",
    atividade_principal: { descricao: "Bancos múltiplos, com carteira comercial" },
    tipo_logradouro: "QUADRA", logradouro: "SAUN QUADRA 5 BLOCO B TORRE I, II, III", numero: "SN",
    bairro: "ASA NORTE", cidade: { nome: "Brasília" }, estado: { sigla: "DF" },
  },
};
const cnpja = {
  alias: "Direcao Geral", status: { text: "Ativa" },
  company: { name: "BANCO DO BRASIL SA", simei: { optant: false } },
  mainActivity: { text: "Bancos múltiplos, com carteira comercial" },
  address: { street: "Quadra Saun Quadra 5 Bloco B Torre I, II, III", number: "SN", district: "Asa Norte", city: "Brasília", state: "DF" },
};

// Finge as fontes: cada item da lista é o que a próxima consulta devolve.
function fontesFalsas(respostas) {
  const chamadas = [];
  const buscar = async (url) => {
    chamadas.push(url);
    const r = respostas.shift();
    if (r instanceof Error) throw r;
    return { ok: r.status === 200, status: r.status, json: async () => r.corpo };
  };
  return { buscar, chamadas };
}

test("dígitos do CNPJ: aceita o certo e recusa o errado", () => {
  assert.equal(cnpjValido(BB), true);
  assert.equal(cnpjValido("00000000000192"), false);
  assert.equal(cnpjValido("11111111111111"), false);
  assert.equal(cnpjValido("123"), false);
});

test("as 3 fontes viram o mesmo formato", () => {
  for (const d of [deBrasilApi(brasilApi, BB), deCnpjWs(cnpjWs, BB), deCnpja(cnpja, BB)]) {
    assert.equal(d.cnpj, BB);
    assert.equal(d.razao_social, "BANCO DO BRASIL SA");
    assert.equal(d.mei, false);
    assert.equal(d.atividade, "Bancos múltiplos, com carteira comercial");
    assert.match(d.endereco, /SAUN QUADRA 5/i);
    assert.match(d.municipio, /bras[ií]lia/i);
    assert.ok(d.fonte.includes(BB));
  }
  assert.equal(deCnpjWs(cnpjWs, BB).endereco, "QUADRA SAUN QUADRA 5 BLOCO B TORRE I, II, III, SN, ASA NORTE, Brasília, DF");
});

test("BrasilAPI funcionando: usa só ela", async () => {
  const { buscar, chamadas } = fontesFalsas([{ status: 200, corpo: brasilApi }]);
  const r = await conferirCnpj(BB, { buscar });
  assert.equal(r.fonte_nome, "BrasilAPI");
  assert.equal(chamadas.length, 1);
});

test("BrasilAPI com erro 503: usa a CNPJ.ws", async () => {
  const { buscar, chamadas } = fontesFalsas([{ status: 503 }, { status: 200, corpo: cnpjWs }]);
  const r = await conferirCnpj(BB, { buscar });
  assert.equal(r.fonte_nome, "CNPJ.ws");
  assert.equal(chamadas.length, 2);
});

test("BrasilAPI demora e CNPJ.ws no limite (429): usa a CNPJá", async () => {
  const demora = new Error("The operation was aborted due to timeout");
  const { buscar } = fontesFalsas([demora, { status: 429 }, { status: 200, corpo: cnpja }]);
  const r = await conferirCnpj(BB, { buscar });
  assert.equal(r.fonte_nome, "CNPJá");
});

test("todas falham: devolve null", async () => {
  const { buscar } = fontesFalsas([{ status: 503 }, { status: 500 }, new Error("sem rede")]);
  assert.equal(await conferirCnpj(BB, { buscar }), null);
});

test("CNPJ com dígitos errados: nem consulta", async () => {
  const { buscar, chamadas } = fontesFalsas([]);
  assert.equal(await conferirCnpj("00000000000192", { buscar }), null);
  assert.equal(chamadas.length, 0);
});

test("o tempo máximo de espera funciona de verdade", async () => {
  // Uma fonte que nunca responde, mas respeita o aviso de desistir.
  const lenta = (url, { signal }) => new Promise((_, falhar) => signal.addEventListener("abort", () => falhar(signal.reason)));
  const segura = setTimeout(() => {}, 2000); // mantém o teste vivo enquanto espera
  const inicio = Date.now();
  assert.equal(await conferirCnpj(BB, { buscar: lenta, esperaMs: 50 }), null);
  clearTimeout(segura);
  assert.ok(Date.now() - inicio < 1000);
});

import { eIndividual } from "./receita.js";

test("acha empresário individual pelo código ou pelo texto da Receita", () => {
  assert.equal(eIndividual(2135, null), true);
  assert.equal(eIndividual("213-5", null), true);
  assert.equal(eIndividual(null, "Empresário (Individual)"), true);
  assert.equal(eIndividual("2062", "Sociedade Empresária Limitada"), false);
});
