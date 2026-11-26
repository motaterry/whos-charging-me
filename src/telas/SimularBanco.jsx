// Modo "Simular banco": mostra compras de exemplo como um banco mandaria,
// com o nome estranho e o local onde a maquininha estava.
// Com o local, a busca fica bem mais certeira.

export const COMPRAS = [
  {
    nome: "MP*CASADOPAODEQUEIJO",
    valor: "R$ 18,90",
    data: "24/11",
    local: { endereco: "Alameda Santos, 1290", bairro: "Cerqueira César", cidade: "São Paulo", uf: "SP", lat: -23.5644593, lon: -46.6547833 },
  },
  {
    nome: "PAG*PADARIARODESIA",
    valor: "R$ 32,50",
    data: "23/11",
    local: { endereco: "Rua Rodésia", bairro: "Vila Madalena", cidade: "São Paulo", uf: "SP", lat: -23.5508777, lon: -46.6901345 },
  },
  {
    nome: "RAIADROGASIL",
    valor: "R$ 64,12",
    data: "22/11",
    local: { endereco: "Avenida Paulista, 995", bairro: "Cerqueira César", cidade: "São Paulo", uf: "SP", lat: -23.5654273, lon: -46.6520986 },
  },
  {
    nome: "EBN*SPOTIFY",
    valor: "R$ 21,90",
    data: "20/11",
    local: null, // compra pela internet: não tem maquininha
  },
];

export default function SimularBanco({ carregando, aoEscolher }) {
  return (
    <section aria-labelledby="sim-titulo">
      <h2 id="sim-titulo" className="sim__titulo">Fatura de exemplo</h2>
      <p className="ajuda-texto">
        Assim um banco usaria a gente: ele já manda o nome e o local da compra. Toque numa compra para descobrir a loja.
      </p>
      <ul className="fatura">
        {COMPRAS.map((c) => (
          <li key={c.nome}>
            <button type="button" className="fatura__item" disabled={carregando} onClick={() => aoEscolher(c)}>
              <span className="fatura__nome">{c.nome}</span>
              <span className="fatura__valor">{c.valor}</span>
              <span className="fatura__local">
                {c.data} · {c.local ? `📍 ${c.local.endereco}, ${c.local.bairro}` : "Compra pela internet, sem local"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
