// Tela 1: a pessoa digita o nome da fatura e a cidade.
import Botao from "../componentes/Botao.jsx";
import Campo from "../componentes/Campo.jsx";

const EXEMPLOS = [
  { nome: "MP*CASADOPAODEQUEIJO", cidade: "São Paulo" },
  { nome: "EBN*SPOTIFY", cidade: "" },
];

export default function Busca({ nome, cidade, setNome, setCidade, carregando, aoBuscar, aoLimpar }) {
  function enviar(e) {
    e.preventDefault();
    aoBuscar(nome, cidade);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <Campo
        id="nome"
        rotulo="Nome que aparece na fatura"
        ajuda="Copie do jeito que está na fatura, com * e tudo."
        placeholder="Ex.: MP*CASADOPAODEQUEIJO"
        autoComplete="off"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <Campo
        id="cidade"
        rotulo="Cidade da compra"
        opcional="ajuda muito"
        placeholder="Ex.: São Paulo"
        autoComplete="address-level2"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
      />
      <div className="grupo-botoes">
        <button type="submit" className="botao botao--principal" disabled={carregando}>
          {carregando ? "Procurando..." : "Descobrir a loja"}
        </button>
        <Botao tipo="secundario" onClick={aoLimpar}>Limpar</Botao>
      </div>
      <p className="exemplos">
        Testar com um exemplo:
        {EXEMPLOS.map((ex) => (
          <Botao key={ex.nome} tipo="link" onClick={() => {
            setNome(ex.nome);
            setCidade(ex.cidade);
            aoBuscar(ex.nome, ex.cidade);
          }}>
            {ex.nome}
          </Botao>
        ))}
      </p>
    </form>
  );
}
