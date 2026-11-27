// Protótipo do cenário 1 (B2B): o "Quem me cobrou?" dentro do app de um banco.
// O banco já sabe o nome e o local da compra. A pessoa só toca na compra.
// Fluxo A: fatura -> detalhe com a loja. Fluxo B: contestar com provas já preenchidas -> enviado.
import { useEffect, useState } from "react";
import Moldura from "./Moldura.jsx";
import MapaFalso from "./MapaFalso.jsx";
import SeloCerteza from "../componentes/SeloCerteza.jsx";
import { BANCO_FICTICIO, coresCss } from "./marca.js";
import { BANCO, COMPRAS_FATURA, RESPOSTA_PADARIA as R, API_PEDIDO, API_RESPOSTA } from "./dados.js";

const TELAS = [
  { id: "fatura", nome: "Fatura no app do banco" },
  { id: "detalhe", nome: "Quem cobrou (loja achada)" },
  { id: "contestar", nome: "Contestar com provas" },
  { id: "enviado", nome: "Contestação enviada" },
];

const NOTAS = {
  fatura: "A pessoa está no app do banco, sem login novo. O nome estranho ganha a marca \"Quem é?\". Toque nele.",
  detalhe: "O banco mandou o nome e o local para a nossa API. Em poucos segundos aparece a loja, a certeza, o mapa e as fontes. A pessoa pode mover a compra de \"Outros\" para a categoria certa. Abra \"Ver o que a API recebe\" para mostrar a parte técnica.",
  contestar: "O formulário já vem com as provas que a API achou: loja, CNPJ, endereço e distância. A pessoa não digita nada. Antes de enviar, o app pede confirmação.",
  enviado: "O banco recebe a contestação com provas. A pessoa vê o protocolo e o andamento no próprio app.",
};

export default function Cenario1() {
  const [tela, setTela] = useState("fatura");
  const [movida, setMovida] = useState(false);
  const [reconhecida, setReconhecida] = useState(false);
  const [contestada, setContestada] = useState(false);
  const [erro, setErro] = useState(null); // caso de erro escolhido no painel ao lado
  const irPara = (t) => { setTela(t); setErro(null); if (t === "fatura") { setMovida(false); setReconhecida(false); setContestada(false); } };
  const ERROS = [
    { id: "api", nome: "Nossa API fora do ar", descricao: "A busca falha. A pessoa pode tentar de novo ou contestar mesmo assim.", acao: () => { setTela("detalhe"); setErro("api"); } },
    { id: "baixa", nome: "Loja sem certeza", descricao: "Duas lojas parecidas, longe do local. Mostramos a dúvida.", acao: () => { setTela("detalhe"); setErro("baixa"); } },
    { id: "motivo", nome: "Esqueceu o motivo", descricao: "Toque em \"Revisar e enviar\" sem escolher o que aconteceu.", acao: () => { setTela("contestar"); setErro("motivo"); } },
    { id: "envio", nome: "Falha ao enviar", descricao: "O envio falha na 1ª vez. Nada se perde. Na 2ª tentativa funciona.", acao: () => { setTela("contestar"); setErro("envio"); } },
  ];
  return (
    <Moldura titulo="Cenário 1: dentro do app do banco" telas={TELAS} atual={tela} irPara={irPara} nota={NOTAS[tela]} erros={ERROS} erroAtual={erro}>
      <div className="app-banco" style={coresCss(BANCO_FICTICIO)}>
        {tela === "fatura" && <Fatura movida={movida} reconhecida={reconhecida} contestada={contestada} aoTocar={() => setTela("detalhe")} />}
        {tela === "detalhe" && (
          <Detalhe
            key={erro || "ok"} erro={erro} aoTentarDeNovo={() => setErro("recarregar")}
            movida={movida} setMovida={setMovida}
            aoVoltar={() => setTela("fatura")}
            aoReconhecer={() => { setReconhecida(true); setTela("fatura"); }}
            aoContestar={() => setTela("contestar")}
          />
        )}
        {tela === "contestar" && <Contestar key={erro || "ok"} erro={erro} aoVoltar={() => setTela("detalhe")} aoEnviar={() => setTela("enviado")} />}
        {tela === "enviado" && <Enviado aoFim={() => { setContestada(true); setTela("fatura"); }} />}
      </div>
    </Moldura>
  );
}

