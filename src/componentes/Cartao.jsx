// Caixa com borda que agrupa um conteúdo.
export default function Cartao({ children, ...resto }) {
  return <section className="cartao" {...resto}>{children}</section>;
}
