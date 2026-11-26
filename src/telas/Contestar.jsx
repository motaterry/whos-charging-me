// Fluxo de contestação em 4 passos:
// 1. Conferir antes (pode ser uma compra que a pessoa esqueceu)
// 2. O que aconteceu (não fui eu / fui eu, mas teve problema)
// 3. Qual é o banco do cartão
// 4. Plano: passo a passo do banco, texto pronto e para onde ir se o banco não resolver
import { useEffect, useState } from "react";
import Aviso from "../componentes/Aviso.jsx";
import Botao from "../componentes/Botao.jsx";
import Campo from "../componentes/Campo.jsx";
import Cartao from "../componentes/Cartao.jsx";
import Lista from "../componentes/Lista.jsx";
import Opcao from "../componentes/Opcao.jsx";
import Passos from "../componentes/Passos.jsx";
import Ilustracao from "../componentes/Ilustracao.jsx";
import Selecao from "../componentes/Selecao.jsx";
import { contestar } from "../api.js";

const BANCOS = ["C6 Bank", "Nubank", "Itaú", "Bradesco", "Santander", "Banco do Brasil", "Caixa", "Inter", "Outro"];

const MOTIVOS_PROBLEMA = [
  "Não recebi o produto ou serviço",
  "Fui cobrado mais de uma vez",
  "O valor está maior que o combinado",
  "Cancelei, mas continuaram cobrando",
  "Outro problema",
];

const TOTAL = 4;

function textoPadrao(d) {
  const situacao = d.tipo === "golpe"
    ? "Não reconheço esta compra e não autorizei este pagamento."
    : `Fiz esta compra, mas tive um problema: ${d.motivo || "[descreva o problema]"}.`;
  return `Olá. Quero contestar uma compra no meu cartão de crédito.

Nome na fatura: ${d.nomeFatura}
Valor: ${d.valor || "[valor]"}
Data: ${d.data || "[data]"}

${situacao} Peço que a compra seja analisada e o valor devolvido. Por favor, me informem o número de protocolo.

Obrigado(a).`;
}

