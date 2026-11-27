// Protótipo do cenário 2 (B2C, visão de futuro): o nosso próprio app, com visual jovem.
// A pessoa cria conta, um chat monta o painel, ela conecta os bancos pelo Open Finance,
// e o app acha sozinho as compras de nome estranho. Depois ajuda a contestar e confere se o dinheiro voltou.
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Moldura from "./Moldura.jsx";
import Icone from "./ui/Icone.jsx";
import {
  usePilha, Telas, Toque, Aviso, CheckAnimado, AnelCerteza, Digitando,
  listaEmSequencia, itemEmSequencia, MOLA, MOLA_SUAVE,
} from "./ui/kit.jsx";
import { MARCA, coresCss } from "./marca.js";
import { BANCO, COMPRAS_PAINEL, GASTOS, BANCOS_FICTICIOS } from "./dados.js";
// Foto do login (troque o arquivo para mudar a imagem; formato WebP, leve para a web).
import fotoLogin from "../assets/prototipos/login-fundo.webp";

const TELAS = [
  { id: "boas-vindas", nome: "Boas-vindas" },
  { id: "conta", nome: "Criar conta" },
  { id: "chat", nome: "Chat que monta o painel" },
  { id: "bancos", nome: "Escolher bancos" },
  { id: "permissao", nome: "Permissão (Open Finance)" },
  { id: "painel", nome: "Painel" },
  { id: "compra", nome: "Compra sem certeza" },
  { id: "contestar", nome: "Contestar" },
  { id: "acompanhar", nome: "Acompanhar o estorno" },
];

const NOTAS = {
  "boas-vindas": "Visão de futuro: um app nosso, para quem tem cartões em vários bancos. A animação mostra a ideia em 2 segundos: o nome estranho vira o nome da loja.",
  conta: "Cadastro curto. O app confere o e-mail e a senha na hora e explica o que corrigir.",
  chat: "Em vez de um cadastro longo, um chat faz 2 perguntas e monta só o painel que a pessoa quer. As outras funções ficam numa lista.",
  bancos: "A pessoa escolhe de quais bancos quer trazer as faturas. Os nomes dos bancos são inventados.",
  permissao: "Consentimento do Open Finance: o que o app vê, o que não vê, por quanto tempo e como cancelar. Na vida real isso passa por uma empresa parceira autorizada pelo Banco Central.",
  painel: "O app já achou as compras de nome estranho de todos os bancos e identificou as lojas. Toque na compra com certeza baixa.",
  compra: "Quando não temos certeza, dizemos. Também mostramos um limite honesto: o Open Finance talvez não mande o local da compra.",
  contestar: "O texto já vem preenchido com banco, valor, data e nome, porque o app tem esses dados. A pessoa pode ligar um lembrete.",
  acompanhar: "Depois de contestar, o app confere sozinho a fatura todo dia e avisa quando o dinheiro voltar.",
};

