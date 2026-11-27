// Escolhe a página pelo endereço depois do "#".
// "#/prototipos..." abre os protótipos. Qualquer outro endereço abre o site de sempre (App).
// Usamos "#" para não precisar mudar nada na Vercel.
import { useEffect, useState } from "react";
import App from "./App.jsx";
import Inicio from "./prototipos/Inicio.jsx";
import Cenario1 from "./prototipos/Cenario1.jsx";
import Cenario2 from "./prototipos/Cenario2.jsx";
import "./prototipos/prototipos.css";

function lerEndereco() {
  return window.location.hash.replace(/^#/, "") || "/";
}

export default function Raiz() {
  const [endereco, setEndereco] = useState(lerEndereco);
  useEffect(() => {
    const mudou = () => { setEndereco(lerEndereco()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", mudou);
    return () => window.removeEventListener("hashchange", mudou);
  }, []);

  if (endereco === "/prototipos/cenario-1") return <Cenario1 />;
  if (endereco === "/prototipos/cenario-2") return <Cenario2 />;
  if (endereco.startsWith("/prototipos")) return <Inicio />;
  return <App />;
}
