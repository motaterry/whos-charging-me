// Moldura dos protótipos: um celular realista no meio da tela e um painel ao lado com:
// - faixa dizendo que é protótipo (nada é real);
// - "Tela X de Y" e o nome da tela (a pessoa sabe onde está);
// - Voltar e Recomeçar (a pessoa pode sair de qualquer tela);
// - "O que mostrar nesta tela", para quem apresenta;
// - "Casos de erro": botões que mostram o que acontece quando algo dá errado.
// MotionConfig reducedMotion="user": quem pediu menos movimento no sistema vê tudo sem animação.
import { MotionConfig, motion, AnimatePresence } from "motion/react";
import Iphone from "./ui/Iphone.jsx";

export default function Moldura({
  titulo, subtitulo, telas, atual, irPara, aoVoltar, podeVoltar, aoRecomecar,
  nota, erros = [], erroAtual, claro = true, children,
}) {
  const indice = Math.max(0, telas.findIndex((t) => t.id === atual));
  const tela = telas[indice];
  return (
    <MotionConfig reducedMotion="user">
      <div className="proto">
        <header className="proto__topo">
          <a className="proto__voltar-lista" href="#/prototipos">← Todos os protótipos</a>
          <h1 className="proto__titulo">{titulo}</h1>
          {subtitulo && <p className="proto__subtitulo">{subtitulo}</p>}
          <p className="proto__faixa" role="note">Protótipo: só visual. Os dados são de exemplo. Nada aqui é real.</p>
        </header>

        <div className="proto__corpo">
          <div className="proto__palco">
            <Iphone claro={claro} rotulo={`Tela do celular: ${tela.nome}`}>{children}</Iphone>
          </div>

          <aside className="proto__lado">
            <p className="proto__onde">Tela {indice + 1} de {telas.length}</p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={tela.id} className="proto__nome-tela"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {tela.nome}
              </motion.p>
            </AnimatePresence>
            <div className="proto__barra" role="progressbar" aria-label="Andamento" aria-valuemin={1} aria-valuemax={telas.length} aria-valuenow={indice + 1}>
              <motion.span animate={{ width: `${((indice + 1) / telas.length) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
            </div>
            <div className="proto__botoes">
              <button type="button" className="proto__botao" disabled={!podeVoltar} onClick={aoVoltar}>Voltar</button>
              <button type="button" className="proto__botao" disabled={!podeVoltar && !erroAtual} onClick={aoRecomecar}>Recomeçar</button>
            </div>

            {nota && (
              <div className="proto__nota">
                <h2>O que mostrar nesta tela</h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={nota} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>{nota}</motion.p>
                </AnimatePresence>
              </div>
            )}

            {erros.length > 0 && (
              <div className="proto__erros">
                <h2>Casos de erro</h2>
                <p>Toque para ver o que a pessoa vê quando algo dá errado.</p>
                <ul>
                  {erros.map((e) => (
                    <li key={e.id}>
                      <button type="button" className={`proto__erro${erroAtual === e.id ? " proto__erro--ativo" : ""}`} aria-pressed={erroAtual === e.id} onClick={e.acao}>
                        <strong>{e.nome}</strong>
                        <span>{e.descricao}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <details className="proto__lista">
              <summary>Ver todas as telas</summary>
              <ol>
                {telas.map((t) => (
                  <li key={t.id}>
                    <button type="button" aria-current={t.id === atual ? "step" : undefined} onClick={() => irPara(t.id)}>{t.nome}</button>
                  </li>
                ))}
              </ol>
            </details>
          </aside>
        </div>
      </div>
    </MotionConfig>
  );
}
