import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth-context";
import { useCan } from "@/features/auth/use-can";
import { PERMISSIONS } from "@/lib/permission-codes";
import { mapApiErrorToUi, type UiFieldErrors } from "@/lib/api-error-mapper";
import { toastApiError } from "@/lib/toast-helpers";
import { ru } from "@/lib/i18n/ru";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { usePagedList } from "@/lib/use-paged-list";
import { toUserFormInputCreate, toUserFormInputEdit, type UserCreateFormValues, type UserEditFormValues } from "@/features/users/user-form-schema";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  getUsersStats,
  updateUser,
  type UserDto,
  type UserFormInput,
  type UsersStatsDto
} from "@/features/users/users-api";
import { getGroupById, getGroups } from "@/features/groups/groups-api";

export type UserStatusFilter = "all" | "active" | "inactive";
export type UserSortKey = "user" | "email" | "updated";

function toGroupOption(group: { id: number; code: string; title: string }) {
  return {
    id: Number(group.id),
    code: group.code,
    title: group.title
  };
}

export function useUsersPage() {
  const { token } = useAuth();
  const { can } = useCan();
  const canCreateUser = can(PERMISSIONS.USERS_CREATE);
  const canUpdateUser = can(PERMISSIONS.USERS_UPDATE);
  const canDeleteUser = can(PERMISSIONS.USERS_DELETE);
  const canReadUserDetail = can(PERMISSIONS.USERS_READ);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [sortKey, setSortKey] = useState<UserSortKey>("user");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isSaving, setIsSaving] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<UiFieldErrors>({});

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<UiFieldErrors>({});

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [statsData, setStatsData] = useState<UsersStatsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const usersList = usePagedList<UserDto, { q: string; status: UserStatusFilter }>({
    enabled: Boolean(token),
    limit: 20,
    params: { q: debouncedQuery.trim(), status: statusFilter },
    fetchPage: async ({ page, limit, params }) => {
      if (!token) throw new Error(ru.users.listError.fallback);
      try {
        return await getUsers(token, { page, limit, q: params.q, status: params.status });
      } catch (error) {
        const mapped = mapApiErrorToUi(error, ru.users.listError.fallback);
        throw new Error(mapped.message);
      }
    }
  });

  const displayUsers = useMemo(() => {
    const list = [...usersList.items];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "user") cmp = a.username.localeCompare(b.username, undefined, { sensitivity: "base" });
      else if (sortKey === "email") cmp = a.email.localeCompare(b.email, undefined, { sensitivity: "base" });
      else {
        const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        cmp = ta - tb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [usersList.items, sortDir, sortKey]);

  const loadStats = async () => {
    if (!token) {
      setStatsData(null);
      setStatsError(null);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await getUsersStats(token);
      setStatsData(response);
    } catch (error) {
      const mapped = mapApiErrorToUi(error, ru.users.stats.loadFailed);
      setStatsError(mapped.message);
      setStatsData(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, [token]);

  const setDetailsOpen = (open: boolean) => {
    setIsDetailsOpen(open);
    if (!open) {
      setDetailsError(null);
      setSelectedUser(null);
    }
  };

  const openDetails = async (row: UserDto) => {
    if (!token) return;
    setDetailsError(null);
    setIsDetailsLoading(true);
    setSelectedUser(null);
    setIsDetailsOpen(true);
    try {
      const detailed = await getUserById(row.id, token);
      setSelectedUser(detailed);
    } catch (detailsError) {
      const mapped = mapApiErrorToUi(detailsError, ru.users.toast.detailsFailed);
      setDetailsError(mapped.message);
      toastApiError(detailsError, ru.users.toast.detailsFailed);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const setCreateOpen = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      setCreateError(null);
      setCreateFieldErrors({});
    }
  };

  const openCreateModal = () => {
    setCreateError(null);
    setCreateFieldErrors({});
    setIsCreateOpen(true);
  };

  const setEditOpen = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditError(null);
      setEditFieldErrors({});
      setEditingUser(null);
    }
  };

  const openEditModal = (row: UserDto) => {
    setEditError(null);
    setEditFieldErrors({});
    setEditingUser(row);
    setIsEditOpen(true);
  };

  const searchGroups = async ({ q, page, limit }: { q: string; page: number; limit: number }) => {
    if (!token) throw new Error(ru.users.groupsPicker.loadFailed);
    const response = await getGroups(token, { q, page, limit });
    return {
      items: response.items.map(toGroupOption),
      page: response.page,
      totalPages: response.totalPages
    };
  };

  const loadGroupsByIds = async (ids: number[]) => {
    if (!token || ids.length === 0) return [];
    const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)));
    const responses = await Promise.all(uniqueIds.map(async (id) => getGroupById(id, token)));
    return responses.map(toGroupOption);
  };

  const submitCreatePayload = async (values: UserCreateFormValues) => {
    if (!token) return;
    const payload: UserFormInput = toUserFormInputCreate(values);
    setIsSaving(true);
    setCreateError(null);
    setCreateFieldErrors({});
    try {
      await createUser(payload, token);
      toast.success(ru.users.toast.created);
      setIsCreateOpen(false);
      await Promise.all([usersList.reload(), loadStats()]);
    } catch (createError) {
      const mapped = mapApiErrorToUi(createError, ru.users.toast.createFailed);
      setCreateError(mapped.message);
      setCreateFieldErrors(mapped.fieldErrors);
    } finally {
      setIsSaving(false);
    }
  };

  const submitEditPayload = async (values: UserEditFormValues) => {
    if (!token || !editingUser) return;
    const payload: UserFormInput = toUserFormInputEdit(values);
    setIsSaving(true);
    setEditError(null);
    setEditFieldErrors({});
    try {
      await updateUser(editingUser.id, payload, token);
      toast.success(ru.users.toast.updated);
      setIsEditOpen(false);
      setEditingUser(null);
      await Promise.all([usersList.reload(), loadStats()]);
    } catch (err) {
      const mapped = mapApiErrorToUi(err, ru.users.toast.updateFailed);
      setEditError(mapped.message);
      setEditFieldErrors(mapped.fieldErrors);
    } finally {
      setIsSaving(false);
    }
  };

  const setDeleteOpen = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setDeleteError(null);
      setDeletingUser(null);
    }
  };

  const submitDelete = async () => {
    if (!token || !deletingUser) return;
    setIsSaving(true);
    setDeleteError(null);
    try {
      await deleteUser(deletingUser.id, token);
      toast.success(ru.users.toast.deleted);
      setIsDeleteOpen(false);
      setDeletingUser(null);
      await Promise.all([usersList.reload(), loadStats()]);
    } catch (deleteError) {
      const mapped = mapApiErrorToUi(deleteError, ru.users.toast.deleteFailed);
      setDeleteError(mapped.message);
      toastApiError(deleteError, ru.users.toast.deleteFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedUserGroups = selectedUser?.roleGroups ?? [];

  const groupsForRow = (row: UserDto) => (row.roleGroups ?? []).map((g) => ({ code: g.code, title: g.title }));

  return {
    permissions: {
      canCreateUser,
      canUpdateUser,
      canDeleteUser,
      canReadUserDetail
    },
    stats: {
      data: statsData,
      isLoading: statsLoading,
      error: statsError,
      reload: loadStats
    },
    filters: {
      status: statusFilter,
      setStatus: (value: UserStatusFilter) => {
        setStatusFilter(value);
      },
      sortKey,
      setSortKey: (value: UserSortKey) => {
        setSortKey(value);
        usersList.setPage(1);
      },
      sortDir,
      setSortDir: (value: "asc" | "desc") => {
        setSortDir(value);
        usersList.setPage(1);
      },
      toggleSortDir: () => {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        usersList.setPage(1);
      }
    },
    list: {
      users: usersList.items,
      displayUsers,
      total: usersList.total,
      page: usersList.page,
      totalPages: usersList.totalPages,
      query,
      setQuery,
      status: statusFilter,
      setPage: usersList.setPage,
      isLoading: usersList.isLoading,
      error: usersList.error,
      reload: usersList.reload
    },
    details: {
      open: isDetailsOpen,
      setOpen: setDetailsOpen,
      user: selectedUser,
      isLoading: isDetailsLoading,
      error: detailsError,
      groups: selectedUserGroups,
      groupsForRow
    },
    create: {
      open: isCreateOpen,
      setOpen: setCreateOpen,
      error: createError,
      fieldErrors: createFieldErrors,
      searchGroups,
      loadGroupsByIds,
      submitPayload: submitCreatePayload
    },
    edit: {
      open: isEditOpen,
      setOpen: setEditOpen,
      user: editingUser,
      error: editError,
      fieldErrors: editFieldErrors,
      searchGroups,
      loadGroupsByIds,
      submitPayload: submitEditPayload
    },
    delete: {
      open: isDeleteOpen,
      setOpen: setDeleteOpen,
      user: deletingUser,
      error: deleteError,
      requestDelete: (row: UserDto) => {
        setDeleteError(null);
        setDeletingUser(row);
        setIsDeleteOpen(true);
      },
      submit: submitDelete
    },
    dialogs: {
      openCreate: openCreateModal,
      openEdit: openEditModal,
      openDetails
    },
    isSaving
  };
}
