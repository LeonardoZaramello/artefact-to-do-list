import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import {
  atualizarTarefa,
  buscarTarefa,
  type DadosTarefa,
  type Resultado,
} from "@/lib/tarefas";

import { FormularioTarefa } from "../../../FormularioTarefa";

async function atualizarAcao(id: string, dados: DadosTarefa): Promise<Resultado> {
  "use server";
  const resultado = atualizarTarefa(id, dados);

  if (resultado.erro) return resultado;

  redirect("/?aviso=atualizado");
}

async function FormularioEdicao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tarefa = buscarTarefa(id);

  if (!tarefa) notFound();

  return (
    <FormularioTarefa modo="editar" tarefa={tarefa} atualizarAcao={atualizarAcao} />
  );
}

export default function EditarTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        ← Voltar para a lista
      </Link>

      <h1 className="text-2xl font-semibold">Editar tarefa</h1>

      <Suspense
        fallback={
          <p role="status" className="text-sm text-zinc-500">
            Carregando tarefa…
          </p>
        }
      >
        <FormularioEdicao params={params} />
      </Suspense>
    </main>
  );
}
