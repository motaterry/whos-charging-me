// Protótipo do cenário 2 (B2C, visão de futuro): o nosso próprio app.
// A pessoa cria conta, um chat monta o painel, ela conecta os bancos pelo Open Finance,
// e o app acha sozinho as compras de nome estranho. Depois ajuda a contestar e confere se o dinheiro voltou.
import { useEffect, useState } from "react";
import Moldura from "./Moldura.jsx";
import SeloCerteza from "../componentes/SeloCerteza.jsx";
import { COMPRAS_PAINEL, GASTOS, BANCOS_FICTICIOS } from "./dados.js";

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
  "boas-vindas": "Visão de futuro: um app nosso, para quem tem cartões em vários bancos.",
  conta: "Login simples. No protótipo os campos já vêm preenchidos e nada é salvo.",
  chat: "Em vez de um cadastro longo, um chat faz 2 perguntas e monta só o painel que a pessoa quer. As outras funções ficam numa lista.",
  bancos: "A pessoa escolhe de quais bancos quer trazer as faturas. Os nomes dos bancos são inventados.",
  permissao: "Tela de consentimento do Open Finance: o que o app vê, o que não vê, por quanto tempo e como cancelar. Na vida real isso passa por uma empresa parceira autorizada pelo Banco Central.",
  painel: "O app já achou as compras de nome estranho de todos os bancos e identificou as lojas. Toque na compra com certeza baixa.",
  compra: "Quando não temos certeza, dizemos. Aqui também mostramos um limite honesto: o Open Finance talvez não mande o local da compra.",
  contestar: "O texto já vem preenchido com banco, valor, data e nome, porque o app tem esses dados. A pessoa pode ligar um lembrete.",
  acompanhar: "Depois de contestar, o app confere sozinho a fatura todo dia e avisa quando o dinheiro voltar.",
};

export default function Cenario2() {
  const [tela, setTela] = useState("boas-vindas");
  const [escolhas, setEscolhas] = useState({});
  const [bancos, setBancos] = useState(["Banco Exemplo", "Banco Horizonte"]);
  const irPara = (t) => { setTela(t); if (t === "boas-vindas") setEscolhas({}); };
  return (
    <Moldura titulo="Cenário 2: o nosso app (visão de futuro)" telas={TELAS} atual={tela} irPara={irPara} nota={NOTAS[tela]}>
      <div className="app-nosso">
        {tela === "boas-vindas" && <BoasVindas aoComecar={() => setTela("conta")} />}
        {tela === "conta" && <Conta aoVoltar={() => setTela("boas-vindas")} aoContinuar={() => setTela("chat")} />}
        {tela === "chat" && <Chat escolhas={escolhas} setEscolhas={setEscolhas} aoContinuar={() => setTela("bancos")} />}
        {tela === "bancos" && <Bancos bancos={bancos} setBancos={setBancos} aoVoltar={() => setTela("chat")} aoContinuar={() => setTela("permissao")} />}
        {tela === "permissao" && <Permissao bancos={bancos} aoVoltar={() => setTela("bancos")} aoAutorizar={() => setTela("painel")} />}
        {tela === "painel" && <Painel escolhas={escolhas} aoAbrir={() => setTela("compra")} />}
        {tela === "compra" && <Compra aoVoltar={() => setTela("painel")} aoContestar={() => setTela("contestar")} />}
        {tela === "contestar" && <Contestar aoVoltar={() => setTela("compra")} aoEnviei={() => setTela("acompanhar")} />}
        {tela === "acompanhar" && <Acompanhar aoPainel={() => setTela("painel")} />}
      </div>
    </Moldura>
  );
}

function Barra({ titulo, aoVoltar }) {
  return (
    <div className="app-barra">
      {aoVoltar && <button type="button" className="app-barra__voltar" onClick={aoVoltar} aria-label="Voltar">‹</button>}
      <span className="app-barra__titulo">{titulo}</span>
    </div>
  );
}

function BoasVindas({ aoComecar }) {
  return (
    <div className="app-conteudo app-centro">
      <div className="app-logo" aria-hidden="true">?</div>
      <h2 className="app-grande">Quem me cobrou?</h2>
      <p>Ache as compras de nome estranho em todos os seus cartões. Num lugar só.</p>
      <ul className="app-provas app-provas--esquerda">
        <li>✓ Mostramos qual é a loja e de onde veio a informação</li>
        <li>✓ Avisamos quando aparece um nome estranho</li>
        <li>✓ Ajudamos a contestar e conferimos se o dinheiro voltou</li>
      </ul>
      <div className="app-acoes">
        <button type="button" className="app-botao app-botao--principal" onClick={aoComecar}>Criar conta</button>
        <button type="button" className="app-botao" onClick={aoComecar}>Já tenho conta</button>
      </div>
    </div>
  );
}

