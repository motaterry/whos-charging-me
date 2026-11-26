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

| Arquivo | O que faz |
|---|---|
| `index.html`, `style.css`, `app.js` | A tela do site |
| `contestar.html` | Tela de contestação (em construção) |
| `api/identificar.js` | O servidor: recebe o nome e devolve a loja |
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
3. Testes: `npm test`

## Time

Terry, Aline e Rafael.
