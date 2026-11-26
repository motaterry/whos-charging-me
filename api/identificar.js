// Servidor: recebe o nome estranho da fatura e devolve quem é a loja.
// Endereço: POST /api/identificar  com  { "nome": "MP*CASADOPAODEQUEIJO", "cidade": "São Paulo" }
//
// Passos:
// 1. Limpa o nome (tira o prefixo da maquininha).
// 2. Pede para a IA (pelo OpenRouter, com busca na web) achar a loja e o CNPJ.
// 3. Confere o CNPJ em dados públicos da Receita (BrasilAPI; se falhar, CNPJ.ws; depois CNPJá).
// 4. Devolve a loja, a fonte e o grau de certeza.
// Se a loja for MEI, esconde o nome do dono, o CPF e a rua (ver lib/privacidade.js).

import { limparNome } from "../lib/limpar-nome.js";
import { conferirCnpj } from "../lib/receita.js";
import { receitaPublica, lojaPublica, fontesPublicas, limparTexto, nomeDoDono } from "../lib/privacidade.js";

const CATEGORIAS = [
  "Alimentação", "Mercado", "Transporte", "Saúde e farmácia", "Compras",
  "Assinaturas e serviços digitais", "Lazer", "Educação", "Casa", "Outros",
];

// Texto sobre o local da compra, quando o banco manda.
function textoLocal(local) {
  if (!local) return "não informado";
  const partes = [local.endereco, local.bairro, local.cidade, local.uf].filter(Boolean).join(", ");
  const coords = local.lat && local.lon ? ` (latitude ${local.lat}, longitude ${local.lon})` : "";
  return partes + coords;
}

function instrucoes(limpo, cidade, local) {
  return `Você ajuda pessoas a descobrir qual loja aparece com um nome estranho na fatura do cartão de crédito no Brasil.

Nome na fatura: "${limpo.original}"
Nome sem o prefixo: "${limpo.nome}"
Empresa de pagamento (maquininha): ${limpo.intermediario ?? "não identificada"}
Cidade da compra: ${cidade || "não informada"}
Local da compra enviado pelo banco: ${textoLocal(local)}

Procure na internet a loja mais provável.${local ? " O banco informou onde a maquininha estava: procure a loja nesse endereço ou bem perto dele." : ""} Tente achar o CNPJ (número de registro da empresa, 14 dígitos).
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

async function perguntarIA(limpo, cidade, local) {
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
      messages: [{ role: "user", content: instrucoes(limpo, cidade, local) }],
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

// Acha a latitude e longitude de um endereço no OpenStreetMap (grátis).
async function acharCoordenadas(endereco) {
  if (!endereco) return null;
  try {
    const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=" + encodeURIComponent(endereco);
    const resp = await fetch(url, {
      headers: { "User-Agent": "whos-charging-me/0.3 (prototipo de hackathon)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    const [primeiro] = await resp.json();
    return primeiro ? { lat: Number(primeiro.lat), lon: Number(primeiro.lon) } : null;
  } catch (e) {
    console.error("OpenStreetMap falhou:", e.message);
    return null;
  }
}

// Distância em metros entre dois pontos (fórmula de Haversine).
export function distanciaMetros(a, b) {
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Use POST." });
    return;
  }

  const { nome } = req.body ?? {};
  // "local" é opcional: o banco manda onde a maquininha estava.
  const local = req.body?.local && typeof req.body.local === "object" ? req.body.local : null;
  const cidade = req.body?.cidade || local?.cidade || "";
  if (!nome || String(nome).trim().length < 2) {
    res.status(400).json({ erro: "Escreva o nome que aparece na fatura." });
    return;
  }

  const limpo = limparNome(nome);

  try {
    const ia = await perguntarIA(limpo, cidade, local);
    const receita = await conferirCnpj(ia.cnpj);

    // Se a Receita confirmou o CNPJ, a certeza pode subir um nível.
    let certeza = ia.certeza;
    if (receita && certeza === "media") certeza = "alta";
    if (!receita && certeza === "alta") certeza = "media";

    // Se a empresa da Receita fica em outra cidade, a certeza cai.
    let aviso = null;
    const normal = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    if (receita?.municipio && cidade && normal(receita.municipio) !== normal(cidade)) {
      certeza = "baixa";
      aviso = `A empresa achada fica em ${receita.municipio}, não em ${cidade}. Confira antes de confirmar.`;
    }

    // Se o banco mandou o local, compara com o endereço da Receita.
    // MEI: o endereço costuma ser a casa do dono. Então usamos só o bairro e a cidade
    // (um ponto aproximado), e a rua nem sai do servidor.
    let distancia = null;
    let distanciaAproximada = false;
    const pontoCompra = local?.lat && local?.lon ? { lat: Number(local.lat), lon: Number(local.lon) } : null;
    if (pontoCompra && receita?.mei) {
      const bairro = receita.bairro ? [receita.bairro, receita.municipio, receita.uf].filter(Boolean).join(", ") : null;
      const pontoBairro = await acharCoordenadas(bairro);
      if (pontoBairro) {
        distanciaAproximada = true;
        // Arredonda para 100 m: é só uma ideia de distância.
        distancia = Math.round(distanciaMetros(pontoCompra, pontoBairro) / 100) * 100;
        if (distancia <= 2000) {
          aviso = `A loja é registrada no bairro ${receita.bairro}, perto de onde a compra foi feita.`;
        } else if (distancia > 5000) {
          certeza = "baixa";
          aviso = `A loja é registrada no bairro ${receita.bairro}, a cerca de ${(distancia / 1000).toFixed(1)} km de onde a compra foi feita. Confira antes de confirmar.`;
        }
      }
    } else if (pontoCompra && receita?.endereco) {
      const pontoLoja = await acharCoordenadas(receita.endereco);
      if (pontoLoja) {
        distancia = distanciaMetros(pontoCompra, pontoLoja);
        if (distancia <= 500) {
          certeza = "alta";
          aviso = `O endereço na Receita fica a ${distancia} m de onde a compra foi feita.`;
        } else if (distancia > 5000) {
          certeza = "baixa";
          aviso = `O endereço na Receita fica a ${(distancia / 1000).toFixed(1)} km de onde a compra foi feita. Confira antes de confirmar.`;
        }
      }
    }

    // MEI: tira o nome do dono e o CPF de tudo que vai para a tela.
    const dono = receita?.mei ? nomeDoDono(receita.razao_social) : null;

    res.status(200).json({
      entrada: limpo,
      loja: lojaPublica(ia.loja, receita),
      categoria: ia.categoria,
      certeza,
      explicacao: receita?.mei ? limparTexto(ia.explicacao, dono) : ia.explicacao,
      aviso,
      fontes: fontesPublicas(ia.fontes ?? [], receita),
      cnpj_sugerido: ia.cnpj ?? null, // o CNPJ que a IA achou, antes de conferir
      receita: receitaPublica(receita), // null quando não deu para confirmar o CNPJ. MEI: sem nome oficial e sem rua.
      local, // o local que o banco mandou (ou null)
      distancia, // metros entre o local da compra e o endereço da Receita (ou null)
      distancia_aproximada: distanciaAproximada, // true no MEI: medida até o centro do bairro
    });
  } catch (e) {
    res.status(502).json({ erro: e.message, entrada: limpo });
  }
}
