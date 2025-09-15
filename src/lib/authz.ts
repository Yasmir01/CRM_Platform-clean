import { getSession } from "./auth";
import { can } from "./rbac";
import { NextResponse } from "next/server";

/**
 * Wraps an API handler with role-based access control
 */
export function withAuthorization(action: string, handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const session = await getSession(req);
    const user = session?.user as any;

    if (!user || !can(user, action)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, ...args);
  };
}
