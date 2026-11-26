// Confere um CNPJ em fontes públicas e grátis com os dados da Receita.
// Tenta uma fonte por vez. Se uma falhar (erro, fora do ar ou demora), passa para a próxima.
// Ordem: BrasilAPI, depois CNPJ.ws, depois CNPJá. Nenhuma pede chave.
// Nada é guardado: cada consulta vai direto na fonte.

// Tempo máximo de espera por fonte, em milissegundos.
const ESPERA_MS = 4000;

// Empresário individual: empresa de uma pessoa só, com o nome dela. Código 213-5 na Receita.
export function eIndividual(codigo, texto) {
  return String(codigo ?? "").replace(/\D/g, "") === "2135" || /empres[áa]rio\s*\(?individual/i.test(String(texto ?? ""));
}

// Telefone como "(34) 3232-1234". Devolve null se não tiver.
export function montarTelefone(ddd, numero) {
  const so = (t) => String(t ?? "").replace(/\D/g, "");
  let d = so(ddd);
  let n = so(numero);
  // A BrasilAPI manda tudo junto: DDD + número.
  if (!d && n.length >= 10) { d = n.slice(0, 2); n = n.slice(2); }
  if (n.length < 8) return null;
  const meio = n.length - 4;
  return `${d ? `(${d}) ` : ""}${n.slice(0, meio)}-${n.slice(meio)}`;
}

function montarEndereco(partes) {
  return partes.filter(Boolean).join(", ");
}

// Cada função abaixo traduz a resposta de uma fonte para o mesmo formato.

export function deBrasilApi(d, numeros) {
  return {
    cnpj: numeros,
    razao_social: d.razao_social,
    nome_fantasia: d.nome_fantasia || null,
    situacao: d.descricao_situacao_cadastral,
    atividade: d.cnae_fiscal_descricao,
    telefone: montarTelefone(null, d.ddd_telefone_1),
    mei: d.opcao_pelo_mei === true,
    individual: eIndividual(d.codigo_natureza_juridica, d.natureza_juridica),
    endereco: montarEndereco([
      [d.descricao_tipo_de_logradouro, d.logradouro].filter(Boolean).join(" "),
      String(d.logradouro ?? "").includes(String(d.numero ?? "")) ? null : d.numero,
      d.bairro,
      d.municipio,
      d.uf,
    ]),
    bairro: d.bairro || null,
    municipio: d.municipio || null,
    uf: d.uf || null,
    fonte: `https://brasilapi.com.br/api/cnpj/v1/${numeros}`,
    fonte_nome: "BrasilAPI",
  };
}

export function deCnpjWs(d, numeros) {
  const e = d.estabelecimento ?? {};
  const logradouro = String(e.logradouro ?? "");
  const tipo = e.tipo_logradouro && !logradouro.toUpperCase().startsWith(String(e.tipo_logradouro).toUpperCase()) ? e.tipo_logradouro : null;
  return {
    cnpj: numeros,
    razao_social: d.razao_social,
    nome_fantasia: e.nome_fantasia || null,
    situacao: e.situacao_cadastral,
    atividade: e.atividade_principal?.descricao ?? null,
    telefone: montarTelefone(e.ddd1, e.telefone1),
    mei: d.simples?.mei === "Sim",
    individual: eIndividual(d.natureza_juridica?.id, d.natureza_juridica?.descricao),
    endereco: montarEndereco([
      [tipo, logradouro].filter(Boolean).join(" "),
      e.numero,
      e.bairro,
      e.cidade?.nome,
      e.estado?.sigla,
    ]),
    bairro: e.bairro || null,
    municipio: e.cidade?.nome || null,
    uf: e.estado?.sigla || null,
    fonte: `https://publica.cnpj.ws/cnpj/${numeros}`,
    fonte_nome: "CNPJ.ws",
  };
}

export function deCnpja(d, numeros) {
  const a = d.address ?? {};
  return {
    cnpj: numeros,
    razao_social: d.company?.name,
    nome_fantasia: d.alias || null,
    situacao: d.status?.text,
    atividade: d.mainActivity?.text ?? null,
    telefone: montarTelefone(d.phones?.[0]?.area, d.phones?.[0]?.number),
    mei: d.company?.simei?.optant === true,
    individual: eIndividual(d.company?.nature?.id, d.company?.nature?.text),
    endereco: montarEndereco([a.street, a.number, a.district, a.city, a.state]),
    bairro: a.district || null,
    municipio: a.city || null,
    uf: a.state || null,
    fonte: `https://open.cnpja.com/office/${numeros}`,
    fonte_nome: "CNPJá",
  };
}

// Confere os 2 dígitos finais do CNPJ (dígitos verificadores, uma conta que a Receita usa).
export function cnpjValido(numeros) {
  if (!/^\d{14}$/.test(numeros) || /^(\d)\1{13}$/.test(numeros)) return false;
  const digito = (base) => {
    let peso = base.length - 7;
    let soma = 0;
    for (const c of base) {
      soma += Number(c) * peso--;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = digito(numeros.slice(0, 12));
  const d2 = digito(numeros.slice(0, 12) + d1);
  return numeros.endsWith(`${d1}${d2}`);
}

const FONTES = [
  { nome: "BrasilAPI", url: (n) => `https://brasilapi.com.br/api/cnpj/v1/${n}`, traduzir: deBrasilApi },
  { nome: "CNPJ.ws", url: (n) => `https://publica.cnpj.ws/cnpj/${n}`, traduzir: deCnpjWs },
  { nome: "CNPJá", url: (n) => `https://open.cnpja.com/office/${n}`, traduzir: deCnpja },
];

// Devolve os dados da empresa, ou null se nenhuma fonte confirmou o CNPJ.
// "buscar" é o fetch; dá para trocar nos testes.
export async function conferirCnpj(cnpj, { buscar = fetch, esperaMs = ESPERA_MS } = {}) {
  const numeros = String(cnpj ?? "").replace(/\D/g, "");
  // Se os dígitos finais não batem, o número foi inventado ou digitado errado. Nem consulta.
  if (!cnpjValido(numeros)) return null;

  for (const fonte of FONTES) {
    try {
      const resp = await buscar(fonte.url(numeros), {
        headers: { "User-Agent": "whos-charging-me", Accept: "application/json" },
        signal: AbortSignal.timeout(esperaMs),
      });
      if (!resp.ok) {
        console.error(fonte.nome, "respondeu", resp.status, "para", numeros);
        continue;
      }
      const dados = fonte.traduzir(await resp.json(), numeros);
      if (!dados.razao_social) {
        console.error(fonte.nome, "respondeu sem razão social para", numeros);
        continue;
      }
      return dados;
    } catch (e) {
      console.error(fonte.nome, "falhou:", e.message);
    }
  }
  return null;
}
