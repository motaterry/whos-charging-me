// Peças de interface dos protótipos, com animação (biblioteca "motion").
// Quem pediu "menos movimento" no sistema vê tudo sem animação (MotionConfig reducedMotion="user").
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from "motion/react";

// Mola padrão: rápida e sem balançar demais (parecido com o iOS).
export const MOLA = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 };
export const MOLA_SUAVE = { type: "spring", stiffness: 260, damping: 30 };

// ---------- Navegação em pilha (como um app de celular) ----------
// ir("x") empurra uma tela nova (entra pela direita). voltar() tira a de cima (sai pela direita).
export function usePilha(inicial) {
  const [pilha, setPilha] = useState([inicial]);
  const [direcao, setDirecao] = useState(1);
  return {
    atual: pilha[pilha.length - 1],
    direcao,
    ir: (t) => { setDirecao(1); setPilha((p) => [...p, t]); },
    voltar: () => { setDirecao(-1); setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p)); },
    trocar: (t) => { setDirecao(1); setPilha([t]); }, // limpa o histórico (ex.: recomeçar)
    pular: (t) => { setDirecao(1); setPilha((p) => [...p.filter((x) => x !== t), t]); },
    tamanho: pilha.length,
  };
}

const variantesTela = {
  entra: (d) => ({ x: d > 0 ? "100%" : "-28%", opacity: d > 0 ? 1 : 0.6 }),
  fica: { x: 0, opacity: 1 },
  sai: (d) => ({ x: d > 0 ? "-28%" : "100%", opacity: d > 0 ? 0.6 : 1 }),
};

// Mostra uma tela por vez, com a transição de "empurrar" do iOS.
export function Telas({ chave, direcao, children }) {
  return (
    <AnimatePresence initial={false} custom={direcao} mode="popLayout">
      <motion.div
        key={chave}
        className="ui-tela"
        custom={direcao}
        variants={variantesTela}
        initial="entra"
        animate="fica"
        exit="sai"
        transition={MOLA}
        style={{ zIndex: direcao > 0 ? 2 : 1 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------- Botão que "afunda" ao tocar ----------
export function Toque({ className = "", children, ...resto }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.97 }} transition={MOLA} className={className} {...resto}>
      {children}
    </motion.button>
  );
}

// ---------- Folha que sobe de baixo (bottom sheet). Arraste para baixo para fechar. ----------
export function Folha({ aberta, aoFechar, titulo, children, travada = false, estilo, classe = "" }) {
  // "estilo" leva as cores da marca (a folha aparece fora da tela do app, então precisa recebê-las).
  const alvo = typeof document !== "undefined" ? document.getElementById("ui-camada") : null;
  // Tecla Esc fecha a folha (quem usa teclado também consegue sair).
  useEffect(() => {
    if (!aberta || travada) return;
    const tecla = (e) => { if (e.key === "Escape") aoFechar(); };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberta, travada, aoFechar]);
  const conteudo = (
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div
            className="ui-folha-fundo" style={estilo}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={travada ? undefined : aoFechar}
          />
          <motion.div
            className={`ui-folha ${classe}`} style={estilo}
            role="dialog" aria-modal="true" aria-label={titulo}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={MOLA}
            drag={travada ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) aoFechar(); }}
          >
            <div className="ui-folha__pegador" aria-hidden="true" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
  return alvo ? createPortal(conteudo, alvo) : conteudo;
}

