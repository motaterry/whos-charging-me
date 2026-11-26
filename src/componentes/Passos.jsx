// Mostra em que passo a pessoa está ("Passo 2 de 4") e uma barra de progresso.
export default function Passos({ atual, total, titulo }) {
  return (
    <div className="passos">
      <p className="passos__texto">Passo {atual} de {total}{titulo ? ` · ${titulo}` : ""}</p>
      <div className="passos__barra" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={atual}>
        <span style={{ width: `${(atual / total) * 100}%` }} />
      </div>
    </div>
  );
}
