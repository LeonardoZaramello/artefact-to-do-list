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

export type PaginaTarefas = {
  tarefas: Tarefa[];
  /** Offset da próxima página; `null` quando não há mais tarefas. */
  proximoCursor: number | null;
  total: number;
};

const esquemaTarefa = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório"),
  descricao: z.string().trim().optional(),
});

const QUANTIDADE_INICIAL = 100;
const TAMANHO_PAGINA = 8;

/**
 * Regra de negócio: a lista vive só na memória do processo.
 * Reiniciar o servidor recomeça com as tarefas de exemplo.
 */
type Estado = { tarefas: Tarefa[]; semeado: boolean };

const escopo = globalThis as typeof globalThis & { __tarefas?: Estado };
const estado = (escopo.__tarefas ??= { tarefas: [], semeado: false });

function semearTarefasIniciais() {
  if (estado.semeado) return;

  estado.semeado = true;
  const agora = Date.now();

  for (let indice = 1; indice <= QUANTIDADE_INICIAL; indice += 1) {
    estado.tarefas.push({
      id: randomUUID(),
      titulo: `Tarefa de exemplo ${indice}`,
      descricao: indice % 3 === 0 ? `Descrição da tarefa ${indice}` : undefined,
      dataCriacao: agora - (indice - 1) * 60_000,
    });
  }
}

semearTarefasIniciais();

export function listarTarefas(): Tarefa[] {
  return [...estado.tarefas]
    .reverse()
    .sort((a, b) => b.dataCriacao - a.dataCriacao);
}

export function buscarTarefa(id: string): Tarefa | null {
  return estado.tarefas.find((tarefa) => tarefa.id === id) ?? null;
}

export function listarTarefasPaginado(
  cursor = 0,
  limite = TAMANHO_PAGINA,
): PaginaTarefas {
  const todas = listarTarefas();
  const inicio = Math.max(0, cursor);
  const fim = inicio + limite;

  return {
    tarefas: todas.slice(inicio, fim),
    proximoCursor: fim < todas.length ? fim : null,
    total: todas.length,
  };
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

export function excluirTodasTarefas(): Resultado {
  estado.tarefas.splice(0, estado.tarefas.length);
  return {};
}

export function atualizarTarefa(id: string, dados: DadosTarefa): Resultado {
  const validacao = esquemaTarefa.safeParse(dados);

  if (!validacao.success) {
    return { erro: validacao.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const indice = estado.tarefas.findIndex((tarefa) => tarefa.id === id);

  if (indice === -1) {
    return { erro: "Tarefa não encontrada." };
  }

  const descricao = validacao.data.descricao?.trim();

  estado.tarefas[indice] = {
    ...estado.tarefas[indice],
    titulo: validacao.data.titulo,
    descricao: descricao ? descricao : undefined,
  };

  return {};
}
