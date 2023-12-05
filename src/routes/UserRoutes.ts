import { userHandler } from "../handlers/UserHandler";
import { authMiddleware } from "../middleware/authMiddleware";

export function configureUserRoutes(app) {
  return app
    .guard({ body: userHandler.validateCreateUser }, (guardApp) =>
      guardApp.post("/", userHandler.createUser)
    )
    .get("/:id", userHandler.getUserById, {
      beforeHandle: authMiddleware
    })
    .delete("/:id", userHandler.deleteUser, {
      beforeHandle: authMiddleware
    })
    .post("/login", userHandler.loginUser);
}