export default function Contestar({ nomeFatura, loja, aoVoltar }) {
  const [passo, setPasso] = useState(1);
  const [tipo, setTipo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [banco, setBanco] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [plano, setPlano] = useState(null);
  const [erroPlano, setErroPlano] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Ao mudar de passo, volta para o topo da página.
  useEffect(() => { window.scrollTo(0, 0); }, [passo]);

  const dados = { nomeFatura, loja, banco, tipo, motivo, valor, data };

  async function montarPlano() {
    setPasso(4);
    setCarregando(true);
    setErroPlano(false);
    setPlano(null);
    try {
      setPlano(await contestar(dados));
    } catch (e) {
      console.error(e);
      setErroPlano(true);
    } finally {
      setCarregando(false);
    }
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  const texto = plano?.texto_pronto || textoPadrao(dados);

  return (
    <section aria-labelledby="titulo-contestar">
      <Botao tipo="link" onClick={passo === 1 ? aoVoltar : () => setPasso(passo - 1)}>← Voltar</Botao>
      <p className="rotulo" style={{ marginTop: "var(--espaco-4)" }}>Contestar: {nomeFatura}{loja ? ` (${loja})` : ""}</p>

      {passo === 1 && (
        <>
          <Passos atual={1} total={TOTAL} titulo="Conferir antes" />
          <h2 id="titulo-contestar">Antes de contestar, confira</h2>
          <p className="subtitulo-p">Muitas compras "estranhas" são de quem a gente conhece. Pense rapidinho:</p>
          <Lista itens={[
            "Alguém da sua família ou da sua casa usou o seu cartão?",
            "É uma assinatura ou um teste grátis que virou pago?",
            "É uma parcela de uma compra antiga?",
            "É uma compra internacional, com o valor convertido para real?",
          ]} />
          <div className="grupo-botoes">
            <Botao onClick={() => setPasso(2)}>Ainda não reconheço</Botao>
            <Botao tipo="secundario" onClick={aoVoltar}>Lembrei, a compra é minha</Botao>
          </div>
        </>
      )}

      {passo === 2 && (
        <>
          <Passos atual={2} total={TOTAL} titulo="O que aconteceu" />
          <h2 id="titulo-contestar">O que aconteceu?</h2>
          <fieldset className="grupo-opcoes">
            <legend className="visualmente-oculto">Escolha uma opção</legend>
            <Opcao nome="tipo" valor="golpe" escolhido={tipo === "golpe"} aoEscolher={setTipo}
              titulo="Não fui eu que fiz essa compra"
              descricao="Pode ser golpe ou cartão clonado." />
            <Opcao nome="tipo" valor="problema" escolhido={tipo === "problema"} aoEscolher={setTipo}
              titulo="Fui eu, mas teve um problema"
              descricao="Ex.: não chegou, cobraram a mais, cancelei e continuaram cobrando." />
          </fieldset>

          {tipo === "golpe" && (
            <Aviso tipo="erro">Bloqueie o cartão agora no app do banco. Isso evita novas compras enquanto você contesta.</Aviso>
          )}

          {tipo === "problema" && (
            <Selecao id="motivo" rotulo="Qual foi o problema?" opcoes={MOTIVOS_PROBLEMA}
              valor={motivo} aoMudar={setMotivo} placeholder="Escolha um motivo" />
          )}

          <div className="grupo-botoes">
            <Botao onClick={() => setPasso(3)} disabled={!tipo || (tipo === "problema" && !motivo)}>Continuar</Botao>
          </div>
        </>
      )}

      {passo === 3 && (
        <>
          <Passos atual={3} total={TOTAL} titulo="Seu banco" />
          <h2 id="titulo-contestar">Qual é o banco do cartão?</h2>
          <Selecao id="banco" rotulo="Banco" opcoes={BANCOS} valor={banco} aoMudar={setBanco} placeholder="Escolha o banco" />
          <Campo id="valor" rotulo="Valor da compra" opcional="se souber" placeholder="Ex.: R$ 49,90"
            value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" />
          <Campo id="data" rotulo="Data da compra" opcional="se souber" type="date"
            value={data} onChange={(e) => setData(e.target.value)} />
          <div className="grupo-botoes">
            <Botao onClick={montarPlano} disabled={!banco}>Ver como contestar</Botao>
          </div>
        </>
      )}

      {passo === 4 && (
        <>
          <Passos atual={4} total={TOTAL} titulo="Seu plano" />
          <h2 id="titulo-contestar">Como contestar no {banco}</h2>

          {carregando && <Aviso tipo="carregando">Procurando o caminho oficial do {banco} e escrevendo o seu texto...</Aviso>}
          {erroPlano && (
            <Aviso tipo="erro">Não conseguimos achar o passo a passo do {banco} agora. Abaixo está o caminho geral, que funciona na maioria dos bancos.</Aviso>
          )}

          {!carregando && (
            <>
              <Cartao>
                <h3>Passo a passo</h3>
                {plano?.onde && <p>{plano.onde}</p>}
                <Lista itens={plano?.passos?.length ? plano.passos : [
                  ...(tipo === "golpe" ? ["Bloqueie o cartão no app do banco."] : []),
                  "Abra a fatura no app do banco e toque na compra.",
                  "Procure a opção \"Não reconheço\" ou \"Contestar\". Se não achar, fale com o chat ou o telefone do banco.",
                  "Envie o texto pronto abaixo.",
                  "Anote o número de protocolo.",
                ]} />
                {plano?.fontes?.length > 0 && (
                  <details className="fontes">
                    <summary>Ver as fontes ({plano.fontes.length})</summary>
                    <ul>{plano.fontes.map((f) => <li key={f}><a href={f} target="_blank" rel="noopener noreferrer">{f}</a></li>)}</ul>
                  </details>
                )}
              </Cartao>

              <Cartao>
                <h3>Texto pronto para mandar ao banco</h3>
                <p className="ajuda-texto">Complete o que está entre [colchetes] antes de enviar.</p>
                <pre className="texto-pronto">{texto}</pre>
                <div className="grupo-botoes">
                  <Botao onClick={() => copiar(texto)}>{copiado ? "Texto copiado ✓" : "Copiar texto"}</Botao>
                </div>
              </Cartao>

              <Cartao>
                <h3>Se o banco não resolver</h3>
                <Lista itens={[
                  "Ligue para o SAC do banco e peça um protocolo.",
                  "Se não resolver, procure a Ouvidoria do banco, com o protocolo em mãos.",
                  "Ainda sem solução? Registre uma reclamação no Banco Central ou no consumidor.gov.br.",
                ]} />
                <p className="ajuda-texto">
                  <a href="https://www.bcb.gov.br/meubc/registrar_reclamacao" target="_blank" rel="noopener noreferrer">Reclamar no Banco Central</a>
                  {" · "}
                  <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer">consumidor.gov.br</a>
                </p>
              </Cartao>

              <Cartao>
                <div className="fim">
                  <Ilustracao nome="torcendo" tamanho="p" />
                  <h3>Pronto! Agora é com o banco.</h3>
                  <p className="ajuda-texto">Guarde o número de protocolo. Se o banco não responder, siga os passos acima.</p>
                  <Botao tipo="secundario" onClick={aoVoltar}>Voltar ao início</Botao>
                </div>
              </Cartao>
            </>
          )}
        </>
      )}
    </section>
  );
}
