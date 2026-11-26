// Mensagem de andamento ou de erro. "role=status" faz o leitor de tela anunciar a mudança.
export default function Aviso({ tipo = "info", children }) {
  return (
    <div className={`aviso aviso--${tipo}`} role="status" aria-live="polite">
      {children}
    </div>
  );
}
