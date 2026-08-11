"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserActionsProps = {
  userId: number;
  currentRole: string;
  isCurrentUser: boolean;
  isBanned: boolean;
  currentUserRole: string;
};

export default function UserActions({
  userId,
  currentRole,
  isCurrentUser,
  isBanned,
  currentUserRole,
}: UserActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  /*
   * --------------------------------------------------
   * ROLE PERMISSIONS
   * --------------------------------------------------
   *
   * SUPERADMIN:
   *   USER  -> ADMIN
   *   ADMIN -> USER
   *   Cannot modify SUPERADMIN
   *
   * ADMIN:
   *   USER  -> ADMIN
   *   Cannot modify ADMIN
   *   Cannot modify SUPERADMIN
   *
   * Nobody can modify their own account.
   */

  const canChangeRole =
    !isCurrentUser &&
    currentRole !== "SUPERADMIN" &&
    (
      // Admin can promote USER
      (
        currentUserRole === "ADMIN" &&
        currentRole === "USER"
      ) ||
      // Superadmin can promote USER or demote ADMIN
      (
        currentUserRole === "SUPERADMIN" &&
        (
          currentRole === "USER" ||
          currentRole === "ADMIN"
        )
      )
    );

  /*
   * --------------------------------------------------
   * BAN PERMISSIONS
   * --------------------------------------------------
   *
   * SUPERADMIN:
   *   Can ban/unban USER and ADMIN
   *
   * ADMIN:
   *   Can ban/unban USER
   *   Cannot ban ADMIN
   *
   * SUPERADMIN cannot be banned.
   */

  const canBan =
    !isCurrentUser &&
    currentRole !== "SUPERADMIN" &&
    (
      // ADMIN can only ban USER
      (
        currentUserRole === "ADMIN" &&
        currentRole === "USER"
      ) ||
      // SUPERADMIN can ban USER or ADMIN
      (
        currentUserRole === "SUPERADMIN" &&
        (
          currentRole === "USER" ||
          currentRole === "ADMIN"
        )
      )
    );

  /*
   * --------------------------------------------------
   * CHANGE ROLE
   * --------------------------------------------------
   */

  async function changeRole() {
    const newRole =
      currentRole === "USER"
        ? "ADMIN"
        : "USER";

    const confirmed = window.confirm(
      `Change ${currentRole} to ${newRole}?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to update user role"
        );
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * BAN / UNBAN
   * --------------------------------------------------
   */

  async function toggleBan() {
    const action = isBanned
      ? "unban"
      : "ban";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            banned: !isBanned,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            `Failed to ${action} user`
        );
        return;
      }

      router.refresh();
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /*
   * --------------------------------------------------
   * PROTECTED ACCOUNTS
   * --------------------------------------------------
   */

  if (isCurrentUser) {
    return (
      <span className="text-xs text-gray-600">
        Current account
      </span>
    );
  }

  if (currentRole === "SUPERADMIN") {
    return (
      <span className="text-xs text-gray-600">
        Protected
      </span>
    );
  }

  /*
   * --------------------------------------------------
   * ACTION BUTTONS
   * --------------------------------------------------
   */

  return (
    <div className="flex flex-wrap gap-2">
      {/* Role action */}
      {canChangeRole && (
        <button
          type="button"
          onClick={changeRole}
          disabled={loading}
          className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Updating..."
            : currentRole === "ADMIN"
              ? "Remove Admin"
              : "Make Admin"}
        </button>
      )}

      {/* Ban action */}
      {canBan && (
        <button
          type="button"
          onClick={toggleBan}
          disabled={loading}
          className={
            isBanned
              ? "rounded-lg border border-green-500/30 px-3 py-2 text-sm text-green-400 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              : "rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {loading
            ? "Updating..."
            : isBanned
              ? "Unban"
              : "Ban"}
        </button>
      )}

      {/* No available actions */}
      {!canChangeRole && !canBan && (
        <span className="text-xs text-gray-600">
          No actions available
        </span>
      )}
    </div>
  );
}