// O App guarda o "estado" do site (o que está digitado, o resultado, qual tela mostrar)
// e escolhe qual tela aparece.
import { useState } from "react";
import Aviso from "./componentes/Aviso.jsx";
import Ilustracao from "./componentes/Ilustracao.jsx";
import Busca from "./telas/Busca.jsx";
import SimularBanco from "./telas/SimularBanco.jsx";
import Resultado from "./telas/Resultado.jsx";
import Contestar from "./telas/Contestar.jsx";
import { identificar } from "./api.js";

export default function App() {
  const [tela, setTela] = useState("busca"); // "busca" ou "contestar"
  const [modo, setModo] = useState("digitar"); // "digitar" ou "banco"
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  async function buscar(n, c, local = null) {
    if (n.trim().length < 2) {
      setErro("Escreva o nome que aparece na fatura.");
      return;
    }
    setErro("");
    setResultado(null);
    setCarregando(true);
    try {
      setResultado(await identificar(n.trim(), c.trim(), local));
    } catch (e) {
      console.error(e);
      setErro("Não conseguimos buscar agora. Confira sua internet e tente de novo em alguns segundos.");
    } finally {
      setCarregando(false);
    }
  }

  function trocarModo(m) {
    setModo(m);
    limpar();
  }

  function limpar() {
    setNome("");
    setCidade("");
    setErro("");
    setResultado(null);
  }

  return (
    <main className="pagina">
      <header className={tela === "busca" ? "cabecalho cabecalho--com-ilustracao" : "cabecalho"}>
        <div>
          <h1>Quem me cobrou?</h1>
          <p className="subtitulo">
            Viu um nome estranho na fatura do cartão? Digite aqui. A gente descobre qual é a loja.
          </p>
        </div>
        {tela === "busca" && !resultado && <Ilustracao nome="cartoes" tamanho="m" />}
      </header>

      {tela === "contestar" ? (
        <Contestar
          nomeFatura={nome || resultado?.entrada?.original || ""}
          loja={resultado?.loja}
          aoVoltar={() => setTela("busca")}
        />
      ) : (
        <>
          <div className="modos" role="tablist" aria-label="Como buscar">
            <button type="button" role="tab" aria-selected={modo === "digitar"} className="modos__item" onClick={() => trocarModo("digitar")}>
              Digitar o nome
            </button>
            <button type="button" role="tab" aria-selected={modo === "banco"} className="modos__item" onClick={() => trocarModo("banco")}>
              Simular banco
            </button>
          </div>
          {modo === "digitar" ? (
            <Busca
              nome={nome} cidade={cidade} setNome={setNome} setCidade={setCidade}
              carregando={carregando} aoBuscar={buscar} aoLimpar={limpar}
            />
          ) : (
            <SimularBanco
              carregando={carregando}
              aoEscolher={(c) => { setNome(c.nome); setCidade(c.local?.cidade || ""); buscar(c.nome, c.local?.cidade || "", c.local); }}
            />
          )}
          {carregando && <Aviso tipo="carregando">Procurando a loja na internet e na Receita. Leva uns 10 segundos...</Aviso>}
          {erro && <Aviso tipo="erro">{erro}</Aviso>}
          {resultado && <Resultado key={resultado.loja} r={resultado} aoContestar={() => setTela("contestar")} />}
        </>
      )}

      <footer className="rodape">
        Usamos dados públicos da Receita Federal e busca na internet. Sempre mostramos a fonte e o quanto temos certeza.
      </footer>
    </main>
  );
}
