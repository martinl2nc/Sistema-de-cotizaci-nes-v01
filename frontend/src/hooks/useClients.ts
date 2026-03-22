import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  getActiveClients,
  createClient,
  updateClient,
  toggleClientActive,
  deleteClient,
} from '@/services/clients.service';
import type { ClientFormData } from '@/services/clients.service';

// ─── Query Keys ──────────────────────────────────────────────

export const clientsKeys = {
  all: () => ['clients'] as const,
  list: () => [...clientsKeys.all(), 'list'] as const,
  active: () => [...clientsKeys.all(), 'active'] as const,
};

// ─── Queries ─────────────────────────────────────────────────

export const useClientsList = () => {
  return useQuery({
    queryKey: clientsKeys.list(),
    queryFn: getClients,
  });
};

export const useActiveClientsList = () => {
  return useQuery({
    queryKey: clientsKeys.active(),
    queryFn: getActiveClients,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

// ─── Mutations ───────────────────────────────────────────────

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientFormData) => createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.list() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.active() });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.list() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.active() });
    },
  });
};

export const useToggleClientActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      toggleClientActive(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.list() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.active() });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsKeys.list() });
      queryClient.invalidateQueries({ queryKey: clientsKeys.active() });
    },
  });
};
