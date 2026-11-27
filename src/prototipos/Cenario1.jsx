// Protótipo do cenário 1 (B2B): o "Quem me cobrou?" dentro do app de um banco fictício.
// O banco já sabe o nome e o local da compra. A pessoa só toca na compra.
// Fluxo A: cartão -> detalhe (loja achada). Fluxo B: contestar com provas já preenchidas -> enviado.
import { useCallback, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import Moldura from "./Moldura.jsx";
import MapaFalso from "./MapaFalso.jsx";
import Icone from "./ui/Icone.jsx";
import {
  usePilha, Telas, Toque, Folha, Aviso, Contador, CheckAnimado, AnelCerteza, Esqueleto,
  PassosAnalise, listaEmSequencia, itemEmSequencia, MOLA,
} from "./ui/kit.jsx";
import { BANCO_FICTICIO, coresCss } from "./marca.js";
import { RESPOSTA_PADARIA as R, API_PEDIDO, API_RESPOSTA } from "./dados.js";

const TELAS = [
  // "acao" = o que a pessoa faz nesta tela para seguir no caminho feliz (aparece no user flow do Guia).
  { id: "cartao", nome: "Cartão no app do banco", acao: "Toca na compra de nome estranho (MP*PADARIABOMDIA)" },
  { id: "detalhe", nome: "Quem cobrou (loja achada)", acao: "Vê a loja e toca em \"Não reconheço\"", alternativa: "Ou toca em \"Reconheço esta compra\": a compra fica marcada e volta ao cartão" },
  { id: "contestar", nome: "Contestar com provas", acao: "Escolhe o motivo, revisa e confirma o envio" },
  { id: "enviado", nome: "Contestação enviada", acao: "Fim: guarda o protocolo e volta ao cartão" },
];

const NOTAS = {
  cartao: "A pessoa está no app do banco, sem login novo. Os nomes estranhos ganham a marca \"Quem é?\". Toque na padaria.",
  detalhe: "O banco mandou o nome e o local para a nossa API. A tela mostra cada etapa da busca, depois a loja, a certeza, o mapa e as fontes. A pessoa pode mudar a categoria. Abra \"Ver por trás\" para mostrar a parte técnica ao júri.",
  contestar: "As provas que a API achou já vão junto: loja, CNPJ, endereço e distância. A pessoa não digita nada. Antes de enviar, o app pede confirmação.",
  enviado: "O banco recebe a contestação com provas. A pessoa vê o protocolo e o andamento no próprio app.",
};

const COMPRAS = [
  { grupo: "Hoje", itens: [{ id: "mercado", nome: "Supermercado Ideal", cat: "Mercado", valor: "187,40", icone: "carrinho", cor: "#5aa9ff" }] },
  { grupo: "Ontem", itens: [{ id: "padaria", nome: "MP*PADARIABOMDIA", cat: "Outros", valor: "32,50", estranho: true }] },
  { grupo: "23 nov", itens: [{ id: "posto", nome: "Posto Avenida", cat: "Transporte", valor: "150,00", icone: "combustivel", cor: "#ffa93a" }] },
  { grupo: "22 nov", itens: [
    { id: "lanches", nome: "PAG*LANCHESDOZE", cat: "Outros", valor: "24,00", estranho: true },
    { id: "farmacia", nome: "Farmácia Saúde Mais", cat: "Saúde", valor: "58,90", icone: "remedio", cor: "#ff6fa5" },
  ] },
];

export default function Cenario1() {
  const nav = usePilha("cartao");
  const [movida, setMovida] = useState(false);
  const [reconhecida, setReconhecida] = useState(false);
  const [contestada, setContestada] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const fecharAviso = useCallback(() => setAviso(null), []);

  function recomecar() { nav.trocar("cartao"); setErro(null); setMovida(false); setReconhecida(false); setContestada(false); setAviso(null); }
  function comErro(tela, e) { return () => { setErro(e); nav.trocar("cartao"); if (tela !== "cartao") nav.ir("detalhe"); if (tela === "contestar") nav.ir("contestar"); }; }
  function irPara(t) { setErro(null); nav.trocar("cartao"); const ordem = TELAS.map((x) => x.id); ordem.slice(1, ordem.indexOf(t) + 1).forEach((x) => nav.ir(x)); }

  const ERROS = [
    { id: "api", tela: "detalhe", nome: "Nossa API fora do ar", descricao: "A busca falha. A pessoa pode tentar de novo ou contestar mesmo assim.", acao: comErro("detalhe", "api") },
    { id: "baixa", tela: "detalhe", nome: "Loja sem certeza", descricao: "Duas lojas parecidas, longe do local. Mostramos a dúvida.", acao: comErro("detalhe", "baixa") },
    { id: "motivo", tela: "contestar", nome: "Esqueceu o motivo", descricao: "Toque em \"Revisar\" sem escolher o que aconteceu.", acao: comErro("contestar", "motivo") },
    { id: "envio", tela: "contestar", nome: "Falha ao enviar", descricao: "O envio falha na 1ª vez. Nada se perde. Na 2ª tentativa funciona.", acao: comErro("contestar", "envio") },
  ];

  return (
    <Moldura
      titulo="Cenário 1: dentro do app do banco"
      subtitulo="Para bancos (B2B). O banco usa a nossa API e mostra a resposta com o visual dele."
      telas={TELAS} atual={nav.atual} irPara={irPara}
      aoVoltar={nav.voltar} podeVoltar={nav.tamanho > 1} aoRecomecar={recomecar}
      nota={NOTAS[nav.atual]} erros={ERROS} erroAtual={erro} claro={false}
    >
      <div className="b1 b1--escuro" style={coresCss(BANCO_FICTICIO)}>
        <Aviso texto={aviso?.texto} acao={aviso?.acao} aoAcao={aviso?.aoAcao} aoFechar={fecharAviso} />
        <Telas chave={nav.atual + (erro || "")} direcao={nav.direcao}>
          {nav.atual === "cartao" && (
            <Cartao movida={movida} reconhecida={reconhecida} contestada={contestada}
              aoTocar={() => nav.ir("detalhe")}
              aoBloqueado={() => setAviso({ texto: "No protótipo, só a compra da padaria abre." })} />
          )}
          {nav.atual === "detalhe" && (
            <Detalhe erro={erro} movida={movida}
              aoMover={() => { setMovida(true); setAviso({ texto: `Movida para ${R.categoria}`, acao: "Desfazer", aoAcao: () => { setMovida(false); setAviso(null); } }); }}
              aoTentarDeNovo={() => setErro(null)}
              aoVoltar={nav.voltar}
              aoReconhecer={() => { setReconhecida(true); nav.voltar(); setAviso({ texto: "Pronto. Marcamos como reconhecida." }); }}
              aoContestar={() => { setAviso(null); nav.ir("contestar"); }} />
          )}
          {nav.atual === "contestar" && <Contestar erro={erro} baixa={erro === "baixa"} aoVoltar={nav.voltar} aoEnviado={() => nav.ir("enviado")} />}
          {nav.atual === "enviado" && <Enviado aoFim={() => { setContestada(true); nav.trocar("cartao"); setErro(null); }} />}
        </Telas>
      </div>
    </Moldura>
  );
}

// ---------- Avatar da loja (ícone colorido, ou "?" com anel girando para nome estranho) ----------
function Avatar({ item, identificado, grande = false }) {
  const cls = `b1-avatar${grande ? " b1-avatar--grande" : ""}`;
  if (item.estranho && !identificado) {
    return (
      <span className={`${cls} b1-avatar--estranho`}>
        <span className="b1-avatar__anel" aria-hidden="true" />
        <span className="b1-avatar__miolo"><Icone nome="interrogacao" tamanho={grande ? 30 : 20} traco={2.4} /></span>
      </span>
    );
  }
  const icone = item.estranho ? "pao" : item.icone;
  const cor = item.estranho ? "#34c759" : item.cor;
  return (
    <span className={cls} style={{ background: `color-mix(in srgb, ${cor} 22%, transparent)`, color: cor }}>
      <Icone nome={icone} tamanho={grande ? 30 : 20} />
    </span>
  );
}

function BarraTabs({ aoBloqueado }) {
  const abas = [["casa", "Início"], ["cartao", "Cartões"], ["pix", "Pix"], ["grafico", "Investir"], ["lista", "Menu"]];
  return (
    <nav className="ui-tabs" aria-label="Menu do banco">
      {abas.map(([i, n]) => (
        <button key={n} type="button" className={`ui-tabs__item${n === "Cartões" ? " ui-tabs__item--ativo" : ""}`}
          aria-current={n === "Cartões" ? "page" : undefined} onClick={n === "Cartões" ? undefined : aoBloqueado}>
          <Icone nome={i} tamanho={24} />
          <span>{n}</span>
        </button>
      ))}
    </nav>
  );
}

// ---------- Tela 1: cartão e fatura ----------
function Cartao({ movida, reconhecida, contestada, aoTocar, aoBloqueado }) {
  const identificada = movida || reconhecida || contestada;
  const estranhas = identificada ? 1 : 2;
  return (
    <div className="ui-rolagem ui-rolagem--com-tabs">
      <div className="b1-topo">
        <h2 className="b1-topo__titulo">Cartões</h2>
        <div className="b1-topo__icones">
          <button type="button" aria-label="Buscar" onClick={aoBloqueado}><Icone nome="busca" tamanho={22} /></button>
          <button type="button" aria-label="Ajuda" onClick={aoBloqueado}><Icone nome="ajuda" tamanho={22} /></button>
          <span className="b1-topo__perfil" aria-hidden="true">A</span>
        </div>
      </div>

      {/* O cartão, pequeno, com a situação dele ao lado */}
      <motion.div className="b1-meu-cartao" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...MOLA, delay: 0.05 }}>
        <span className="b1-cartao" aria-hidden="true">
          <span className="b1-cartao__brilho" />
          <span className="b1-cartao__sigla">{BANCO_FICTICIO.sigla}</span>
          <span className="b1-cartao__chip" />
        </span>
        <span className="b1-meu-cartao__texto">
          <strong>Crédito · final 1234</strong>
          <small><span className="ui-ponto-verde" /> Cartão desbloqueado</small>
        </span>
        <button type="button" className="b1-link" onClick={aoBloqueado}>Bloquear</button>
      </motion.div>

      <section className="b1-fatura" aria-label="Fatura aberta">
        <div className="b1-fatura__cabeca">
          <p className="b1-fatura__rotulo">Fatura aberta</p>
          <span className="b1-fatura__vence">Vence em 10 dez</span>
        </div>
        <p className="b1-fatura__valor"><Contador valor={1284.3} /></p>
        <div className="b1-limite" aria-label="Limite usado: 43%">
          <motion.span initial={{ width: 0 }} animate={{ width: "43%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
        </div>
        <dl className="b1-fatura__dados">
          <div><dt>Limite disponível</dt><dd>R$ 1.715,70</dd></div>
          <div><dt>Melhor dia de compra</dt><dd>4 dez</dd></div>
        </dl>
        <Toque className="ui-botao ui-botao--principal ui-botao--largo b1-fatura__pagar" onClick={aoBloqueado}>Pagar fatura</Toque>
      </section>

      <AnimatePresence>
        {estranhas > 0 && (
          <motion.button type="button" className="b1-dica" onClick={aoTocar}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.98 }}>
            <span className="b1-dica__icone"><Icone nome="brilho" tamanho={20} /></span>
            <span><strong>{estranhas === 1 ? "1 compra" : "2 compras"} com nome estranho</strong><small>Toque para descobrir quem cobrou</small></span>
            <Icone nome="seta" tamanho={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <ul className="b1-atalhos" aria-label="Atalhos do cartão">
        {[["cartao", "Cartão virtual"], ["grafico", "Ajustar limite"], ["cadeado", "Senha"], ["mais", "Mais opções"]].map(([i, n]) => (
          <li key={n}><button type="button" onClick={aoBloqueado}><Icone nome={i} tamanho={22} /><span>{n}</span></button></li>
        ))}
      </ul>

      <div className="b1-transacoes">
        <h3>Transações</h3>
        <span className="b1-transacoes__mes">Novembro · <em>Aberta</em></span>
      </div>

      <motion.div variants={listaEmSequencia} initial="esconde" animate="mostra">
        {COMPRAS.map((g) => (
          <section key={g.grupo} className="b1-grupo" aria-label={g.grupo}>
            <motion.h3 variants={itemEmSequencia} className="b1-grupo__titulo">{g.grupo}</motion.h3>
            <ul className="b1-lista">
              {g.itens.map((c) => {
                const padaria = c.id === "padaria";
                const ident = padaria && identificada;
                const nome = ident ? R.loja : c.nome;
                const cat = padaria && movida ? R.categoria : c.cat;
                const conteudo = (
                  <>
                    <Avatar item={c} identificado={ident} />
                    <span className="b1-lista__meio">
                      <span className={`b1-lista__nome${c.estranho && !ident ? " b1-lista__nome--cru" : ""}`}>{nome}</span>
                      <span className="b1-lista__info">
                        {cat}
                        {c.estranho && !ident && <span className="b1-chip b1-chip--quem">Quem é?</span>}
                        {ident && !contestada && <span className="b1-chip b1-chip--ok">Identificada</span>}
                        {padaria && contestada && <span className="b1-chip b1-chip--contestada">Em contestação</span>}
                      </span>
                    </span>
                    <span className="b1-lista__valor">R$ {c.valor}</span>
                  </>
                );
                return (
                  <motion.li key={c.id} variants={itemEmSequencia}>
                    <motion.button type="button" className={`b1-lista__item${c.estranho ? " b1-lista__item--estranho" : ""}`}
                      whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.06)" }}
                      onClick={padaria ? aoTocar : aoBloqueado}>
                      {conteudo}
                    </motion.button>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        ))}
      </motion.div>
      <BarraTabs aoBloqueado={aoBloqueado} />
    </div>
  );
}

// ---------- Barra de navegação com vidro fosco ----------
function BarraNav({ titulo, aoVoltar, voltarTexto = "Voltar" }) {
  return (
    <div className="ui-nav">
      {aoVoltar ? (
        <button type="button" className="ui-nav__voltar" onClick={aoVoltar}>
          <Icone nome="voltar" tamanho={24} traco={2.4} /><span>{voltarTexto}</span>
        </button>
      ) : <span />}
      <span className="ui-nav__titulo">{titulo}</span>
      <span />
    </div>
  );
}

const PASSOS = ["Limpando o nome da maquininha", "Procurando o CNPJ na Receita Federal", "Comparando com o local da compra"];

const R_BAIXA = {
  loja: "Lanchonete Bom Dia",
  porque: "Achamos 2 lojas com nome parecido. A mais perto fica a 3,2 km de onde o cartão foi usado. Por isso não temos certeza.",
  distancia: "3,2 km",
};

// ---------- Tela 2: detalhe da compra com a loja achada ----------
function Detalhe({ erro, movida, aoMover, aoTentarDeNovo, aoVoltar, aoReconhecer, aoContestar }) {
  const [fase, setFase] = useState("analisando");
  const terminar = useCallback(() => setFase("pronto"), []);
  const falhou = erro === "api";
  const baixa = erro === "baixa";
  const pronto = fase === "pronto";

  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="Detalhe da compra" aoVoltar={aoVoltar} voltarTexto="Cartões" />

      <div className="b1-heroi">
        <Avatar item={{ estranho: true }} identificado={pronto && !falhou && !baixa} grande />
        <p className="b1-heroi__valor">R$ 32,50</p>
        <p className="b1-heroi__cru">MP*PADARIABOMDIA</p>
        <p className="b1-heroi__data">Ontem, 08:12 · Cartão final 1234</p>
      </div>

      <section className="ui-cartao b1-quem" aria-labelledby="quem-titulo" aria-busy={!pronto}>
        <p className="b1-quem__marca"><Icone nome="brilho" tamanho={16} /> Quem cobrou <span>· com Quem me cobrou?</span></p>
        <AnimatePresence mode="wait" initial={false}>
          {!pronto ? (
            <motion.div key="analise" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h3 id="quem-titulo" className="visualmente-oculto">Procurando a loja</h3>
              <PassosAnalise passos={PASSOS} aoTerminar={terminar} />
              <div className="b1-quem__esqueleto"><Esqueleto largura="60%" altura={22} /><Esqueleto largura="90%" /><Esqueleto largura="75%" /></div>
            </motion.div>
          ) : falhou ? (
            <motion.div key="erro" className="b1-erro" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
              <span className="b1-erro__icone"><Icone nome="alerta" tamanho={26} /></span>
              <h3 id="quem-titulo">Não conseguimos descobrir a loja agora</h3>
              <p>O serviço que procura a loja não respondeu. A compra continua na sua fatura e nada mudou.</p>
              <p className="ui-suave">Tente de novo em alguns segundos, ou conteste mesmo assim.</p>
              <Toque className="ui-botao ui-botao--principal ui-botao--largo" onClick={() => { setFase("analisando"); aoTentarDeNovo(); }}>Tentar de novo</Toque>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
              <div className="b1-quem__cabeca">
                <div>
                  {baixa && <p className="ui-suave b1-quem__talvez">Não temos certeza. O mais provável é</p>}
                  <motion.h3 id="quem-titulo" className="b1-quem__loja" initial={{ filter: "blur(6px)", opacity: 0 }} animate={{ filter: "blur(0px)", opacity: 1 }} transition={{ duration: 0.5 }}>
                    {baixa ? R_BAIXA.loja : R.loja}
                  </motion.h3>
                  <p className="ui-suave">{baixa ? "Lanchonete" : R.atividade}</p>
                </div>
                <AnelCerteza nivel={baixa ? "baixa" : "alta"} variante="3d" />
              </div>
              <p className="b1-quem__porque">{baixa ? R_BAIXA.porque : R.porque}</p>
              <MapaFalso distancia={baixa ? R_BAIXA.distancia : R.distancia} longe={baixa} escuro />
              {!baixa && (
                <dl className="ui-dados">
                  <div><dt>CNPJ</dt><dd>{R.cnpj}</dd></div>
                  <div><dt>Endereço</dt><dd>{R.endereco}</dd></div>
                  <div><dt>Situação</dt><dd><span className="ui-ponto-verde" /> Ativa na Receita</dd></div>
                </dl>
              )}
              <details className="ui-fontes">
                <summary>{baixa ? "Ver as 2 lojas parecidas" : `Ver as fontes (${R.fontes.length})`}</summary>
                <ul>
                  {(baixa ? ["Lanchonete Bom Dia · a 3,2 km", "Bom Dia Lanches e Café · a 7,8 km"] : R.fontes).map((f) => (
                    <li key={f}><Icone nome="link" tamanho={14} /> {f}</li>
                  ))}
                </ul>
              </details>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {pronto && !falhou && (
        <motion.section className="ui-cartao b1-categoria" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...MOLA, delay: 0.15 }} aria-labelledby="cat-titulo">
          <h3 id="cat-titulo" className="ui-rotulo">Categoria</h3>
          {baixa ? (
            <p className="ui-suave">Sem certeza, não sugerimos categoria. A compra fica em "Outros" até você confirmar.</p>
          ) : (
            <LayoutGroup>
              <div className="b1-categoria__linha">
                <motion.span layout className={`b1-tag${movida ? " b1-tag--velha" : ""}`}>Outros</motion.span>
                <Icone nome="seta" tamanho={16} />
                <motion.span layout className={`b1-tag b1-tag--nova${movida ? " b1-tag--ativa" : ""}`}>
                  {movida && <Icone nome="check" tamanho={14} traco={3} />} {R.categoria}
                </motion.span>
              </div>
              {!movida && <Toque className="ui-botao ui-botao--secundario ui-botao--largo" onClick={aoMover}>Mover para {R.categoria}</Toque>}
            </LayoutGroup>
          )}
        </motion.section>
      )}

      {pronto && !falhou && (
        <details className="b1-tecnico">
          <summary><Icone nome="codigo" tamanho={16} /> Ver por trás: o que a API recebe e devolve</summary>
          <div className="b1-tecnico__corpo">
            <p>O banco manda <code>POST /api/identificar</code></p>
            <pre>{JSON.stringify(API_PEDIDO, null, 2)}</pre>
            <p>A nossa API devolve (resumo), em cerca de 13 s</p>
            <pre>{JSON.stringify(baixa ? { ...API_RESPOSTA, loja: R_BAIXA.loja, certeza: "baixa", distancia_m: 3200 } : API_RESPOSTA, null, 2)}</pre>
          </div>
        </details>
      )}

      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" disabled={!pronto} onClick={aoReconhecer}>Reconheço esta compra</Toque>
        <Toque className="ui-botao ui-botao--perigo" onClick={aoContestar}>Não reconheço</Toque>
      </div>
    </div>
  );
}

// ---------- Tela 3: contestar com provas ----------
function Contestar({ erro, baixa, aoVoltar, aoEnviado }) {
  const [tipo, setTipo] = useState("");
  const [aviso, setAviso] = useState("");
  const [folha, setFolha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [falhouEnvio, setFalhouEnvio] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [tremer, setTremer] = useState(0);

  function revisar() {
    if (!tipo) { setAviso("Escolha o que aconteceu para continuar."); setTremer((t) => t + 1); return; }
    setAviso(""); setFolha(true);
  }
  function enviar() {
    setEnviando(true); setFalhouEnvio(false);
    setTimeout(() => {
      setEnviando(false);
      if (erro === "envio" && tentativas === 0) { setTentativas(1); setFalhouEnvio(true); return; }
      setFolha(false); aoEnviado();
    }, 1100);
  }

  const provas = [
    ["Loja", R.loja], ["CNPJ na Receita", R.cnpj], ["Endereço da loja", R.endereco],
    ["Distância do local da compra", R.distancia], ["Fontes consultadas", `${R.fontes.length}`],
  ];
  const opcoes = [
    ["golpe", "Não fui eu", "Alguém usou meu cartão. O banco bloqueia este cartão e manda outro.", "escudo"],
    ["problema", "Fui eu, mas teve problema", "Ex.: cobraram duas vezes ou não recebi o produto.", "alerta"],
  ];

  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="" aoVoltar={aoVoltar} voltarTexto="Compra" />
      <div className="ui-margem">
        <h2 className="ui-titulo-grande">Contestar compra</h2>
        <p className="ui-suave">{R.loja} · R$ 32,50 · ontem</p>

        <h3 className="ui-rotulo b1-espaco">O que aconteceu?</h3>
        <motion.div role="radiogroup" aria-label="O que aconteceu?" aria-describedby={aviso ? "aviso-tipo" : undefined}
          className="b1-opcoes" key={tremer} animate={tremer ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
          {opcoes.map(([v, t, d, i]) => (
            <button key={v} type="button" role="radio" aria-checked={tipo === v}
              className={`b1-opcao${tipo === v ? " b1-opcao--ativa" : ""}`} onClick={() => { setTipo(v); setAviso(""); }}>
              {tipo === v && <motion.span layoutId="opcao-anel" className="b1-opcao__anel" transition={MOLA} />}
              <span className="b1-opcao__icone"><Icone nome={i} tamanho={22} /></span>
              <span className="b1-opcao__texto"><strong>{t}</strong><small>{d}</small></span>
              <span className="b1-opcao__radio" aria-hidden="true">{tipo === v && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={MOLA} />}</span>
            </button>
          ))}
        </motion.div>
        <AnimatePresence>
          {aviso && (
            <motion.p id="aviso-tipo" className="ui-erro-texto" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <Icone nome="alerta" tamanho={16} /> {aviso}
            </motion.p>
          )}
        </AnimatePresence>

        <h3 className="ui-rotulo b1-espaco">Provas que vão junto</h3>
        <motion.ul className="ui-cartao b1-provas" variants={listaEmSequencia} initial="esconde" animate="mostra">
          {provas.map(([k, v]) => (
            <motion.li key={k} variants={itemEmSequencia}>
              <span className="b1-provas__check"><Icone nome="check" tamanho={14} traco={3} /></span>
              <span><small>{k}</small>{v}</span>
            </motion.li>
          ))}
        </motion.ul>
        <p className="ui-suave b1-provas__nota">
          {baixa ? "A loja veio sem certeza. Mesmo assim, as fontes vão junto para o banco analisar." : "Achadas pela nossa API. Você não precisa digitar nada."}
        </p>

        <label className="ui-campo">
          <span>Quer contar mais alguma coisa? <em>(opcional)</em></span>
          <textarea rows={2} placeholder="Ex.: eu estava em casa nesse horário" />
        </label>
      </div>

      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" onClick={revisar}>Revisar e enviar</Toque>
      </div>

      <Folha aberta={folha} aoFechar={() => !enviando && setFolha(false)} titulo="Enviar contestação?" travada={enviando} estilo={coresCss(BANCO_FICTICIO)} classe="b1-folha--escuro">
        <h2 className="ui-folha__titulo">Enviar contestação?</h2>
        <dl className="ui-dados ui-dados--folha">
          <div><dt>Compra</dt><dd>R$ 32,50 · {R.loja}</dd></div>
          <div><dt>Data</dt><dd>24/11, 08:12</dd></div>
          <div><dt>Motivo</dt><dd>{tipo === "golpe" ? "Não fui eu" : "Fui eu, mas teve problema"}</dd></div>
          <div><dt>Provas</dt><dd>5 itens anexados</dd></div>
        </dl>
        {tipo === "golpe" && <p className="ui-suave">O cartão final 1234 será bloqueado e um novo vai para você.</p>}
        <AnimatePresence>
          {falhouEnvio && (
            <motion.p className="ui-erro-caixa" role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Icone nome="alerta" tamanho={18} /> Não conseguimos enviar agora. Suas respostas e as provas estão guardadas. Tente de novo.
            </motion.p>
          )}
        </AnimatePresence>
        <div className="ui-folha__acoes">
          <Toque className="ui-botao ui-botao--principal" disabled={enviando} onClick={enviar}>
            {enviando ? <><span className="ui-girando ui-girando--branco" /> Enviando...</> : falhouEnvio ? "Tentar de novo" : "Enviar contestação"}
          </Toque>
          <Toque className="ui-botao ui-botao--fantasma" disabled={enviando} onClick={() => setFolha(false)}>Voltar e mudar</Toque>
        </div>
      </Folha>
    </div>
  );
}

// ---------- Tela 4: enviado ----------
function Enviado({ aoFim }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes b1-fim">
      <div className="b1-fim__topo">
        <div className="b1-fim__confete" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span key={i} style={{ background: [BANCO_FICTICIO.cor, "#ffffff", "#8e8e93", BANCO_FICTICIO.cor][i % 4] }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 110, y: Math.sin((i / 14) * Math.PI * 2) * 80 - 20, opacity: 0, scale: 1, rotate: 180 }}
              transition={{ duration: 1.1, delay: 0.5, ease: "easeOut" }} />
          ))}
        </div>
        <CheckAnimado />
        <motion.h2 className="ui-titulo-grande" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>Contestação enviada</motion.h2>
        <motion.button type="button" className="b1-protocolo" onClick={() => setCopiado(true)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }} whileTap={{ scale: 0.97 }}>
          Protocolo <strong>2026-112400123</strong>
          <span className="b1-protocolo__icone">{copiado ? <Icone nome="check" tamanho={16} traco={3} /> : <Icone nome="copiar" tamanho={16} />}</span>
          <span className="visualmente-oculto" role="status">{copiado ? "Protocolo copiado" : ""}</span>
        </motion.button>
      </div>
      <motion.ol className="ui-linha-tempo ui-margem" variants={listaEmSequencia} initial="esconde" animate="mostra" transition={{ delayChildren: 0.9 }}>
        {[["feito", "Enviada com 5 provas", "Hoje, 08:30"], ["agora", "Em análise pelo banco", "Avisamos aqui quando mudar"], ["", "Resposta do banco", "Você recebe uma notificação"]].map(([e, t, s]) => (
          <motion.li key={t} variants={itemEmSequencia} className={e}>
            <span className="ui-linha-tempo__ponto" aria-hidden="true" />
            <strong>{t}</strong><small>{s}</small>
          </motion.li>
        ))}
      </motion.ol>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" onClick={aoFim}>Voltar para o cartão</Toque>
      </div>
    </div>
  );
}
