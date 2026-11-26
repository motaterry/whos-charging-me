import { test } from "node:test";
import assert from "node:assert/strict";
import { distanciaMetros } from "../api/identificar.js";

test("dois pontos na Av. Paulista ficam a cerca de 1,4 km", () => {
  const d = distanciaMetros({ lat: -23.5654273, lon: -46.6520986 }, { lat: -23.5563052, lon: -46.6619012 });
  assert.ok(d > 1300 && d < 1500, `deu ${d}`);
});

test("o mesmo ponto dá zero", () => {
  assert.equal(distanciaMetros({ lat: -23.5, lon: -46.6 }, { lat: -23.5, lon: -46.6 }), 0);
});
