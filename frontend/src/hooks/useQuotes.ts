import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesService } from '@/services/quotes.service';
import type { QuoteFormData, QuoteStatus } from '@/services/quotes.service';

export const quotesKeys = {
  all: ['quotes'] as const,
  list: () => [...quotesKeys.all, 'list'] as const,
  detail: (id: string) => [...quotesKeys.all, 'detail', id] as const,
};

export function useQuotesList() {
  return useQuery({
    queryKey: quotesKeys.list(),
    queryFn: quotesService.getQuotes,
  });
}

export function useQuoteDetail(id: string | null) {
  return useQuery({
    queryKey: id ? quotesKeys.detail(id) : [],
    queryFn: () => quotesService.getQuoteById(id!),
    enabled: !!id,
  });
}

export function useSaveQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuoteFormData) => quotesService.saveQuote(data),
    onSuccess: (savedQuote) => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.list() });
      if (savedQuote.id) {
        queryClient.invalidateQueries({ queryKey: quotesKeys.detail(savedQuote.id) });
      }
    },
  });
}

export function useDeleteQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotesService.deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.list() });
    },
  });
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => 
      quotesService.updateQuoteStatus(id, status),
    onSuccess: (updatedQuote: any) => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.list() });
      if (updatedQuote.id) {
        queryClient.invalidateQueries({ queryKey: quotesKeys.detail(updatedQuote.id) });
      }
    },
  });
}
