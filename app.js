// Código da tela: envia o nome para o servidor e mostra a resposta.

const CATEGORIAS = [
  "Alimentação", "Mercado", "Transporte", "Saúde e farmácia", "Compras",
  "Assinaturas e serviços digitais", "Lazer", "Educação", "Casa", "Outros",
];

const $ = (id) => document.getElementById(id);
const form = $("form");
const statusEl = $("status");
const resultado = $("resultado");

function mostrarStatus(texto, tipo = "info") {
  statusEl.hidden = false;
  statusEl.className = `status ${tipo}`;
  statusEl.textContent = texto;
}

function esconderStatus() {
  statusEl.hidden = true;
  statusEl.textContent = "";
}

const TEXTO_CERTEZA = {
  alta: "Certeza alta",
  media: "Certeza média",
  baixa: "Certeza baixa: confira antes de confirmar",
};

function mostrarResultado(r) {
  $("res-loja").textContent = r.loja || "Não encontramos com certeza";
  const selo = $("res-certeza");
  selo.textContent = TEXTO_CERTEZA[r.certeza] || "Certeza desconhecida";
  selo.dataset.nivel = r.certeza || "baixa";
  $("res-explicacao").textContent = [r.explicacao, r.aviso].filter(Boolean).join(" ");

  const dados = $("res-dados");
  dados.innerHTML = "";
  const linhas = [];
  if (r.entrada?.intermediario) linhas.push(["Maquininha", r.entrada.intermediario]);
  if (r.receita) {
    linhas.push(["Nome oficial", r.receita.razao_social]);
    linhas.push(["CNPJ", r.receita.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")]);
    linhas.push(["Endereço", r.receita.endereco]);
    linhas.push(["Atividade", r.receita.atividade]);
    if (r.receita.mei) linhas.push(["Tipo", "MEI (microempreendedor)"]);
  }
  for (const [k, v] of linhas) {
    const dt = document.createElement("dt");
    dt.textContent = k;
    const dd = document.createElement("dd");
    dd.textContent = v;
    dados.append(dt, dd);
  }

  const sel = $("res-categoria");
  sel.innerHTML = "";
  for (const c of CATEGORIAS) {
    const op = document.createElement("option");
    op.textContent = c;
    op.selected = c === r.categoria;
    sel.append(op);
  }
  $("confirmar").textContent = "Confirmar";
  $("confirmar").disabled = false;

  const fontes = $("res-fontes");
  fontes.innerHTML = "";
  const todas = [...(r.fontes || [])];
  if (r.receita?.fonte) todas.unshift(r.receita.fonte);
  if (todas.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma fonte informada.";
    fontes.append(li);
  }
  for (const f of todas) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = f;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = f;
    li.append(a);
    fontes.append(li);
  }

  resultado.hidden = false;
  $("res-loja").focus?.();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = $("nome").value.trim();
  const cidade = $("cidade").value.trim();

  if (nome.length < 2) {
    mostrarStatus("Escreva o nome que aparece na fatura.", "erro");
    $("nome").focus();
    return;
  }

  resultado.hidden = true;
  $("buscar").disabled = true;
  mostrarStatus("Procurando a loja na internet e na Receita. Leva uns 10 segundos...");

  try {
    const resp = await fetch("/api/identificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cidade }),
    });
    const dados = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(dados.erro || "Algo deu errado.");
    esconderStatus();
    mostrarResultado(dados);
  } catch (err) {
    mostrarStatus(`Não conseguimos buscar agora. ${err.message} Tente de novo em alguns segundos.`, "erro");
  } finally {
    $("buscar").disabled = false;
  }
});

$("limpar").addEventListener("click", () => {
  form.reset();
  resultado.hidden = true;
  esconderStatus();
  $("nome").focus();
});

document.querySelectorAll("[data-nome]").forEach((b) =>
  b.addEventListener("click", () => {
    $("nome").value = b.dataset.nome;
    $("cidade").value = b.dataset.cidade;
    form.requestSubmit();
  })
);

$("confirmar").addEventListener("click", () => {
  $("confirmar").textContent = "Categoria salva ✓";
  $("confirmar").disabled = true;
});
