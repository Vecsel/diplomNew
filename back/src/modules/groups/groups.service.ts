import { query } from "../../config/db.js";
import { AppError } from "../../common/utils/app-error.js";
import { permissionsService } from "../permissions/permissions.service.js";

type GroupRow = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type GroupDto = {
  id: number;
  code: string;
  title: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

type CreateGroupInput = {
  code: string;
  title: string;
  description?: string;
  permissionCodes?: string[];
};

type UpdateGroupInput = Partial<CreateGroupInput>;
type GroupListOptions = { page: number; limit: number; q?: string };

async function mapGroup(row: GroupRow): Promise<GroupDto> {
  const permissions = await query<{ code: string }>(
    `
    SELECT p.code
    FROM role_group_permissions rgp
    JOIN permissions p ON p.id = rgp.permission_id
    WHERE rgp.role_group_id = $1
    ORDER BY p.code ASC
    `,
    [row.id]
  );

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    permissions: permissions.rows.map((item: { code: string }) => item.code),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function syncGroupPermissions(groupId: number, permissionCodes: string[] | undefined) {
  if (!permissionCodes) return;

  const perms = await permissionsService.getByCodes(permissionCodes);
  if (perms.length !== permissionCodes.length) {
    throw new AppError(400, "Some permission codes do not exist");
  }

  await query("DELETE FROM role_group_permissions WHERE role_group_id = $1", [groupId]);
  for (const permission of perms) {
    await query(
      `
      INSERT INTO role_group_permissions (role_group_id, permission_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [groupId, permission.id]
    );
  }
}

export const groupsService = {
  async getAll(options: GroupListOptions) {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, Math.min(100, options.limit));
    const skip = (page - 1) * limit;
    const q = (options.q ?? "").trim();

    const params: unknown[] = [];
    let whereClause = "";
    if (q) {
      params.push(`%${q}%`);
      const qParam = `$${params.length}`;
      whereClause = `WHERE (code ILIKE ${qParam} OR title ILIKE ${qParam} OR COALESCE(description, '') ILIKE ${qParam})`;
    }

    const totalResult = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM role_groups
      ${whereClause}
      `,
      params
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);

    const pageParams = [...params, limit, skip];
    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;
    const result = await query<GroupRow>(
      `
      SELECT id, code, title, description, created_at, updated_at
      FROM role_groups
      ${whereClause}
      ORDER BY id ASC
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      pageParams
    );

    const items = await Promise.all(result.rows.map(mapGroup));
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  },

  async findById(id: number) {
    const result = await query<GroupRow>(
      `
      SELECT id, code, title, description, created_at, updated_at
      FROM role_groups
      WHERE id = $1
      `,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return mapGroup(row);
  },

  async create(input: CreateGroupInput) {
    try {
      const created = await query<GroupRow>(
        `
        INSERT INTO role_groups (code, title, description)
        VALUES ($1, $2, $3)
        RETURNING id, code, title, description, created_at, updated_at
        `,
        [input.code, input.title, input.description ?? null]
      );
      const row = created.rows[0];
      await syncGroupPermissions(row.id, input.permissionCodes);
      return mapGroup(row);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        throw new AppError(409, "Group code already exists");
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateGroupInput) {
    const current = await query<GroupRow>("SELECT * FROM role_groups WHERE id = $1", [id]);
    const row = current.rows[0];
    if (!row) return null;

    try {
      const updated = await query<GroupRow>(
        `
        UPDATE role_groups
        SET code = $1,
            title = $2,
            description = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING id, code, title, description, created_at, updated_at
        `,
        [input.code ?? row.code, input.title ?? row.title, input.description ?? row.description, id]
      );

      await syncGroupPermissions(id, input.permissionCodes);
      return mapGroup(updated.rows[0]);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        throw new AppError(409, "Group code already exists");
      }
      throw error;
    }
  },

  async remove(id: number) {
    const result = await query("DELETE FROM role_groups WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
};
