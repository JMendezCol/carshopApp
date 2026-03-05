import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateVehicleRequest, type UpdateVehicleRequest } from "@shared/routes";

function parseWithLogging<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useVehicles() {
  return useQuery({
    queryKey: [api.vehicles.list.path],
    queryFn: async () => {
      const res = await fetch(api.vehicles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      const data = await res.json();
      return parseWithLogging(api.vehicles.list.responses[200], data, "vehicles.list");
    },
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: [api.vehicles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.vehicles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      const data = await res.json();
      return parseWithLogging(api.vehicles.get.responses[200], data, "vehicles.get");
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateVehicleRequest) => {
      const res = await fetch(api.vehicles.create.path, {
        method: api.vehicles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create vehicle");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateVehicleRequest) => {
      const url = buildUrl(api.vehicles.update.path, { id });
      const res = await fetch(url, {
        method: api.vehicles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update vehicle");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.vehicles.delete.path, { id });
      const res = await fetch(url, { method: api.vehicles.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete vehicle");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.vehicles.list.path] }),
  });
}
