import { query } from "../../config/db.js";

type PermissionRow = {
  id: number;
  code: string;
  description: string;
};

export const permissionsService = {
  async getAll() {
    const result = await query<PermissionRow>(
      "SELECT id, code, description FROM permissions ORDER BY id ASC"
    );
    return result.rows;
  },

  async getByCodes(codes: string[]) {
    if (!codes.length) return [];
    const result = await query<PermissionRow>(
      "SELECT id, code, description FROM permissions WHERE code = ANY($1::text[]) ORDER BY id ASC",
      [codes]
    );
    return result.rows;
  },

  async userHasPermission(userId: number, permissionCode: string) {
    const result = await query<{ exists: boolean }>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM user_role_groups urg
        JOIN role_group_permissions rgp ON rgp.role_group_id = urg.role_group_id
        JOIN permissions p ON p.id = rgp.permission_id
        WHERE urg.user_id = $1 AND p.code = $2
      ) AS exists
      `,
      [userId, permissionCode]
    );
    return result.rows[0]?.exists ?? false;
  },

  async getUserPermissions(userId: number) {
    const result = await query<PermissionRow>(
      `
      SELECT DISTINCT p.id, p.code, p.description
      FROM user_role_groups urg
      JOIN role_group_permissions rgp ON rgp.role_group_id = urg.role_group_id
      JOIN permissions p ON p.id = rgp.permission_id
      WHERE urg.user_id = $1
      ORDER BY p.id ASC
      `,
      [userId]
    );
    return result.rows;
  }
};
