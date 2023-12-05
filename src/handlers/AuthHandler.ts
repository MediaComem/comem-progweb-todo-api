import { userService } from "../services/UserService";
import { authService } from "../services/AuthService";

export const authHandler = {
  postAuth: async ({ jwt, refreshJwt, body, set }) => {
    const userId = await userService.verifyUserByEmail(body.email);
    const access_token = await jwt.sign(userId);
    const refresh_token = await refreshJwt.sign(userId);
    await authService.addRefreshToken(refresh_token);
    set.status = 201;
    return {
      data: {
        access_token: access_token,
        refresh_token: refresh_token
      }
    };
  },

  putAuth: async ({
    jwt,
    refreshJwt,
    body: { refresh_token },
    set
  }) => {
    await authService.verifyRefreshToken(refresh_token);
    const tokenPayload = await refreshJwt.verify(refresh_token);
    const access_token = await jwt.sign(tokenPayload);
    set.status = 200;
    return {
      message: "Access token successfully updated",
      data: {
        access_token: access_token
      }
    };
  },

  deleteAuth: async ({
    refreshJwt,
    body: { refresh_token },
    set
  }) => {
    await authService.verifyRefreshToken(refresh_token);
    await refreshJwt.verify(refresh_token);
    set.status = 200;
    return {
      message: "Refresh token has been successfully deleted"
    };
  }
};
