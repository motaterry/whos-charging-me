import { test } from "node:test";
import assert from "node:assert/strict";
import { limparNome } from "./limpar-nome.js";

test("tira o prefixo do Mercado Pago", () => {
  const r = limparNome("MP*CASADOPAODEQUEIJO");
  assert.equal(r.intermediario, "Mercado Pago");
  assert.equal(r.nome, "CASADOPAODEQUEIJO");
});

test("tira o prefixo do PagSeguro com espaço", () => {
  const r = limparNome("PAG *JOAOSILVALANCHES");
  assert.equal(r.intermediario, "PagSeguro (PagBank)");
  assert.equal(r.nome, "JOAOSILVALANCHES");
});

test("nome sem prefixo fica igual", () => {
  const r = limparNome("  RAIADROGASIL   SAO PAULO ");
  assert.equal(r.intermediario, null);
  assert.equal(r.nome, "RAIADROGASIL SAO PAULO");
});

test("texto vazio não quebra", () => {
  assert.equal(limparNome("").nome, "");
  assert.equal(limparNome(undefined).nome, "");
});
