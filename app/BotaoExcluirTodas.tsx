"use client";

import { useState, useTransition } from "react";

import type { Resultado } from "@/lib/tarefas";

type Props = {
  excluirTodasAcao: () => Promise<Resultado>;
};

export function BotaoExcluirTodas({ excluirTodasAcao }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function limparTudo() {
    if (!window.confirm("Excluir todas as tarefas? Essa ação não pode ser desfeita.")) {
      return;
    }

    setErro(null);

    iniciar(async () => {
      const resultado = await excluirTodasAcao();

      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={limparTudo}
        disabled={pendente}
        aria-busy={pendente}
        className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
      >
        {pendente ? "Excluindo…" : "Excluir todas"}
      </button>
      {erro ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {erro}
        </span>
      ) : null}
    </>
  );
}
