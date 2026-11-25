"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { Resultado, Tarefa } from "@/lib/tarefas";

type Props = {
  iniciais: Tarefa[];
  mensagemInicial: string | null;
  excluirAcao: (id: string) => Promise<Resultado>;
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ListaTarefas({ iniciais, mensagemInicial, excluirAcao }: Props) {
  const [mensagemLocal, setMensagemLocal] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [, iniciarExclusao] = useTransition();

  const mensagem = mensagemLocal ?? mensagemInicial;

  function remover(tarefa: Tarefa) {
    if (!window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;

    setErro(null);
    setMensagemLocal(null);
    setExcluindo(tarefa.id);

    iniciarExclusao(async () => {
      const resultado = await excluirAcao(tarefa.id);
      setExcluindo(null);

      if (resultado?.erro) {
        setErro(resultado.erro);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {mensagem ? (
        <p
          role="status"
          className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensagem}
        </p>
      ) : null}

      {erro ? (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {erro}
        </p>
      ) : null}

      {iniciais.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Nenhuma tarefa cadastrada ainda. Use o botão “Nova tarefa”.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {iniciais.map((tarefa) => {
            const removendo = excluindo === tarefa.id;

            return (
              <li
                key={tarefa.id}
                className="flex items-start justify-between gap-4 p-4"
                aria-busy={removendo}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{tarefa.titulo}</p>
                  {tarefa.descricao ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {tarefa.descricao}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-zinc-500">
                    Criada em {formatoData.format(new Date(tarefa.dataCriacao))}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/tarefas/${tarefa.id}/editar`}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => remover(tarefa)}
                    disabled={removendo}
                    aria-busy={removendo}
                    className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    {removendo ? "Excluindo…" : "Excluir"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