// ---------- Aviso que desce do topo (como notificação do iOS) ----------
export function Aviso({ texto, acao, aoAcao, aoFechar, tipo = "ok" }) {
  useEffect(() => {
    if (!texto) return;
    const t = setTimeout(aoFechar, 3800);
    return () => clearTimeout(t);
  }, [texto, aoFechar]);
  return (
    <AnimatePresence>
      {texto && (
        <motion.div
          className={`ui-aviso ui-aviso--${tipo}`} role="status"
          initial={{ y: -80, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -80, opacity: 0 }}
          transition={MOLA}
        >
          <span>{texto}</span>
          {acao && <button type="button" onClick={aoAcao}>{acao}</button>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Número que conta até o valor ----------
export function Contador({ valor, prefixo = "R$ ", duracao = 1.1 }) {
  const mv = useMotionValue(0);
  const texto = useTransform(mv, (v) => prefixo + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  useEffect(() => {
    const c = animate(mv, valor, { duration: duracao, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [valor, duracao, mv]);
  return <motion.span aria-label={prefixo + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}>{texto}</motion.span>;
}

// ---------- Check que se desenha ----------
export function CheckAnimado({ tamanho = 88, cor = "var(--ui-verde)" }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 88 88" aria-hidden="true">
      <motion.circle cx="44" cy="44" r="40" fill="none" stroke={cor} strokeWidth="5" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.2 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
      <motion.path d="M27 45 l12 12 l23 -25" fill="none" stroke={cor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }} />
    </svg>
  );
}

// ---------- Anel de certeza (quanto mais cheio, mais certeza) ----------
export function AnelCerteza({ nivel, variante }) {
  const mapa = { alta: [0.92, "var(--ui-verde)", "Alta"], media: [0.6, "var(--ui-ambar)", "Média"], baixa: [0.28, "var(--ui-vermelho)", "Baixa"] };
  const [p, cor, rotulo] = mapa[nivel] || mapa.baixa;
  const id = useId().replace(/:/g, "");
  if (variante === "3d") {
    // Exceção de cor: certeza alta é verde, mesmo nos apps que só usam uma cor de destaque.
    const cor3d = nivel === "alta" ? "var(--ui-certeza-alta, var(--ui-verde))" : cor;
    // Versão "3D de mentira": disco com luz e sombra, anel com brilho, e a palavra "Certeza" fora do anel (mais espaço).
    return (
      <motion.div className="ui-anel3d" style={{ "--anel-cor": cor3d }} role="img" aria-label={`Certeza ${rotulo.toLowerCase()}`}
        initial={{ rotateX: 50, scale: 0.7, opacity: 0 }} animate={{ rotateX: 12, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}>
        <span className="ui-anel3d__roda">
          <span className="ui-anel3d__disco" aria-hidden="true" />
          <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
            <defs>
              <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={`color-mix(in srgb, ${cor3d} 35%, #fff)`} />
                <stop offset="45%" stopColor={cor3d} />
                <stop offset="100%" stopColor={`color-mix(in srgb, ${cor3d} 60%, #000)`} />
              </linearGradient>
            </defs>
            <circle cx="48" cy="48" r="41" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="9" />
            <motion.circle cx="48" cy="48" r="41" fill="none" stroke={`url(#g${id})`} strokeWidth="9" strokeLinecap="round"
              transform="rotate(-90 48 48)" initial={{ pathLength: 0 }} animate={{ pathLength: p }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
          </svg>
          <strong className="ui-anel3d__nivel">{rotulo}</strong>
        </span>
        <span className="ui-anel3d__legenda">Certeza</span>
      </motion.div>
    );
  }
  return (
    <div className="ui-anel" role="img" aria-label={`Certeza ${rotulo.toLowerCase()}`}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--ui-linha)" strokeWidth="7" />
        <motion.circle cx="32" cy="32" r="26" fill="none" stroke={cor} strokeWidth="7" strokeLinecap="round"
          transform="rotate(-90 32 32)" initial={{ pathLength: 0 }} animate={{ pathLength: p }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} />
      </svg>
      <span className="ui-anel__texto"><small>Certeza</small><strong style={{ color: cor }}>{rotulo}</strong></span>
    </div>
  );
}

// ---------- Esqueleto com brilho (enquanto carrega) ----------
export function Esqueleto({ largura = "100%", altura = 14, raio = 7 }) {
  return <span className="ui-esqueleto" style={{ width: largura, height: altura, borderRadius: raio }} aria-hidden="true" />;
}

// ---------- Passos de análise que vão se completando ----------
export function PassosAnalise({ passos, aoTerminar, intervalo = 650 }) {
  const [feitos, setFeitos] = useState(0);
  useEffect(() => {
    if (feitos >= passos.length) { const t = setTimeout(aoTerminar, 350); return () => clearTimeout(t); }
    const t = setTimeout(() => setFeitos((f) => f + 1), intervalo);
    return () => clearTimeout(t);
  }, [feitos, passos.length, aoTerminar, intervalo]);
  return (
    <ul className="ui-passos" aria-live="polite">
      {passos.map((p, i) => {
        const estado = i < feitos ? "feito" : i === feitos ? "agora" : "espera";
        return (
          <motion.li key={p} className={`ui-passos__item ui-passos__item--${estado}`}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: estado === "espera" ? 0.4 : 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <span className="ui-passos__icone" aria-hidden="true">
              {estado === "feito" ? (
                <motion.svg viewBox="0 0 20 20" width="20" height="20" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={MOLA}>
                  <circle cx="10" cy="10" r="10" fill="var(--ui-verde)" />
                  <path d="M6 10.5l2.6 2.6L14 7.6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              ) : estado === "agora" ? <span className="ui-girando" /> : <span className="ui-bolinha" />}
            </span>
            <span>{p}{estado === "feito" ? " ✓" : estado === "agora" ? "..." : ""}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}

// ---------- Lista que aparece em sequência ----------
export const listaEmSequencia = {
  esconde: {},
  mostra: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
export const itemEmSequencia = {
  esconde: { opacity: 0, y: 12 },
  mostra: { opacity: 1, y: 0, transition: MOLA_SUAVE },
};

// ---------- "Digitando..." (três bolinhas) ----------
export function Digitando() {
  return (
    <span className="ui-digitando" aria-label="Digitando">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}
