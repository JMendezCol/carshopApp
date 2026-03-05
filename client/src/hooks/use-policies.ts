import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreatePolicyRequest, type UpdatePolicyRequest } from "@shared/routes";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function usePolicies() {
  return useQuery({
    queryKey: [api.policies.list.path],
    queryFn: async () => {
      const res = await fetch(api.policies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch policies");
      const data = await res.json();
      return parseWithLogging(api.policies.list.responses[200], data, "policies.list");
    },
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePolicyRequest) => {
      const res = await fetch(api.policies.create.path, {
        method: api.policies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create policy");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.policies.list.path] }),
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdatePolicyRequest) => {
      const url = buildUrl(api.policies.update.path, { id });
      const res = await fetch(url, {
        method: api.policies.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update policy");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.policies.list.path] }),
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.policies.delete.path, { id });
      const res = await fetch(url, { method: api.policies.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete policy");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.policies.list.path] }),
  });
}