function Conta({ aoVoltar, aoContinuar }) {
  return (
    <>
      <Barra titulo="Criar conta" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <div className="campo">
          <label htmlFor="c2-nome">Seu nome</label>
          <input id="c2-nome" defaultValue="Ana" autoComplete="off" />
        </div>
        <div className="campo">
          <label htmlFor="c2-email">E-mail</label>
          <input id="c2-email" type="email" defaultValue="ana@exemplo.com" autoComplete="off" />
        </div>
        <div className="campo">
          <label htmlFor="c2-senha">Senha</label>
          <input id="c2-senha" type="password" defaultValue="exemplo123" autoComplete="off" aria-describedby="c2-senha-ajuda" />
          <p id="c2-senha-ajuda" className="ajuda">Pelo menos 8 letras ou números.</p>
        </div>
        <p className="app-dica">Protótipo: nada é salvo.</p>
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" onClick={aoContinuar}>Continuar</button>
        </div>
      </div>
    </>
  );
}

const PERGUNTAS = [
  { chave: "objetivo", texto: "Oi, Ana! O que você quer fazer aqui?", opcoes: ["Achar compras estranhas", "Controlar meus gastos", "Os dois"] },
  { chave: "aviso", texto: "Quer que eu avise quando aparecer um nome estranho na fatura?", opcoes: ["Sim, me avise", "Agora não"] },
];

