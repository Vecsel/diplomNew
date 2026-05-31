import { Button } from "@/components/ui/button";
import { AdminListPageLayout } from "@/components/admin/admin-list-page-layout";
import { EmptyState } from "@/components/empty-state";
import { ErrorBanner } from "@/components/error-banner";
import { TableSkeleton } from "@/components/table-skeleton";
import { GroupCreateDialog } from "@/features/groups/components/group-create-dialog";
import { GroupDeleteDialog } from "@/features/groups/components/group-delete-dialog";
import { GroupDetailsSheet } from "@/features/groups/components/group-details-sheet";
import { GroupEditDialog } from "@/features/groups/components/group-edit-dialog";
import { GroupsStatsCards } from "@/features/groups/components/groups-stats-cards";
import { GroupsTable } from "@/features/groups/components/groups-table";
import { GroupsToolbar } from "@/features/groups/components/groups-toolbar";
import { useGroupsPage } from "@/features/groups/hooks/use-groups-page";
import { ru } from "@/lib/i18n/ru";

export function GroupsPage() {
  const { permissions, stats, filters, list, permissionsCatalog, details, create, edit, delete: remove, dialogs, isSaving } =
    useGroupsPage();

  const statsRow = <GroupsStatsCards total={stats.total} />;

  const toolbar = (
    <GroupsToolbar
      query={list.query}
      onQueryChange={list.setQuery}
      disabled={list.isLoading}
      sortKey={filters.sortKey}
      onSortKeyChange={filters.setSortKey}
      sortDir={filters.sortDir}
      onToggleSortDir={filters.toggleSortDir}
      onRefresh={() => void list.reload()}
    />
  );

  const primaryAction = permissions.canCreateGroup ? (
    <Button className="h-11 px-6 shadow-sm" onClick={dialogs.openCreate}>
      {ru.groups.create}
    </Button>
  ) : (
    <Button className="h-11 px-6" disabled title={ru.groups.createNoPerm}>
      {ru.groups.create}
    </Button>
  );

  const listError = list.error && !list.isLoading ? (
    <ErrorBanner message={list.error} onRetry={() => void list.reload()} />
  ) : null;

  const body = list.isLoading ? (
    <TableSkeleton rows={8} columns={5} />
  ) : list.error ? null : list.groups.length === 0 && list.query.trim() ? (
    <EmptyState title={ru.groups.empty.noMatch} description={ru.groups.empty.noMatchDesc} />
  ) : list.groups.length === 0 ? (
    <EmptyState title={ru.groups.empty.none} description={ru.groups.empty.noneDesc} />
  ) : (
    <GroupsTable
      rows={list.displayGroups}
      canReadDetail={permissions.canReadGroupDetail}
      canUpdate={permissions.canUpdateGroup}
      canDelete={permissions.canDeleteGroup}
      onRowOpen={dialogs.openDetails}
      onEdit={dialogs.openEdit}
      onDeleteRequest={remove.requestDelete}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
    />
  );

  const handleEditFromSheet = () => {
    const g = details.group;
    if (!g) return;
    details.setOpen(false);
    dialogs.openEdit(g);
  };

  return (
    <>
      <AdminListPageLayout
        title={ru.groups.pageTitle}
        description={ru.groups.pageDescription}
        actions={primaryAction}
        stats={statsRow}
        toolbar={toolbar}
        listError={listError}
      >
        {body}
      </AdminListPageLayout>

      <GroupDetailsSheet
        open={details.open}
        onOpenChange={details.setOpen}
        group={details.group}
        isLoading={details.isLoading}
        error={details.error}
        canUpdate={permissions.canUpdateGroup}
        onEdit={handleEditFromSheet}
      />

      <GroupCreateDialog
        open={create.open}
        onOpenChange={create.setOpen}
        apiError={create.error}
        apiFieldErrors={create.fieldErrors}
        isSaving={isSaving}
        canSubmit={permissions.canCreateGroup}
        allPermissions={permissionsCatalog}
        onSave={(values) => void create.submitPayload(values)}
      />

      <GroupEditDialog
        open={edit.open}
        onOpenChange={edit.setOpen}
        group={edit.group}
        apiError={edit.error}
        apiFieldErrors={edit.fieldErrors}
        isSaving={isSaving}
        canSubmit={permissions.canUpdateGroup}
        allPermissions={permissionsCatalog}
        onSave={(values) => void edit.submitPayload(values)}
      />

      <GroupDeleteDialog
        open={remove.open}
        onOpenChange={remove.setOpen}
        group={remove.group}
        apiError={remove.error}
        isSaving={isSaving}
        canDelete={permissions.canDeleteGroup}
        onConfirm={() => void remove.submit()}
      />
    </>
  );
}
