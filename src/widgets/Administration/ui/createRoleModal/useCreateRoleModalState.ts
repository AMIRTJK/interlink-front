import * as React from "react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { T } from "../../theme/tokens";
import type { RoleCard, PermModule } from "../../model";
import { buildPermModules, collectEnabledPermNames } from "../../lib/adapters";
import {
  CREATE_ROLE_COLORS,
  countModuleToggles,
} from "./createRoleModalModel";

interface IUseCreateRoleModalStateProps {
  allPermNames: string[];
  roleCards: RoleCard[];
  onClose: () => void;
  onCreated: () => void;
  addToast: (msg: string) => void;
}

export function useCreateRoleModalState({
  allPermNames,
  roleCards,
  onClose,
  onCreated,
  addToast,
}: IUseCreateRoleModalStateProps) {
  const [roleName, setRoleName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [template, setTemplate] = React.useState("empty");
  const [colorId, setColorId] = React.useState<string | null>(null);

  const resolveTemplatePerms = React.useCallback(
    (tpl: string): PermModule[] => {
      if (tpl === "empty") return buildPermModules(allPermNames, []);
      const card = roleCards.find((c) => c.id === tpl);
      return buildPermModules(allPermNames, card ? card.permissionNames : []);
    },
    [allPermNames, roleCards],
  );

  const [perms, setPerms] = React.useState<PermModule[]>(() =>
    resolveTemplatePerms("empty"),
  );
  const [collapsed, setCollapsed] = React.useState<Record<number, boolean>>({});
  const [activeModuleIdx, setActiveModuleIdx] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    setPerms(resolveTemplatePerms(template));
    setCollapsed({});
  }, [template, resolveTemplatePerms]);

  const CREATE_ROLE_TEMPLATES = React.useMemo(
    () => [
      { value: "empty", label: "Пустая роль" },
      ...roleCards.map((r) => ({
        value: r.id,
        label: `На основе «${r.name}»`,
      })),
    ],
    [roleCards],
  );

  const selectedColor =
    CREATE_ROLE_COLORS.find((c) => c.id === colorId) ?? null;
  const accent = selectedColor ? selectedColor.text : T.accent;
  const totalSelected = React.useMemo(
    () => perms.reduce((sum, m) => sum + countModuleToggles(m).active, 0),
    [perms],
  );

  const createRoleM = useMutationQuery({
    url: () => ApiRoutes.CREATE_ROLE,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.GET_ROLES],
    },
  });

  const togglePerm = (mIdx: number, pIdx: number, spIdx: number) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p, pi) =>
                pi !== pIdx
                  ? p
                  : {
                      ...p,
                      subperms: p.subperms
                        ? p.subperms.map((sp, si) =>
                            si !== spIdx ? sp : { ...sp, value: !sp.value },
                          )
                        : p.subperms,
                    },
              ),
            },
      ),
    );
  };

  const setModuleAll = (mIdx: number, val: boolean) => {
    setPerms((prev) =>
      prev.map((m, mi) =>
        mi !== mIdx
          ? m
          : {
              ...m,
              perms: m.perms.map((p) => ({
                ...p,
                subperms: p.subperms
                  ? p.subperms.map((sp) => ({ ...sp, value: val }))
                  : p.subperms,
                children: p.children
                  ? p.children.map((ch) => ({
                      ...ch,
                      subperms: ch.subperms
                        ? ch.subperms.map((csp) => ({ ...csp, value: val }))
                        : ch.subperms,
                    }))
                  : p.children,
              })),
            },
      ),
    );
  };

  const scrollToModule = (mIdx: number) => {
    const el = sectionRefs.current[mIdx];
    const container = scrollRef.current;
    if (el && container)
      container.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    setActiveModuleIdx(mIdx);
  };

  const handleNavScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const top = container.scrollTop;
    let current = 0;
    sectionRefs.current.forEach((el, idx) => {
      if (el && el.offsetTop - 60 <= top) current = idx;
    });
    setActiveModuleIdx(current);
  };

  const handleSubmit = () => {
    if (!roleName.trim()) return;
    createRoleM.mutate(
      {
        name: roleName.trim(),
        description: description.trim(),
        permissions: collectEnabledPermNames(perms),
      },
      {
        onSuccess: () => {
          addToast(`Роль «${roleName.trim()}» создана`);
          onCreated();
          onClose();
        },
      },
    );
  };

  return {
    roleName,
    setRoleName,
    description,
    setDescription,
    template,
    setTemplate,
    colorId,
    setColorId,
    perms,
    setPerms,
    collapsed,
    setCollapsed,
    activeModuleIdx,
    scrollRef,
    sectionRefs,
    CREATE_ROLE_TEMPLATES,
    selectedColor,
    accent,
    totalSelected,
    createRoleM,
    togglePerm,
    setModuleAll,
    scrollToModule,
    handleNavScroll,
    handleSubmit,
  };
}
