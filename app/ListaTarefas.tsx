"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import type { PaginaTarefas, Resultado, Tarefa } from "@/lib/tarefas";

type Props = {
  iniciais: Tarefa[];
  cursorInicial: number | null;
  totalInicial: number;
  mensagemInicial: string | null;
  excluirAcao: (id: string) => Promise<Resultado>;
  carregarMaisAcao: (cursor: number) => Promise<PaginaTarefas>;
};

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function ListaTarefas({
  iniciais,
  cursorInicial,
  totalInicial,
  mensagemInicial,
  excluirAcao,
  carregarMaisAcao,
}: Props) {
  const [tarefas, setTarefas] = useState(iniciais);
  const [cursor, setCursor] = useState<number | null>(cursorInicial);
  const [total, setTotal] = useState(totalInicial);
  const [mensagemLocal, setMensagemLocal] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [, iniciarExclusao] = useTransition();

  const sentinela = useRef<HTMLDivElement | null>(null);
  const carregandoRef = useRef(false);

  const mensagem = mensagemLocal ?? mensagemInicial;

  const carregarMais = useCallback(async () => {
    if (cursor === null || carregandoRef.current) return;

    carregandoRef.current = true;
    setCarregandoMais(true);
    setErroCarregamento(null);

    try {
      const pagina = await carregarMaisAcao(cursor);

      setTarefas((atuais) => {
        const vistos = new Set(atuais.map((tarefa) => tarefa.id));
        return [
          ...atuais,
          ...pagina.tarefas.filter((tarefa) => !vistos.has(tarefa.id)),
        ];
      });
      setCursor(pagina.proximoCursor);
      setTotal(pagina.total);
    } catch {
      setErroCarregamento("Não foi possível carregar mais tarefas.");
    } finally {
      carregandoRef.current = false;
      setCarregandoMais(false);
    }
  }, [carregarMaisAcao, cursor]);

  // Infinite scroll: carrega a próxima página quando o fim da lista se aproxima.
  useEffect(() => {
    const alvo = sentinela.current;

    if (!alvo || cursor === null) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          void carregarMais();
        }
      },
      { rootMargin: "200px" },
    );

    observador.observe(alvo);
    return () => observador.disconnect();
  }, [carregarMais, cursor]);

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
        return;
      }

      setTarefas((atuais) => atuais.filter((item) => item.id !== tarefa.id));
      setCursor((atual) => (atual === null ? null : Math.max(0, atual - 1)));
      setTotal((atual) => Math.max(0, atual - 1));
      setMensagemLocal("Tarefa excluída com sucesso.");
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

      {total > 0 ? (
        <p className="text-xs text-zinc-500">
          Mostrando {tarefas.length} de {total} tarefa{total === 1 ? "" : "s"}
        </p>
      ) : null}

      {tarefas.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Nenhuma tarefa cadastrada ainda. Use o botão “Nova tarefa”.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {tarefas.map((tarefa) => {
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

      {cursor !== null ? (
        <div ref={sentinela} aria-hidden="true" className="h-1" />
      ) : null}

      {carregandoMais ? (
        <p role="status" className="text-center text-sm text-zinc-500">
          Carregando mais tarefas…
        </p>
      ) : null}

      {erroCarregamento ? (
        <p
          role="alert"
          className="flex flex-wrap items-center justify-center gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {erroCarregamento}
          <button
            type="button"
            onClick={() => void carregarMais()}
            className="rounded border border-current px-2 py-1 font-medium"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}
    </div>
  );
}
