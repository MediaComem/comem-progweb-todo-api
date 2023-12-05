import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "elysia";
import { InvariantError } from "../exceptions/InvariantError";

const db = new PrismaClient();

export const authService = {
  verifyRefreshToken: async (refresh_token: string) => {
    const token = await db.authentication.findFirst({
      where: {
        token: {
          equals: refresh_token
        }
      }
    });

    if (!token) throw new NotFoundError("Token is incorrect!");
  },
  addRefreshToken: async (refresh_token: string) => {
    const token = await db.authentication.create({
      data: {
        token: refresh_token
      }
    });

    if (!token) throw new InvariantError("Token failed to be added");

    return token.token;
  }
};
