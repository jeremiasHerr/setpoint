import { useQuery } from '@tanstack/react-query';
import { listarConvocatorias } from './api';

export function useTorneos(slug: string) {
  return useQuery({
    queryKey: ['torneos', slug],
    queryFn: () => listarConvocatorias(slug),
    retry: false,
  });
}
