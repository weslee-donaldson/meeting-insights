export const VALID_SCOPES = [
  "meetings:read",
  "meetings:write",
  "search:execute",
  "threads:read",
  "threads:write",
  "insights:read",
  "insights:write",
  "milestones:read",
  "milestones:write",
  "notes:read",
  "notes:write",
  "admin",
] as const;

export type Scope = (typeof VALID_SCOPES)[number];

export function isValidScope(s: string): s is Scope {
  return (VALID_SCOPES as readonly string[]).includes(s);
}

export interface AuthIdentity {
  tenantId: string;
  userId: string;
  scopes: Scope[];
}

interface RouteRule {
  methods: string[];
  prefix: string;
  suffix?: string;
  scope: Scope;
}

const ROUTE_RULES: RouteRule[] = [
  { methods: ["GET", "DELETE"], prefix: "/api/meetings/", suffix: "/messages", scope: "meetings:write" },
  { methods: ["GET"], prefix: "/api/debug", scope: "admin" },
  { methods: ["POST"], prefix: "/api/re-embed", scope: "admin" },
  { methods: ["GET"], prefix: "/api/clients", scope: "meetings:read" },
  { methods: ["GET"], prefix: "/api/default-client", scope: "meetings:read" },
  { methods: ["GET"], prefix: "/api/templates", scope: "meetings:read" },
  { methods: ["GET"], prefix: "/api/meetings", scope: "meetings:read" },
  { methods: ["POST", "PUT", "PATCH", "DELETE"], prefix: "/api/meetings", scope: "meetings:write" },
  { methods: ["GET", "POST"], prefix: "/api/chat", scope: "search:execute" },
  { methods: ["GET"], prefix: "/api/search", scope: "search:execute" },
  { methods: ["POST"], prefix: "/api/deep-search", scope: "search:execute" },
  { methods: ["GET"], prefix: "/api/threads", scope: "threads:read" },
  { methods: ["POST", "PUT", "DELETE"], prefix: "/api/threads", scope: "threads:write" },
  { methods: ["GET"], prefix: "/api/insights", scope: "insights:read" },
  { methods: ["POST", "PUT", "DELETE"], prefix: "/api/insights", scope: "insights:write" },
  { methods: ["GET"], prefix: "/api/milestones", scope: "milestones:read" },
  { methods: ["POST", "PUT", "DELETE"], prefix: "/api/milestones", scope: "milestones:write" },
  { methods: ["GET"], prefix: "/api/notes", scope: "notes:read" },
  { methods: ["POST", "PATCH", "DELETE"], prefix: "/api/notes", scope: "notes:write" },
];

export function scopesForRoute(method: string, path: string): Scope[] {
  const upperMethod = method.toUpperCase();
  for (const rule of ROUTE_RULES) {
    if (!rule.methods.includes(upperMethod)) continue;
    if (rule.suffix) {
      if (path.startsWith(rule.prefix) && path.endsWith(rule.suffix)) {
        return [rule.scope];
      }
      continue;
    }
    if (path === rule.prefix || path.startsWith(rule.prefix + "/") || path.startsWith(rule.prefix + "?")) {
      return [rule.scope];
    }
  }
  return [];
}
