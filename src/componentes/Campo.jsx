// Campo de texto com rótulo e texto de ajuda. O "id" liga o rótulo ao campo (acessibilidade).
export default function Campo({ id, rotulo, opcional, ajuda, ...resto }) {
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  return (
    <div className="campo">
      <label htmlFor={id}>
        {rotulo} {opcional && <span className="opcional">({opcional})</span>}
      </label>
      <input id={id} aria-describedby={idAjuda} {...resto} />
      {ajuda && <p id={idAjuda} className="ajuda">{ajuda}</p>}
    </div>
  );
}
