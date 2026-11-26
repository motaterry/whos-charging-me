// Limpa o nome que aparece na fatura do cartão.
// Exemplo: "MP*CASADOPAODEQUEIJO" vira { intermediario: "Mercado Pago", nome: "CASADOPAODEQUEIJO" }.
// O "intermediário" é a empresa da maquininha ou do pagamento online.

const PREFIXOS = [
  { padrao: /^MP\s*\*/i, intermediario: "Mercado Pago" },
  { padrao: /^MERCADOPAGO\s*\*/i, intermediario: "Mercado Pago" },
  { padrao: /^PAG\s*\*/i, intermediario: "PagSeguro (PagBank)" },
  { padrao: /^PAGSEGURO\s*\*/i, intermediario: "PagSeguro (PagBank)" },
  { padrao: /^SUMUP\s*\*/i, intermediario: "SumUp" },
  { padrao: /^PG\s*\*/i, intermediario: "Pagar.me" },
  { padrao: /^EC\s*\*/i, intermediario: "Maquininha (EC)" },
  { padrao: /^STONE\s*\*/i, intermediario: "Stone" },
  { padrao: /^TON\s*\*/i, intermediario: "Ton (Stone)" },
  { padrao: /^IFD\s*\*/i, intermediario: "iFood" },
  { padrao: /^EBN\s*\*/i, intermediario: "Ebanx (compra internacional)" },
  { padrao: /^EBW\s*\*/i, intermediario: "Ebanx (compra internacional)" },
  { padrao: /^DL\s*\*/i, intermediario: "dLocal (compra internacional)" },
  { padrao: /^PAYPAL\s*\*/i, intermediario: "PayPal" },
  { padrao: /^HTM\s*\*/i, intermediario: "Hotmart" },
  { padrao: /^PICPAY\s*\*/i, intermediario: "PicPay" },
  { padrao: /^JIM\.?COM\s*\*/i, intermediario: "InfinitePay" },
];

export function limparNome(texto) {
  const original = String(texto ?? "").trim();
  let nome = original;
  let intermediario = null;

  for (const p of PREFIXOS) {
    if (p.padrao.test(nome)) {
      intermediario = p.intermediario;
      nome = nome.replace(p.padrao, "");
      break;
    }
  }

  // Tira espaços repetidos e símbolos que não ajudam na busca.
  nome = nome.replace(/[*_]+/g, " ").replace(/\s+/g, " ").trim();

  return { original, intermediario, nome };
}
