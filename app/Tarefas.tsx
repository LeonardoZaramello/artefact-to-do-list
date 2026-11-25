"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { DadosTarefa, Resultado, Tarefa } from "@/lib/tarefas";

type Props = {
  iniciais: Tarefa[];
  criarAcao: (dados: DadosTarefa) => Promise<Resultado>;
  excluirAcao: (id: string) => Promise<Resultado>;
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function Tarefas({ iniciais, criarAcao, excluirAcao }: Props) {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const [salvando, iniciarCriacao] = useTransition();
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [, iniciarExclusao] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;

    if (titulo.trim().length === 0) {
      setMensagem(null);
      setErro("O título é obrigatório.");
      return;
    }

    setErro(null);
    setMensagem(null);

    iniciarCriacao(async () => {
      const resultado = await criarAcao({ titulo, descricao });

      if (resultado.erro) {
        setErro(resultado.erro);
        return;
      }

      setTitulo("");
      setDescricao("");
      setMensagem("Tarefa criada com sucesso.");
      router.refresh();
    });
  }

  function remover(tarefa: Tarefa) {
    if (!window.confirm(`Excluir a tarefa "${tarefa.titulo}"?`)) return;

    setErro(null);
    setMensagem(null);
    setExcluindo(tarefa.id);

    iniciarExclusao(async () => {
      const resultado = await excluirAcao(tarefa.id);
      setExcluindo(null);

      if (resultado.erro) {
        setErro(resultado.erro);
        return;
      }

      setMensagem("Tarefa excluída com sucesso.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="titulo" className="text-sm font-medium">
            Título
          </label>
          <input
            id="titulo"
            value={titulo}
            onChange={(evento) => {
              setTitulo(evento.target.value);
              if (erro) setErro(null);
            }}
            disabled={salvando}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? "erro-titulo" : "ajuda-titulo"}
            placeholder="Ex.: comprar café"
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          {erro ? (
            <p id="erro-titulo" role="alert" className="text-sm text-red-600 dark:text-red-400">
              {erro}
            </p>
          ) : (
            <p id="ajuda-titulo" className="text-xs text-zinc-500">
              Campo obrigatório.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="descricao" className="text-sm font-medium">
            Descrição <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(evento) => setDescricao(evento.target.value)}
            disabled={salvando}
            rows={2}
            className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          aria-busy={salvando}
          className="w-fit rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Adicionar tarefa"}
        </button>
      </form>

      {mensagem ? (
        <p
          role="status"
          className="rounded border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
        >
          {mensagem}
        </p>
      ) : null}

      {iniciais.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Nenhuma tarefa cadastrada ainda.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {iniciais.map((tarefa) => (
            <li
              key={tarefa.id}
              className="flex items-start justify-between gap-4 p-4"
              aria-busy={excluindo === tarefa.id}
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

              <button
                type="button"
                onClick={() => remover(tarefa)}
                disabled={excluindo === tarefa.id}
                aria-busy={excluindo === tarefa.id}
                className="shrink-0 rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              >
                {excluindo === tarefa.id ? "Excluindo…" : "Excluir"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
