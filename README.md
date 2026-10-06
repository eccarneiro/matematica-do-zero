# Matemática do Zero

Curso gratuito e autodidata de matemática, do básico absoluto até o cálculo, em português do Brasil.
Cada aula traz a história da ideia, a teoria com desenhos interativos, aplicações reais, uma pergunta
filosófica, videoaulas selecionadas, exemplos resolvidos e **treino infinito** com questões geradas na hora.

## Como rodar localmente

É um site estático, sem etapa de build. Basta servir a pasta:

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

## Testes dos geradores de exercícios

```sh
node tests/run.mjs
```

## Estrutura

```
index.html               página única (rotas por #hash)
css/style.css            estilos (mobile-first, claro/escuro)
content/curriculum.js    trilha completa de módulos e aulas
content/<modulo>/*.js    conteúdo de cada aula (texto, história, vídeos, exemplos)
js/app.js                roteador e telas
js/practice.js           motor do treino infinito
js/generators/*.js       um gerador de questões por tópico
js/interactives/*.js     desenhos interativos (SVG)
js/lib/                  frações exatas, sorteio, correção de respostas, progresso
tests/                   testes dos geradores e da correção de respostas
```

## Como adicionar uma aula

1. Crie `content/<modulo>/<aula>.js` seguindo o formato das aulas existentes.
2. Se tiver treino, crie `js/generators/<topico>.js` e adicione um verificador em `tests/run.mjs`.
3. Em `content/curriculum.js`, marque a aula com `ready: true` e `generator: '<topico>'`.
