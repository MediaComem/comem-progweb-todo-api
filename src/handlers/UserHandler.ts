import { t } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { userService } from "../services/UserService";

export const userHandler = {
  getUsers: async () => {
    const users = await userService.getUsers();
    return {
      status: "success",
      data: users
    };
  },

  createUser: async ({ body, set }) => {
    await userService.verifyEmailIsAvailable(body.email);

    const id = uuidv4();

    
    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: parseInt(process.env.BUN_COST)
    });

    const user = await userService.createUser({
      id: `user-${id}`,
      email: body.email,
      password: passwordHash
    });

    if (!user) {
      return {
        status: "error",
        message: `User could not be created`
      };
    }
    set.status = 201;
    return {
      status: "success",
      message: `User ${body.email} successfully created!`
    };
  },

  getUserById: async ({ set, params: { id } }) => {
    const user = await userService.getUserById(id);

    set.status = 200;
    return {
      status: "success",
      data: user
    };
  },

  deleteUser: async ({ params: { id } }) => {
    await userService.deleteUser(id);

    return {
      status: "success",
      message: `User ${id} has been successfully deleted!`
    };
  },

  loginUser: async ({ jwt, setCookie, body, set }) => {
    const hashedPassword = await userService.getPasswordByEmail(body.email);
    const isMatch = await Bun.password.verify(body.password, hashedPassword);

    if (!isMatch) {
      set.status = 401;
      return {
        status: "error",
        message: `Password is not correct!`
      };
    }

    const login = await userService.loginUser({
      email: body.email,
      password: hashedPassword
    });

    setCookie("auth", await jwt.sign(login), {
      HttpOnly: true,
      maxAge: 4 * 86400,
      sameSite: "None",
      path: "/"
    });

    set.status = 200;
    return {
      status: "success",
      message: `Signed in successfully!`
    };
  },

  validateCreateUser: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 6 })
  })
};
