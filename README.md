# Quem me cobrou? (whos-charging-me)

Projeto do hackathon HackBrasil 2026.

**O problema:** a pessoa vê um nome estranho na fatura do cartão (ex.: `MP*CASADOPAODEQUEIJO`) e não sabe que compra é essa.

**A solução:** a pessoa digita o nome. O site descobre qual é a loja, mostra a fonte e o quanto tem certeza, e sugere uma categoria. Se a pessoa não reconhecer a compra, o site ajuda a contestar.

## Como funciona

1. **Limpar o nome.** Tiramos o prefixo da maquininha (ex.: `MP*` = Mercado Pago).
2. **Achar a loja.** A IA (Claude, pelo OpenRouter) procura na internet o nome + a cidade e tenta achar o CNPJ.
3. **Conferir na Receita.** Confirmamos o CNPJ na [BrasilAPI](https://brasilapi.com.br), que usa dados públicos da Receita Federal.
4. **Mostrar o resultado.** Loja, endereço, fonte e grau de certeza.

## Arquivos

O site é feito em **React** (uma biblioteca para montar telas com peças reutilizáveis) e **Vite** (a ferramenta que junta tudo num site pronto).

| Arquivo | O que faz |
|---|---|
| `src/tokens.css` | Design system: todas as cores, tamanhos e espaços |
| `src/estilo.css` | O visual de cada peça, usando os tokens |
| `src/componentes/` | Peças reutilizáveis: Botão, Campo, Cartão, Aviso, Selo de certeza |
| `src/telas/` | As telas: Busca, Resultado, Contestar |
| `src/App.jsx` | Guarda o que a pessoa digitou e escolhe qual tela mostrar |
| `src/api.js` | Manda o nome para o servidor |
| `api/identificar.js` | O servidor: recebe o nome e devolve a loja |
| `api/contestar.js` | O servidor: monta o passo a passo do banco e o texto pronto |
| `lib/limpar-nome.js` | Tira o prefixo da maquininha |

## API para bancos

Um banco pode usar o mesmo servidor:

```
POST /api/identificar
{ "nome": "MP*CASADOPAODEQUEIJO", "cidade": "São Paulo" }
```

Resposta: loja, categoria, certeza, explicação, fontes e dados da Receita.

## Como rodar

1. Copie `.env.example` para `.env` e coloque a chave do OpenRouter. O `.env` nunca vai para o GitHub.
2. Na Vercel, coloque a mesma chave em Settings > Environment Variables, com o nome `OPENROUTER_API_KEY`.
3. No computador: `npm install` e depois `npm run dev`.
4. Testes: `npm test`

## Time

Terry, Aline e Rafael.
