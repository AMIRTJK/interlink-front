import * as React from "react";
import { X, Check } from "lucide-react";
import { T, cancelBtnStyle } from "../theme/tokens";
import type { ExtUser } from "../model";
import { useAddUserModalState } from "./addUserModal/useAddUserModalState";
import { AddUserEmployeeSelection } from "./addUserModal/AddUserEmployeeSelection";
import { AddUserFormFields } from "./addUserModal/AddUserFormFields";

export function AddUserModal({
  onClose,
  allRoleNames,
  existingUsers,
  addToast,
}: {
  onClose: () => void;
  allRoleNames: string[];
  existingUsers: ExtUser[];
  addToast: (msg: string) => void;
}) {
  const {
    employeeTab,
    selectedEmployee,
    formData,
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
    setFormData,
  } = useAddUserModalState({
    onClose,
    allRoleNames,
    existingUsers,
    addToast,
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "backdropIn 0.18s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          borderRadius: 10,
          boxShadow: T.shadowXl,
          animation: "modalFadeIn 0.2s ease-out forwards",
          width: 700,
          height: showFields ? "auto" : 480,
          minHeight: showFields ? 550 : "auto",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: T.font,
          margin: "0 16px",
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            height: 64,
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Добавление пользователя
          </h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.textSecondary,
              cursor: "pointer",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                T.hoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "transparent";
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: showFields ? "auto" : "hidden",
            padding: "22px 24px",
          }}
        >
          <AddUserEmployeeSelection
            employeeTab={employeeTab}
            onSwitchTab={switchTab}
            existingDropRef={existingDropRef}
            existingDropdownOpen={existingDropdownOpen}
            onOpenExistingDropdown={() => setExistingDropdownOpen(true)}
            existingSearch={existingSearch}
            onExistingSearchChange={(val) => {
              setExistingSearch(val);
              setExistingDropdownOpen(true);
            }}
            onClearExistingSearch={() => {
              setExistingSearch("");
              setExistingDropdownOpen(false);
              setShowFields(false);
            }}
            searchResults={searchResults}
            selectedEmployee={selectedEmployee}
            onSelectExistingEmployee={selectExistingEmployee}
            newFio={newFio}
            onNewFioChange={setNewFio}
            onNewSearch={handleNewSearch}
            newSearching={newSearching}
            newSearchResult={newSearchResult}
          />

          {showFields && (
            <AddUserFormFields
              formData={formData}
              setField={setField}
              isAutofilled={isAutofilled}
              departments={departments}
              allRoleNames={allRoleNames}
              supervisorOptions={supervisorOptions}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: "0 24px",
            height: 60,
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: T.surface,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: T.textSecondary,
              fontWeight: 500,
              minWidth: 0,
            }}
          >
            {selectedEmployee ? (
              <span
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#EFF6FF",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: T.accent,
                    flexShrink: 0,
                  }}
                >
                  {formData.fio
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span style={{ fontWeight: 600, color: T.textPrimary }}>
                  {formData.fio || "—"}
                </span>
              </span>
            ) : (
              <span style={{ color: "#94A3B8" }}>Сотрудник не выбран</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={onClose} style={cancelBtnStyle}>
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !canSubmit || createUserM.isPending || setUserRolesM.isPending
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 20px",
                height: 36,
                borderRadius: 8,
                border: "none",
                background: canSubmit ? T.accent : T.border,
                color: canSubmit ? "#fff" : T.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontFamily: T.font,
                boxShadow: canSubmit ? `0 2px 8px ${T.accent}35` : "none",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
            >
              <Check size={14} />
              <span>Добавить пользователя</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