export default function Cenario2() {
  const nav = usePilha("boas-vindas");
  const [escolhas, setEscolhas] = useState({});
  const [bancos, setBancos] = useState([BANCO, "Banco Horizonte"]);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);
  const fecharAviso = useCallback(() => setAviso(null), []);
  const ordem = TELAS.map((t) => t.id);

  function irAte(t) { nav.trocar(ordem[0]); ordem.slice(1, ordem.indexOf(t) + 1).forEach((x) => nav.ir(x)); }
  function irPara(t) { setErro(null); if (!escolhas.objetivo && ordem.indexOf(t) > 2) setEscolhas({ objetivo: "Os dois", aviso: "Sim, me avise" }); irAte(t); }
  function recomecar() { setErro(null); setEscolhas({}); setBancos([BANCO, "Banco Horizonte"]); nav.trocar("boas-vindas"); }
  const comErro = (t, e) => () => { setErro(e); if (!escolhas.objetivo) setEscolhas({ objetivo: "Os dois", aviso: "Sim, me avise" }); irAte(t); };
  const ERROS = [
    { id: "cadastro", nome: "E-mail ou senha errados", descricao: "Toque em Continuar. O app explica o que corrigir.", acao: comErro("conta", "cadastro") },
    { id: "recusou", nome: "Não autorizou no banco", descricao: "A pessoa cancela no app do banco. Oferecemos tentar de novo.", acao: comErro("permissao", "recusou") },
    { id: "banco-fora", nome: "Um banco não respondeu", descricao: "Mostramos o que veio dos outros bancos e avisamos.", acao: comErro("painel", "banco-fora") },
    { id: "vazio", nome: "Nenhuma compra estranha", descricao: "Painel sem nada para conferir.", acao: comErro("painel", "vazio") },
  ];
  const bloqueado = () => setAviso({ texto: "No protótipo, esta parte ainda não abre." });

  return (
    <Moldura
      titulo="Cenário 2: o nosso app (visão de futuro)"
      subtitulo="Para pessoas (B2C). Login, Open Finance e todas as faturas num lugar só."
      telas={TELAS} atual={nav.atual} irPara={irPara}
      aoVoltar={nav.voltar} podeVoltar={nav.tamanho > 1} aoRecomecar={recomecar}
      nota={NOTAS[nav.atual]} erros={ERROS} erroAtual={erro}
      claro={nav.atual !== "boas-vindas" && nav.atual !== "conta"}
    >
      <div className="b2" style={coresCss(MARCA)}>
        <Aviso texto={aviso?.texto} acao={aviso?.acao} aoAcao={aviso?.aoAcao} aoFechar={fecharAviso} />
        <Telas chave={nav.atual + (erro || "")} direcao={nav.direcao}>
          {nav.atual === "boas-vindas" && <BoasVindas aoComecar={() => nav.ir("conta")} />}
          {nav.atual === "conta" && <Conta erro={erro} aoVoltar={nav.voltar} aoContinuar={() => { setErro(null); nav.ir("chat"); }} />}
          {nav.atual === "chat" && <Chat escolhas={escolhas} setEscolhas={setEscolhas} aoContinuar={() => nav.ir("bancos")} />}
          {nav.atual === "bancos" && <Bancos bancos={bancos} setBancos={setBancos} aoVoltar={nav.voltar} aoContinuar={() => nav.ir("permissao")} />}
          {nav.atual === "permissao" && <Permissao erro={erro} bancos={bancos} aoVoltar={nav.voltar} aoAutorizar={() => { setErro(null); nav.trocar("painel"); }} />}
          {nav.atual === "painel" && <Painel erro={erro} escolhas={escolhas} aoTentarDeNovo={() => { setErro(null); setAviso({ texto: "Banco Horizonte conectado de novo." }); }} aoAbrir={() => nav.ir("compra")} aoBloqueado={bloqueado} />}
          {nav.atual === "compra" && <Compra aoVoltar={nav.voltar} aoContestar={() => nav.ir("contestar")} aoReconhecer={() => { nav.voltar(); setAviso({ texto: "Anotado. Não vamos mais avisar sobre ela." }); }} />}
          {nav.atual === "contestar" && <Contestar aoVoltar={nav.voltar} aoEnviei={() => nav.ir("acompanhar")} />}
          {nav.atual === "acompanhar" && <Acompanhar aoPainel={() => nav.trocar("painel")} />}
        </Telas>
      </div>
    </Moldura>
  );
}

function Logo({ tamanho = 56 }) {
  return (
    <span className="b2-logo" style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.5 }} aria-hidden="true">
      {MARCA.letraLogo}
    </span>
  );
}

function BarraNav({ titulo, aoVoltar }) {
  return (
    <div className="ui-nav">
      {aoVoltar ? (
        <button type="button" className="ui-nav__voltar" onClick={aoVoltar}><Icone nome="voltar" tamanho={24} traco={2.4} /><span>Voltar</span></button>
      ) : <span />}
      <span className="ui-nav__titulo">{titulo}</span>
      <span />
    </div>
  );
}

// ---------- Boas-vindas: fundo com gradiente vivo e cartão que se transforma ----------
function BoasVindas({ aoComecar }) {
  const [virou, setVirou] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setVirou((v) => !v), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="b2-boas">
      <div className="b2-malha" aria-hidden="true"><span /><span /><span /></div>
      <div className="b2-boas__conteudo">
        <motion.div className="b2-boas__marca" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Logo tamanho={40} /><span>{MARCA.nome}</span>
        </motion.div>

        <div className="b2-demo" aria-hidden="true">
          <motion.div className="b2-demo__cartao b2-demo__cartao--fundo" animate={{ rotate: -8, y: 18 }} />
          <motion.div className="b2-demo__cartao" layout transition={MOLA}>
            <AnimatePresence mode="wait">
              {!virou ? (
                <motion.div key="cru" className="b2-demo__linha" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }}>
                  <span className="b2-demo__avatar b2-demo__avatar--q">?</span>
                  <span><code>MP*PADARIABOMDIA</code><small>Nome estranho na fatura</small></span>
                </motion.div>
              ) : (
                <motion.div key="loja" className="b2-demo__linha" initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }}>
                  <span className="b2-demo__avatar"><Icone nome="pao" tamanho={20} /></span>
                  <span><strong>Padaria Bom Dia</strong><small><span className="ui-ponto-verde" /> Certeza alta · 24 m</small></span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <motion.h2 className="b2-boas__titulo" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...MOLA }}>
          Quem te cobrou? <span>A gente descobre.</span>
        </motion.h2>
        <motion.p className="b2-boas__frase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>{MARCA.frase}</motion.p>
        <motion.div className="b2-boas__acoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Toque className="ui-botao b2-botao-claro" onClick={aoComecar}>Criar conta grátis</Toque>
          <button type="button" className="b2-link-claro" onClick={aoComecar}>Já tenho conta</button>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- Criar conta (confere na hora) ----------
