import { authHandler } from "../handlers/AuthHandler";

export function configureAuthRoutes(app) {
  return app.post("/", authHandler.postAuth).put("/", authHandler.putAuth);
}
