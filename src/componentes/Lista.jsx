// Lista numerada com bolinhas (linha do tempo de passos).
export default function Lista({ itens }) {
  return (
    <ol className="lista">
      {itens.map((item, i) => (
        <li key={i}><span className="lista__numero" aria-hidden="true">{i + 1}</span><span>{item}</span></li>
      ))}
    </ol>
  );
}
