import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import {
  excluirTarefa,
  excluirTodasTarefas,
  listarTarefasPaginado,
  type PaginaTarefas,
  type Resultado,
} from "@/lib/tarefas";

import { BotaoExcluirTodas } from "./BotaoExcluirTodas";
import { ListaTarefas } from "./ListaTarefas";

const MENSAGENS: Record<string, string> = {
  criado: "Tarefa criada com sucesso.",
  atualizado: "Tarefa atualizada com sucesso.",
  todas: "Todas as tarefas foram excluídas.",
};

async function excluirAcao(id: string): Promise<Resultado> {
  "use server";
  return excluirTarefa(id);
}

async function excluirTodasAcao(): Promise<Resultado> {
  "use server";
  const resultado = excluirTodasTarefas();

  if (resultado.erro) return resultado;

  redirect("/?aviso=todas");
}

async function carregarMaisAcao(cursor: number): Promise<PaginaTarefas> {
  "use server";
  return listarTarefasPaginado(cursor);
}

async function Conteudo({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  // Garante leitura por requisição: a lista em memória não pode virar HTML de build.
  await connection();

  const { aviso } = await searchParams;
  const { tarefas, proximoCursor, total } = listarTarefasPaginado();
  const mensagem = aviso ? (MENSAGENS[aviso] ?? null) : null;

  return (
    <ListaTarefas
      key={`${tarefas.length}:${tarefas[0]?.id ?? ""}`}
      iniciais={tarefas}
      cursorInicial={proximoCursor}
      totalInicial={total}
      mensagemInicial={mensagem}
      excluirAcao={excluirAcao}
      carregarMaisAcao={carregarMaisAcao}
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
        <div className="flex flex-wrap items-center gap-2">
          <BotaoExcluirTodas excluirTodasAcao={excluirTodasAcao} />
          <Link
            href="/tarefas/nova"
            className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Nova tarefa
          </Link>
        </div>
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