function Conta({ erro, aoVoltar, aoContinuar }) {
  const [email, setEmail] = useState(erro === "cadastro" ? "ana@exemplo" : "ana@exemplo.com");
  const [senha, setSenha] = useState(erro === "cadastro" ? "123" : "exemplo123");
  const [ver, setVer] = useState(false);
  const [tentou, setTentou] = useState(false);
  const [tremer, setTremer] = useState(0);
  const [entrando, setEntrando] = useState(false);
  const erroEmail = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Confira o e-mail. Exemplo: nome@email.com" : "";
  const erroSenha = senha.length < 8 ? `Precisa ter pelo menos 8 letras ou números. Faltam ${8 - senha.length}.` : "";
  const forca = Math.min(senha.length / 12, 1);
  function continuar() {
    setTentou(true);
    if (erroEmail || erroSenha) { setTremer((t) => t + 1); return; }
    setEntrando(true);
    setTimeout(aoContinuar, 700);
  }
  return (
    <div className="b2-login">
      {/* Foto no fundo da tela toda. Ela aproxima bem devagar (quem pediu menos movimento vê a foto parada). */}
      <motion.img className="b2-login__foto" src={fotoLogin} alt="" aria-hidden="true"
        initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 9, ease: [0.16, 1, 0.3, 1] }} />
      <div className="b2-login__escurece" aria-hidden="true" />
      <div className="ui-rolagem ui-rolagem--com-acoes b2-login__rolagem">
      <BarraNav titulo="" aoVoltar={aoVoltar} />
      <div className="ui-margem b2-login__conteudo">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...MOLA_SUAVE }}>
          <h2 className="ui-titulo-grande b2-login__titulo">Criar conta</h2>
          <p className="b2-login__sub">Leva 30 segundos. Protótipo: nada é salvo.</p>
        </motion.div>
        <motion.div className="b2-login__cartao" key={tremer} animate={tremer ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
          <label className="ui-campo">
            <span>Seu nome</span>
            <input defaultValue="Ana" autoComplete="off" />
          </label>
          <label className={`ui-campo${tentou && erroEmail ? " ui-campo--erro" : ""}`}>
            <span>E-mail</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" aria-invalid={tentou && !!erroEmail} aria-describedby="b2-email-ajuda" />
            <AnimatePresence>{tentou && erroEmail && <motion.small id="b2-email-ajuda" className="ui-erro-texto" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Icone nome="alerta" tamanho={14} /> {erroEmail}</motion.small>}</AnimatePresence>
          </label>
          <label className={`ui-campo${tentou && erroSenha ? " ui-campo--erro" : ""}`}>
            <span>Senha</span>
            <span className="ui-campo__senha">
              <input type={ver ? "text" : "password"} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="off" aria-invalid={tentou && !!erroSenha} aria-describedby="b2-senha-ajuda" />
              <button type="button" onClick={() => setVer(!ver)} aria-label={ver ? "Esconder senha" : "Mostrar senha"}><Icone nome="olho" tamanho={20} /></button>
            </span>
            <span className="b2-forca" aria-hidden="true"><motion.span animate={{ width: `${forca * 100}%`, backgroundColor: forca < 0.66 ? "#ff9f0a" : "#30a14e" }} /></span>
            <small id="b2-senha-ajuda" className={tentou && erroSenha ? "ui-erro-texto" : "ui-suave"}>
              {tentou && erroSenha ? <><Icone nome="alerta" tamanho={14} /> {erroSenha}</> : "Pelo menos 8 letras ou números."}
            </small>
          </label>
        </motion.div>
      </div>
      <div className="ui-acoes-fixas b2-login__acoes">
        <Toque className="ui-botao ui-botao--principal" onClick={continuar} disabled={entrando}>
          {entrando ? <><span className="ui-girando ui-girando--branco" /> Criando...</> : "Continuar"}
        </Toque>
      </div>
      </div>
    </div>
  );
}

