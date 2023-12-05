import { NotFoundError, t } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { AuthorizationError } from "../exceptions/AuthorizationError";

const db = new PrismaClient();

interface todoPayload {
  id: string;
  body: string;
  tags: string;
  owner: string;
}

interface updateTodoPayload {
  body: string;
  tags: string;
  id: string;
}

export const todoService = {
  getTodos: async (owner: string) => {
    const todos = await db.todo.findMany({
      where: {
        owner: {
          equals: owner
        }
      }
    });

    if (!todos) throw new NotFoundError("This user has no todos!");

    return todos;
  },

  createTodo: async (payload: todoPayload) => {
    const todo = await db.todo.create({
      data: {
        id: payload.id,
        body: payload.body,
        tags: payload.tags,
        owner: payload.owner
      },
      select: {
        id: true
      }
    });

    if (!todo) throw new InvariantError("Could not create todo");
  },

  updateTodo: async (payload: updateTodoPayload) => {
    const todo = await db.todo.update({
      where: {
        id: payload.id
      },
      data: {
        body: payload.body,
        tags: payload.tags
      }
    });

    if (!todo) throw new InvariantError("Could not update todo");
  },

  getTodoById: async (id: string) => {
    const todo = await db.todo.findFirst({
      where: {
        id: {
          equals: id
        }
      }
    });

    if (!todo) throw new NotFoundError("Todo is not found!");

    return todo;
  },

  deleteTodo: async (id: string) => {
    console.log(id)
    const todo = await db.todo.delete({
      where: {
        id: id
      }
    });

    if (!todo) throw new NotFoundError("Todo is not found!");
  },

  verifyTodoOwner: async (todoId: string, userId: string) => {
    const todo = await db.todo.findFirst({
      where: {
        id: {
          equals: todoId
        }
      }
    });

    if (!todo) throw new NotFoundError("Todo is not found!");

    if (todo.owner !== userId)
      throw new AuthorizationError("You have no access!");
  },

  verifyTodoAccess: async (todoId: string, userId: string) => {
    try {
      await todoService.verifyTodoOwner(todoId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
    }
  },

  getTodoBodyById: async (id: string) => {
    const todo = await db.todo.findFirst({
      where: {
        id: {
          equals: id
        }
      },
      select: {
        body: true
      }
    });

    return todo.body;
  },
};