function BarraApp({ titulo, aoVoltar }) {
  return (
    <div className="app-barra">
      {aoVoltar ? (
        <button type="button" className="app-barra__voltar" onClick={aoVoltar} aria-label="Voltar">‹</button>
      ) : (
        <span className="app-barra__logo" aria-hidden="true">{BANCO_FICTICIO.sigla}</span>
      )}
      <span className="app-barra__titulo">{titulo}</span>
    </div>
  );
}

function Fatura({ movida, reconhecida, contestada, aoTocar }) {
  return (
    <>
      <BarraApp titulo={BANCO} />
      <div className="app-conteudo">
        <div className="app-resumo">
          <p className="app-resumo__rotulo">Fatura aberta · vence 10/12</p>
          <p className="app-resumo__valor">R$ 1.284,30</p>
        </div>
        <h2 className="app-secao">Compras recentes</h2>
        <ul className="app-lista">
          {COMPRAS_FATURA.map((c) => {
            const padaria = c.id === "padaria";
            const identificada = padaria && (movida || reconhecida || contestada);
            const nome = identificada ? R.loja : c.nome;
            const categoria = padaria && movida ? R.categoria : c.categoria;
            const clicavel = padaria;
            const Conteudo = (
              <>
                <span className="app-lista__nome">{nome}</span>
                <span className="app-lista__valor">{c.valor}</span>
                <span className="app-lista__info">
                  {c.data} · {categoria}
                  {c.estranho && !identificada && <span className="chip-quem">? Quem é</span>}
                  {identificada && !contestada && <span className="chip-ok">✓ Loja identificada</span>}
                  {padaria && contestada && <span className="chip-contestada">Em contestação</span>}
                </span>
              </>
            );
            return (
              <li key={c.id}>
                {clicavel ? (
                  <button type="button" className="app-lista__item app-lista__item--toque" onClick={aoTocar}>{Conteudo}</button>
                ) : (
                  <div className="app-lista__item">{Conteudo}</div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="app-dica">No protótipo, só a compra da padaria abre.</p>
      </div>
    </>
  );
}

// Resposta quando não temos certeza (caso de erro "baixa").
const R_BAIXA = {
  loja: "Talvez: Lanchonete Bom Dia",
  porque: "Achamos 2 lojas com nome parecido. A mais perto fica a 3,2 km de onde o cartão foi usado. Por isso não temos certeza.",
  distancia: "3,2 km",
};

function Detalhe({ erro, aoTentarDeNovo, movida, setMovida, aoVoltar, aoReconhecer, aoContestar }) {
  const falhou = erro === "api";
  const baixa = erro === "baixa";
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCarregando(false), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <BarraApp titulo="Detalhe da compra" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <div className="app-compra">
          <p className="app-compra__valor">R$ 32,50</p>
          <p className="app-compra__nome">MP*PADARIABOMDIA</p>
          <p className="app-compra__info">24/11 às 08:12 · Cartão final 1234</p>
        </div>

        <section className="app-cartao" aria-labelledby="quem-cobrou" aria-busy={carregando}>
          <p className="app-cartao__marca">Quem cobrou · <span>com Quem me cobrou?</span></p>
          {carregando ? (
            <div className="aviso" role="status">
              <span className="girando" aria-hidden="true" />
              <span>Procurando a loja na Receita e perto de onde o cartão foi usado...</span>
            </div>
          ) : falhou ? (
            <div className="app-erro" role="alert">
              <h2 id="quem-cobrou" className="app-cartao__loja">Não conseguimos descobrir a loja agora</h2>
              <p>O serviço que procura a loja não respondeu. A compra continua na sua fatura e nada mudou.</p>
              <p className="ajuda-texto">Você pode tentar de novo em alguns segundos, ou contestar mesmo assim.</p>
              <button type="button" className="app-botao app-botao--principal app-botao-largo" onClick={aoTentarDeNovo}>Tentar de novo</button>
            </div>
          ) : baixa ? (
            <>
              <p className="rotulo">Não temos certeza. O mais provável é</p>
              <h2 id="quem-cobrou" className="app-cartao__loja">{R_BAIXA.loja}</h2>
              <SeloCerteza nivel="baixa" />
              <p className="app-cartao__porque">{R_BAIXA.porque}</p>
              <MapaFalso distancia={R_BAIXA.distancia} />
              <details className="fontes">
                <summary>Ver as 2 lojas parecidas</summary>
                <ul><li>Lanchonete Bom Dia (a 3,2 km)</li><li>Bom Dia Lanches e Café (a 7,8 km)</li></ul>
              </details>
            </>
          ) : (
            <>
              <h2 id="quem-cobrou" className="app-cartao__loja">{R.loja}</h2>
              <SeloCerteza nivel={R.certeza} />
              <p className="app-cartao__porque">{R.porque}</p>
              <MapaFalso distancia={R.distancia} />
              <dl className="dados">
                <dt>CNPJ</dt><dd>{R.cnpj}</dd>
                <dt>Endereço</dt><dd>{R.endereco}</dd>
                <dt>Atividade</dt><dd>{R.atividade}</dd>
              </dl>
              <details className="fontes">
                <summary>Ver as fontes ({R.fontes.length})</summary>
                <ul>{R.fontes.map((f) => <li key={f}>{f}</li>)}</ul>
              </details>
            </>
          )}
        </section>

        {!carregando && (
          <>
            {!falhou && !baixa && (
            <section className="app-cartao" aria-labelledby="cat-titulo">
              <h3 id="cat-titulo" className="app-cartao__subtitulo">Categoria</h3>
              {movida ? (
                <div className="app-toast" role="status">
                  <span>✓ Movida de "Outros" para <strong>{R.categoria}</strong>.</span>
                  <button type="button" className="botao botao--link" onClick={() => setMovida(false)}>Desfazer</button>
                </div>
              ) : (
                <>
                  <p className="ajuda-texto">Hoje está em <strong>Outros</strong>. Sugestão: <strong>{R.categoria}</strong>.</p>
                  <button type="button" className="botao botao--secundario app-botao-largo" onClick={() => setMovida(true)}>
                    Mover para {R.categoria}
                  </button>
                </>
              )}
            </section>
            )}
            {baixa && (
              <p className="ajuda-texto app-cartao">Sem certeza, não sugerimos categoria. A compra fica em "Outros" até você confirmar.</p>
            )}

            {!falhou && (
            <details className="app-tecnico">
              <summary>Ver o que a API recebe e devolve</summary>
              <p className="ajuda-texto">O banco manda:</p>
              <pre>{JSON.stringify(API_PEDIDO, null, 2)}</pre>
              <p className="ajuda-texto">A nossa API devolve (resumo):</p>
              <pre>{JSON.stringify(API_RESPOSTA, null, 2)}</pre>
            </details>
            )}

            <div className="app-acoes">
              <button type="button" className="app-botao app-botao--principal" onClick={aoReconhecer}>Reconheço esta compra</button>
              <button type="button" className="app-botao app-botao--perigo" onClick={aoContestar}>Não reconheço esta compra</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Contestar({ erro, aoVoltar, aoEnviar }) {
  const [tipo, setTipo] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [falhouEnvio, setFalhouEnvio] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  function enviar() {
    setEnviando(true);
    setFalhouEnvio(false);
    setTimeout(() => {
      setEnviando(false);
      // No caso de erro "envio", a 1ª tentativa falha e a 2ª funciona.
      if (erro === "envio" && tentativas === 0) { setTentativas(1); setFalhouEnvio(true); return; }
      aoEnviar();
    }, 1000);
  }
  function revisar() {
    if (!tipo) { setAviso("Escolha o que aconteceu para continuar."); return; }
    setAviso("");
    setConfirmar(true);
  }
  return (
    <>
      <BarraApp titulo="Contestar compra" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <div className="app-compra app-compra--pequena">
          <p className="app-compra__nome">{R.loja} · R$ 32,50 · 24/11</p>
        </div>

        <fieldset className="grupo-opcoes" aria-describedby={aviso ? "aviso-tipo" : undefined}>
          <legend className="app-secao">O que aconteceu?</legend>
          {[
            ["golpe", "Não fui eu", "Alguém usou meu cartão. O banco bloqueia este cartão e manda outro."],
            ["problema", "Fui eu, mas teve problema", "Ex.: cobraram duas vezes ou não recebi o produto."],
          ].map(([v, t, d]) => (
            <label key={v} className={`opcao${tipo === v ? " opcao--escolhida" : ""}`}>
              <input type="radio" name="tipo" value={v} checked={tipo === v} onChange={() => { setTipo(v); setAviso(""); }} />
              <span><strong>{t}</strong><span className="opcao__descricao">{d}</span></span>
            </label>
          ))}
        </fieldset>
        {aviso && <p id="aviso-tipo" className="aviso aviso--erro" role="alert"><span className="aviso__icone">!</span>{aviso}</p>}

        <section className="app-cartao" aria-labelledby="provas">
          <h3 id="provas" className="app-cartao__subtitulo">Provas que vão junto (já preenchidas)</h3>
          <ul className="app-provas">
            <li>✓ Loja: {R.loja}</li>
            <li>✓ CNPJ na Receita: {R.cnpj}</li>
            <li>✓ Endereço da loja: {R.endereco}</li>
            <li>✓ Distância do local da compra: {R.distancia}</li>
            <li>✓ {R.fontes.length} fontes consultadas</li>
          </ul>
          <p className="ajuda-texto">Você não precisa digitar nada disso.</p>
        </section>

        <div className="campo">
          <label htmlFor="obs">Quer contar mais alguma coisa? <span className="opcional">(opcional)</span></label>
          <input id="obs" placeholder="Ex.: estava em casa nesse horário" />
        </div>

        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" onClick={revisar}>Revisar e enviar</button>
        </div>
      </div>

      {confirmar && (
        <div className="app-folha" role="dialog" aria-modal="true" aria-labelledby="conf-titulo">
          <div className="app-folha__caixa">
            <h2 id="conf-titulo" className="app-cartao__loja">Enviar contestação?</h2>
            <p>Compra de <strong>R$ 32,50</strong> em <strong>{R.loja}</strong>, dia 24/11.</p>
            <p className="ajuda-texto">
              {tipo === "golpe" ? "Motivo: não fui eu. O cartão final 1234 será bloqueado." : "Motivo: fui eu, mas teve problema."}
            </p>
            {falhouEnvio && (
              <p className="aviso aviso--erro" role="alert">
                <span className="aviso__icone">!</span>
                Não conseguimos enviar agora. Suas respostas e as provas estão guardadas. Tente de novo.
              </p>
            )}
            <div className="app-acoes">
              <button type="button" className="app-botao app-botao--principal" disabled={enviando} onClick={enviar}>
                {enviando ? "Enviando..." : falhouEnvio ? "Tentar de novo" : "Sim, enviar"}
              </button>
              <button type="button" className="app-botao" disabled={enviando} onClick={() => setConfirmar(false)}>Voltar e mudar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Enviado({ aoFim }) {
  return (
    <>
      <BarraApp titulo="Contestação" />
      <div className="app-conteudo app-fim">
        <div className="app-fim__icone" aria-hidden="true">✓</div>
        <h2 className="app-cartao__loja">Contestação enviada</h2>
        <p>Protocolo <strong>2026-112400123</strong></p>
        <ol className="app-status">
          <li className="feito"><strong>Enviada com provas</strong><span>Hoje, 08:30</span></li>
          <li className="agora"><strong>Em análise pelo banco</strong><span>Avisamos aqui no app quando mudar</span></li>
          <li><strong>Resposta do banco</strong><span>Você recebe uma notificação</span></li>
        </ol>
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" onClick={aoFim}>Voltar para a fatura</button>
        </div>
      </div>
    </>
  );
}
