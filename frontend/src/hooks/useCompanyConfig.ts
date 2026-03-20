import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanyConfig,
  saveCompanyConfig,
} from '@/services/companyConfig.service';
import type { CompanyConfigFormData } from '@/services/companyConfig.service';

// ─── Query Keys ──────────────────────────────────────────────

export const companyConfigKeys = {
  all: () => ['companyConfig'] as const,
  detail: () => [...companyConfigKeys.all(), 'detail'] as const,
};

// ─── Queries ─────────────────────────────────────────────────

export const useCompanyConfig = () => {
  return useQuery({
    queryKey: companyConfigKeys.detail(),
    queryFn: getCompanyConfig,
  });
};

// ─── Mutations ───────────────────────────────────────────────

export const useSaveCompanyConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | null; data: CompanyConfigFormData }) =>
      saveCompanyConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyConfigKeys.detail() });
    },
  });
};
