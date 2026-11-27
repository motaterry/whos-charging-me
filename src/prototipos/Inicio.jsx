// Página que lista os protótipos. Endereço: /#/prototipos
export default function Inicio() {
  return (
    <main className="pagina">
      <a className="botao botao--link" href="#/">← Voltar ao site</a>
      <h1>Protótipos</h1>
      <p className="subtitulo">Como o "Quem me cobrou?" pode chegar às pessoas. São telas clicáveis, com dados de exemplo.</p>
      <ul className="proto-escolha">
        <li>
          <a className="proto-escolha__item" href="#/prototipos/cenario-1">
            <span className="proto-escolha__tag">Cenário 1 · para bancos</span>
            <strong>Dentro do app do banco</strong>
            <span>O banco manda o nome e o local da compra. A pessoa só toca na compra e vê a loja. Pode contestar com as provas já preenchidas.</span>
          </a>
        </li>
        <li>
          <a className="proto-escolha__item" href="#/prototipos/cenario-2">
            <span className="proto-escolha__tag">Cenário 2 · visão de futuro</span>
            <strong>O nosso app</strong>
            <span>A pessoa cria conta, conecta os bancos pelo Open Finance e o app acha sozinho as compras de nome estranho.</span>
          </a>
        </li>
      </ul>
      <p className="ajuda-texto">O site principal (digitar o nome ou simular banco) continua funcionando com dados reais.</p>
    </main>
  );
}
