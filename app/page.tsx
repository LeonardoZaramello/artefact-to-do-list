import { connection } from "next/server";
import { Suspense } from "react";

import {
  atualizarTarefa,
  criarTarefa,
  excluirTarefa,
  listarTarefas,
  type DadosTarefa,
  type Resultado,
} from "@/lib/tarefas";

import { Tarefas } from "./Tarefas";

async function criarAcao(dados: DadosTarefa): Promise<Resultado> {
  "use server";
  return criarTarefa(dados);
}

async function atualizarAcao(id: string, dados: DadosTarefa): Promise<Resultado> {
  "use server";
  return atualizarTarefa(id, dados);
}

async function excluirAcao(id: string): Promise<Resultado> {
  "use server";
  return excluirTarefa(id);
}

async function Conteudo() {
  // Garante leitura por requisição: a lista em memória não pode virar HTML de build.
  await connection();
  const tarefas = listarTarefas();

  return (
    <Tarefas
      iniciais={tarefas}
      criarAcao={criarAcao}
      atualizarAcao={atualizarAcao}
      excluirAcao={excluirAcao}
    />
  );
}

export default function Pagina() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Suspense
        fallback={
          <p role="status" className="text-sm text-zinc-500">
            Carregando tarefas…
          </p>
        }
      >
        <Conteudo />
      </Suspense>
    </main>
  );
}
