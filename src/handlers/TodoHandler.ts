import { t } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { todoService } from "../services/TodoService";

export const todoHandler = {
  getTodos: async ({ jwt, bearer }) => {
    const { id: userId } = await jwt.verify(bearer);
    const todos = await todoService.getTodos(userId);

    return {
      status: "success",
      todos: todos
    };
  },

  createTodo: async ({ jwt, body, set, bearer }) => {
    const { id: userId } = await jwt.verify(bearer);

    const id = uuidv4();
    const note = await todoService.createTodo({
      id: `todo-${id}`,
      owner: userId,
      ...body
    });
    set.status = 201;
    return {
      status: "success",
      message: `Todo '${body.body}' successfully created!`,
      data: {
        id: note
      }
    };
  },

  updateTodo: async ({ jwt, bearer, body, set, params: { id } }) => {
    const { id: userId } = await jwt.verify(bearer);
    await todoService.verifyTodoAccess(id, userId);

    await todoService.updateTodo({
      id: id,
      ...body
    });
    set.status = 201;
    return {
      status: "success",
      message: `Todo '${body.body}' successfully updated!`
    };
  },

  getTodoById: async ({ jwt, bearer, set, params: { id } }) => {
    const { id: userId } = await jwt.verify(bearer);
    await todoService.verifyTodoAccess(id, userId);

    const todo = await todoService.getTodoById(id);

    set.status = 200;
    return {
      status: "success",
      todo: todo
    };
  },

  deleteTodo: async ({ jwt, set, bearer, params: { id } }) => {
    const { id: userId } = await jwt.verify(bearer);
    await todoService.verifyTodoAccess(id, userId);
    await todoService.deleteTodo(id);
    set.status = 200;
    return {
      status: "success",
      message: `Todo successfully deleted!`
    };
  },

  validateCreateTodo: t.Object({
    body: t.String(),
    tags: t.String()
  })
};
