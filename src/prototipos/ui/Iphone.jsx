// Celular de mentira, bem parecido com um de verdade: ilha no topo, hora, sinal, bateria e a barrinha de baixo.
// No celular de verdade (tela pequena), a moldura some e o protótipo ocupa a tela toda.
export default function Iphone({ claro = true, children, rotulo }) {
  return (
    <div className="ui-iphone" aria-label={rotulo}>
      <div className="ui-iphone__tela">
        <div className={`ui-status ${claro ? "" : "ui-status--escuro"}`} aria-hidden="true">
          <span className="ui-status__hora">9:41</span>
          <span className="ui-status__ilha" />
          <span className="ui-status__icones">
            <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5l2.4-2.9a3.6 3.6 0 00-4.8 0z M3.2 6.3a7.2 7.2 0 019.6 0l1.4-1.6a9.4 9.4 0 00-12.4 0z M.4 3a11 11 0 0115.2 0L17 1.4A13 13 0 00-1 1.4z" /></svg>
            <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="18" height="9" rx="2.4" /><rect x="25" y="4.5" width="1.5" height="4" rx="0.7" opacity="0.4" /></svg>
          </span>
        </div>
        <div className="ui-iphone__conteudo">{children}</div>
        {/* Camada por cima de tudo: a folha que sobe de baixo aparece aqui (não rola junto com a tela) */}
        <div id="ui-camada" className="ui-camada" />
        <div className="ui-iphone__barra" aria-hidden="true" />
      </div>
    </div>
  );
}
