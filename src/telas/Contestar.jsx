// Tela 3: como contestar a compra. Será feita no sábado (28/11).
import Botao from "../componentes/Botao.jsx";

export default function Contestar({ aoVoltar }) {
  return (
    <section>
      <Botao tipo="link" onClick={aoVoltar}>← Voltar</Botao>
      <h2>Como contestar uma compra</h2>
      <p className="subtitulo">Em construção. Aqui vai o passo a passo e um texto pronto para mandar ao banco.</p>
    </section>
  );
}