// ---------- Chat que monta o painel ----------
const PERGUNTAS = [
  { chave: "objetivo", texto: "Oi, Ana! O que você quer fazer aqui?", opcoes: ["Achar compras estranhas", "Controlar meus gastos", "Os dois"] },
  { chave: "aviso", texto: "Quer que eu avise quando aparecer um nome estranho na fatura?", opcoes: ["Sim, me avise", "Agora não"] },
];

function Chat({ escolhas, setEscolhas, aoContinuar }) {
  const respondidas = PERGUNTAS.filter((p) => escolhas[p.chave]);
  const proxima = PERGUNTAS.find((p) => !escolhas[p.chave]);
  const [digitando, setDigitando] = useState(true);
  const passo = respondidas.length;
  useEffect(() => {
    setDigitando(true);
    const t = setTimeout(() => setDigitando(false), 900);
    return () => clearTimeout(t);
  }, [passo]);
  const painel = escolhas.objetivo === "Controlar meus gastos" ? "gastos por categoria" : escolhas.objetivo === "Os dois" ? "compras estranhas e gastos por categoria" : "compras estranhas";
  const bolha = { initial: { opacity: 0, y: 10, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: MOLA };
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes b2-chat-tela">
      <div className="b2-chat-topo">
        <Logo tamanho={36} />
        <span><strong>{MARCA.nome}</strong><small><span className="ui-ponto-verde" /> Assistente</small></span>
      </div>
      <div className="b2-chat" aria-live="polite">
        {respondidas.map((p) => (
          <div key={p.chave} className="b2-chat__par">
            <p className="b2-bolha b2-bolha--app">{p.texto}</p>
            <motion.p className="b2-bolha b2-bolha--eu" {...bolha}>{escolhas[p.chave]}</motion.p>
          </div>
        ))}
        {digitando ? (
          <motion.p className="b2-bolha b2-bolha--app" {...bolha}><Digitando /></motion.p>
        ) : proxima ? (
          <>
            <motion.p className="b2-bolha b2-bolha--app" {...bolha}>{proxima.texto}</motion.p>
            <motion.div className="b2-chips" role="group" aria-label="Respostas" variants={listaEmSequencia} initial="esconde" animate="mostra">
              {proxima.opcoes.map((o) => (
                <motion.button key={o} variants={itemEmSequencia} type="button" className="b2-chip" whileTap={{ scale: 0.95 }}
                  onClick={() => setEscolhas({ ...escolhas, [proxima.chave]: o })}>{o}</motion.button>
              ))}
            </motion.div>
          </>
        ) : (
          <>
            <motion.div className="b2-bolha b2-bolha--app" {...bolha}>
              Pronto! Montei seu painel com <strong>{painel}</strong>.
              <div className="b2-mini-painel" aria-hidden="true">
                {escolhas.objetivo !== "Controlar meus gastos" && <span><Icone nome="brilho" tamanho={14} /> Compras estranhas</span>}
                {escolhas.objetivo !== "Achar compras estranhas" && <span><Icone nome="grafico" tamanho={14} /> Gastos</span>}
                <span className="b2-mini-painel__mais"><Icone nome="lista" tamanho={14} /> Outras funções numa lista</span>
              </div>
            </motion.div>
            <motion.p className="b2-bolha b2-bolha--app" {...bolha} transition={{ ...MOLA, delay: 0.3 }}>Agora preciso ver suas faturas. Vamos conectar seus bancos?</motion.p>
          </>
        )}
      </div>
      <AnimatePresence>
        {!proxima && !digitando && (
          <motion.div className="ui-acoes-fixas" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ ...MOLA, delay: 0.4 }}>
            <Toque className="ui-botao ui-botao--principal" onClick={aoContinuar}>Conectar meus bancos</Toque>
            <button type="button" className="ui-botao ui-botao--fantasma" onClick={() => setEscolhas({})}>Mudar minhas respostas</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Escolher bancos ----------
const CORES_BANCO = { [BANCO]: "#0b6e6e", "Banco Horizonte": "#5b4bdb", "Banco Ipê": "#d9822b", "Cooperativa Vale": "#2c8a4b" };
function LogoBanco({ nome, tamanho = 44 }) {
  const ini = nome.split(" ").filter((p) => p.length > 2).map((p) => p[0]).join("").slice(0, 2);
  return <span className="b2-banco-logo" style={{ background: CORES_BANCO[nome] || "#555", width: tamanho, height: tamanho }} aria-hidden="true">{ini}</span>;
}

function Bancos({ bancos, setBancos, aoVoltar, aoContinuar }) {
  const alternar = (b) => setBancos(bancos.includes(b) ? bancos.filter((x) => x !== b) : [...bancos, b]);
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="" aoVoltar={aoVoltar} />
      <div className="ui-margem">
        <h2 className="ui-titulo-grande">Seus bancos</h2>
        <p className="ui-suave">Escolha de onde trazer as faturas. Usamos o <strong>Open Finance</strong>: o sistema do Banco Central que deixa você compartilhar seus dados com outro app, só com a sua permissão.</p>
        <motion.div className="b2-bancos" variants={listaEmSequencia} initial="esconde" animate="mostra" role="group" aria-label="Bancos">
          {BANCOS_FICTICIOS.map((b) => {
            const on = bancos.includes(b);
            return (
              <motion.button key={b} variants={itemEmSequencia} type="button" role="checkbox" aria-checked={on}
                className={`b2-banco${on ? " b2-banco--on" : ""}`} onClick={() => alternar(b)} whileTap={{ scale: 0.96 }}>
                <LogoBanco nome={b} />
                <span>{b}</span>
                <AnimatePresence>
                  {on && (
                    <motion.span className="b2-banco__check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={MOLA}>
                      <Icone nome="check" tamanho={14} traco={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
        <AnimatePresence>
          {bancos.length === 0 && (
            <motion.p className="ui-erro-texto" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Icone nome="alerta" tamanho={16} /> Escolha pelo menos um banco.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" disabled={bancos.length === 0} onClick={aoContinuar}>
          Continuar{bancos.length > 0 ? ` com ${bancos.length} ${bancos.length === 1 ? "banco" : "bancos"}` : ""}
        </Toque>
      </div>
    </div>
  );
}

// ---------- Permissão do Open Finance ----------
function Permissao({ erro, bancos, aoVoltar, aoAutorizar }) {
  const [fase, setFase] = useState("ler"); // ler, conectando, recusou, pronto
  const [tentativas, setTentativas] = useState(0);
  useEffect(() => {
    if (fase === "conectando") {
      const t = setTimeout(() => {
        if (erro === "recusou" && tentativas === 0) { setTentativas(1); setFase("recusou"); return; }
        setFase("pronto");
      }, 1900);
      return () => clearTimeout(t);
    }
    if (fase === "pronto") { const t = setTimeout(aoAutorizar, 1500); return () => clearTimeout(t); }
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (fase === "conectando" || fase === "pronto") {
    return (
      <div className="ui-rolagem b2-conectando" role="status">
        <div className="b2-ponte" aria-hidden="true">
          <Logo tamanho={64} />
          <span className="b2-ponte__trilho">
            {fase === "conectando" && [0, 1, 2].map((i) => (
              <motion.span key={i} animate={{ x: [0, 72], opacity: [0, 1, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }} />
            ))}
          </span>
          <LogoBanco nome={bancos[0]} tamanho={64} />
        </div>
        <AnimatePresence mode="wait">
          {fase === "conectando" ? (
            <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="b2-conectando__titulo">Abrindo o app do {bancos[0]}...</h2>
              <p className="ui-suave">Confirme lá com sua senha ou rosto. Depois você volta para cá sozinho.</p>
            </motion.div>
          ) : (
            <motion.div key="p" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckAnimado tamanho={72} />
              <h2 className="b2-conectando__titulo">{bancos.length === 1 ? "Banco conectado" : `${bancos.length} bancos conectados`}</h2>
              <p className="ui-suave">Procurando compras de nome estranho...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (fase === "recusou") {
    return (
      <div className="ui-rolagem ui-rolagem--com-acoes">
        <BarraNav titulo="" aoVoltar={aoVoltar} />
        <motion.div className="ui-margem b2-recusou" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
          <span className="b2-recusou__icone"><Icone nome="alerta" tamanho={32} /></span>
          <h2 className="ui-titulo-medio" role="alert">O {bancos[0]} não foi conectado</h2>
          <p>A autorização foi cancelada no app do banco. Sem ela, não conseguimos ver suas faturas.</p>
          <p className="ui-suave">Se foi sem querer, tente de novo. Você também pode seguir sem esse banco.</p>
        </motion.div>
        <div className="ui-acoes-fixas">
          <Toque className="ui-botao ui-botao--principal" onClick={() => setFase("conectando")}>Tentar de novo</Toque>
          <Toque className="ui-botao ui-botao--fantasma" onClick={aoVoltar}>Escolher outros bancos</Toque>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="" aoVoltar={aoVoltar} />
      <div className="ui-margem">
        <div className="b2-permissao__logos" aria-hidden="true">
          <Logo tamanho={48} />
          <Icone nome="link" tamanho={20} />
          {bancos.slice(0, 3).map((b) => <LogoBanco key={b} nome={b} tamanho={48} />)}
        </div>
        <h2 className="ui-titulo-medio">Sua permissão</h2>
        <p className="ui-suave">Vamos pedir aos bancos: <strong>{bancos.join(", ")}</strong>.</p>
        <motion.div className="ui-cartao b2-permissao" variants={listaEmSequencia} initial="esconde" animate="mostra">
          <motion.h3 variants={itemEmSequencia}>O que vamos ver</motion.h3>
          {["Faturas do cartão", "Nome, valor e data de cada compra"].map((t) => (
            <motion.p key={t} variants={itemEmSequencia} className="b2-permissao__sim"><Icone nome="check" tamanho={16} traco={3} /> {t}</motion.p>
          ))}
          <motion.h3 variants={itemEmSequencia}>O que NÃO vamos ver nem fazer</motion.h3>
          {["Sua senha do banco", "Mover seu dinheiro ou pagar contas"].map((t) => (
            <motion.p key={t} variants={itemEmSequencia} className="b2-permissao__nao"><Icone nome="x" tamanho={16} traco={3} /> {t}</motion.p>
          ))}
          <motion.h3 variants={itemEmSequencia}>Por quanto tempo</motion.h3>
          <motion.p variants={itemEmSequencia} className="ui-suave"><Icone nome="relogio" tamanho={16} /> 12 meses. Você cancela quando quiser, aqui ou no app do banco.</motion.p>
        </motion.div>
      </div>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" onClick={() => setFase("conectando")}><Icone nome="cadeado" tamanho={18} /> Autorizar no app do banco</Toque>
      </div>
    </div>
  );
}

// ---------- Painel ----------
function Painel({ erro, escolhas, aoTentarDeNovo, aoAbrir, aoBloqueado }) {
  const bancoFora = erro === "banco-fora";
  const vazio = erro === "vazio";
  const compras = bancoFora ? COMPRAS_PAINEL.filter((c) => c.banco !== "Banco Horizonte") : vazio ? [] : COMPRAS_PAINEL;
  const mostrarGastos = escolhas.objetivo !== "Achar compras estranhas";
  const mostrarCompras = escolhas.objetivo !== "Controlar meus gastos";
  const total = GASTOS.reduce((s, g) => s + g.valor, 0);
  const semCerteza = compras.filter((c) => !c.loja).length;
  return (
    <div className="ui-rolagem ui-rolagem--com-tabs">
      <div className="b2-painel-topo">
        <div><p className="ui-suave">Quinta, 27 nov</p><h2 className="ui-titulo-grande">Olá, Ana</h2></div>
        <button type="button" className="b2-sino" onClick={aoBloqueado} aria-label="Avisos (3 novos)"><Icone nome="sino" tamanho={22} /><span>3</span></button>
      </div>

      <AnimatePresence>
        {bancoFora && (
          <motion.div className="ui-erro-caixa b2-aviso-banco" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Icone nome="alerta" tamanho={18} />
            <span>O <strong>Banco Horizonte</strong> não respondeu. Mostramos só o que veio dos outros bancos. Tentamos de novo sozinhos em 1 hora.
              <button type="button" onClick={aoTentarDeNovo}>Tentar agora</button></span>
          </motion.div>
        )}
      </AnimatePresence>

      {mostrarCompras && (
        <section aria-labelledby="estranhas">
          {compras.length === 0 ? (
            <motion.div className="ui-cartao b2-vazio" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckAnimado tamanho={56} />
              <strong id="estranhas">Tudo certo por aqui</strong>
              <span className="ui-suave">Nenhuma compra com nome estranho em novembro. Avisamos se aparecer alguma.</span>
            </motion.div>
          ) : (
            <motion.div className="b2-resumo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
              <span className="b2-resumo__brilho" aria-hidden="true" />
              <p className="b2-resumo__rotulo"><Icone nome="brilho" tamanho={16} /> Compras com nome estranho</p>
              <p id="estranhas" className="b2-resumo__numero">{compras.length}</p>
              <p className="b2-resumo__texto">
                {compras.length - semCerteza} já identificadas{semCerteza ? ` · ${semCerteza} precisa da sua atenção` : ""}
              </p>
            </motion.div>
          )}
          <motion.ul className="b2-compras" variants={listaEmSequencia} initial="esconde" animate="mostra">
            {compras.map((c) => {
              const atencao = !c.loja;
              return (
                <motion.li key={c.id} variants={itemEmSequencia}>
                  <motion.button type="button" className={`b2-compra${atencao ? " b2-compra--atencao" : ""}`} whileTap={{ scale: 0.98 }}
                    onClick={atencao ? aoAbrir : aoBloqueado}>
                    <span className={`b2-compra__avatar${atencao ? " b2-compra__avatar--q" : ""}`}>
                      <Icone nome={atencao ? "interrogacao" : c.id === "padaria" ? "pao" : "lanche"} tamanho={20} />
                    </span>
                    <span className="b2-compra__meio">
                      <strong>{c.loja || "Não sabemos com certeza"}</strong>
                      <small><code>{c.nome}</code></small>
                      <small><LogoBanco nome={c.banco} tamanho={14} /> {c.banco} · {c.data}</small>
                    </span>
                    <span className="b2-compra__dir">
                      <strong>{c.valor}</strong>
                      <span className={`b2-selo b2-selo--${c.certeza}`}>{{ alta: "Alta", media: "Média", baixa: "Baixa" }[c.certeza]}</span>
                    </span>
                  </motion.button>
                </motion.li>
              );
            })}
          </motion.ul>
        </section>
      )}

      {mostrarGastos && (
        <motion.section className="ui-cartao b2-gastos" aria-labelledby="gastos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...MOLA, delay: 0.25 }}>
          <div className="b2-gastos__topo">
            <h3 id="gastos" className="ui-rotulo">Gastos de novembro</h3>
            <strong>R$ {total.toLocaleString("pt-BR")}</strong>
          </div>
          <div className="b2-gastos__barra" aria-hidden="true">
            {GASTOS.map((g, i) => (
              <motion.span key={g.nome} style={{ background: g.cor }} initial={{ width: 0 }} animate={{ width: `${(g.valor / total) * 100}%` }} transition={{ delay: 0.4 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
            ))}
          </div>
          <ul className="b2-gastos__lista">
            {GASTOS.map((g) => (
              <li key={g.nome}><span className="b2-gastos__ponto" style={{ background: g.cor }} />{g.nome}<span>R$ {g.valor}</span></li>
            ))}
          </ul>
        </motion.section>
      )}

      <section className="ui-cartao b2-mais" aria-labelledby="mais">
        <h3 id="mais" className="ui-rotulo">Outras funções</h3>
        {[["relogio", "Assinaturas que se repetem", "Em breve"], ["sino", "Lembretes de prazo", "Em breve"], ["link", "Bancos conectados", "3"]].map(([i, t, d]) => (
          <button key={t} type="button" className="b2-mais__item" onClick={aoBloqueado}>
            <span className="b2-mais__icone"><Icone nome={i} tamanho={18} /></span><span>{t}</span><small>{d}</small><Icone nome="seta" tamanho={16} />
          </button>
        ))}
      </section>

      <nav className="ui-tabs" aria-label="Menu do app">
        {[["casa", "Início"], ["lista", "Compras"], ["escudo", "Contestações"], ["usuario", "Perfil"]].map(([i, n]) => (
          <button key={n} type="button" className={`ui-tabs__item${n === "Início" ? " ui-tabs__item--ativo" : ""}`} aria-current={n === "Início" ? "page" : undefined}
            onClick={n === "Início" ? undefined : aoBloqueado}>
            <Icone nome={i} tamanho={24} /><span>{n}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ---------- Compra sem certeza ----------
function Compra({ aoVoltar, aoContestar, aoReconhecer }) {
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="Compra" aoVoltar={aoVoltar} />
      <div className="b1-heroi">
        <span className="b2-compra__avatar b2-compra__avatar--q b2-compra__avatar--grande"><Icone nome="interrogacao" tamanho={30} /></span>
        <p className="b1-heroi__valor">R$ 89,90</p>
        <p className="b1-heroi__cru">INT*XQZ7 SERVICOS</p>
        <p className="b1-heroi__data">20 nov · {BANCO} · cartão final 1234</p>
      </div>
      <motion.section className="ui-cartao b1-quem" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={MOLA}>
        <div className="b1-quem__cabeca">
          <div>
            <p className="ui-suave b1-quem__talvez">Não temos certeza. O mais provável é</p>
            <h3 className="b1-quem__loja">Um serviço pela internet</h3>
          </div>
          <AnelCerteza nivel="baixa" />
        </div>
        <p className="b1-quem__porque">Achamos 2 empresas com nome parecido, em cidades diferentes. Nenhuma bate com certeza.</p>
        <p className="b2-limite"><Icone nome="mapa" tamanho={16} /> O Open Finance talvez não mande o local da compra. Sem o local, a certeza fica mais baixa que no app do banco.</p>
        <details className="ui-fontes">
          <summary>Ver as 2 empresas parecidas</summary>
          <ul><li><Icone nome="link" tamanho={14} /> XQZ Serviços Digitais · Cidade A</li><li><Icone nome="link" tamanho={14} /> XQ7 Soluções · Cidade B</li></ul>
        </details>
      </motion.section>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--perigo-cheio" onClick={aoContestar}>Não reconheço, quero contestar</Toque>
        <Toque className="ui-botao ui-botao--fantasma" onClick={aoReconhecer}>Reconheço, fui eu</Toque>
      </div>
    </div>
  );
}

// ---------- Contestar ----------
function Contestar({ aoVoltar, aoEnviei }) {
  const [copiado, setCopiado] = useState(false);
  const [lembrete, setLembrete] = useState(true);
  const texto = `Olá. Quero contestar uma compra no meu cartão final 1234.

Nome na fatura: INT*XQZ7 SERVICOS
Valor: R$ 89,90
Data: 20/11/2026

Não reconheço esta compra e não autorizei este pagamento. Peço que seja analisada e o valor devolvido. Por favor, me informem o número de protocolo.`;
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="" aoVoltar={aoVoltar} />
      <div className="ui-margem">
        <h2 className="ui-titulo-grande">Contestar</h2>
        <p className="ui-suave">No {BANCO}, em 3 passos.</p>
        <ol className="b2-passos">
          {["Copie o texto pronto", `Abra o app do ${BANCO} em "Contestar compra"`, "Cole o texto e anote o protocolo"].map((p, i) => (
            <li key={p}><span>{i + 1}</span>{p}</li>
          ))}
        </ol>
        <div className="b2-texto">
          <pre>{texto}</pre>
          <Toque className={`b2-copiar${copiado ? " b2-copiar--ok" : ""}`} onClick={() => setCopiado(true)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={copiado ? "ok" : "c"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                {copiado ? <><Icone nome="check" tamanho={16} traco={3} /> Copiado</> : <><Icone nome="copiar" tamanho={16} /> Copiar texto</>}
              </motion.span>
            </AnimatePresence>
          </Toque>
        </div>
        <button type="button" className="b2-interruptor" role="switch" aria-checked={lembrete} onClick={() => setLembrete(!lembrete)}>
          <span><strong>Me lembrar em 7 dias</strong><small>O prazo muda de banco para banco.</small></span>
          <span className={`b2-interruptor__trilho${lembrete ? " b2-interruptor__trilho--on" : ""}`}><motion.span layout transition={MOLA} /></span>
        </button>
      </div>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" onClick={aoEnviei}>Já enviei ao banco</Toque>
        <Toque className="ui-botao ui-botao--fantasma">Abrir app do {BANCO}</Toque>
      </div>
    </div>
  );
}

// ---------- Acompanhar o estorno ----------
function Acompanhar({ aoPainel }) {
  return (
    <div className="ui-rolagem ui-rolagem--com-acoes">
      <BarraNav titulo="Acompanhar" />
      <div className="ui-margem">
        <div className="ui-cartao b2-acompanhar">
          <span className="b2-compra__avatar b2-compra__avatar--q"><Icone nome="interrogacao" tamanho={20} /></span>
          <span><strong>INT*XQZ7 SERVICOS</strong><small className="ui-suave">R$ 89,90 · {BANCO}</small></span>
        </div>
        <motion.ol className="ui-linha-tempo" variants={listaEmSequencia} initial="esconde" animate="mostra">
          {[["feito", "Contestação enviada ao banco", "Hoje"], ["agora", "Conferindo sua fatura todo dia", "Pelo Open Finance. Você não precisa fazer nada."], ["", "Dinheiro de volta", "Avisamos quando o estorno aparecer na fatura"]].map(([e, t, s]) => (
            <motion.li key={t} variants={itemEmSequencia} className={e}>
              <span className="ui-linha-tempo__ponto" aria-hidden="true" />
              <strong>{t}</strong><small>{s}</small>
            </motion.li>
          ))}
        </motion.ol>
        <p className="b2-lembrete-marcado"><Icone nome="sino" tamanho={16} /> Lembrete marcado para 04/12</p>
      </div>
      <div className="ui-acoes-fixas">
        <Toque className="ui-botao ui-botao--principal" onClick={aoPainel}>Voltar ao painel</Toque>
      </div>
    </div>
  );
}
