import bcrypt from "bcrypt";
import { query } from "../../config/db.js";
import { signToken } from "../../common/utils/jwt.js";
import { usersService } from "../users/users.service.js";
import { permissionsService } from "../permissions/permissions.service.js";

type UserRow = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
};

export const authService = {
  async login(login: string, password: string) {
    const user = await usersService.findByLogin(login);
    if (!user || !user.is_active) return null;

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    const token = signToken({
      sub: String(user.id),
      username: user.username,
      email: user.email
    });

    return {
      accessToken: token,
      tokenType: "Bearer"
    };
  },

  async me(userId: number) {
    const result = await query<UserRow>(
      `
      SELECT id, username, email, full_name, is_active
      FROM users
      WHERE id = $1
      `,
      [userId]
    );
    const user = result.rows[0];
    if (!user) return null;

    const groups = await query<{ id: number; code: string; title: string }>(
      `
      SELECT rg.id, rg.code, rg.title
      FROM user_role_groups urg
      JOIN role_groups rg ON rg.id = urg.role_group_id
      WHERE urg.user_id = $1
      ORDER BY rg.id ASC
      `,
      [userId]
    );

    const permissions = await permissionsService.getUserPermissions(userId);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      isActive: user.is_active,
      roleGroups: groups.rows,
      permissions: permissions.map((item: { code: string }) => item.code)
    };
  }
};
