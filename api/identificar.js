// Servidor: recebe o nome estranho da fatura e devolve quem é a loja.
// Endereço: POST /api/identificar  com  { "nome": "MP*CASADOPAODEQUEIJO", "cidade": "São Paulo" }
//
// Passos:
// 1. Limpa o nome (tira o prefixo da maquininha).
// 2. Pede para a IA (pelo OpenRouter, com busca na web) achar a loja e o CNPJ.
// 3. Confere o CNPJ na BrasilAPI (dados públicos da Receita).
// 4. Devolve a loja, a fonte e o grau de certeza.

import { limparNome } from "../lib/limpar-nome.js";

const CATEGORIAS = [
  "Alimentação", "Mercado", "Transporte", "Saúde e farmácia", "Compras",
  "Assinaturas e serviços digitais", "Lazer", "Educação", "Casa", "Outros",
];

function instrucoes(limpo, cidade) {
  return `Você ajuda pessoas a descobrir qual loja aparece com um nome estranho na fatura do cartão de crédito no Brasil.

Nome na fatura: "${limpo.original}"
Nome sem o prefixo: "${limpo.nome}"
Empresa de pagamento (maquininha): ${limpo.intermediario ?? "não identificada"}
Cidade da compra: ${cidade || "não informada"}

Procure na internet a loja mais provável. Tente achar o CNPJ (número de registro da empresa, 14 dígitos).
Não invente. Se não tiver certeza, diga que a certeza é baixa.

Responda SOMENTE com um JSON neste formato:
{
  "loja": "nome que a pessoa conhece (nome fantasia)",
  "razao_social": "nome oficial da empresa ou null",
  "cnpj": "só os 14 números ou null",
  "cidade": "cidade da loja ou null",
  "categoria": "uma destas: ${CATEGORIAS.join(", ")}",
  "certeza": "alta" | "media" | "baixa",
  "explicacao": "uma frase simples dizendo por que acha que é essa loja",
  "fontes": ["links usados"]
}`;
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

async function perguntarIA(limpo, cidade) {
  const chave = process.env.OPENROUTER_API_KEY;
  if (!chave) throw new Error("Falta a chave OPENROUTER_API_KEY no servidor.");
  const modelo = process.env.OPENROUTER_MODEL || "anthropic/claude-opus-5.5";

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chave}`,
      "Content-Type": "application/json",
      "X-Title": "whos-charging-me",
    },
    body: JSON.stringify({
      // ":online" liga a busca na web do OpenRouter.
      model: `${modelo}:online`,
      messages: [{ role: "user", content: instrucoes(limpo, cidade) }],
    }),
  });

  if (!resp.ok) {
    throw new Error(`A IA não respondeu (código ${resp.status}).`);
  }
  const dados = await resp.json();
  const texto = dados?.choices?.[0]?.message?.content ?? "";
  const json = extrairJson(texto);
  if (!json) throw new Error("A IA respondeu num formato inesperado.");
  return json;
}

async function conferirCnpj(cnpj) {
  const numeros = String(cnpj ?? "").replace(/\D/g, "");
  if (numeros.length !== 14) return null;
  const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`);
  if (!resp.ok) return null;
  const d = await resp.json();
  return {
    cnpj: numeros,
    razao_social: d.razao_social,
    nome_fantasia: d.nome_fantasia || null,
    situacao: d.descricao_situacao_cadastral,
    atividade: d.cnae_fiscal_descricao,
    mei: d.opcao_pelo_mei === true,
    endereco: [d.descricao_tipo_de_logradouro, d.logradouro, d.numero, d.bairro, d.municipio, d.uf]
      .filter(Boolean)
      .join(", "),
    fonte: `https://brasilapi.com.br/api/cnpj/v1/${numeros}`,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Use POST." });
    return;
  }

  const { nome, cidade } = req.body ?? {};
  if (!nome || String(nome).trim().length < 2) {
    res.status(400).json({ erro: "Escreva o nome que aparece na fatura." });
    return;
  }

  const limpo = limparNome(nome);

  try {
    const ia = await perguntarIA(limpo, cidade);
    const receita = await conferirCnpj(ia.cnpj);

    // Se a Receita confirmou o CNPJ, a certeza pode subir um nível.
    let certeza = ia.certeza;
    if (receita && certeza === "media") certeza = "alta";
    if (!receita && certeza === "alta") certeza = "media";

    res.status(200).json({
      entrada: limpo,
      loja: ia.loja,
      categoria: ia.categoria,
      certeza,
      explicacao: ia.explicacao,
      fontes: ia.fontes ?? [],
      receita, // null quando não deu para confirmar o CNPJ
    });
  } catch (e) {
    res.status(502).json({ erro: e.message, entrada: limpo });
  }
}
