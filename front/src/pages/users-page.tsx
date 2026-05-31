import { Button } from "@/components/ui/button";
import { AdminListPageLayout } from "@/components/admin/admin-list-page-layout";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { TableSkeleton } from "@/components/table-skeleton";
import { UserCreateDialog } from "@/features/users/components/user-create-dialog";
import { UserDeleteDialog } from "@/features/users/components/user-delete-dialog";
import { UserDetailsSheet } from "@/features/users/components/user-details-sheet";
import { UserEditDialog } from "@/features/users/components/user-edit-dialog";
import { UsersStatsCards } from "@/features/users/components/users-stats-cards";
import { UsersTable } from "@/features/users/components/users-table";
import { UsersToolbar } from "@/features/users/components/users-toolbar";
import { useUsersPage } from "@/features/users/hooks/use-users-page";
import { ru } from "@/lib/i18n/ru";

export function UsersPage() {
  const { permissions, stats, filters, list, details, create, edit, delete: remove, dialogs, isSaving } = useUsersPage();

  const statsRow = (
    <UsersStatsCards
      total={stats.data?.totalUsers}
      active={stats.data?.activeUsers}
      administrators={stats.data?.adminUsers}
      isLoading={stats.isLoading}
      error={stats.error}
      onRetry={() => void stats.reload()}
    />
  );

  const toolbar = (
    <UsersToolbar
      query={list.query}
      onQueryChange={list.setQuery}
      disabled={list.isLoading}
      status={filters.status}
      onStatusChange={filters.setStatus}
      sortKey={filters.sortKey}
      onSortKeyChange={filters.setSortKey}
      sortDir={filters.sortDir}
      onToggleSortDir={filters.toggleSortDir}
      onRefresh={() => {
        void Promise.all([list.reload(), stats.reload()]);
      }}
    />
  );

  const primaryAction = permissions.canCreateUser ? (
    <Button className="h-11 px-6 shadow-sm" onClick={dialogs.openCreate}>
      {ru.users.create}
    </Button>
  ) : (
    <Button className="h-11 px-6" disabled title={ru.users.createNoPerm}>
      {ru.users.create}
    </Button>
  );

  const listError = list.error && !list.isLoading ? (
    <ErrorBanner message={list.error} onRetry={() => void list.reload()} />
  ) : null;

  const body = list.isLoading ? (
    <TableSkeleton rows={8} columns={6} />
  ) : list.error ? null : list.users.length === 0 && (list.query.trim() || list.status !== "all") ? (
    <EmptyState title={ru.users.empty.noMatch} description={ru.users.empty.noMatchDesc} />
  ) : list.users.length === 0 ? (
    <EmptyState title={ru.users.empty.none} description={ru.users.empty.noneDesc} />
  ) : (
    <UsersTable
      rows={list.displayUsers}
      rowGroups={details.groupsForRow}
      canReadDetail={permissions.canReadUserDetail}
      canUpdate={permissions.canUpdateUser}
      canDelete={permissions.canDeleteUser}
      onRowOpen={dialogs.openDetails}
      onEdit={dialogs.openEdit}
      onDeleteRequest={remove.requestDelete}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
    />
  );

  const handleEditFromSheet = () => {
    const row = details.user;
    if (!row) return;
    details.setOpen(false);
    dialogs.openEdit(row);
  };

  return (
    <>
      <AdminListPageLayout
        title={ru.users.pageTitle}
        description={ru.users.pageDescription}
        actions={primaryAction}
        stats={statsRow}
        toolbar={toolbar}
        listError={listError}
      >
        {body}
      </AdminListPageLayout>

      <UserDetailsSheet
        open={details.open}
        onOpenChange={details.setOpen}
        user={details.user}
        isLoading={details.isLoading}
        error={details.error}
        groups={details.groups}
        canUpdate={permissions.canUpdateUser}
        onEdit={handleEditFromSheet}
      />

      <UserCreateDialog
        open={create.open}
        onOpenChange={create.setOpen}
        apiError={create.error}
        apiFieldErrors={create.fieldErrors}
        isSaving={isSaving}
        canSubmit={permissions.canCreateUser}
        onSearchGroups={create.searchGroups}
        onLoadGroupsByIds={create.loadGroupsByIds}
        onSave={(values) => void create.submitPayload(values)}
      />

      <UserEditDialog
        open={edit.open}
        onOpenChange={edit.setOpen}
        user={edit.user}
        apiError={edit.error}
        apiFieldErrors={edit.fieldErrors}
        isSaving={isSaving}
        canSubmit={permissions.canUpdateUser}
        onSearchGroups={edit.searchGroups}
        onLoadGroupsByIds={edit.loadGroupsByIds}
        onSave={(values) => void edit.submitPayload(values)}
      />

      <UserDeleteDialog
        open={remove.open}
        onOpenChange={remove.setOpen}
        user={remove.user}
        apiError={remove.error}
        isSaving={isSaving}
        canDelete={permissions.canDeleteUser}
        onConfirm={() => void remove.submit()}
      />
    </>
  );
}
