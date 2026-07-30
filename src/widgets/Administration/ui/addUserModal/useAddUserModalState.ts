import * as React from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import type { ExtUser } from "../../model";
import { adaptExtUser, unwrapList } from "../../lib/adapters";
import {
  type AddUserEmployeeTab,
  type SelectedEmployee,
  type UserFormData,
  emptyFormData,
  buildFormDataFromExtUser,
} from "./addUserModalModel";

interface IUseAddUserModalStateProps {
  onClose: () => void;
  allRoleNames: string[];
  existingUsers: ExtUser[];
  addToast: (msg: string) => void;
}

export function useAddUserModalState({
  onClose,
  allRoleNames,
  existingUsers,
  addToast,
}: IUseAddUserModalStateProps) {
  const defaultRole = allRoleNames[0] ?? "";
  const [employeeTab, setEmployeeTab] =
    React.useState<AddUserEmployeeTab>("existing");
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<SelectedEmployee | null>(null);
  const [formData, setFormData] = React.useState<UserFormData>(
    emptyFormData(defaultRole),
  );
  const [isAutofilled, setIsAutofilled] = React.useState(false);
  const [showFields, setShowFields] = React.useState(false);
  const [existingSearch, setExistingSearch] = React.useState("");
  const [existingDropdownOpen, setExistingDropdownOpen] = React.useState(false);
  const existingDropRef = React.useRef<HTMLDivElement>(null);
  const [newFio, setNewFio] = React.useState("");
  const [newSearchResult, setNewSearchResult] = React.useState<
    "idle" | "found" | "notfound"
  >("idle");
  const [newSearching, setNewSearching] = React.useState(false);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        existingDropRef.current &&
        !existingDropRef.current.contains(e.target as Node)
      )
        setExistingDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: deptsData } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });
  const { data: orgsData } = useGetQuery({
    url: ApiRoutes.GET_ORGANIZATIONS,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });
  const departments = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(deptsData),
    [deptsData],
  );
  const organizations = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(orgsData),
    [orgsData],
  );

  const { data: searchData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: { search: existingSearch, per_page: "8" },
    options: {
      enabled: employeeTab === "existing" && existingDropdownOpen,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  });
  const searchResults = React.useMemo(() => {
    const raw = unwrapList<IAdminUser>(searchData).map(adaptExtUser);
    if (raw.length) return raw.slice(0, 8);
    if (!existingSearch.trim()) return existingUsers.slice(0, 8);
    const q = existingSearch.toLowerCase();
    return existingUsers
      .filter(
        (u) =>
          u.fio.toLowerCase().includes(q) ||
          u.position.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchData, existingSearch, existingUsers]);

  const createUserM = useMutationQuery({
    url: () => ApiRoutes.CREATE_USER,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });
  const setUserRolesM = useMutationQuery({
    url: () => ApiRoutes.SET_USER_ROLES,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const selectExistingEmployee = (u: ExtUser) => {
    setSelectedEmployee({ source: "existing", user: u });
    setExistingSearch(u.fio);
    setExistingDropdownOpen(false);
    setFormData(buildFormDataFromExtUser(u, defaultRole));
    setIsAutofilled(true);
    setShowFields(true);
  };

  const handleNewSearch = () => {
    if (!newFio.trim()) return;
    setNewSearching(true);
    _axios
      .get(ApiRoutes.GET_USERS, { params: { search: newFio, per_page: 5 } })
      .then((res) => {
        const found = unwrapList<IAdminUser>(res.data).map(adaptExtUser)[0];
        setNewSearching(false);
        if (found) {
          setNewSearchResult("found");
          selectExistingEmployee(found);
        } else {
          setNewSearchResult("notfound");
          setSelectedEmployee({ source: "new", fio: newFio.trim() });
          setFormData({ ...emptyFormData(defaultRole), fio: newFio.trim() });
          setIsAutofilled(false);
          setShowFields(true);
        }
      })
      .catch(() => {
        setNewSearching(false);
        setNewSearchResult("notfound");
        setSelectedEmployee({ source: "new", fio: newFio.trim() });
        setFormData({ ...emptyFormData(defaultRole), fio: newFio.trim() });
        setIsAutofilled(false);
        setShowFields(true);
      });
  };

  const setField = (key: keyof UserFormData, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const canSubmit = selectedEmployee !== null && formData.fio.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit || !selectedEmployee) return;
    if (selectedEmployee.source === "existing") {
      setUserRolesM.mutate(
        {
          user_id: Number(selectedEmployee.user.id),
          roles: Array.from(
            new Set([...selectedEmployee.user.roles, formData.role]),
          ),
        },
        {
          onSuccess: () => {
            addToast(`Роль назначена · ${formData.fio}`);
            onClose();
          },
        },
      );
    } else {
      const parts = formData.fio.trim().split(/\s+/);
      const last_name = parts[0] ?? "";
      const first_name = parts.slice(1).join(" ") || last_name;
      const dept = departments.find((d) => d.name === formData.department);
      createUserM.mutate(
        {
          last_name,
          first_name,
          phone: formData.phone,
          position: formData.position,
          organization_id: organizations[0]?.id,
          department_id: dept?.id,
          roles: [formData.role],
        },
        {
          onSuccess: () => {
            addToast(`Пользователь добавлен · ${formData.fio}`);
            onClose();
          },
        },
      );
    }
  };

  const switchTab = (tab: AddUserEmployeeTab) => {
    setEmployeeTab(tab);
    setSelectedEmployee(null);
    setFormData(emptyFormData(defaultRole));
    setIsAutofilled(false);
    setShowFields(false);
    setExistingSearch("");
    setExistingDropdownOpen(false);
    setNewFio("");
    setNewSearchResult("idle");
  };

  const supervisorOptions = React.useMemo(
    () => existingUsers.map((u) => u.fio),
    [existingUsers],
  );

  return {
    defaultRole,
    employeeTab,
    selectedEmployee,
    setSelectedEmployee,
    formData,
    setFormData,
    isAutofilled,
    showFields,
    setShowFields,
    existingSearch,
    setExistingSearch,
    existingDropdownOpen,
    setExistingDropdownOpen,
    existingDropRef,
    newFio,
    setNewFio,
    newSearchResult,
    newSearching,
    departments,
    organizations,
    searchResults,
    createUserM,
    setUserRolesM,
    selectExistingEmployee,
    handleNewSearch,
    setField,
    canSubmit,
    handleSubmit,
    switchTab,
    supervisorOptions,
  };
}
