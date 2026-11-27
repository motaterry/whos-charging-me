// Mapa desenhado (não é mapa de verdade). Mostra o local da compra e a loja da Receita.
// O alfinete cai com uma pequena mola e a linha entre os 2 pontos se desenha.
import { motion } from "motion/react";

export default function MapaFalso({ distancia, longe = false }) {
  const loja = longe ? { x: 268, y: 34 } : { x: 182, y: 50 };
  return (
    <figure className="mapa-falso">
      <svg viewBox="0 0 320 150" role="img" aria-label={`Desenho de mapa: a loja fica a ${distancia} do local da compra`}>
        <rect width="320" height="150" fill="#eef2f5" />
        <path d="M0 62 H320 M0 116 H320 M92 0 V150 M214 0 V150" stroke="#fff" strokeWidth="13" />
        <path d="M0 18 L320 142" stroke="#fff" strokeWidth="7" />
        <rect x="106" y="74" width="94" height="30" rx="5" fill="#dcebd6" />
        <rect x="228" y="78" width="78" height="26" rx="5" fill="#dcebd6" />
        <rect x="12" y="78" width="66" height="26" rx="5" fill="#e4e1f0" />
        <motion.line x1="150" y1="62" x2={loja.x} y2={loja.y + 12} stroke="#1d1d1f" strokeWidth="1.6" strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.5 }} transition={{ delay: 0.7, duration: 0.6 }} />
        <motion.circle cx="150" cy="62" r="18" fill="#0a84ff" initial={{ scale: 0.6, opacity: 0.35 }}
          animate={{ scale: [0.6, 1.4], opacity: [0.35, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
        <circle cx="150" cy="62" r="7" fill="#0a84ff" stroke="#fff" strokeWidth="2.5" />
        <motion.g initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.35 }}>
          <path d={`M${loja.x - 14} ${loja.y - 6} c0-8 6-14 14-14 s14 6 14 14 c0 10-14 22-14 22 s-14-12-14-22z`} fill={longe ? "#ff9f0a" : "#30a14e"} />
          <circle cx={loja.x} cy={loja.y - 6} r="5" fill="#fff" />
        </motion.g>
        <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.1 }}>
          <rect x={(150 + loja.x) / 2 - 24} y={(62 + loja.y) / 2 + 8} width="48" height="20" rx="10" fill="#1d1d1f" />
          <text x={(150 + loja.x) / 2} y={(62 + loja.y) / 2 + 22} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{distancia}</text>
        </motion.g>
      </svg>
      <figcaption>
        <span><span className="mapa-falso__ponto mapa-falso__ponto--compra" /> Onde o cartão foi usado</span>
        <span><span className={`mapa-falso__ponto ${longe ? "mapa-falso__ponto--longe" : "mapa-falso__ponto--loja"}`} /> Endereço na Receita</span>
      </figcaption>
    </figure>
  );
}
