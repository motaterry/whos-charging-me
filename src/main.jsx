// Ponto de partida: coloca o App dentro da <div id="raiz"> do index.html.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tokens.css";
import "./estilo.css";
import Raiz from "./Raiz.jsx";

createRoot(document.getElementById("raiz")).render(
  <StrictMode>
    <Raiz />
  </StrictMode>
);
