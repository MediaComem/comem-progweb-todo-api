import { Elysia } from "elysia";
import bearer from "@elysiajs/bearer";
import { swagger } from "@elysiajs/swagger";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";

import { configureTodoRoutes } from "./routes/TodoRoutes";
import { configureUserRoutes } from "./routes/UserRoutes";
import { configureAuthRoutes } from "./routes/AuthRoutes";

import { AuthenticationError } from "./exceptions/AuthenticationError";
import { AuthorizationError } from "./exceptions/AuthorizationError";
import { InvariantError } from "./exceptions/InvariantError";

const app = new Elysia();

app
  .error("AUTHENTICATION_ERROR", AuthenticationError)
  .error("AUTHORIZATION_ERROR", AuthorizationError)
  .error("INVARIANT_ERROR", InvariantError)
  .onError(({ code, error, set }) => {
    console.log(error)
    switch (code) {
      case "VALIDATION": 
        set.status = 400;
        return {
          status: "error",
          message: "Some fields are invalid"
        };
      case "AUTHENTICATION_ERROR":
        set.status = 401;
        return {
          status: "error",
          message: error.toString().replace("Error: ", "")
        };
      case "AUTHORIZATION_ERROR":
        set.status = 403;
        return {
          status: "error",
          message: error.toString().replace("Error: ", "")
        };
      case "INVARIANT_ERROR":
        set.status = 400;
        return {
          status: "error",
          message: error.toString().replace("Error: ", "")
        };
      case "NOT_FOUND":
        set.status = 404;
        return {
          status: "error",
          message: error.toString().replace("Error: ", "")
        };
      case "INTERNAL_SERVER_ERROR":
        set.status = 500;
        return {
          status: "error",
          message: "Something went wrong!"
        };
    }
  })

  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET,
      exp: "7d"
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: process.env.JWT_REFRESH_SECRET
    })
  )
  .use(cookie())
  .use(
    cors({
      credentials: true,
      allowedHeaders: ["Content-Type, Authorization"],
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"]
    })
  )
  .use(bearer())
  .use(
    swagger({
      path: "/swagger"
    })
  );

app
  .get("/", () => `Welcome to Bun Elysia`)
  .group("/todos", configureTodoRoutes)
  .group("/users", configureUserRoutes)
  .group("/auth", configureAuthRoutes)
  .listen(process.env.BUN_PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
