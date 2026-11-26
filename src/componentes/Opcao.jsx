// Cartão clicável para escolher uma opção (funciona como um botão de rádio).
export default function Opcao({ nome, valor, escolhido, aoEscolher, titulo, descricao }) {
  const id = `${nome}-${valor}`;
  return (
    <label htmlFor={id} className={`opcao${escolhido ? " opcao--escolhida" : ""}`}>
      <input type="radio" id={id} name={nome} value={valor} checked={escolhido} onChange={() => aoEscolher(valor)} />
      <span>
        <strong>{titulo}</strong>
        {descricao && <span className="opcao__descricao">{descricao}</span>}
      </span>
    </label>
  );
}
