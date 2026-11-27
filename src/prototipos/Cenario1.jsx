// Protótipo B2B: o "Quem me cobrou?" dentro do app de um banco. O visual imita o app do C6 Bank (conceito, sem vínculo).
// O banco já sabe o nome e o local da compra. A pessoa só toca na compra.
// Jornada: tela inicial (destaque "Não reconhece uma compra?") -> cartão -> detalhe (loja achada) -> contestar -> enviado.
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
import logoC6 from "../assets/prototipos/c6-logo-branco.png";
import logoC6Bank from "../assets/prototipos/c6-bank-logo-branco.png";
import { RESPOSTA_PADARIA as R, API_PEDIDO, API_RESPOSTA } from "./dados.js";

const TELAS = [
  // "acao" = o que a pessoa faz nesta tela para seguir no caminho feliz (aparece no user flow do Guia).
  { id: "inicio", nome: "Tela inicial do banco", acao: "Toca no destaque \"Não reconhece uma compra?\"", alternativa: "Ou toca no atalho \"Cartão\": abre a mesma tela" },
  { id: "cartao", nome: "Cartão e fatura", acao: "Toca na compra de nome estranho (MP*PADARIABOMDIA)" },
  { id: "detalhe", nome: "Recibo e quem cobrou", acao: "Toca no botão redondo \"Quem cobrou?\", vê a loja e toca em \"Não reconheço\"", alternativa: "Ou toca em \"Reconheço esta compra\": a compra fica marcada e volta ao cartão" },
  { id: "contestar", nome: "Contestar com provas", acao: "Escolhe o motivo, revisa e confirma o envio" },
  { id: "enviado", nome: "Contestação enviada", acao: "Fim: guarda o protocolo e volta ao cartão" },
];

const NOTAS = {
  inicio: "Tela inicial do app do banco, igual à de todo dia. Logo abaixo dos atalhos, em \"Pra você\", fica o nosso destaque: \"Não reconhece uma compra?\". A pessoa não instala nada e não faz login novo. Toque no destaque.",
  cartao: "A fatura do cartão. O histórico fica limpo, igual ao do banco: nome, hora e valor. Toque na padaria (MP*PADARIABOMDIA).",
  detalhe: "O recibo da compra. O recibo segue o padrão dos bancos digitais: nome, valor, data, botões redondos e campos. O botão \"Quem cobrou?\" só aparece aqui. Ao tocar, o banco manda o nome e o local para a nossa API. A tela mostra cada etapa da busca, depois a loja, a certeza, o mapa e as fontes. A pessoa pode mudar a categoria. Abra \"Ver por trás\" para mostrar a parte técnica ao júri.",
  contestar: "As provas que a API achou já vão junto: loja, CNPJ, endereço e distância. A pessoa não digita nada. Antes de enviar, o app pede confirmação.",
  enviado: "O banco recebe a contestação com provas. A pessoa vê o protocolo e o andamento no próprio app.",
};

const COMPRAS = [
  { grupo: "Hoje", itens: [{ id: "mercado", nome: "Supermercado Ideal", cat: "Mercado", valor: "187,40", icone: "carrinho", cor: "#5aa9ff", hora: "13:21" }] },
  { grupo: "Ontem", itens: [{ id: "padaria", nome: "MP*PADARIABOMDIA", cat: "Outros", valor: "32,50", estranho: true, hora: "08:12" }] },
  { grupo: "23 nov", itens: [{ id: "posto", nome: "Posto Avenida", cat: "Transporte", valor: "150,00", icone: "combustivel", cor: "#ffa93a", hora: "18:40" }] },
  { grupo: "22 nov", itens: [
    { id: "lanches", nome: "PAG*LANCHESDOZE", cat: "Outros", valor: "24,00", estranho: true, hora: "12:05" },
    { id: "farmacia", nome: "Farmácia Saúde Mais", cat: "Saúde", valor: "58,90", icone: "remedio", cor: "#ff6fa5", hora: "09:30" },
  ] },
];

