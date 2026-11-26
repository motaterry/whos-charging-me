// Protege os dados pessoais do dono quando a loja é MEI (LGPD).
// No MEI, o nome oficial da empresa costuma ser o nome da pessoa, às vezes com o CPF.
// E o endereço muitas vezes é a casa dela.
// Por isso, para MEI, o site só mostra: nome da loja, tipo de negócio, bairro e cidade.
// Isso vale para a resposta da API (o JSON), não só para a tela.
// Nada é guardado.

// Tira acentos de uma letra só. Cada letra continua com 1 caractere,
// então as posições no texto não mudam.
function dobrar(texto) {
  return Array.from(String(texto ?? ""), (c) => c.normalize("NFD")[0] ?? c).join("").toUpperCase();
}

// Nome do dono: o nome oficial sem números e sem pontuação.
export function nomeDoDono(razaoSocial) {
  const nome = String(razaoSocial ?? "").replace(/[\d.\-/]+/g, " ").replace(/\s+/g, " ").trim();
  // Nome com uma palavra só é curto demais para ter certeza de que é um nome de pessoa.
  return nome.split(" ").length >= 2 ? nome : null;
}

// CPF: 11 números, com ou sem pontos e traço. Não pega CNPJ (14 números).
const CPF = /(?<!\d|\d[./-])\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?!\d|[./-]\d)/g;

// Tira o nome do dono e qualquer CPF de um texto.
export function limparTexto(texto, dono, troca = "[nome escondido]") {
  if (texto == null) return texto;
  let saida = String(texto).replace(CPF, "[CPF escondido]");
  if (dono) {
    const partes = dobrar(dono).split(" ").map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const busca = new RegExp(partes.join("\\s+"), "g");
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

// Versão da Receita que pode sair para o público quando a loja é MEI.
// Sem nome oficial (razão social) e sem rua e número.
export function receitaPublica(receita) {
  if (!receita?.mei) return receita;
  const dono = nomeDoDono(receita.razao_social);
  const fantasia = temDadoPessoal(receita.nome_fantasia, dono) ? null : receita.nome_fantasia;
  return {
    cnpj: receita.cnpj,
    nome_fantasia: fantasia,
    situacao: receita.situacao,
    atividade: receita.atividade,
    mei: true,
    bairro: receita.bairro ?? null,
    municipio: receita.municipio ?? null,
    uf: receita.uf ?? null,
    // O link da fonte abre a ficha completa, com nome e endereço. Por isso não vai.
    fonte: null,
    fonte_nome: receita.fonte_nome,
    dados_protegidos: true,
  };
}

// Nome da loja para mostrar. Se a IA usou o nome do dono, troca pelo nome fantasia
// ou por um nome genérico.
export function lojaPublica(loja, receita) {
  if (!receita?.mei) return loja;
  const dono = nomeDoDono(receita.razao_social);
  if (loja && !temDadoPessoal(loja, dono)) return loja;
  const fantasia = receitaPublica(receita).nome_fantasia;
  return fantasia || "Pequeno negócio (MEI)";
}

// Tira links que abrem a ficha da empresa na Receita (eles mostram nome e endereço do dono).
export function fontesPublicas(fontes, receita) {
  if (!receita?.mei) return fontes;
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
