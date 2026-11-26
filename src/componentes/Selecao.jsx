// Lista de opções no visual do site (no lugar do <select> do navegador).
// Segue o padrão de acessibilidade "combobox só de escolha" (WAI-ARIA):
// - Teclado: seta para cima/baixo, Home, End, Enter ou Espaço escolhe, Esc fecha, letras pulam para a opção.
// - Leitor de tela: anuncia o nome do campo, a opção escolhida e a opção em foco.
import { useEffect, useId, useRef, useState } from "react";

export default function Selecao({ id, rotulo, opcoes, valor, aoMudar, placeholder = "Escolha uma opção" }) {
  const base = useId();
  const idRotulo = `${id}-rotulo`;
  const idLista = `${id}-lista`;
  const idOpcao = (i) => `${base}-op-${i}`;
  const [aberta, setAberta] = useState(false);
  const [ativa, setAtiva] = useState(Math.max(0, opcoes.indexOf(valor)));
  const caixa = useRef(null);
  const lista = useRef(null);
  const busca = useRef({ texto: "", tempo: 0 });

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberta) return;
    const fora = (e) => { if (!caixa.current?.contains(e.target)) setAberta(false); };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberta]);

  // Mantém a opção em foco visível quando a lista rola.
  useEffect(() => {
    if (aberta) lista.current?.querySelector(`#${CSS.escape(idOpcao(ativa))}`)?.scrollIntoView({ block: "nearest" });
  }, [aberta, ativa]); // eslint-disable-line react-hooks/exhaustive-deps

  function abrir() {
    setAtiva(Math.max(0, opcoes.indexOf(valor)));
    setAberta(true);
  }

  function escolher(i) {
    aoMudar(opcoes[i]);
    setAberta(false);
  }

  function pularPorLetra(tecla) {
    const agora = Date.now();
    const b = busca.current;
    b.texto = agora - b.tempo > 600 ? tecla : b.texto + tecla;
    b.tempo = agora;
    const normal = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const i = opcoes.findIndex((o) => normal(o).startsWith(normal(b.texto)));
    if (i >= 0) { setAtiva(i); if (!aberta) setAberta(true); }
  }

  function tecla(e) {
    const ultimo = opcoes.length - 1;
    if (!aberta) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); abrir(); }
      else if (e.key.length === 1 && /\S/.test(e.key)) pularPorLetra(e.key);
      return;
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setAtiva((a) => Math.min(ultimo, a + 1)); break;
      case "ArrowUp": e.preventDefault(); setAtiva((a) => Math.max(0, a - 1)); break;
      case "Home": e.preventDefault(); setAtiva(0); break;
      case "End": e.preventDefault(); setAtiva(ultimo); break;
      case "Enter": case " ": e.preventDefault(); escolher(ativa); break;
      case "Escape": e.preventDefault(); setAberta(false); break;
      case "Tab": escolher(ativa); break;
      default: if (e.key.length === 1 && /\S/.test(e.key)) pularPorLetra(e.key);
    }
  }

  return (
    <div className="campo selecao" ref={caixa}>
      <label id={idRotulo} htmlFor={id}>{rotulo}</label>
      <button
        id={id}
        type="button"
        role="combobox"
        className={`selecao__botao${valor ? "" : " selecao__botao--vazio"}`}
        aria-haspopup="listbox"
        aria-expanded={aberta}
        aria-controls={idLista}
        aria-labelledby={`${idRotulo} ${id}`}
        aria-activedescendant={aberta ? idOpcao(ativa) : undefined}
        onClick={() => (aberta ? setAberta(false) : abrir())}
        onKeyDown={tecla}
      >
        <span>{valor || placeholder}</span>
        <svg className="selecao__seta" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul id={idLista} ref={lista} role="listbox" aria-labelledby={idRotulo} className="selecao__lista" hidden={!aberta} tabIndex={-1}>
        {opcoes.map((o, i) => (
          <li
            key={o}
            id={idOpcao(i)}
            role="option"
            aria-selected={o === valor}
            className={`selecao__opcao${i === ativa ? " selecao__opcao--ativa" : ""}`}
            onPointerMove={() => setAtiva(i)}
            onClick={() => escolher(i)}
          >
            <span>{o}</span>
            {o === valor && (
              <svg className="selecao__marca" viewBox="0 0 14 10" aria-hidden="true">
                <path d="M1 5l4 4 8-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
