"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { DadosTarefa, Resultado, Tarefa } from "@/lib/tarefas";

type Props = {
  modo: "criar" | "editar";
  tarefa?: Tarefa;
  criarAcao?: (dados: DadosTarefa) => Promise<Resultado>;
  atualizarAcao?: (id: string, dados: DadosTarefa) => Promise<Resultado>;
};

export function FormularioTarefa({ modo, tarefa, criarAcao, atualizarAcao }: Props) {
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvamento] = useTransition();

  function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (salvando) return;

    if (titulo.trim().length === 0) {
      setErro("O título é obrigatório.");
      return;
    }

    setErro(null);

    const dados: DadosTarefa = { titulo, descricao };

    iniciarSalvamento(async () => {
      let resultado: Resultado | null = null;

      if (tarefa && atualizarAcao) {
        resultado = await atualizarAcao(tarefa.id, dados);
      } else if (criarAcao) {
        resultado = await criarAcao(dados);
      }

      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
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
          rows={3}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={salvando}
          aria-busy={salvando}
          className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando
            ? "Salvando…"
            : modo === "editar"
              ? "Salvar alterações"
              : "Criar tarefa"}
        </button>
        <Link
          href="/"
          className="rounded border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
