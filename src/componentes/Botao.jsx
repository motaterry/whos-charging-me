// Botão do design system. "tipo" escolhe o visual: principal, secundario ou link.
export default function Botao({ tipo = "principal", children, ...resto }) {
  return (
    <button type="button" className={`botao botao--${tipo}`} {...resto}>
      {children}
    </button>
  );
}
