// Tela 2: mostra a loja que achamos, a certeza, os dados da Receita e as fontes.
import { useState } from "react";
import Botao from "../componentes/Botao.jsx";
import Cartao from "../componentes/Cartao.jsx";
import SeloCerteza from "../componentes/SeloCerteza.jsx";
import Ilustracao from "../componentes/Ilustracao.jsx";
import Mapa from "../componentes/Mapa.jsx";
import { CATEGORIAS } from "../api.js";

function formatarCnpj(c) {
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export default function Resultado({ r, aoContestar }) {
  const [categoria, setCategoria] = useState(r.categoria || "Outros");
  const [salvo, setSalvo] = useState(false);

  const linhas = [];
  if (r.entrada?.intermediario) linhas.push(["Maquininha", r.entrada.intermediario]);
  // MEI ou empresário individual: a API já não manda o nome completo do dono nem a rua (LGPD).
  // Mostramos só os primeiros nomes, o bairro e a cidade.
  const protegido = r.receita?.dados_protegidos === true;
  const tipoPessoa = r.receita?.mei ? "MEI (microempreendedor)" : "Empresário individual (empresa de uma pessoa só)";
  if (r.receita && protegido) {
    if (r.receita.nome_fantasia) linhas.push(["Nome da loja", r.receita.nome_fantasia]);
    if (r.receita.nome_dono) linhas.push(["Dono", r.receita.nome_dono]);
    linhas.push(["CNPJ", formatarCnpj(r.receita.cnpj)]);
    linhas.push(["Bairro e cidade", [r.receita.bairro, r.receita.municipio].filter(Boolean).join(", ") + (r.receita.uf ? ` (${r.receita.uf})` : "")]);
    linhas.push(["Atividade", r.receita.atividade]);
    linhas.push(["Tipo", tipoPessoa]);
  } else if (r.receita) {
    linhas.push(["Nome oficial", r.receita.razao_social]);
    linhas.push(["CNPJ", formatarCnpj(r.receita.cnpj)]);
    linhas.push(["Endereço", r.receita.endereco]);
    linhas.push(["Atividade", r.receita.atividade]);
    if (r.receita.mei) linhas.push(["Tipo", "MEI (microempreendedor)"]);
  }

  const fontes = [...(r.receita?.fonte ? [r.receita.fonte] : []), ...(r.fontes || [])];

  return (
    <Cartao aria-labelledby="res-loja">
      {(r.certeza === "baixa" || !r.loja) && <Ilustracao nome="procurando" tamanho="p" />}
      <p className="rotulo">{r.certeza === "baixa" || !r.loja ? "Não temos certeza. O mais provável é" : "Achamos que é"}</p>
      <h2 id="res-loja">{r.loja || "Não encontramos com certeza"}</h2>
      <SeloCerteza nivel={r.certeza} />
      <p>{[r.explicacao, r.aviso].filter(Boolean).join(" ")}</p>

      {r.local?.lat && r.local?.lon && (
        <div className="local-compra">
          <h3>Onde a compra foi feita</h3>
          <p className="ajuda-texto">
            {[r.local.endereco, r.local.bairro, r.local.cidade].filter(Boolean).join(", ")} (informado pelo banco)
          </p>
          <Mapa lat={r.local.lat} lon={r.local.lon} titulo="Mapa do local da compra" />
        </div>
      )}

      {linhas.length > 0 && (
        <dl className="dados">
          {linhas.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {protegido && (
        <p className="ajuda-texto">
          🔒 É {r.receita.mei ? "um MEI" : "uma empresa de uma pessoa só"}. Para proteger quem é dono do negócio, mostramos só os primeiros nomes. Não mostramos sobrenome, CPF nem endereço completo (LGPD).
        </p>
      )}

      <div className="categoria">
        <div className="campo">
          <label htmlFor="categoria">Categoria sugerida</label>
          <select id="categoria" value={categoria} onChange={(e) => { setCategoria(e.target.value); setSalvo(false); }}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <Botao onClick={() => setSalvo(true)} disabled={salvo}>
          {salvo ? "Categoria salva ✓" : "Confirmar"}
        </Botao>
      </div>

      <details className="fontes">
        <summary>Ver as fontes ({fontes.length + (protegido && r.receita.fonte_nome ? 1 : 0)})</summary>
        <ul>
          {protegido && r.receita.fonte_nome && <li>Dados públicos da Receita, conferidos na {r.receita.fonte_nome} (link escondido porque mostra dados pessoais do dono)</li>}
          {fontes.length === 0 && !protegido && <li>Nenhuma fonte informada.</li>}
          {fontes.map((f) => (
            <li key={f}><a href={f} target="_blank" rel="noopener noreferrer">{f}</a></li>
          ))}
        </ul>
      </details>

      <div className="separador">
        <p>Mesmo assim não reconhece essa compra?</p>
        <Botao tipo="secundario" onClick={aoContestar}>Não reconheço, quero contestar</Botao>
      </div>
    </Cartao>
  );
}
