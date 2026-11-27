// Ícones de traço simples (desenhados aqui, sem biblioteca). "nome" escolhe o desenho.
const P = {
  voltar: "M15 18l-6-6 6-6",
  seta: "M9 6l6 6-6 6",
  carrinho: "M3 4h2l2.4 10.2a2 2 0 002 1.6h7.6a2 2 0 002-1.6L21 8H6.2 M9 20.5h.01 M17 20.5h.01",
  pao: "M4 13a8 5 0 0116 0v5a1 1 0 01-1 1H5a1 1 0 01-1-1z M8 13v3 M12 12v4 M16 13v3",
  combustivel: "M4 20V5a1 1 0 011-1h8a1 1 0 011 1v15 M3 20h12 M14 9h2.5a1.5 1.5 0 011.5 1.5V16a1.5 1.5 0 003 0V8l-3-3 M7 8h4",
  remedio: "M10.5 3.5a5 5 0 017 7l-7 7a5 5 0 01-7-7z M7 10l7 7",
  lanche: "M4 11h16 M5 11a7 5 0 0114 0 M4 15h16 M5 15v1a3 3 0 003 3h8a3 3 0 003-3v-1",
  interrogacao: "M9.2 9a3 3 0 015.6 1c0 2-3 2.6-3 4.5 M12 18h.01",
  casa: "M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z",
  cartao: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z M3 10h18 M7 15h3",
  pix: "M12 3l3.5 3.5L12 10 8.5 6.5z M12 14l3.5 3.5L12 21l-3.5-3.5z M3 12l3.5-3.5L10 12l-3.5 3.5z M14 12l3.5-3.5L21 12l-3.5 3.5z",
  mais: "M5 12h.01 M12 12h.01 M19 12h.01",
  brilho: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  escudo: "M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z M9 12l2 2 4-4",
  copiar: "M9 9h10v10H9z M5 15V5h10",
  check: "M5 12.5l4.5 4.5L19 7.5",
  sino: "M6 16V11a6 6 0 1112 0v5l1.5 2h-15z M10 20.5a2 2 0 004 0",
  usuario: "M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0",
  lista: "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
  cadeado: "M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 017 0v3",
  olho: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 15a3 3 0 100-6 3 3 0 000 6z",
  x: "M6 6l12 12 M18 6L6 18",
  alerta: "M12 4l9 16H3z M12 10v4 M12 17h.01",
  relogio: "M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2",
  codigo: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13.5 5l-3 14",
  mapa: "M12 21s-6-5.4-6-10.5a6 6 0 0112 0C18 15.6 12 21 12 21z M12 12.5a2 2 0 100-4 2 2 0 000 4z",
  grafico: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  busca: "M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4-4",
  ajuda: "M12 21a9 9 0 100-18 9 9 0 000 18z M9.6 9.5a2.5 2.5 0 014.8.8c0 1.6-2.4 2-2.4 3.6 M12 17h.01",
  barras: "M4 5v14 M7 5v14 M9.5 5v14 M13 5v14 M16 5v14 M18.5 5v14 M20.5 5v14",
  recarga: "M20 12a8 8 0 01-14 5.3 M4 12a8 8 0 0114-5.3 M18 3v4h-4 M6 21v-4h4",
  transferir: "M4 8h15l-3.5-3.5 M20 16H5l3.5 3.5",
  extrato: "M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1 M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
};

export default function Icone({ nome, tamanho = 22, traco = 2, className = "" }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[nome] || P.interrogacao} />
    </svg>
  );
}
