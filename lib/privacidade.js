// Protege os dados pessoais do dono quando a loja é de uma pessoa só (LGPD):
// MEI (microempreendedor) ou empresário individual.
// Nesses casos, o nome oficial da empresa costuma ser o nome da pessoa, às vezes com o CPF.
// E o endereço muitas vezes é a casa dela.
// Por isso o site só mostra: nome da loja, os primeiros nomes do dono, tipo de negócio, bairro e cidade.
// Isso vale para a resposta da API (o JSON), não só para a tela.
// Nada é guardado.

// Tira acentos de uma letra só. Cada letra continua com 1 caractere,
// então as posições no texto não mudam.
function dobrar(texto) {
  return Array.from(String(texto ?? ""), (c) => c.normalize("NFD")[0] ?? c).join("").toUpperCase();
}

// A loja é de uma pessoa só? (MEI ou empresário individual)
export function eDePessoa(receita) {
  return Boolean(receita?.mei || receita?.individual);
}

// Nome do dono: o nome oficial sem números, sem pontuação e sem "ME" ou "EPP" no fim.
export function nomeDoDono(razaoSocial) {
  const nome = String(razaoSocial ?? "")
    .replace(/[\d.\-/]+/g, " ")
    .replace(/\s+(ME|EPP|MEI|EIRELI)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  // Nome com uma palavra só é curto demais para ter certeza de que é um nome de pessoa.
  return nome.split(" ").length >= 2 ? nome : null;
}

// Quantos nomes do dono mostrar. O site não sabe separar nome do meio de sobrenome,
// então mostra os primeiros nomes e esconde o resto.
const NOMES_MOSTRADOS = 2;
const LIGACOES = new Set(["DA", "DE", "DO", "DAS", "DOS", "E"]);

// Nome curto do dono, com a primeira letra maiúscula.
// Ex.: "SEBASTIAO JOSE MARTINS DE SOUZA" vira "Sebastiao Jose".
export function nomeCurto(dono, quantos = NOMES_MOSTRADOS) {
  const palavras = String(dono ?? "").split(" ").filter(Boolean);
  const nomes = [];
  for (const p of palavras) {
    if (nomes.length >= quantos) break;
    if (LIGACOES.has(dobrar(p))) continue;
    nomes.push(p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
  }
  return nomes.length ? nomes.join(" ") : null;
}

// CPF: 11 números, com ou sem pontos e traço. Não pega CNPJ (14 números).
const CPF = /(?<!\d|\d[./-])\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?!\d|[./-]\d)/g;

// Tira os sobrenomes do dono e qualquer CPF de um texto. Ficam só os primeiros nomes.
// Pega também o nome pela metade, como "Diogo Martin" quando o nome todo é "Diogo Martins da Silva".
export function limparTexto(texto, dono, troca = nomeCurto(dono) ?? "") {
  if (texto == null) return texto;
  let saida = String(texto).replace(CPF, "[CPF escondido]");
  if (dono) {
    const escapar = (p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [primeiro, ...resto] = dobrar(dono).split(" ").map(escapar);
    // Cada sobrenome pode aparecer inteiro ou cortado no fim (fatura corta nomes).
    const sobrenomes = resto.map((p) => (p.length > 3 ? `${p.slice(0, 3)}\\w*` : p));
    const busca = new RegExp(`\\b${primeiro}(?:\\s+(?:${sobrenomes.join("|")}))+\\b`, "g");
    const dobrado = dobrar(saida);
    let resultado = "";
    let ultimo = 0;
    for (const m of dobrado.matchAll(busca)) {
      resultado += saida.slice(ultimo, m.index) + troca;
      ultimo = m.index + m[0].length;
    }
    saida = resultado + saida.slice(ultimo);
  }
  return saida;
}

function temDadoPessoal(texto, dono) {
  return texto != null && limparTexto(texto, dono, "") !== String(texto);
}

function tipoDePessoa(receita) {
  return receita.mei ? "MEI" : "empresa individual";
}

// Versão da Receita que pode sair para o público quando a loja é de uma pessoa só.
// Sem nome oficial (razão social), sem sobrenome, sem rua e número e sem telefone.
export function receitaPublica(receita) {
  if (!eDePessoa(receita)) return receita;
  const dono = nomeDoDono(receita.razao_social);
  const fantasia = temDadoPessoal(receita.nome_fantasia, dono) ? null : receita.nome_fantasia;
  return {
    cnpj: receita.cnpj,
    nome_fantasia: fantasia,
    situacao: receita.situacao,
    atividade: receita.atividade,
    mei: Boolean(receita.mei),
    individual: Boolean(receita.individual),
    nome_dono: nomeCurto(dono), // só os primeiros nomes
    bairro: receita.bairro ?? null,
    municipio: receita.municipio ?? null,
    uf: receita.uf ?? null,
    // O link da fonte pública da Receita fica, para quem quiser conferir.
    // O site não copia nem mostra os dados pessoais que estão lá.
    fonte: receita.fonte ?? null,
    fonte_nome: receita.fonte_nome,
    dados_protegidos: true,
  };
}

// Nome da loja para mostrar. Se a IA usou o nome completo do dono, troca pelo nome fantasia
// ou pelos primeiros nomes, como "Diogo Martin (MEI)".
export function lojaPublica(loja, receita) {
  if (!eDePessoa(receita)) return loja;
  const dono = nomeDoDono(receita.razao_social);
  if (loja && !temDadoPessoal(loja, dono)) return loja;
  const fantasia = receitaPublica(receita).nome_fantasia;
  if (fantasia) return fantasia;
  const curto = nomeCurto(dono);
  return curto ? `${curto} (${tipoDePessoa(receita)})` : `Pequeno negócio (${tipoDePessoa(receita)})`;
}

// Tira links que abrem a ficha da empresa na Receita (eles mostram nome e endereço do dono).
export function fontesPublicas(fontes, receita) {
  if (!eDePessoa(receita)) return fontes;
  const n = receita.cnpj;
  const formatado = n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  const dono = nomeDoDono(receita.razao_social);
  const donoNoLink = dono ? dobrar(dono).split(" ").join("-") : null;
  return (fontes ?? []).filter((f) => {
    const link = String(f);
    let legivel = link;
    try { legivel = decodeURIComponent(link); } catch { /* link com % solto: usa como está */ }
    const semSimbolos = legivel.replace(/[.\-/]/g, "");
    if (semSimbolos.includes(n) || legivel.includes(formatado)) return false;
    if (donoNoLink && dobrar(legivel).replace(/[\s_+]/g, "-").includes(donoNoLink)) return false;
    return true;
  });
}