export default function Cenario1() {
  const nav = usePilha("inicio");
  const [movida, setMovida] = useState(false);
  const [reconhecida, setReconhecida] = useState(false);
  const [contestada, setContestada] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const fecharAviso = useCallback(() => setAviso(null), []);

  function recomecar() { nav.trocar("inicio"); setErro(null); setMovida(false); setReconhecida(false); setContestada(false); setAviso(null); }
  function comErro(tela, e) { return () => { setErro(e); nav.trocar("inicio"); nav.ir("cartao"); if (tela !== "cartao") nav.ir("detalhe"); if (tela === "contestar") nav.ir("contestar"); }; }
  function irPara(t) { setErro(null); nav.trocar("inicio"); const ordem = TELAS.map((x) => x.id); ordem.slice(1, ordem.indexOf(t) + 1).forEach((x) => nav.ir(x)); }

  const ERROS = [
    { id: "api", tela: "detalhe", nome: "Nossa API fora do ar", descricao: "A busca falha. A pessoa pode tentar de novo ou contestar mesmo assim.", acao: comErro("detalhe", "api") },
    { id: "baixa", tela: "detalhe", nome: "Loja sem certeza", descricao: "Duas lojas parecidas, longe do local. Mostramos a dúvida.", acao: comErro("detalhe", "baixa") },
    { id: "motivo", tela: "contestar", nome: "Esqueceu o motivo", descricao: "Toque em \"Revisar\" sem escolher o que aconteceu.", acao: comErro("contestar", "motivo") },
    { id: "envio", tela: "contestar", nome: "Falha ao enviar", descricao: "O envio falha na 1ª vez. Nada se perde. Na 2ª tentativa funciona.", acao: comErro("contestar", "envio") },
  ];

  return (
    <Moldura
      titulo="Dentro do app do banco (estilo C6)"
      subtitulo="Para bancos (B2B). O banco usa a nossa API e mostra a resposta com o visual dele. Aqui, imitando o app do C6 Bank."
      aviso="Conceito. Sem vínculo com o banco."
      telas={TELAS} atual={nav.atual} irPara={irPara}
      aoVoltar={nav.voltar} podeVoltar={nav.tamanho > 1} aoRecomecar={recomecar}
      nota={NOTAS[nav.atual]} erros={ERROS} erroAtual={erro} claro={nav.atual !== "inicio"}
    >
      <div className="b1 c6" style={coresCss(BANCO_FICTICIO)}>
        <Aviso texto={aviso?.texto} acao={aviso?.acao} aoAcao={aviso?.aoAcao} aoFechar={fecharAviso} />
        <Telas chave={nav.atual + (erro || "")} direcao={nav.direcao}>
          {nav.atual === "inicio" && (
            <InicioBanco aoDestaque={() => nav.ir("cartao")}
              aoBloqueado={() => setAviso({ texto: "No protótipo, toque no destaque \"Não reconhece uma compra?\"." })} />
          )}
          {nav.atual === "cartao" && (
            <Cartao movida={movida} reconhecida={reconhecida} contestada={contestada}
              aoTocar={() => nav.ir("detalhe")} aoInicio={nav.voltar}
              aoBloqueado={() => setAviso({ texto: "No protótipo, só a compra da padaria abre." })} />
          )}
          {nav.atual === "detalhe" && (
            <Detalhe erro={erro} movida={movida}
              aoMover={() => { setMovida(true); setAviso({ texto: `Movida para ${R.categoria}`, acao: "Desfazer", aoAcao: () => { setMovida(false); setAviso(null); } }); }}
              aoTentarDeNovo={() => setErro(null)}
              aoVoltar={nav.voltar}
              aoReconhecer={() => { setReconhecida(true); nav.voltar(); setAviso({ texto: "Pronto. Marcamos como reconhecida." }); }}
              aoContestar={() => { setAviso(null); nav.ir("contestar"); }}
              aoBloqueado={() => setAviso({ texto: "No protótipo, este botão não abre nada." })} />
          )}
          {nav.atual === "contestar" && <Contestar erro={erro} baixa={erro === "baixa"} aoVoltar={nav.voltar} aoEnviado={() => nav.ir("enviado")} />}
          {nav.atual === "enviado" && <Enviado aoFim={() => { setContestada(true); nav.trocar("inicio"); nav.ir("cartao"); setErro(null); }} />}
        </Telas>
      </div>
    </Moldura>
  );
}

