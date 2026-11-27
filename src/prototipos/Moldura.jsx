// Moldura dos protótipos: um "celular" no meio da tela, com:
// - faixa no topo dizendo que é protótipo (nada é real);
// - "Tela X de Y" e o nome da tela (a pessoa sabe onde está);
// - botões Voltar e Recomeçar (a pessoa pode sair de qualquer tela);
// - uma nota "O que mostrar nesta tela", para quem apresenta.
import { useEffect, useRef } from "react";

export default function Moldura({ titulo, telas, atual, irPara, nota, children }) {
  const indice = telas.findIndex((t) => t.id === atual);
  const tela = telas[indice];
  const rolagem = useRef(null);
  // Ao trocar de tela, volta para o topo do celular.
  useEffect(() => { if (rolagem.current) rolagem.current.scrollTop = 0; }, [atual]);
  return (
    <div className="proto">
      <header className="proto__topo">
        <a className="botao botao--link" href="#/prototipos">← Todos os protótipos</a>
        <h1 className="proto__titulo">{titulo}</h1>
        <p className="proto__faixa" role="note">
          Protótipo: só visual. Os dados são de exemplo. Nada aqui é real.
        </p>
      </header>

      <div className="proto__corpo">
        <div className="proto__celular" aria-label={`Tela do celular: ${tela.nome}`}>
          <div className="proto__tela" ref={rolagem}>{children}</div>
        </div>

        <aside className="proto__lado">
          <p className="proto__onde">
            Tela {indice + 1} de {telas.length} · <strong>{tela.nome}</strong>
          </p>
          <div className="proto__barra" role="progressbar" aria-valuemin={1} aria-valuemax={telas.length} aria-valuenow={indice + 1}>
            <span style={{ width: `${((indice + 1) / telas.length) * 100}%` }} />
          </div>
          <div className="grupo-botoes">
            <button type="button" className="botao botao--secundario" disabled={indice === 0} onClick={() => irPara(telas[indice - 1].id)}>
              Voltar
            </button>
            <button type="button" className="botao botao--secundario" disabled={indice === 0} onClick={() => irPara(telas[0].id)}>
              Recomeçar
            </button>
          </div>
          {nota && (
            <div className="proto__nota">
              <h2>O que mostrar nesta tela</h2>
              <p>{nota}</p>
            </div>
          )}
          <details className="proto__lista">
            <summary>Ver todas as telas</summary>
            <ol>
              {telas.map((t) => (
                <li key={t.id}>
                  <button type="button" className="botao botao--link" aria-current={t.id === atual ? "step" : undefined} onClick={() => irPara(t.id)}>
                    {t.nome}
                  </button>
                </li>
              ))}
            </ol>
          </details>
        </aside>
      </div>
    </div>
  );
}
