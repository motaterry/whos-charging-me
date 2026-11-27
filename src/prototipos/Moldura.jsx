// Moldura dos protótipos: a página mostra só o celular. Tudo o que não é do app fica na faixa preta do topo:
// - "Sair do protótipo";
// - "Tela X de Y" e o nome da tela (a pessoa sabe onde está);
// - "Recomeçar";
// - "Guia": abre uma folha embaixo com "O que mostrar nesta tela" e o user flow (com os casos de erro).
//   Também tem o "User flow": o caminho feliz em destaque e os erros como desvios. Ao escolher algo, a folha fecha sozinha. Esc ou tocar fora também fecham.
// MotionConfig reducedMotion="user": quem pediu menos movimento no sistema vê tudo sem animação.
import { useEffect, useRef, useState } from "react";
import { MotionConfig, motion, AnimatePresence } from "motion/react";
import Iphone from "./ui/Iphone.jsx";

const MOLA = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 };

export default function Moldura({
  titulo, subtitulo, telas, atual, irPara, aoVoltar, podeVoltar, aoRecomecar,
  nota, erros = [], erroAtual, claro = true, children,
}) {
  const indice = Math.max(0, telas.findIndex((t) => t.id === atual));
  const tela = telas[indice];
  const [guia, setGuia] = useState(false);
  const botaoGuia = useRef(null);
  const folha = useRef(null);
  // No computador, o celular diminui para caber inteiro na altura da janela (sem rolar a página).
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    const medir = () => setEscala(window.innerWidth <= 480 ? 1 : Math.min(1, (window.innerHeight - 40 - 48) / 876));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, []);
  const fechar = () => { setGuia(false); botaoGuia.current?.focus(); };
  const escolher = (acao) => () => { acao(); setGuia(false); };

  // Esc fecha a folha. Ao abrir, o foco vai para a folha (quem usa teclado ou leitor de tela sabe onde está).
  useEffect(() => {
    if (!guia) return;
    folha.current?.focus();
    const tecla = (e) => { if (e.key === "Escape") fechar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [guia]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="proto">
        <header className="proto__faixa-topo">
          <a className="proto__sair" href="#/">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            Sair<span className="proto__faixa-texto"> do protótipo</span>
          </a>
          <button type="button" className="proto__onde-faixa" onClick={() => setGuia(true)} aria-label={`Tela ${indice + 1} de ${telas.length}: ${tela.nome}. Abrir guia`}>
            <span className="proto__onde-num">{indice + 1}/{telas.length}</span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={tela.id} className="proto__onde-nome" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                {tela.nome}
              </motion.span>
            </AnimatePresence>
          </button>
          <span className="proto__faixa-direita">
            <button type="button" className="proto__faixa-botao" onClick={aoRecomecar} disabled={!podeVoltar && !erroAtual} aria-label="Recomeçar do início">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 109-9 9.5 9.5 0 00-6.7 2.7L3 8 M3 3v5h5" /></svg>
              <span className="proto__faixa-texto">Recomeçar</span>
            </button>
            <button ref={botaoGuia} type="button" className="proto__faixa-botao proto__faixa-botao--guia" onClick={() => setGuia(true)} aria-haspopup="dialog" aria-expanded={guia}>
              Guia{erroAtual && <span className="proto__faixa-ponto" aria-label="(caso de erro ativo)" />}
            </button>
          </span>
        </header>

        <div className="proto__palco" style={{ zoom: escala }}>
          <Iphone claro={claro} rotulo={`Tela do celular: ${tela.nome}`}>{children}</Iphone>
        </div>

        <AnimatePresence>
          {guia && (
            <>
              <motion.div className="proto-guia__fundo" onClick={fechar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div ref={folha} tabIndex={-1} className="proto-guia" role="dialog" aria-modal="true" aria-labelledby="guia-titulo"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={MOLA}
                drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) fechar(); }}>
                <div className="proto-guia__pegador" aria-hidden="true" />
                <div className="proto-guia__cabeca">
                  <div>
                    <p className="proto-guia__cenario">{titulo}</p>
                    <h2 id="guia-titulo" className="proto-guia__titulo">Tela {indice + 1} de {telas.length}: {tela.nome}</h2>
                  </div>
                  <button type="button" className="proto-guia__fechar" onClick={fechar} aria-label="Fechar guia">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12 M18 6L6 18" /></svg>
                  </button>
                </div>
                <div className="proto__barra" role="progressbar" aria-label="Andamento" aria-valuemin={1} aria-valuemax={telas.length} aria-valuenow={indice + 1}>
                  <span style={{ width: `${((indice + 1) / telas.length) * 100}%` }} />
                </div>

                <div className="proto-guia__corpo">
                  {subtitulo && <p className="proto-guia__sub">{subtitulo}</p>}
                  <div className="proto__botoes">
                    <button type="button" className="proto__botao" disabled={!podeVoltar} onClick={escolher(aoVoltar)}>Voltar uma tela</button>
                    <button type="button" className="proto__botao" disabled={!podeVoltar && !erroAtual} onClick={escolher(aoRecomecar)}>Recomeçar</button>
                  </div>

                  {nota && (
                    <section className="proto__nota">
                      <h3>O que mostrar nesta tela</h3>
                      <p>{nota}</p>
                    </section>
                  )}


                  {/* User flow: o caminho feliz em destaque (tudo dá certo) e os erros como desvios ao lado */}
                  <section className="proto-fluxo" aria-labelledby="fluxo-titulo">
                    <h3 id="fluxo-titulo">User flow: o caminho feliz</h3>
                    <p className="proto-fluxo__legenda">
                      <span><i className="proto-fluxo__amostra proto-fluxo__amostra--feliz" /> Caminho feliz: tudo dá certo</span>
                      {erros.length > 0 && <span><i className="proto-fluxo__amostra proto-fluxo__amostra--erro" /> Desvio: toque para ver o caso de erro</span>}
                    </p>
                    <ol className="proto-fluxo__lista">
                      {telas.map((t, i) => {
                        const desvios = erros.filter((e) => e.tela === t.id);
                        const aqui = t.id === atual;
                        return (
                          <li key={t.id} className={`proto-fluxo__passo${aqui ? " proto-fluxo__passo--aqui" : ""}${i === telas.length - 1 ? " proto-fluxo__passo--fim" : ""}`}>
                            <span className="proto-fluxo__no" aria-hidden="true">{i + 1}</span>
                            <div className="proto-fluxo__corpo">
                              <button type="button" className="proto-fluxo__tela" aria-current={aqui ? "step" : undefined} onClick={escolher(() => irPara(t.id))}>
                                <strong>{t.nome}</strong>
                                {aqui && <span className="proto-fluxo__voce">Você está aqui</span>}
                              </button>
                              {t.acao && <p className="proto-fluxo__acao">{t.acao}</p>}
                              {t.alternativa && <p className="proto-fluxo__alt">{t.alternativa}</p>}
                              {desvios.length > 0 && (
                                <ul className="proto-fluxo__desvios" aria-label={`Casos de erro em ${t.nome}`}>
                                  {desvios.map((e) => (
                                    <li key={e.id}>
                                      <button type="button" className={`proto-fluxo__desvio${erroAtual === e.id ? " proto-fluxo__desvio--ativo" : ""}`} title={e.descricao} onClick={escolher(e.acao)}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 9v4 M12 17h.01 M10.3 3.9L2 18a2 2 0 001.7 3h16.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>
                                        {e.nome}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
