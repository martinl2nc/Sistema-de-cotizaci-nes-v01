import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesService } from '@/services/quotes.service';
import type { QuoteFormData, QuoteStatus, Quote } from '@/services/quotes.service';
import { sendQuoteToWebhook } from '@/services/webhook.service';
import type { SendQuoteWebhookParams } from '@/services/webhook.service';

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

    // Optimistic update: immediately reflect the change in cache
    onMutate: async ({ id, status }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: quotesKeys.list() });

      // Snapshot the previous list for rollback
      const previousQuotes = queryClient.getQueryData<Quote[]>(quotesKeys.list());

      // Optimistically update the cache
      queryClient.setQueryData<Quote[]>(quotesKeys.list(), (old) =>
        old?.map(q => q.id === id ? { ...q, estado: status } : q) ?? []
      );

      return { previousQuotes };
    },

    // Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previousQuotes) {
        queryClient.setQueryData(quotesKeys.list(), context.previousQuotes);
      }
    },

    // Always refetch after settle to ensure server state is in sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.list() });
    },
  });
}

export function useUpdateQuoteFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      quotesService.updateQuoteFollowup(id, value),
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey: quotesKeys.list() });
      const previousQuotes = queryClient.getQueryData<Quote[]>(quotesKeys.list());
      queryClient.setQueryData<Quote[]>(quotesKeys.list(), (old) =>
        old?.map(q => q.id === id ? { ...q, seguimiento_automatico: value } : q) ?? []
      );
      return { previousQuotes };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQuotes) {
        queryClient.setQueryData(quotesKeys.list(), context.previousQuotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: quotesKeys.list() });
    },
  });
}

export function useSendQuoteWebhook() {
  return useMutation({
    mutationFn: (params: SendQuoteWebhookParams) => sendQuoteToWebhook(params),
  });
}
