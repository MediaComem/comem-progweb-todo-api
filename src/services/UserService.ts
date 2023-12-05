import { NotFoundError } from "elysia";
import { PrismaClient } from "@prisma/client";
import { InvariantError } from "../exceptions/InvariantError";
import { AuthorizationError } from "../exceptions/AuthorizationError";
import { AuthenticationError } from "../exceptions/AuthenticationError";

const db = new PrismaClient();

interface createUserPayload {
    id: string,
    email: string,
    password: string
}

interface loginPayload {
    email: string,
    password: string
}

export const userService = {
    getUsers: async () => {
        return await db.user.findMany({
            select: {
                id: true,
                email: true,
            }
        });
    },

    createUser: async (payload: createUserPayload) => {
        const user = await db.user.create({
            data: {
                id: payload.id,
                email: payload.email,
                password: payload.password,
            },
            select: {
                id: true
            }
        });

        if (!user) throw new InvariantError("User failed to be added")
        return user;
    },

    getUserById: async (id: string) => {
        const user = await db.user.findFirst({
            where: {
                id: {
                    equals: id,
                },
            },
            select: {
                id: true,
                email: true,
            }
        });

        if (!user) throw new NotFoundError("User not found");
        return user;
    },

    deleteUser: async (id: string) => {
        await db.user.delete({
            where: {
                id: id,
            },
        });
    },

    getPasswordByEmail: async (email: string) => {
        const getPassword = await db.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            },
            select: {
                password: true
            }
        })

        if (!getPassword) throw new InvariantError("Email is not found!")

        return getPassword.password
    },

    loginUser: async (body: loginPayload) => {
        const user = await db.user.findFirst({
            where: {
                email: {
                    equals: body.email,
                },
                password: {
                    equals: body.password
                }
            },
            select: {
                id: true
            }
        })


        if (!user) throw new AuthenticationError("Email or password is wrong!")
        return user
    },

    verifyUserByEmail: async (email: string) => {
        const user = await db.user.findFirst({
            where: {
                email: {
                    equals: email,
                },
            },
            select: {
                id: true,
            },
        });

        if (!user) throw new AuthenticationError("Email or password is wrong!")

        return user;
    },

    verifyUserById: async (id: string) => {
        const user = await db.user.findFirst({
            where: {
                email: {
                    equals: id,
                },
            },
        });

        if (!user) throw new AuthorizationError("You have no access!")
    },

    verifyEmailIsAvailable: async (email: string) => {
        const unavailable = await db.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            },
        })

        if (unavailable) throw new InvariantError('Email already exist!')
    }
};