import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{
    userid: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: Params
) {
  try {
    /*
     * Get currently authenticated user.
     */
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
     * Only ADMIN and SUPERADMIN can access
     * this endpoint.
     */
    if (
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "SUPERADMIN"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /*
     * Get target user ID.
     */
    const { userid } = await params;

    const userId = Number(userid);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    /*
     * Find target user.
     */
    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /*
     * Nobody can modify their own account
     * through this endpoint.
     */
    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        {
          error:
            "You cannot modify your own account.",
        },
        { status: 403 }
      );
    }

    /*
     * SUPERADMIN accounts are protected.
     *
     * Even another SUPERADMIN cannot modify
     * a SUPERADMIN.
     */
    if (targetUser.role === "SUPERADMIN") {
      return NextResponse.json(
        {
          error:
            "SUPERADMIN accounts are protected.",
        },
        { status: 403 }
      );
    }

    /*
     * Read request body.
     *
     * The request can contain either:
     *
     * {
     *   role: "ADMIN"
     * }
     *
     * or:
     *
     * {
     *   role: "USER"
     * }
     *
     * or:
     *
     * {
     *   banned: true
     * }
     */
    const body = await request.json();

    const { role, banned } = body;

    /*
     * Make sure at least one supported
     * property was supplied.
     */
    if (
      role === undefined &&
      banned === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "No valid update provided.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * ROLE CHANGE
     * --------------------------------------------------
     */

    if (role !== undefined) {
      /*
       * Only USER and ADMIN are valid target roles.
       *
       * Nobody can create another SUPERADMIN
       * through this endpoint.
       */
      if (
        role !== "USER" &&
        role !== "ADMIN"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid role.",
          },
          { status: 400 }
        );
      }

      /*
       * ADMIN permissions
       *
       * ADMIN can promote USER -> ADMIN.
       *
       * ADMIN cannot demote ADMIN -> USER.
       */
      if (currentUser.role === "ADMIN") {
        if (
          targetUser.role === "ADMIN" &&
          role === "USER"
        ) {
          return NextResponse.json(
            {
              error:
                "Only SUPERADMIN can demote an admin.",
            },
            { status: 403 }
          );
        }

        /*
         * ADMIN can only modify normal users
         * for role changes.
         */
        if (targetUser.role !== "USER") {
          return NextResponse.json(
            {
              error:
                "Admins can only modify regular users.",
            },
            { status: 403 }
          );
        }

        /*
         * Prevent pointless USER -> USER update.
         */
        if (targetUser.role === role) {
          return NextResponse.json(
            {
              error:
                "User already has this role.",
            },
            { status: 400 }
          );
        }
      }

      /*
       * SUPERADMIN permissions
       *
       * SUPERADMIN can:
       *
       * USER  -> ADMIN
       * ADMIN -> USER
       *
       * SUPERADMIN cannot modify another
       * SUPERADMIN, already checked above.
       */
      if (currentUser.role === "SUPERADMIN") {
        if (
          targetUser.role === role
        ) {
          return NextResponse.json(
            {
              error:
                "User already has this role.",
            },
            { status: 400 }
          );
        }

        if (
          targetUser.role !== "USER" &&
          targetUser.role !== "ADMIN"
        ) {
          return NextResponse.json(
            {
              error:
                "Invalid role transition.",
            },
            { status: 403 }
          );
        }
      }
    }

    /*
     * --------------------------------------------------
     * BAN / UNBAN
     * --------------------------------------------------
     */

    if (banned !== undefined) {
      /*
       * Make sure banned is actually boolean.
       */
      if (typeof banned !== "boolean") {
        return NextResponse.json(
          {
            error:
              "Invalid banned value.",
          },
          { status: 400 }
        );
      }

      /*
       * ADMIN:
       *
       * Can ban/unban USER.
       *
       * Cannot ban/unban ADMIN.
       */
      if (currentUser.role === "ADMIN") {
        if (targetUser.role !== "USER") {
          return NextResponse.json(
            {
              error:
                "Admins can only ban or unban regular users.",
            },
            { status: 403 }
          );
        }
      }

      /*
       * SUPERADMIN:
       *
       * Can ban/unban USER and ADMIN.
       *
       * SUPERADMIN target was already
       * rejected above.
       */
    }

    /*
     * --------------------------------------------------
     * BUILD UPDATE
     * --------------------------------------------------
     */

    const updateData: {
      role?: "USER" | "ADMIN";
      banned?: boolean;
    } = {};

    if (role !== undefined) {
      updateData.role = role;
    }

    if (banned !== undefined) {
      updateData.banned = banned;
    }

    /*
     * Update the user.
     */
    const updatedUser =
      await prisma.user.update({
        where: {
          id: targetUser.id,
        },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          banned: true,
        },
      });

    return NextResponse.json(
      updatedUser
    );
  } catch (error) {
    console.error(
      "ADMIN USER UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update user.",
      },
      { status: 500 }
    );
  }
}