// Barra de baixo no estilo do C6: 4 abas e o botão preto "C6" no meio. A aba ativa ganha um traço amarelo.
function BarraC6({ ativa, claro = false, aoIr = {}, aoBloqueado }) {
  const abas = [["casa", "Início"], ["extrato", "Extrato"], ["c6", "C6"], ["cartao", "Cartões"], ["grafico", "Investir"]];
  return (
    <nav className={`c6-tabs${claro ? " c6-tabs--claro" : ""}`} aria-label="Menu do banco">
      {abas.map(([i, n]) => {
        if (i === "c6") return <button key={n} type="button" className="c6-tabs__marca" aria-label="Menu C6" onClick={aoBloqueado}><img src={logoC6} alt="" /></button>;
        const ativo = n === ativa;
        return (
          <button key={n} type="button" className={`c6-tabs__item${ativo ? " c6-tabs__item--ativo" : ""}`}
            aria-current={ativo ? "page" : undefined} onClick={ativo ? undefined : aoIr[n] || aoBloqueado}>
            <Icone nome={i} tamanho={22} />
            <span>{n}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ---------- Tela 0: tela inicial do banco (estilo C6) ----------
// Topo preto com saudação e saldo. Embaixo, a folha branca com atalhos, "Pra você" (o nosso destaque) e Pix.
function InicioBanco({ aoDestaque, aoBloqueado }) {
  const [verSaldo, setVerSaldo] = useState(false);
  return (
    <div className="ui-rolagem c6-inicio">
      <div className="c6-inicio__topo">
        <div>
          <p className="c6-inicio__ola">Boa tarde,</p>
          <p className="c6-inicio__nome">Angélica</p>
        </div>
        <div className="c6-inicio__icones">
          <button type="button" className="c6-sino" aria-label="Notificações (1 nova)" onClick={aoBloqueado}><Icone nome="sino" tamanho={22} /><span className="c6-sino__ponto" /></button>
          <button type="button" className="c6-perfil" aria-label="Perfil" onClick={aoBloqueado}>A</button>
        </div>
      </div>

      <div className="c6-saldos" aria-label="Contas">
        <section className="c6-saldo" aria-label="Saldo em reais">
          <p className="c6-saldo__rotulo"><span className="c6-saldo__bandeira" aria-hidden="true" /> Saldo</p>
          <div className="c6-saldo__linha">
            <p className="c6-saldo__valor"><small>R$</small> {verSaldo ? "2.768,90" : "••••••"}</p>
            <button type="button" className="c6-saldo__olho" aria-label={verSaldo ? "Esconder saldo" : "Mostrar saldo"} aria-pressed={verSaldo} onClick={() => setVerSaldo((v) => !v)}>
              <Icone nome={verSaldo ? "x" : "olho"} tamanho={18} />
            </button>
          </div>
          <button type="button" className="c6-saldo__rodape" onClick={aoBloqueado}>Ver extrato <Icone nome="seta" tamanho={16} /></button>
        </section>
        <section className="c6-saldo c6-saldo--espia" aria-label="Pontos" aria-hidden="true">
          <p className="c6-saldo__rotulo">Pontos</p>
          <p className="c6-saldo__valor"><small>PTS</small> 1.240</p>
        </section>
      </div>

      <div className="c6-folha">
        <span className="c6-folha__pegador" aria-hidden="true" />
        <ul className="c6-atalhos" aria-label="Atalhos">
          {[["extrato", "Ver extrato"], ["cartao", "Cartão"], ["barras", "Pagar"], ["recarga", "Recargas"], ["transferir", "Transferir"]].map(([i, n]) => (
            <li key={n}>
              <button type="button" onClick={n === "Cartão" ? aoDestaque : aoBloqueado}>
                <span className="c6-atalhos__icone"><Icone nome={i} tamanho={20} /></span>
                <span>{n}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="c6-secao">
          <h2>Pra você</h2>
        </div>
        {/* O destaque: mesmo lugar e mesmo formato dos cartões de oferta do banco */}
        <div className="c6-carrossel">
          <motion.button type="button" className="c6-destaque" onClick={aoDestaque} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...MOLA, delay: 0.15 }}>
            <span className="c6-destaque__selo"><Icone nome="brilho" tamanho={14} /> Novo</span>
            <strong className="c6-destaque__titulo">Não reconhece uma compra?</strong>
            <span className="c6-destaque__texto">Descubra quem cobrou antes de contestar.</span>
            <span className="c6-destaque__seta" aria-hidden="true"><Icone nome="seta" tamanho={18} traco={2.6} /></span>
            <span className="c6-destaque__lupa" aria-hidden="true"><Icone nome="busca" tamanho={64} traco={1.4} /></span>
          </motion.button>
          <button type="button" className="c6-oferta" onClick={aoBloqueado} aria-label="Oferta: benefícios para clientes">
            <strong>Benefícios para clientes</strong>
          </button>
        </div>
        <div className="c6-bolinhas" aria-hidden="true"><span className="ativa" /><span /><span /><span /></div>

        <div className="c6-secao c6-secao--pix">
          <h2><Icone nome="pix" tamanho={18} /> Pix</h2>
        </div>
        <ul className="c6-pix" aria-label="Pix">
          {[["barras", "Ler QR code"], ["transferir", "Transferir"], ["extrato", "Cobrar"], ["cadeado", "Chaves"]].map(([i, n]) => (
            <li key={n}><button type="button" onClick={aoBloqueado}><span className="c6-pix__bola"><Icone nome={i} tamanho={20} /></span><span>{n}</span></button></li>
          ))}
        </ul>
        <BarraC6 ativa="Início" claro aoIr={{ "Cartões": aoDestaque }} aoBloqueado={aoBloqueado} />
      </div>
    </div>
  );
}

// ---------- Peças do padrão C6 ----------
// Barra preta no topo: seta para voltar à esquerda e o título no meio.
function C6Barra({ titulo, aoVoltar, rotuloVoltar = "Voltar" }) {
  return (
    <div className="c6-barra">
      {aoVoltar ? (
        <button type="button" className="c6-barra__voltar" onClick={aoVoltar} aria-label={rotuloVoltar}>
          <Icone nome="voltar" tamanho={24} traco={2} />
        </button>
      ) : <span />}
      <h2 className="c6-barra__titulo">{titulo}</h2>
      <span />
    </div>
  );
}

// Caixa com borda fina, como "Número do cartão" no app do C6.
function C6Caixa({ rotulo, children, acao }) {
  return (
    <div className="c6-caixa">
      <span className="c6-caixa__texto"><small>{rotulo}</small><strong>{children}</strong></span>
      {acao}
    </div>
  );
}

// O cartão preto (Carbon) com o logo C6 BANK.
function CartaoCarbon({ pequeno = false }) {
  return (
    <span className={`c6-carbon${pequeno ? " c6-carbon--pequeno" : ""}`} aria-hidden="true">
      <span className="c6-carbon__nome"><i>Carbon</i></span>
      <img className="c6-carbon__logo" src={logoC6Bank} alt="" />
      <span className="c6-carbon__bandeira"><span /><span /></span>
    </span>
  );
}

// ---------- Tela 1: cartão e fatura ----------
function Cartao({ movida, reconhecida, contestada, aoTocar, aoInicio, aoBloqueado }) {
  const identificada = movida || reconhecida || contestada;
  return (
    <div className="ui-rolagem ui-rolagem--com-tabs c6-tela">
      <C6Barra titulo="Cartões" />
      <div className="c6-cartao-topo">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...MOLA, delay: 0.05 }}>
          <CartaoCarbon />
        </motion.div>
        <p className="c6-cartao-topo__info">Crédito · final 1234 · <span>Desbloqueado</span></p>
      </div>

      <div className="c6-corpo">
        <span className="c6-corpo__pegador" aria-hidden="true" />
        <section className="c6-fatura" aria-label="Fatura aberta">
          <p className="c6-rotulo-fino">Fatura aberta · vence em 10 dez</p>
          <p className="c6-valor-grande"><small>R$</small> <Contador valor={1284.3} prefixo="" /></p>
          <div className="c6-limite" aria-label="Limite usado: 43%">
            <motion.span initial={{ width: 0 }} animate={{ width: "43%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
          </div>
          <div className="c6-duas">
            <C6Caixa rotulo="Limite disponível">R$ 1.715,70</C6Caixa>
            <C6Caixa rotulo="Melhor dia de compra">4 dez</C6Caixa>
          </div>
          <Toque className="ui-botao ui-botao--principal ui-botao--largo c6-espaco" onClick={aoBloqueado}>Pagar fatura</Toque>
        </section>


        <ul className="c6-atalhos c6-atalhos--cartao" aria-label="Atalhos do cartão">
          {[["cartao", "Cartão virtual"], ["grafico", "Ajustar limite"], ["cadeado", "Senha"], ["mais", "Mais"]].map(([i, n]) => (
            <li key={n}><button type="button" onClick={aoBloqueado}><span className="c6-atalhos__icone"><Icone nome={i} tamanho={20} /></span><span>{n}</span></button></li>
          ))}
        </ul>

        <div className="c6-filtros" aria-label="Filtros">
          <span className="c6-filtros__item"><Icone nome="lista" tamanho={14} /> Filtro</span>
          <span className="c6-filtros__item c6-filtros__item--ativo">Todas</span>
          <span className="c6-filtros__item c6-filtros__item--borda">Novembro</span>
        </div>

        <motion.div variants={listaEmSequencia} initial="esconde" animate="mostra">
          {COMPRAS.map((g) => (
            <section key={g.grupo} aria-label={g.grupo}>
              <motion.h3 variants={itemEmSequencia} className="c6-dia">{g.grupo}</motion.h3>
              <ul className="c6-extrato">
                {g.itens.map((c) => {
                  const padaria = c.id === "padaria";
                  const ident = padaria && identificada;
                  const nome = ident ? R.loja : c.nome;
                  return (
                    <motion.li key={c.id} variants={itemEmSequencia}>
                      <button type="button" className="c6-extrato__item" onClick={padaria ? aoTocar : aoBloqueado}>
                        <span className="c6-extrato__icone"><Icone nome={ident ? "pao" : c.icone || "carrinho"} tamanho={20} /></span>
                        <span className="c6-extrato__meio">
                          <span className="c6-extrato__nome">{nome}</span>
                          <small>{c.hora} · Crédito{padaria && contestada ? " · Em contestação" : ""}</small>
                        </span>
                        <span className="c6-extrato__valor">R$ {c.valor}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ))}
        </motion.div>
        <BarraC6 ativa="Cartões" claro aoIr={{ "Início": aoInicio }} aoBloqueado={aoBloqueado} />
      </div>
    </div>
  );
}

const PASSOS = ["Limpando o nome da maquininha", "Procurando o CNPJ na Receita Federal", "Comparando com o local da compra"];

const R_BAIXA = {
  loja: "Lanchonete Bom Dia",
  porque: "Achamos 2 lojas com nome parecido. A mais perto fica a 3,2 km de onde o cartão foi usado. Por isso não temos certeza.",
  distancia: "3,2 km",
};

// ---------- Tela 2: recibo da compra (estrutura de recibo de banco digital, visual C6) ----------
// Folha branca com X, ícone redondo, nome e valor grandes, data e etiqueta "Compra".
// Botões redondos: "Quem cobrou?" (a nossa função), "Preciso de ajuda" (contestar) e "Comprovante".
// Embaixo, os campos: Estabelecimento, Nome original, Cartão e Categoria.
function Detalhe({ erro, movida, aoMover, aoTentarDeNovo, aoVoltar, aoReconhecer, aoContestar, aoBloqueado }) {
  // "inicial": a busca só começa quando a pessoa toca em "Quem cobrou?".
  // Nos casos de erro do Guia, a busca já começa sozinha para mostrar o erro.
  const [fase, setFase] = useState(erro ? "analisando" : "inicial");
  const terminar = useCallback(() => setFase("pronto"), []);
  const falhou = erro === "api";
  const baixa = erro === "baixa";
  const pronto = fase === "pronto";
  const achou = pronto && !falhou;
  const loja = baixa ? R_BAIXA.loja : R.loja;
  const estabelecimento = achou && !baixa ? R.loja : "MP*PADARIABOMDIA";

  return (
    <div className="ui-rolagem c6-tela c6-recibo-tela">
      <div className="c6-corpo c6-recibo">
        <button type="button" className="c6-recibo__fechar" onClick={aoVoltar} aria-label="Fechar recibo e voltar para Cartões">
          <Icone nome="x" tamanho={24} traco={2} />
        </button>

        <div className="c6-recibo__topo">
          <span className="c6-recibo__icone"><Icone nome={achou && !baixa ? "pao" : "carrinho"} tamanho={24} /></span>
          <h2 className="c6-recibo__nome">{estabelecimento}</h2>
          <p className="c6-recibo__valor">R$ 32,50</p>
          <p className="c6-recibo__data">24 NOV 2026 08:12</p>
          <span className="c6-recibo__tag">Compra</span>
        </div>

        <ul className="c6-redondos" aria-label="Ações da compra">
          <li>
            <button type="button" className="c6-redondo c6-redondo--destaque" onClick={() => fase === "inicial" && setFase("analisando")} aria-pressed={fase !== "inicial"}>
              <span className="c6-redondo__bola"><Icone nome="busca" tamanho={24} /></span>
              <span>Quem cobrou?</span>
            </button>
          </li>
          <li>
            <button type="button" className="c6-redondo" onClick={aoContestar}>
              <span className="c6-redondo__bola"><Icone nome="alerta" tamanho={22} /></span>
              <span>Preciso de ajuda</span>
            </button>
          </li>
          <li>
            <button type="button" className="c6-redondo" onClick={aoBloqueado}>
              <span className="c6-redondo__bola"><Icone nome="extrato" tamanho={22} /></span>
              <span>Comprovante</span>
            </button>
          </li>
        </ul>

        <AnimatePresence initial={false}>
          {fase !== "inicial" && (
            <motion.section className="c6-quem" aria-labelledby="quem-titulo" aria-busy={fase === "analisando"}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
              <p className="c6-quem__marca"><Icone nome="busca" tamanho={15} /> Quem cobrou · conferido na Receita</p>
              <AnimatePresence mode="wait" initial={false}>
                {!pronto ? (
                  <motion.div key="analise" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <h3 id="quem-titulo" className="visualmente-oculto">Procurando a loja</h3>
                    <PassosAnalise passos={PASSOS} aoTerminar={terminar} />
                    <div className="b1-quem__esqueleto"><Esqueleto largura="60%" altura={22} /><Esqueleto largura="90%" /><Esqueleto largura="75%" /></div>
                  </motion.div>
                ) : falhou ? (
                  <motion.div key="erro" className="c6-erro" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
                    <span className="c6-erro__icone"><Icone nome="alerta" tamanho={24} /></span>
                    <h3 id="quem-titulo">Não conseguimos descobrir a loja agora</h3>
                    <p>O serviço que procura a loja não respondeu. A compra continua na sua fatura e nada mudou.</p>
                    <p>Tente de novo em alguns segundos, ou conteste mesmo assim.</p>
                  </motion.div>
                ) : (
                  <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
                    <div className="c6-quem__cabeca">
                      <div>
                        {baixa && <p className="c6-rotulo-fino">Não temos certeza. O mais provável é</p>}
                        <h3 id="quem-titulo" className="c6-quem__loja">{loja}</h3>
                        <p className="c6-rotulo-fino">{baixa ? "Lanchonete" : R.atividade}</p>
                      </div>
                      <AnelCerteza nivel={baixa ? "baixa" : "alta"} variante="3d" />
                    </div>
                    <p className="c6-importante"><span className="c6-importante__i" aria-hidden="true">i</span>{baixa ? R_BAIXA.porque : R.porque}</p>
                    <MapaFalso distancia={baixa ? R_BAIXA.distancia : R.distancia} longe={baixa} />
                    {!baixa && (
                      <div className="c6-caixas">
                        <C6Caixa rotulo="CNPJ">{R.cnpj}</C6Caixa>
                        <C6Caixa rotulo="Endereço">{R.endereco}</C6Caixa>
                        <C6Caixa rotulo="Situação na Receita">Ativa</C6Caixa>
                      </div>
                    )}
                    <details className="ui-fontes c6-fontes">
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
            </motion.section>
          )}
        </AnimatePresence>

        <dl className="c6-campos">
          <div>
            <span><dt>Estabelecimento</dt><dd>{estabelecimento}</dd></span>
            <button type="button" className="c6-pilula" onClick={aoBloqueado}>Alterar</button>
          </div>
          <div>
            <span><dt>Nome original</dt><dd className="c6-campos__cru">MP*PADARIABOMDIA</dd></span>
          </div>
          <div>
            <span><dt>Cartão</dt><dd>Crédito ...1234</dd></span>
          </div>
          <div>
            <span><dt>Categoria</dt><dd>{movida ? R.categoria : "Outros"}{achou && !baixa && !movida && <small> · sugestão: {R.categoria}</small>}</dd></span>
            {achou && !baixa && !movida
              ? <button type="button" className="c6-pilula c6-pilula--amarela" onClick={aoMover}>Mover</button>
              : <button type="button" className="c6-pilula" onClick={aoBloqueado}>Alterar</button>}
          </div>
        </dl>

        {achou && (
          <details className="b1-tecnico c6-tecnico">
            <summary><Icone nome="codigo" tamanho={16} /> Ver por trás: o que a API recebe e devolve</summary>
            <div className="b1-tecnico__corpo">
              <p>O banco manda <code>POST /api/identificar</code></p>
              <pre>{JSON.stringify(API_PEDIDO, null, 2)}</pre>
              <p>A nossa API devolve (resumo), em cerca de 13 s</p>
              <pre>{JSON.stringify(baixa ? { ...API_RESPOSTA, loja: R_BAIXA.loja, certeza: "baixa", distancia_m: 3200 } : API_RESPOSTA, null, 2)}</pre>
            </div>
          </details>
        )}

        {/* Os botões de decisão só aparecem depois da busca (antes disso, o recibo fica limpo) */}
        {pronto && (
          <div className="ui-acoes-fixas c6-acoes">
            {falhou ? (
              <>
                <Toque className="ui-botao ui-botao--principal" onClick={() => { setFase("analisando"); aoTentarDeNovo(); }}>Tentar de novo</Toque>
                <Toque className="ui-botao ui-botao--contorno" onClick={aoContestar}>Contestar mesmo assim</Toque>
              </>
            ) : (
              <>
                <Toque className="ui-botao ui-botao--principal" onClick={aoReconhecer}>Reconheço esta compra</Toque>
                <Toque className="ui-botao ui-botao--contorno" onClick={aoContestar}>Não reconheço</Toque>
              </>
            )}
          </div>
        )}
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
    <div className="ui-rolagem c6-tela">
      <C6Barra titulo="Contestar compra" aoVoltar={aoVoltar} rotuloVoltar="Voltar para a compra" />
      <div className="c6-corpo">
        <span className="c6-corpo__pegador" aria-hidden="true" />
        <div className="c6-margem">
          <p className="c6-titulo-fino">{R.loja}</p>
          <p className="c6-rotulo-fino">R$ 32,50 · ontem, 08:12</p>

          <h3 className="c6-rotulo c6-espaco">O que aconteceu?</h3>
          <motion.div role="radiogroup" aria-label="O que aconteceu?" aria-describedby={aviso ? "aviso-tipo" : undefined}
            className="c6-opcoes" key={tremer} animate={tremer ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
            {opcoes.map(([v, t, d, i]) => (
              <button key={v} type="button" role="radio" aria-checked={tipo === v}
                className={`c6-opcao${tipo === v ? " c6-opcao--ativa" : ""}`} onClick={() => { setTipo(v); setAviso(""); }}>
                <span className="c6-opcao__icone"><Icone nome={i} tamanho={20} /></span>
                <span className="c6-opcao__texto"><strong>{t}</strong><small>{d}</small></span>
                <span className="c6-opcao__radio" aria-hidden="true">{tipo === v && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={MOLA} />}</span>
              </button>
            ))}
          </motion.div>
          <AnimatePresence>
            {aviso && (
              <motion.p id="aviso-tipo" className="c6-aviso-erro" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Icone nome="alerta" tamanho={16} /> {aviso}
              </motion.p>
            )}
          </AnimatePresence>

          <h3 className="c6-rotulo c6-espaco">Provas que vão junto</h3>
          <motion.ul className="c6-provas" variants={listaEmSequencia} initial="esconde" animate="mostra">
            {provas.map(([k, v]) => (
              <motion.li key={k} variants={itemEmSequencia}>
                <span className="c6-provas__check"><Icone nome="check" tamanho={13} traco={3} /></span>
                <span><small>{k}</small>{v}</span>
              </motion.li>
            ))}
          </motion.ul>
          <p className="c6-rotulo-fino c6-provas__nota">
            {baixa ? "A loja veio sem certeza. Mesmo assim, as fontes vão junto para o banco analisar." : "Achadas pela nossa API. Você não precisa digitar nada."}
          </p>

          <label className="c6-campo">
            <span>Quer contar mais alguma coisa? <em>(opcional)</em></span>
            <textarea rows={2} placeholder="Ex.: eu estava em casa nesse horário" />
          </label>
        </div>

        <div className="ui-acoes-fixas c6-acoes">
          <Toque className="ui-botao ui-botao--principal" onClick={revisar}>Revisar e enviar</Toque>
        </div>
      </div>

      <Folha aberta={folha} aoFechar={() => !enviando && setFolha(false)} titulo="Enviar contestação?" travada={enviando} estilo={coresCss(BANCO_FICTICIO)} classe="c6-modal">
        <h2 className="ui-folha__titulo">Enviar contestação?</h2>
        <div className="c6-caixas">
          <C6Caixa rotulo="Compra">R$ 32,50 · {R.loja}</C6Caixa>
          <C6Caixa rotulo="Data">24/11, 08:12</C6Caixa>
          <C6Caixa rotulo="Motivo">{tipo === "golpe" ? "Não fui eu" : "Fui eu, mas teve problema"}</C6Caixa>
          <C6Caixa rotulo="Provas">5 itens anexados</C6Caixa>
        </div>
        {tipo === "golpe" && <p className="c6-importante"><span className="c6-importante__i" aria-hidden="true">i</span>O cartão final 1234 será bloqueado e um novo vai para você.</p>}
        <AnimatePresence>
          {falhouEnvio && (
            <motion.p className="c6-aviso-erro c6-aviso-erro--caixa" role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Icone nome="alerta" tamanho={18} /> Não conseguimos enviar agora. Suas respostas e as provas estão guardadas. Tente de novo.
            </motion.p>
          )}
        </AnimatePresence>
        <div className="ui-folha__acoes">
          <Toque className="ui-botao ui-botao--principal" disabled={enviando} onClick={enviar}>
            {enviando ? <><span className="ui-girando" /> Enviando...</> : falhouEnvio ? "Tentar de novo" : "Enviar contestação"}
          </Toque>
          <Toque className="ui-botao ui-botao--contorno" disabled={enviando} onClick={() => setFolha(false)}>Voltar e mudar</Toque>
        </div>
      </Folha>
    </div>
  );
}

// ---------- Tela 4: enviado ----------
function Enviado({ aoFim }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="ui-rolagem c6-tela">
      <C6Barra titulo="Contestação" />
      <div className="c6-corpo c6-fim">
        <span className="c6-corpo__pegador" aria-hidden="true" />
        <div className="c6-fim__topo">
          <CheckAnimado cor="#1d1d1f" tamanho={76} />
          <motion.h2 className="c6-titulo-fino" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>Contestação enviada</motion.h2>
          <p className="c6-rotulo-fino">O banco recebeu a contestação com 5 provas.</p>
        </div>
        <motion.div className="c6-margem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <C6Caixa rotulo="Protocolo" acao={
            <button type="button" className="c6-caixa__acao" onClick={() => setCopiado(true)} aria-label="Copiar protocolo">
              {copiado ? <Icone nome="check" tamanho={18} traco={3} /> : <Icone nome="copiar" tamanho={18} />}
            </button>}>
            2026-112400123
          </C6Caixa>
          <span className="visualmente-oculto" role="status">{copiado ? "Protocolo copiado" : ""}</span>
        </motion.div>
        <motion.ol className="ui-linha-tempo c6-linha-tempo c6-margem" variants={listaEmSequencia} initial="esconde" animate="mostra" transition={{ delayChildren: 0.9 }}>
          {[["feito", "Enviada com 5 provas", "Hoje, 08:30"], ["agora", "Em análise pelo banco", "Avisamos aqui quando mudar"], ["", "Resposta do banco", "Você recebe uma notificação"]].map(([e, t, s]) => (
            <motion.li key={t} variants={itemEmSequencia} className={e}>
              <span className="ui-linha-tempo__ponto" aria-hidden="true" />
              <strong>{t}</strong><small>{s}</small>
            </motion.li>
          ))}
        </motion.ol>
        <div className="ui-acoes-fixas c6-acoes">
          <Toque className="ui-botao ui-botao--principal" onClick={aoFim}>Voltar para o cartão</Toque>
        </div>
      </div>
    </div>
  );
}
