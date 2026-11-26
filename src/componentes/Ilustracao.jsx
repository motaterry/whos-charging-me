// Ilustração decorativa (pacote "Financial Delight", da Terry).
// alt="" porque é só enfeite: o leitor de tela pula a imagem.
import cartoes from "../assets/ilustracoes/cartoes.svg";
import procurando from "../assets/ilustracoes/procurando.svg";
import torcendo from "../assets/ilustracoes/torcendo.svg";

const IMAGENS = { cartoes, procurando, torcendo };

export default function Ilustracao({ nome, tamanho = "m" }) {
  return (
    <div className={`ilustracao ilustracao--${tamanho}`}>
      <img src={IMAGENS[nome]} alt="" loading="lazy" width="1600" height="1200" />
    </div>
  );
}
