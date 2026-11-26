// Mensagem de andamento ou de erro. "role" faz o leitor de tela anunciar a mudança.
// Andamento mostra um círculo girando. Erro mostra um "!" e fundo vermelho claro.
export default function Aviso({ tipo = "info", children }) {
  const erro = tipo === "erro";
  return (
    <div className={`aviso aviso--${tipo}`} role={erro ? "alert" : "status"} aria-live={erro ? "assertive" : "polite"}>
      {tipo === "carregando" && <span className="girando" aria-hidden="true" />}
      {erro && <span className="aviso__icone" aria-hidden="true">!</span>}
      <span>{children}</span>
    </div>
  );
}
