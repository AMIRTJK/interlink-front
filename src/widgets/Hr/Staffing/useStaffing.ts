import { useState, useMemo, useCallback } from "react";
import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import {
  ISubOrganization,
  IEmployee,
  IStaffingDepartment,
  IStaffingPosition,
  TStaffingViewMode,
  IAssignModalTarget,
  normalizeStaffingStructure,
  ORG_COLORS,
  resolvePhotoUrl,
} from "./model";

export const useStaffing = () => {
  // Fetch structure
  const { data: structureData, isLoading: isStructureLoading } = useGetQuery({
    url: ApiRoutes.GET_STAFFING_STRUCTURE,
    useToken: true,
  });

  const organizations = useMemo<ISubOrganization[]>(() => {
    return normalizeStaffingStructure(structureData?.data || structureData);
  }, [structureData]);

  // Fetch employees list for pickers
  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  const employees = useMemo<IEmployee[]>(() => {
    const raw = (usersData?.data?.data || usersData?.data || usersData || []) as any[];
    return raw.map((u: any) => ({
      id: u.id,
      firstName: u.first_name || "",
      lastName: u.last_name || "",
      patronymic: u.middle_name || "",
      position: u.position || "—",
      department: u.departments?.[0]?.name || "—",
      status: u.hr_status || "active",
      email: u.corporate_email || u.email || "",
      phone: u.corporate_phone || u.phone || "",
      salary: u.salary ? Number(u.salary) : 0,
      avatarColor: ORG_COLORS[u.id % ORG_COLORS.length],
      avatarInitials: `${u.last_name?.[0] || ""}${u.first_name?.[0] || ""}`.toUpperCase() || "??",
      avatarPhoto: resolvePhotoUrl(u.photo_path),
      rating: u.rating || 0,
    }));
  }, [usersData]);

  // Mutations
  const addOrgM = useMutationQuery({
    url: ApiRoutes.CREATE_SUB_ORGANIZATION,
    method: "POST",
    messages: {
      success: "Подорганизация создана",
      invalidate: [ApiRoutes.GET_STAFFING_STRUCTURE],
    },
  });

  const addPositionM = useMutationQuery({
    url: ApiRoutes.CREATE_STAFFING_POSITION,
    method: "POST",
    messages: {
      success: "Позиция создана",
      invalidate: [ApiRoutes.GET_STAFFING_STRUCTURE],
    },
  });

  const assignEmployeesM = useMutationQuery({
    url: (d: { id: number; user_ids: number[] }) =>
      ApiRoutes.ASSIGN_POSITION_EMPLOYEES.replace(":id", String(d.id)),
    method: "PUT",
    messages: {
      success: "Сотрудники назначены",
      invalidate: [ApiRoutes.GET_STAFFING_STRUCTURE],
    },
  });

  // UI States
  const [viewMode, setViewMode] = useState<TStaffingViewMode>("list");
  const [search, setSearch] = useState("");
  const [addOrgOpen, setAddOrgOpen] = useState(false);
  const [addDeptOrgId, setAddDeptOrgId] = useState<number | null>(null);
  const [addPositionTarget, setAddPositionTarget] = useState<{ orgId: number; deptId: number } | null>(null);
  
  const [assignTarget, setAssignTarget] = useState<IAssignModalTarget | null>(null);
  
  const [editOrgTarget, setEditOrgTarget] = useState<ISubOrganization | null>(null);
  const [editDeptTarget, setEditDeptTarget] = useState<{ orgId: number; dept: IStaffingDepartment } | null>(null);

  // Totals calculations
  const allTotals = useMemo(() => {
    let totalPositions = 0,
      totalSlots = 0,
      totalOccupied = 0,
      totalVacant = 0,
      totalFot = 0;

    organizations.forEach((org) =>
      org.departments.forEach((dept) =>
        dept.positions.forEach((pos) => {
          totalPositions++;
          totalSlots += pos.slots;
          totalOccupied += pos.occupied;
          totalVacant += pos.vacant;
          totalFot += pos.salary * pos.slots;
        })
      )
    );

    return { totalPositions, totalSlots, totalOccupied, totalVacant, totalFot };
  }, [organizations]);

  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return organizations;
    const q = search.toLowerCase();
    return organizations
      .map((org) => ({
        ...org,
        departments: org.departments
          .map((d) => ({
            ...d,
            positions: d.positions.filter((p) => p.name.toLowerCase().includes(q)),
          }))
          .filter((d) => d.name.toLowerCase().includes(q) || d.positions.length > 0),
      }))
      .filter((org) => org.name.toLowerCase().includes(q) || org.departments.length > 0);
  }, [organizations, search]);

  const currentAssignedIds = useMemo(() => {
    if (!assignTarget) return [];
    const org = organizations.find((o) => o.id === assignTarget.orgId);
    const dept = org?.departments.find((d) => d.id === assignTarget.deptId);
    const pos = dept?.positions.find((p) => p.id === assignTarget.posId);
    return pos ? pos.assignedEmployees.map((ae) => ae.id) : [];
  }, [assignTarget, organizations]);

  const currentAssignSlots = useMemo(() => {
    if (!assignTarget) return 1;
    const org = organizations.find((o) => o.id === assignTarget.orgId);
    const dept = org?.departments.find((d) => d.id === assignTarget.deptId);
    const pos = dept?.positions.find((p) => p.id === assignTarget.posId);
    return pos?.slots ?? 1;
  }, [assignTarget, organizations]);

  // Operations
  const handleAddOrg = useCallback(
    (name: string, shortName: string, type: string, isMain: boolean, curatorName: string, curatorId?: number | null) => {
      addOrgM.mutate({
        organization_id: 1, // Default main organization
        name,
        short_name: shortName,
        type,
        color: ORG_COLORS[organizations.length % ORG_COLORS.length],
        is_main: isMain,
        sort_order: organizations.length,
        curator_user_id: curatorId || undefined,
      }, {
        onSuccess: () => setAddOrgOpen(false),
      });
    },
    [organizations.length, addOrgM]
  );

  const handleAddPosition = useCallback(
    (orgId: number, deptId: number, pos: Omit<IStaffingPosition, "id">) => {
      addPositionM.mutate({
        organization_id: 1,
        sub_organization_id: orgId,
        department_id: deptId,
        name: pos.name,
        slots: pos.slots,
        salary: pos.salary,
        sort_order: 0,
      }, {
        onSuccess: () => setAddPositionTarget(null),
      });
    },
    [addPositionM]
  );

  const handleAssignEmployee = useCallback(
    (orgId: number, deptId: number, posId: number, emp: IEmployee) => {
      const newUserIds = [...currentAssignedIds, emp.id];
      assignEmployeesM.mutate({
        id: posId,
        user_ids: newUserIds,
      });
    },
    [currentAssignedIds, assignEmployeesM]
  );

  const handleUnassignEmployee = useCallback(
    (orgId: number, deptId: number, posId: number, empId: number) => {
      const newUserIds = currentAssignedIds.filter((id) => id !== empId);
      assignEmployeesM.mutate({
        id: posId,
        user_ids: newUserIds,
      });
    },
    [currentAssignedIds, assignEmployeesM]
  );

  return {
    state: {
      organizations,
      employees,
      isLoading: isStructureLoading,
      viewMode, setViewMode,
      search, setSearch,
      addOrgOpen, setAddOrgOpen,
      addDeptOrgId, setAddDeptOrgId,
      addPositionTarget, setAddPositionTarget,
      assignTarget, setAssignTarget,
      editOrgTarget, setEditOrgTarget,
      editDeptTarget, setEditDeptTarget,
      allTotals,
      filteredOrgs,
      currentAssignedIds,
      currentAssignSlots,
    },
    methods: {
      handleAddOrg,
      handleAddPosition,
      handleAssignEmployee,
      handleUnassignEmployee,
    },
  };
};
