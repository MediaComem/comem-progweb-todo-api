import { todoHandler } from "../handlers/TodoHandler";
import { authMiddleware } from "../middleware/authMiddleware";

export function configureTodoRoutes(app) {
  return app
    .get("/", todoHandler.getTodos, {
      beforeHandle: authMiddleware
    })
    .post("/", todoHandler.createTodo, {
      beforeHandle: authMiddleware,
      body: todoHandler.validateCreateTodo
    })
    .put("/:id", todoHandler.updateTodo, { beforeHandle: authMiddleware })
    .get("/:id", todoHandler.getTodoById, { beforeHandle: authMiddleware })
    .delete("/:id", todoHandler.deleteTodo, { beforeHandle: authMiddleware });
}
