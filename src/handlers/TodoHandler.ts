import { t } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { todoService } from "../services/TodoService";

export const todoHandler = {
  getTodos: async ({ jwt, cookie: { auth }, bearer }) => {
    // console.log(auth + " " + bearer);
    const { id: userId } = auth
      ? await jwt.verify(auth)
      : await jwt.verify(bearer);
    const todos = await todoService.getTodos(userId);

    return {
      status: "success",
      todos: todos
    };
  },

  createTodo: async ({ jwt, body, set, cookie: { auth } }) => {
    const { id: userId } = await jwt.verify(auth);

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

  updateTodo: async ({ jwt, body, set, cookie: { auth }, params: { id } }) => {
    const { id: userId } = await jwt.verify(auth);
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

  getTodoById: async ({ jwt, set, cookie: { auth }, params: { id } }) => {
    const { id: userId } = await jwt.verify(auth);
    await todoService.verifyTodoAccess(id, userId);

    const todo = await todoService.getTodoById(id);

    set.status = 200;
    return {
      status: "success",
      todo: todo
    };
  },

  deleteTodo: async ({ jwt, set, cookie: { auth }, params: { id } }) => {
    const { id: userId } = await jwt.verify(auth);
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
