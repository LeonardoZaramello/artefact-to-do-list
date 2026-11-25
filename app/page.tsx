import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { excluirTarefa, listarTarefas, type Resultado } from "@/lib/tarefas";

import { ListaTarefas } from "./ListaTarefas";

const MENSAGENS: Record<string, string> = {
  criado: "Tarefa criada com sucesso.",
  atualizado: "Tarefa atualizada com sucesso.",
  excluido: "Tarefa excluída com sucesso.",
};

async function excluirAcao(id: string): Promise<Resultado> {
  "use server";
  const resultado = excluirTarefa(id);

  if (resultado.erro) return resultado;

  redirect("/?aviso=excluido");
}

async function Conteudo({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  // Garante leitura por requisição: a lista em memória não pode virar HTML de build.
  await connection();

  const { aviso } = await searchParams;
  const tarefas = listarTarefas();
  const mensagem = aviso ? (MENSAGENS[aviso] ?? null) : null;

  return (
    <ListaTarefas
      iniciais={tarefas}
      mensagemInicial={mensagem}
      excluirAcao={excluirAcao}
    />
  );
}

export default function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Lista de tarefas</h1>
        <Link
          href="/tarefas/nova"
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Nova tarefa
        </Link>
      </header>

      <Suspense
        fallback={
          <p role="status" className="text-sm text-zinc-500">
            Carregando tarefas…
          </p>
        }
      >
        <Conteudo searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
