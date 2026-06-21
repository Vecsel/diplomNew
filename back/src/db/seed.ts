import bcrypt from "bcrypt";
import { query, pool } from "../config/db.js";

const permissions = [
  { code: "users:read", description: "Read users list and details" },
  { code: "users:create", description: "Create users" },
  { code: "users:update", description: "Update users" },
  { code: "users:delete", description: "Delete users" },
  { code: "groups:read", description: "Read groups list and details" },
  { code: "groups:create", description: "Create groups" },
  { code: "groups:update", description: "Update groups" },
  { code: "groups:delete", description: "Delete groups" },
  { code: "permissions:read", description: "Read permissions list" }
];

async function seed() {
  for (const item of permissions) {
    await query(
      `
      INSERT INTO permissions (code, description)
      VALUES ($1, $2)
      ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description
      `,
      [item.code, item.description]
    );
  }

  await query(
    `
    INSERT INTO role_groups (code, title, description)
    VALUES
      ('admins', 'Administrators', 'Full access role'),
      ('managers', 'Managers', 'Limited management role')
    ON CONFLICT (code) DO NOTHING
    `
  );

  const adminHash = await bcrypt.hash("admin123", 10);
  const managerHash = await bcrypt.hash("manager123", 10);
  const diplomHash = await bcrypt.hash("diplom123", 10);

  await query(
    `
    INSERT INTO users (username, email, password_hash, full_name, is_active)
    VALUES
      ('admin', 'admin@example.com', $1, 'System Admin', TRUE),
      ('manager', 'manager@example.com', $2, 'Team Manager', TRUE),
      ('diplom', 'diplom@example.com', $3, 'Демо для комиссии', TRUE)
    ON CONFLICT (username) DO NOTHING
    `,
    [adminHash, managerHash, diplomHash]
  );

  await query(
    `
    INSERT INTO user_role_groups (user_id, role_group_id)
    SELECT u.id, rg.id
    FROM users u
    JOIN role_groups rg ON rg.code = 'admins'
    WHERE u.username = 'admin'
    ON CONFLICT DO NOTHING
    `
  );

  await query(
    `
    INSERT INTO user_role_groups (user_id, role_group_id)
    SELECT u.id, rg.id
    FROM users u
    JOIN role_groups rg ON rg.code = 'managers'
    WHERE u.username = 'manager'
    ON CONFLICT DO NOTHING
    `
  );

  await query(
    `
    INSERT INTO user_role_groups (user_id, role_group_id)
    SELECT u.id, rg.id
    FROM users u
    JOIN role_groups rg ON rg.code = 'managers'
    WHERE u.username = 'diplom'
    ON CONFLICT DO NOTHING
    `
  );

  await query(
    `
    INSERT INTO role_group_permissions (role_group_id, permission_id)
    SELECT rg.id, p.id
    FROM role_groups rg
    CROSS JOIN permissions p
    WHERE rg.code = 'admins'
    ON CONFLICT DO NOTHING
    `
  );

  await query(
    `
    INSERT INTO role_group_permissions (role_group_id, permission_id)
    SELECT rg.id, p.id
    FROM role_groups rg
    JOIN permissions p ON p.code IN ('users:read', 'groups:read', 'permissions:read')
    WHERE rg.code = 'managers'
    ON CONFLICT DO NOTHING
    `
  );

  console.log("Seed data inserted");
}

void seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
