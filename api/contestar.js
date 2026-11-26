// Servidor: monta o plano de contestação para o banco da pessoa.
// Endereço: POST /api/contestar
// Recebe: { nomeFatura, loja, banco, tipo: "golpe" | "problema", motivo, valor, data }
// Devolve: { passos: [texto], onde: texto, fontes: [links], texto_pronto: texto }

const TIPOS = {
  golpe: "A pessoa NÃO fez essa compra (possível golpe ou cartão clonado).",
  problema: "A pessoa fez a compra, mas teve um problema com ela.",
};

function instrucoes(d) {
  return `Você ajuda uma pessoa no Brasil a contestar uma compra no cartão de crédito.

Banco do cartão: ${d.banco}
Nome na fatura: "${d.nomeFatura}"
Loja provável: ${d.loja || "não identificada"}
Situação: ${TIPOS[d.tipo] ?? TIPOS.golpe}
Motivo: ${d.motivo || "não informado"}
Valor: ${d.valor || "não informado"}
Data da compra: ${d.data || "não informada"}

Procure na internet como contestar uma compra no cartão desse banco (onde fica no app, telefone ou chat oficial).
Use só fontes oficiais do banco ou fontes confiáveis. Não invente telefones nem menus.
Se não achar, diga isso e dê o caminho geral.

Responda SOMENTE com um JSON neste formato:
{
  "onde": "uma frase dizendo onde contestar nesse banco (app, chat ou telefone)",
  "passos": ["passo 1 em frase curta", "passo 2", "..."],
  "fontes": ["links usados"],
  "texto_pronto": "mensagem curta e educada, em primeira pessoa, para a pessoa mandar ao banco. Use [colchetes] para o que ela precisa completar."
}
Frases curtas e simples, sem jargão. No máximo 5 passos.`;
}

function extrairJson(texto) {
  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (inicio === -1 || fim === -1) return null;
  try {
    return JSON.parse(texto.slice(inicio, fim + 1));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Use POST." });
    return;
  }

  const d = req.body ?? {};
  if (!d.banco || !d.nomeFatura) {
    res.status(400).json({ erro: "Falta o banco ou o nome da fatura." });
    return;
  }

  const chave = process.env.OPENROUTER_API_KEY;
  if (!chave) {
    res.status(500).json({ erro: "Falta a chave OPENROUTER_API_KEY no servidor." });
    return;
  }
  const modelo = process.env.OPENROUTER_MODEL || "anthropic/claude-opus-5.5";

  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
        "X-Title": "whos-charging-me",
      },
      body: JSON.stringify({
        model: `${modelo}:online`,
        messages: [{ role: "user", content: instrucoes(d) }],
      }),
    });
    if (!resp.ok) throw new Error(`A IA não respondeu (código ${resp.status}).`);
    const dados = await resp.json();
    const json = extrairJson(dados?.choices?.[0]?.message?.content ?? "");
    if (!json) throw new Error("A IA respondeu num formato inesperado.");
    res.status(200).json({
      onde: json.onde ?? "",
      passos: Array.isArray(json.passos) ? json.passos.slice(0, 5) : [],
      fontes: Array.isArray(json.fontes) ? json.fontes : [],
      texto_pronto: json.texto_pronto ?? "",
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ erro: e.message });
  }
}
