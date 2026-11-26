// Mostra o grau de certeza com cor e texto (nunca só cor, para quem não enxerga cores).
const TEXTOS = {
  alta: "Certeza alta",
  media: "Certeza média",
  baixa: "Certeza baixa: confira antes de confirmar",
};

export default function SeloCerteza({ nivel = "baixa" }) {
  return <p className={`selo selo--${nivel}`}>{TEXTOS[nivel] ?? "Certeza desconhecida"}</p>;
}