function Chat({ escolhas, setEscolhas, aoContinuar }) {
  const respondidas = PERGUNTAS.filter((p) => escolhas[p.chave]);
  const proxima = PERGUNTAS.find((p) => !escolhas[p.chave]);
  const fim = !proxima;
  return (
    <>
      <Barra titulo="Vamos montar seu painel" />
      <div className="app-conteudo app-chat" aria-live="polite">
        {respondidas.map((p) => (
          <div key={p.chave}>
            <p className="bolha bolha--app">{p.texto}</p>
            <p className="bolha bolha--pessoa">{escolhas[p.chave]}</p>
          </div>
        ))}
        {proxima && (
          <>
            <p className="bolha bolha--app">{proxima.texto}</p>
            <div className="chips" role="group" aria-label="Respostas">
              {proxima.opcoes.map((o) => (
                <button key={o} type="button" className="chip" onClick={() => setEscolhas({ ...escolhas, [proxima.chave]: o })}>{o}</button>
              ))}
            </div>
          </>
        )}
        {fim && (
          <>
            <p className="bolha bolha--app">
              Pronto! Seu painel vai ter: <strong>{escolhas.objetivo === "Controlar meus gastos" ? "gastos por categoria" : escolhas.objetivo === "Os dois" ? "compras estranhas e gastos por categoria" : "compras estranhas"}</strong>.
              As outras funções ficam numa lista, para quando você quiser.
            </p>
            <p className="bolha bolha--app">Agora preciso ver suas faturas. Vamos conectar seus bancos?</p>
            <div className="app-acoes">
              <button type="button" className="app-botao app-botao--principal" onClick={aoContinuar}>Conectar meus bancos</button>
              <button type="button" className="botao botao--link" onClick={() => setEscolhas({})}>Mudar minhas respostas</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Bancos({ bancos, setBancos, aoVoltar, aoContinuar }) {
  const alternar = (b) => setBancos(bancos.includes(b) ? bancos.filter((x) => x !== b) : [...bancos, b]);
  return (
    <>
      <Barra titulo="Seus bancos" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <p>Escolha de quais bancos quer trazer as faturas.</p>
        <p className="ajuda-texto">
          Usamos o <strong>Open Finance</strong>: o sistema do Banco Central que deixa você compartilhar seus dados de um banco com outro app, só com a sua permissão.
        </p>
        <fieldset className="grupo-opcoes">
          <legend className="visualmente-oculto">Bancos</legend>
          {BANCOS_FICTICIOS.map((b) => (
            <label key={b} className={`opcao${bancos.includes(b) ? " opcao--escolhida" : ""}`}>
              <input type="checkbox" checked={bancos.includes(b)} onChange={() => alternar(b)} />
              <span><strong>{b}</strong></span>
            </label>
          ))}
        </fieldset>
        {bancos.length === 0 && <p className="aviso aviso--erro" role="alert"><span className="aviso__icone">!</span>Escolha pelo menos um banco.</p>}
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" disabled={bancos.length === 0} onClick={aoContinuar}>
            Continuar ({bancos.length})
          </button>
        </div>
      </div>
    </>
  );
}

function Permissao({ bancos, aoVoltar, aoAutorizar }) {
  const [conectando, setConectando] = useState(false);
  useEffect(() => {
    if (!conectando) return;
    const t = setTimeout(aoAutorizar, 1600);
    return () => clearTimeout(t);
  }, [conectando, aoAutorizar]);
  return (
    <>
      <Barra titulo="Sua permissão" aoVoltar={conectando ? undefined : aoVoltar} />
      <div className="app-conteudo">
        <p>Para achar as compras estranhas, vamos pedir aos bancos: <strong>{bancos.join(", ")}</strong>.</p>
        <section className="app-cartao">
          <h3 className="app-cartao__subtitulo">O que vamos ver</h3>
          <ul className="app-provas"><li>✓ Faturas do cartão</li><li>✓ Nome, valor e data de cada compra</li></ul>
          <h3 className="app-cartao__subtitulo">O que NÃO vamos ver nem fazer</h3>
          <ul className="app-provas app-provas--nao"><li>✕ Sua senha do banco</li><li>✕ Mover seu dinheiro ou pagar contas</li></ul>
          <h3 className="app-cartao__subtitulo">Por quanto tempo</h3>
          <p className="ajuda-texto">12 meses. Você pode cancelar quando quiser, aqui no app ou no app do banco.</p>
        </section>
        {conectando ? (
          <div className="aviso" role="status"><span className="girando" aria-hidden="true" /><span>Abrindo o app do banco para você confirmar...</span></div>
        ) : (
          <div className="app-acoes">
            <button type="button" className="app-botao app-botao--principal" onClick={() => setConectando(true)}>Autorizar no app do banco</button>
          </div>
        )}
      </div>
    </>
  );
}

function Painel({ escolhas, aoAbrir }) {
  const total = GASTOS.reduce((s, g) => s + g.valor, 0);
  const mostrarGastos = escolhas.objetivo !== "Achar compras estranhas";
  const mostrarCompras = escolhas.objetivo !== "Controlar meus gastos";
  return (
    <>
      <Barra titulo="Olá, Ana" />
      <div className="app-conteudo">
        {mostrarCompras && (
          <section aria-labelledby="estranhas">
            <div className="app-alerta">
              <strong id="estranhas">3 compras com nome estranho</strong>
              <span>Já identificamos 2. Uma precisa da sua atenção.</span>
            </div>
            <ul className="app-lista">
              {COMPRAS_PAINEL.map((c) => {
                const Conteudo = (
                  <>
                    <span className="app-lista__nome">{c.loja || "Não sabemos com certeza"}</span>
                    <span className="app-lista__valor">{c.valor}</span>
                    <span className="app-lista__info">
                      <code>{c.nome}</code> · {c.banco} · {c.data}
                    </span>
                    <span className="app-lista__selo"><SeloCerteza nivel={c.certeza} /></span>
                  </>
                );
                return (
                  <li key={c.id}>
                    {c.certeza === "baixa" ? (
                      <button type="button" className="app-lista__item app-lista__item--toque app-lista__item--atencao" onClick={aoAbrir}>{Conteudo}</button>
                    ) : (
                      <div className="app-lista__item">{Conteudo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {mostrarGastos && (
          <section aria-labelledby="gastos" className="app-cartao">
            <h3 id="gastos" className="app-cartao__subtitulo">Gastos de novembro · R$ {total.toLocaleString("pt-BR")}</h3>
            <ul className="barras">
              {GASTOS.map((g) => (
                <li key={g.nome}>
                  <span className="barras__nome">{g.nome}</span>
                  <span className="barras__trilho"><span style={{ width: `${(g.valor / GASTOS[0].valor) * 100}%`, background: g.cor }} /></span>
                  <span className="barras__valor">R$ {g.valor}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <details className="app-cartao app-mais">
          <summary>Outras funções</summary>
          <ul>
            <li>Assinaturas que se repetem <span className="ajuda-texto">(em breve)</span></li>
            <li>Lembretes de prazo <span className="ajuda-texto">(em breve)</span></li>
            <li>Bancos conectados e permissões</li>
          </ul>
        </details>
        <p className="app-dica">No protótipo, só a compra sem certeza abre.</p>
      </div>
    </>
  );
}

function Compra({ aoVoltar, aoContestar }) {
  return (
    <>
      <Barra titulo="Detalhe da compra" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <div className="app-compra">
          <p className="app-compra__valor">R$ 89,90</p>
          <p className="app-compra__nome">INT*XQZ7 SERVICOS</p>
          <p className="app-compra__info">20/11 · Banco Exemplo · cartão final 1234</p>
        </div>
        <section className="app-cartao">
          <p className="rotulo">Não temos certeza. O mais provável é</p>
          <h2 className="app-cartao__loja">Um serviço pela internet</h2>
          <SeloCerteza nivel="baixa" />
          <p className="app-cartao__porque">
            Achamos 2 empresas com nome parecido, em cidades diferentes. Nenhuma bate com certeza.
          </p>
          <p className="ajuda-texto">
            ⚠ O Open Finance talvez não mande o local da compra. Sem o local, a certeza fica mais baixa que no app do banco.
          </p>
          <details className="fontes">
            <summary>Ver as 2 empresas parecidas</summary>
            <ul><li>XQZ Serviços Digitais (Cidade A)</li><li>XQ7 Soluções (Cidade B)</li></ul>
          </details>
        </section>
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--perigo" onClick={aoContestar}>Não reconheço, quero contestar</button>
          <button type="button" className="app-botao" onClick={aoVoltar}>Reconheço, foi eu</button>
        </div>
      </div>
    </>
  );
}

function Contestar({ aoVoltar, aoEnviei }) {
  const [copiado, setCopiado] = useState(false);
  const [lembrete, setLembrete] = useState(true);
  const texto = `Olá. Quero contestar uma compra no meu cartão final 1234.

Nome na fatura: INT*XQZ7 SERVICOS
Valor: R$ 89,90
Data: 20/11/2026

Não reconheço esta compra e não autorizei este pagamento. Peço que seja analisada e o valor devolvido. Por favor, me informem o número de protocolo.`;
  return (
    <>
      <Barra titulo="Contestar no Banco Exemplo" aoVoltar={aoVoltar} />
      <div className="app-conteudo">
        <h3 className="app-cartao__subtitulo">Como fazer (3 passos)</h3>
        <ol className="lista">
          <li><span className="lista__numero" aria-hidden="true">1</span><span>Copie o texto abaixo.</span></li>
          <li><span className="lista__numero" aria-hidden="true">2</span><span>Abra o app do Banco Exemplo e vá em "Contestar compra".</span></li>
          <li><span className="lista__numero" aria-hidden="true">3</span><span>Cole o texto e anote o protocolo.</span></li>
        </ol>
        <pre className="texto-pronto">{texto}</pre>
        <div className="app-acoes app-acoes--linha">
          <button type="button" className="app-botao" onClick={() => setCopiado(true)}>{copiado ? "Copiado ✓" : "Copiar texto"}</button>
          <button type="button" className="app-botao">Abrir app do banco</button>
        </div>
        <label className="opcao app-lembrete">
          <input type="checkbox" checked={lembrete} onChange={() => setLembrete(!lembrete)} />
          <span><strong>Me lembrar de conferir em 7 dias</strong><span className="opcao__descricao">O prazo muda de banco para banco.</span></span>
        </label>
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" onClick={aoEnviei}>Já enviei ao banco</button>
        </div>
      </div>
    </>
  );
}

function Acompanhar({ aoPainel }) {
  return (
    <>
      <Barra titulo="Acompanhar" />
      <div className="app-conteudo">
        <div className="app-compra app-compra--pequena"><p className="app-compra__nome">INT*XQZ7 SERVICOS · R$ 89,90</p></div>
        <ol className="app-status">
          <li className="feito"><strong>Contestação enviada ao banco</strong><span>Hoje</span></li>
          <li className="agora"><strong>Conferindo sua fatura todo dia</strong><span>Pelo Open Finance. Você não precisa fazer nada.</span></li>
          <li><strong>Dinheiro de volta</strong><span>Avisamos quando o estorno aparecer na fatura</span></li>
        </ol>
        <p className="ajuda-texto">Lembrete marcado para 04/12.</p>
        <div className="app-acoes">
          <button type="button" className="app-botao app-botao--principal" onClick={aoPainel}>Voltar ao painel</button>
        </div>
      </div>
    </>
  );
}
