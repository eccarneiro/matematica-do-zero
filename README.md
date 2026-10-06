# Matemática do Zero

Curso gratuito e autodidata de matemática, do básico absoluto até o cálculo, em português do Brasil.
Cada aula traz a história da ideia, a teoria com desenhos interativos, aplicações reais, uma pergunta
filosófica, videoaulas selecionadas, exemplos resolvidos e **treino infinito** com questões geradas na hora.

No ar em **https://matematica-do-zero.vercel.app**

## Stack

- **Next.js** (App Router) + **React** + **TypeScript** estrito
- **Tailwind CSS** com tokens de cor (claro/escuro e uma cor por módulo) em `src/app/globals.css`
- **KaTeX** para fórmulas e **MDX** para os textos longos das aulas
- **Auth.js** (login com Google) + **Postgres** na Neon com **Drizzle**, só para guardar o progresso
- **Vitest** para a lógica matemática e os geradores de questões
- Hospedagem na **Vercel** (deploy automático a cada push na `main`)

## Rodando localmente

```sh
npm install
npm run dev        # http://localhost:3000
npm test           # lógica matemática + 400 questões por nível de cada gerador
npm run typecheck
npm run lint
```

O site funciona sem nenhuma variável de ambiente: o progresso fica no `localStorage`.
Para o login com Google e a sincronização na nuvem, copie `.env.example` para `.env.local` e preencha.
Depois de configurar o banco, crie as tabelas com `npm run db:migrate`.

## Estrutura

```
src/
  app/                     rotas (trilha, módulo, aula, treino, busca, auth)
    actions/progress.ts    Server Action que sincroniza o progresso
  content/
    curriculum.ts          trilha completa (módulos, aulas, "em breve")
    lessons.ts             registro do conteúdo das aulas publicadas
    <modulo>/<aula>/       meta.ts (dados), historia.mdx e ideia.mdx
  generators/              um gerador de questões por tópico + registry.ts
    verify/                verificadores independentes usados nos testes
  components/
    practice/              motor do treino infinito
    interactives/          desenhos interativos (SVG)
    lesson/                seções da aula (vídeo, exemplos, índice)
  lib/math/                frações exatas, sorteio e correção de respostas equivalentes
  progress/                progresso local + sincronização
  server/                  Auth.js e banco (Drizzle)
drizzle/                   migrações SQL
```

## Como adicionar uma aula

1. Crie `src/content/<modulo>/<aula>/` com `meta.ts`, `historia.mdx` e `ideia.mdx` (use uma aula existente como modelo).
   Vídeos: confira cada link antes (`https://www.youtube.com/oembed?url=...&format=json` precisa responder).
2. Registre a aula em `src/content/lessons.ts`.
3. Crie o gerador `src/generators/<topico>.ts` e registre-o em `src/generators/registry.ts`.
4. Crie `src/generators/verify/<topico>.ts`, que recalcula as respostas a partir de `q.data`, e inclua-o em `verify/index.ts`.
5. Em `src/content/curriculum.ts`, marque a aula com `ready: true` e `topic: '<topico>'`.
6. Rode `npm test`: cada gerador é testado com 400 questões por nível. O teste confere a resposta,
   verifica se ela é aceita pelo corretor e se todo o LaTeX compila.
