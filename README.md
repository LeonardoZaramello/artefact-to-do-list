# Lista de tarefas

Projeto simples com Next.js (App Router): listagem renderizada no servidor, criação, edição e exclusão de tarefas. Os dados ficam em memória — reiniciar o servidor zera a lista.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Estrutura

```
app/
  page.tsx        # página única: SSR da lista + Server Actions
  Tarefas.tsx     # formulário e lista (Client Component)
lib/
  tarefas.ts      # regra de negócio: validação (Zod) e armazenamento em memória
```

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
