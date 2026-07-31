import { useEffect, useMemo, useState } from "react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  IApiDepartment,
  IApiUser,
  IDepartment,
  IUser,
  getGroupByPosition,
} from "./executorStructureModel";

/** Поиск с задержкой, загрузка сотрудников и отделов, группировка по должностям. */
export const useExecutorStructureData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const searchParams = useMemo(() => {
    return debouncedSearch ? { search: debouncedSearch } : {};
  }, [debouncedSearch]);

  // --- API Request ---
  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: searchParams,
  });

  const { data: deptsData, isLoading: loadingDepts } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    params: searchParams,
  });

  // Mappers
  const mappedUsers: IUser[] = useMemo(() => {
    const apiUsers = usersData?.data?.data || [];
    return apiUsers.map((u: IApiUser) => ({
      id: u.id,
      name: u.full_name,
      role: u.position || "Сотрудник",
      avatar: u.photo_path || `https://i.pravatar.cc/150?u=${u.id}`,
      group: getGroupByPosition(u.position),
    }));
  }, [usersData]);

  const mappedDepartments: IDepartment[] = useMemo(() => {
    const apiDepts = deptsData?.data?.data || [];
    return apiDepts.map((d: IApiDepartment) => ({
      id: d.id,
      name: d.name,
    }));
  }, [deptsData]);

  // Grouping
  const groupedUsers = useMemo(() => {
    return {
      management: mappedUsers.filter((u) => u.group === "management"),
      heads: mappedUsers.filter((u) => u.group === "heads"),
      specialists: mappedUsers.filter((u) => u.group === "specialists"),
    };
  }, [mappedUsers]);

  return {
    searchTerm,
    setSearchTerm,
    mappedUsers,
    mappedDepartments,
    groupedUsers,
    isLoading: loadingUsers || loadingDepts,
    isEmpty: mappedUsers.length === 0 && mappedDepartments.length === 0,
  };
};
