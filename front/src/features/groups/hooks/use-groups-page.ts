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
import { toGroupFormInput, type GroupFormValues } from "@/features/groups/group-form-schema";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
  type GroupDto
} from "@/features/groups/groups-api";
import { getPermissions, type PermissionDto } from "@/features/permissions/permissions-api";

export type GroupSortKey = "title" | "code" | "permissions" | "updated";

export function useGroupsPage() {
  const { token } = useAuth();
  const { can } = useCan();
  const canCreateGroup = can(PERMISSIONS.GROUPS_CREATE);
  const canUpdateGroup = can(PERMISSIONS.GROUPS_UPDATE);
  const canDeleteGroup = can(PERMISSIONS.GROUPS_DELETE);
  const canReadGroupDetail = can(PERMISSIONS.GROUPS_READ);

  const [allPermissions, setAllPermissions] = useState<PermissionDto[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [sortKey, setSortKey] = useState<GroupSortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isSaving, setIsSaving] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<GroupDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createFieldErrors, setCreateFieldErrors] = useState<UiFieldErrors>({});

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<UiFieldErrors>({});

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<GroupDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const groupsList = usePagedList<GroupDto, { q: string }>({
    enabled: Boolean(token),
    limit: 20,
    params: { q: debouncedQuery.trim() },
    fetchPage: async ({ page, limit, params }) => {
      if (!token) throw new Error(ru.groups.listError.fallback);
      try {
        return await getGroups(token, { page, limit, q: params.q });
      } catch (error) {
        const mapped = mapApiErrorToUi(error, ru.groups.listError.fallback);
        throw new Error(mapped.message);
      }
    }
  });

  const displayGroups = useMemo(() => {
    const list = [...groupsList.items];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      else if (sortKey === "code") cmp = a.code.localeCompare(b.code, undefined, { sensitivity: "base" });
      else if (sortKey === "permissions") cmp = a.permissions.length - b.permissions.length;
      else {
        const ta = new Date(a.updatedAt).getTime();
        const tb = new Date(b.updatedAt).getTime();
        cmp = ta - tb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [groupsList.items, sortDir, sortKey]);

  const stats = useMemo(() => {
    const total = groupsList.total;
    const emptyMatrix = groupsList.items.filter((g) => g.permissions.length === 0).length;
    const grants = groupsList.items.reduce((acc, g) => acc + g.permissions.length, 0);
    return { total, emptyMatrix, grants };
  }, [groupsList.items, groupsList.total]);

  const loadPermissionsList = async () => {
    if (!token) return;
    try {
      const response = await getPermissions(token);
      setAllPermissions(response.items);
    } catch (permError) {
      setAllPermissions([]);
      toastApiError(permError, ru.groups.toast.permListFailed);
    }
  };

  useEffect(() => {
    void loadPermissionsList();
  }, [token]);

  const setDetailsOpen = (open: boolean) => {
    setIsDetailsOpen(open);
    if (!open) {
      setDetailsError(null);
      setSelectedGroup(null);
    }
  };

  const openDetails = async (row: GroupDto) => {
    if (!token) return;
    setDetailsError(null);
    setIsDetailsLoading(true);
    setSelectedGroup(null);
    setIsDetailsOpen(true);
    try {
      const detailed = await getGroupById(row.id, token);
      setSelectedGroup(detailed);
    } catch (detailsError) {
      const mapped = mapApiErrorToUi(detailsError, ru.groups.toast.detailsFailed);
      setDetailsError(mapped.message);
      toastApiError(detailsError, ru.groups.toast.detailsFailed);
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
      setEditingGroup(null);
    }
  };

  const openEditModal = (row: GroupDto) => {
    setEditError(null);
    setEditFieldErrors({});
    setEditingGroup(row);
    setIsEditOpen(true);
  };

  const submitCreatePayload = async (values: GroupFormValues) => {
    if (!token) return;
    setIsSaving(true);
    setCreateError(null);
    setCreateFieldErrors({});
    try {
      await createGroup(toGroupFormInput(values), token);
      toast.success(ru.groups.toast.created);
      setIsCreateOpen(false);
      await groupsList.reload();
    } catch (createError) {
      const mapped = mapApiErrorToUi(createError, ru.groups.toast.createFailed);
      setCreateError(mapped.message);
      setCreateFieldErrors(mapped.fieldErrors);
      toastApiError(createError, ru.groups.toast.createFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const submitEditPayload = async (values: GroupFormValues) => {
    if (!token || !editingGroup) return;
    setIsSaving(true);
    setEditError(null);
    setEditFieldErrors({});
    try {
      await updateGroup(editingGroup.id, toGroupFormInput(values), token);
      toast.success(ru.groups.toast.updated);
      setIsEditOpen(false);
      setEditingGroup(null);
      await groupsList.reload();
    } catch (err) {
      const mapped = mapApiErrorToUi(err, ru.groups.toast.updateFailed);
      setEditError(mapped.message);
      setEditFieldErrors(mapped.fieldErrors);
      toastApiError(err, ru.groups.toast.updateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const setDeleteOpen = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setDeleteError(null);
      setDeletingGroup(null);
    }
  };

  const submitDelete = async () => {
    if (!token || !deletingGroup) return;
    setIsSaving(true);
    setDeleteError(null);
    try {
      await deleteGroup(deletingGroup.id, token);
      toast.success(ru.groups.toast.deleted);
      setIsDeleteOpen(false);
      setDeletingGroup(null);
      await groupsList.reload();
    } catch (deleteError) {
      const mapped = mapApiErrorToUi(deleteError, ru.groups.toast.deleteFailed);
      setDeleteError(mapped.message);
      toastApiError(deleteError, ru.groups.toast.deleteFailed);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    permissions: {
      canCreateGroup,
      canUpdateGroup,
      canDeleteGroup,
      canReadGroupDetail
    },
    stats,
    filters: {
      sortKey,
      setSortKey: (value: GroupSortKey) => {
        setSortKey(value);
        groupsList.setPage(1);
      },
      sortDir,
      setSortDir: (value: "asc" | "desc") => {
        setSortDir(value);
        groupsList.setPage(1);
      },
      toggleSortDir: () => {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        groupsList.setPage(1);
      }
    },
    list: {
      groups: groupsList.items,
      displayGroups,
      total: groupsList.total,
      page: groupsList.page,
      totalPages: groupsList.totalPages,
      query,
      setQuery,
      setPage: groupsList.setPage,
      isLoading: groupsList.isLoading,
      error: groupsList.error,
      reload: groupsList.reload
    },
    permissionsCatalog: allPermissions,
    details: {
      open: isDetailsOpen,
      setOpen: setDetailsOpen,
      group: selectedGroup,
      isLoading: isDetailsLoading,
      error: detailsError
    },
    create: {
      open: isCreateOpen,
      setOpen: setCreateOpen,
      error: createError,
      fieldErrors: createFieldErrors,
      submitPayload: submitCreatePayload
    },
    edit: {
      open: isEditOpen,
      setOpen: setEditOpen,
      group: editingGroup,
      error: editError,
      fieldErrors: editFieldErrors,
      submitPayload: submitEditPayload
    },
    delete: {
      open: isDeleteOpen,
      setOpen: setDeleteOpen,
      group: deletingGroup,
      error: deleteError,
      requestDelete: (row: GroupDto) => {
        setDeleteError(null);
        setDeletingGroup(row);
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
