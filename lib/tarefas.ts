import { randomUUID } from "node:crypto";
import { z } from "zod";

export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  /** Epoch em milissegundos. */
  dataCriacao: number;
};

export type DadosTarefa = {
  titulo: string;
  descricao?: string;
};

export type Resultado = { erro?: string };

const esquemaTarefa = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório"),
  descricao: z.string().trim().optional(),
});

/**
 * Regra de negócio: a lista vive só na memória do processo.
 * Reiniciar o servidor começa do zero — não há persistência em disco.
 */
type Estado = { tarefas: Tarefa[] };

const escopo = globalThis as typeof globalThis & { __tarefas?: Estado };
const estado = (escopo.__tarefas ??= { tarefas: [] });

export function listarTarefas(): Tarefa[] {
  return [...estado.tarefas]
    .reverse()
    .sort((a, b) => b.dataCriacao - a.dataCriacao);
}

export function criarTarefa(dados: DadosTarefa): Resultado {
  const validacao = esquemaTarefa.safeParse(dados);

  if (!validacao.success) {
    return { erro: validacao.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const descricao = validacao.data.descricao?.trim();

  estado.tarefas.push({
    id: randomUUID(),
    titulo: validacao.data.titulo,
    descricao: descricao ? descricao : undefined,
    dataCriacao: Date.now(),
  });

  return {};
}

export function excluirTarefa(id: string): Resultado {
  const indice = estado.tarefas.findIndex((tarefa) => tarefa.id === id);

  if (indice === -1) {
    return { erro: "Tarefa não encontrada." };
  }

  estado.tarefas.splice(indice, 1);
  return {};
}
