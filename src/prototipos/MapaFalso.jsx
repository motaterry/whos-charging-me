// Mapa desenhado (não é mapa de verdade). Mostra o local da compra e a loja da Receita.
// No protótipo não usamos mapa real para não parecer um endereço verdadeiro.
export default function MapaFalso({ distancia }) {
  return (
    <figure className="mapa-falso">
      <svg viewBox="0 0 320 150" role="img" aria-label={`Desenho de mapa: a loja fica a ${distancia} do local da compra`}>
        <rect width="320" height="150" fill="#e8eef3" />
        <path d="M0 60 H320 M0 112 H320 M90 0 V150 M215 0 V150" stroke="#ffffff" strokeWidth="12" />
        <path d="M0 20 L320 140" stroke="#ffffff" strokeWidth="7" />
        <rect x="104" y="72" width="96" height="30" rx="4" fill="#d5e3d0" />
        <rect x="228" y="10" width="80" height="40" rx="4" fill="#d5e3d0" />
        <circle cx="150" cy="60" r="16" fill="#0066cc" opacity="0.18" />
        <circle cx="150" cy="60" r="6" fill="#0066cc" stroke="#fff" strokeWidth="2" />
        <path d="M166 44 c0-8 6-14 14-14 s14 6 14 14 c0 10-14 22-14 22 s-14-12-14-22z" fill="#1e7b34" />
        <circle cx="180" cy="44" r="5" fill="#fff" />
      </svg>
      <figcaption>
        <span><span className="mapa-falso__ponto mapa-falso__ponto--compra" /> Onde o cartão foi usado</span>
        <span><span className="mapa-falso__ponto mapa-falso__ponto--loja" /> Endereço na Receita ({distancia})</span>
      </figcaption>
    </figure>
  );
}
