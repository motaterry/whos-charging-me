// Página que lista os protótipos. Endereço: /#/prototipos
export default function Inicio() {
  return (
    <main className="pagina">
      <a className="botao botao--link" href="#/">← Voltar ao site</a>
      <h1>Protótipos</h1>
      <p className="subtitulo">Como o "Quem me cobrou?" chega às pessoas: dentro do app do banco ou dentro de um app de finanças. São telas clicáveis, com dados de exemplo. Conceito, sem vínculo com o banco.</p>
      <ul className="proto-escolha">
        <li>
          <a className="proto-escolha__item" href="#/prototipos/cenario-1">
            <span className="proto-escolha__tag">Para bancos (B2B) · estilo C6</span>
            <strong>Dentro do app do banco</strong>
            <span>A jornada começa na tela inicial do banco. A pessoa toca em "Não reconhece uma compra?", escolhe a compra e vê a loja. Pode contestar com as provas já preenchidas.</span>
          </a>
        </li>
        <li>
          <a className="proto-escolha__item" href="#/prototipos/cenario-2">
            <span className="proto-escolha__tag">Para pessoas (B2C)</span>
            <strong>Dentro do app de finanças</strong>
            <span>A pessoa cria conta, conecta os bancos pelo Open Finance e o app acha sozinho as compras de nome estranho.</span>
          </a>
        </li>
      </ul>
      <p className="ajuda-texto">O site principal (digitar o nome ou simular banco) continua funcionando com dados reais.</p>
    </main>
  );
}
