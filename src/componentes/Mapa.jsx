// Mapa pequeno do OpenStreetMap (grátis, sem chave) com um ponto no local da compra.
export default function Mapa({ lat, lon, titulo }) {
  const d = 0.004; // tamanho da área mostrada (uns 400 m para cada lado)
  const caixa = [lon - d, lat - d, lon + d, lat + d].join(",");
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${caixa}&layer=mapnik&marker=${lat},${lon}`;
  const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
  return (
    <figure className="mapa">
      <iframe title={titulo} src={embed} loading="lazy" />
      <figcaption>
        <a href={link} target="_blank" rel="noopener noreferrer">Abrir o mapa maior</a>
      </figcaption>
    </figure>
  );
}
