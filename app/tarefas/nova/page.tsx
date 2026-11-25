import Link from "next/link";
import { redirect } from "next/navigation";

import { criarTarefa, type DadosTarefa, type Resultado } from "@/lib/tarefas";

import { FormularioTarefa } from "../../FormularioTarefa";

async function criarAcao(dados: DadosTarefa): Promise<Resultado> {
  "use server";
  const resultado = criarTarefa(dados);

  if (resultado.erro) return resultado;

  redirect("/?aviso=criado");
}

export default function NovaTarefaPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        ← Voltar para a lista
      </Link>

      <h1 className="text-2xl font-semibold">Nova tarefa</h1>

      <FormularioTarefa modo="criar" criarAcao={criarAcao} />
    </main>
  );
}
