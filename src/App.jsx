// O App guarda o "estado" do site (o que está digitado, o resultado, qual tela mostrar)
// e escolhe qual tela aparece.
import { useState } from "react";
import Aviso from "./componentes/Aviso.jsx";
import Busca from "./telas/Busca.jsx";
import Resultado from "./telas/Resultado.jsx";
import Contestar from "./telas/Contestar.jsx";
import { identificar } from "./api.js";

export default function App() {
  const [tela, setTela] = useState("busca"); // "busca" ou "contestar"
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);

  async function buscar(n, c) {
    if (n.trim().length < 2) {
      setErro("Escreva o nome que aparece na fatura.");
      return;
    }
    setErro("");
    setResultado(null);
    setCarregando(true);
    try {
      setResultado(await identificar(n.trim(), c.trim()));
    } catch (e) {
      setErro(`Não conseguimos buscar agora. ${e.message} Tente de novo em alguns segundos.`);
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setNome("");
    setCidade("");
    setErro("");
    setResultado(null);
  }

  return (
    <main className="pagina">
      <header>
        <h1>Quem me cobrou?</h1>
        <p className="subtitulo">
          Viu um nome estranho na fatura do cartão? Digite aqui. A gente descobre qual é a loja.
        </p>
      </header>

      {tela === "contestar" ? (
        <Contestar aoVoltar={() => setTela("busca")} />
      ) : (
        <>
          <Busca
            nome={nome} cidade={cidade} setNome={setNome} setCidade={setCidade}
            carregando={carregando} aoBuscar={buscar} aoLimpar={limpar}
          />
          {carregando && <Aviso>Procurando a loja na internet e na Receita. Leva uns 10 segundos...</Aviso>}
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
