// Fala com o nosso servidor (api/identificar.js).
export const CATEGORIAS = [
  "Alimentação", "Mercado", "Transporte", "Saúde e farmácia", "Compras",
  "Assinaturas e serviços digitais", "Lazer", "Educação", "Casa", "Outros",
];

// "local" é opcional: o banco manda onde a maquininha estava.
export async function identificar(nome, cidade, local = null) {
  const resp = await fetch("/api/identificar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, cidade, local }),
  });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || "Algo deu errado.");
  return dados;
}

export async function contestar(dados) {
  const resp = await fetch("/api/contestar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(json.erro || "Algo deu errado.");
  return json;
}
