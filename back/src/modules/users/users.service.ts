import bcrypt from "bcrypt";
import { query } from "../../config/db.js";
import { AppError } from "../../common/utils/app-error.js";

type UserRow = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserWithPasswordRow = UserRow & { password_hash: string };
type RoleGroupRow = { id: number; code: string; title: string };

type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  isActive?: boolean;
  groupIds?: number[];
};

type UpdateUserInput = Partial<CreateUserInput>;
type UserListStatus = "all" | "active" | "inactive";
type UserListOptions = { page: number; limit: number; q?: string; status?: UserListStatus };
type UsersStats = { totalUsers: number; activeUsers: number; adminUsers: number };

function toPublicUser(row: UserRow, roleGroups: RoleGroupRow[] = []) {
  const userId = Number(row.id);
  return {
    id: Number.isInteger(userId) ? userId : 0,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    isActive: row.is_active,
    roleGroups,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getGroupsForUsers(userIds: number[]) {
  if (!userIds.length) return new Map<number, RoleGroupRow[]>();

  const result = await query<{ user_id: number } & RoleGroupRow>(
    `
    SELECT urg.user_id, rg.id, rg.code, rg.title
    FROM user_role_groups urg
    JOIN role_groups rg ON rg.id = urg.role_group_id
    WHERE urg.user_id = ANY($1::bigint[])
    ORDER BY rg.id ASC
    `,
    [userIds]
  );

  const groupsMap = new Map<number, RoleGroupRow[]>();
  for (const row of result.rows) {
    const userId = Number(row.user_id);
    const groupId = Number(row.id);
    if (!Number.isInteger(userId) || userId <= 0) continue;
    if (!Number.isInteger(groupId) || groupId <= 0) continue;
    const current = groupsMap.get(userId) ?? [];
    current.push({ id: groupId, code: row.code, title: row.title });
    groupsMap.set(userId, current);
  }
  return groupsMap;
}

async function assertGroupIdsExist(groupIds: number[]) {
  if (!groupIds.length) return;

  const uniqueIds = [...new Set(groupIds)];
  const existing = await query<{ id: number }>(
    "SELECT id FROM role_groups WHERE id = ANY($1::bigint[])",
    [uniqueIds]
  );

  if (existing.rows.length !== uniqueIds.length) {
    throw new AppError(400, "Some group ids do not exist");
  }
}

async function replaceUserGroups(userId: number, groupIds: number[] | undefined) {
  if (!groupIds) return;

  const uniqueIds = [...new Set(groupIds)];
  await query("DELETE FROM user_role_groups WHERE user_id = $1", [userId]);
  for (const groupId of uniqueIds) {
    await query(
      `
      INSERT INTO user_role_groups (user_id, role_group_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [userId, groupId]
    );
  }
}

export const usersService = {
  async getStats(): Promise<UsersStats> {
    const [totalResult, activeResult, adminsResult] = await Promise.all([
      query<{ total: string }>(
        `
        SELECT COUNT(*)::text AS total
        FROM users
        `
      ),
      query<{ total: string }>(
        `
        SELECT COUNT(*)::text AS total
        FROM users
        WHERE is_active = TRUE
        `
      ),
      query<{ total: string }>(
        `
        SELECT COUNT(DISTINCT u.id)::text AS total
        FROM users u
        JOIN user_role_groups urg ON urg.user_id = u.id
        JOIN role_groups rg ON rg.id = urg.role_group_id
        WHERE rg.code = 'admins'
        `
      )
    ]);

    return {
      totalUsers: Number(totalResult.rows[0]?.total ?? 0),
      activeUsers: Number(activeResult.rows[0]?.total ?? 0),
      adminUsers: Number(adminsResult.rows[0]?.total ?? 0)
    };
  },

  async getAll(options: UserListOptions) {
    const page = Math.max(1, options.page);
    const limit = Math.max(1, Math.min(100, options.limit));
    const skip = (page - 1) * limit;
    const q = (options.q ?? "").trim();
    const status: UserListStatus = options.status ?? "all";

    const whereParts: string[] = [];
    const params: unknown[] = [];

    if (q) {
      params.push(`%${q}%`);
      const qParam = `$${params.length}`;
      whereParts.push(`(username ILIKE ${qParam} OR email ILIKE ${qParam} OR full_name ILIKE ${qParam})`);
    }

    if (status === "active") {
      whereParts.push("is_active = TRUE");
    } else if (status === "inactive") {
      whereParts.push("is_active = FALSE");
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const totalResult = await query<{ total: string }>(
      `
      SELECT COUNT(*)::text AS total
      FROM users
      ${whereClause}
      `,
      params
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);

    const pageParams = [...params, limit, skip];
    const limitParam = `$${params.length + 1}`;
    const offsetParam = `$${params.length + 2}`;
    const result = await query<UserRow>(
      `
      SELECT id, username, email, full_name, is_active, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY id ASC
      LIMIT ${limitParam}
      OFFSET ${offsetParam}
      `,
      pageParams
    );
    const rowIds = result.rows
      .map((row: UserRow) => Number(row.id))
      .filter((id: number) => Number.isInteger(id) && id > 0);
    const groupsMap = await getGroupsForUsers(rowIds);
    const items = result.rows.map((row: UserRow) => {
      const userId = Number(row.id);
      return toPublicUser(row, groupsMap.get(userId) ?? []);
    });
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
    const result = await query<UserRow>(
      `
      SELECT id, username, email, full_name, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
      `,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    const groupsMap = await getGroupsForUsers([id]);
    return toPublicUser(row, groupsMap.get(id) ?? []);
  },

  async findByLogin(login: string) {
    const result = await query<UserWithPasswordRow>(
      `
      SELECT id, username, email, full_name, is_active, created_at, updated_at, password_hash
      FROM users
      WHERE username = $1 OR email = $1
      `,
      [login]
    );
    return result.rows[0] ?? null;
  },

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    await assertGroupIdsExist(input.groupIds ?? []);

    try {
      const result = await query<UserRow>(
        `
        INSERT INTO users (username, email, password_hash, full_name, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email, full_name, is_active, created_at, updated_at
        `,
        [input.username, input.email, passwordHash, input.fullName, input.isActive ?? true]
      );
      const createdUser = result.rows[0];
      const createdUserId = Number(createdUser.id);
      await replaceUserGroups(createdUserId, input.groupIds);
      const groupsMap = await getGroupsForUsers([createdUserId]);
      return toPublicUser(createdUser, groupsMap.get(createdUserId) ?? []);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        throw new AppError(409, "Username or email already exists");
      }
      throw error;
    }
  },

  async update(id: number, input: UpdateUserInput) {
    const current = await query<UserWithPasswordRow>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    const currentRow = current.rows[0];
    if (!currentRow) return null;

    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : currentRow.password_hash;
    await assertGroupIdsExist(input.groupIds ?? []);

    try {
      const result = await query<UserRow>(
        `
        UPDATE users
        SET username = $1,
            email = $2,
            password_hash = $3,
            full_name = $4,
            is_active = $5,
            updated_at = NOW()
        WHERE id = $6
        RETURNING id, username, email, full_name, is_active, created_at, updated_at
        `,
        [
          input.username ?? currentRow.username,
          input.email ?? currentRow.email,
          passwordHash,
          input.fullName ?? currentRow.full_name,
          input.isActive ?? currentRow.is_active,
          id
        ]
      );
      const updatedUser = result.rows[0];
      const updatedUserId = Number(updatedUser.id);
      await replaceUserGroups(id, input.groupIds);
      const groupsMap = await getGroupsForUsers([updatedUserId]);
      return toPublicUser(updatedUser, groupsMap.get(updatedUserId) ?? []);
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error && error.code === "23505") {
        throw new AppError(409, "Username or email already exists");
      }
      throw error;
    }
  },

  async remove(id: number) {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
};
