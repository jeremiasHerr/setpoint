import type { LinkPersonal, SituacionDelLink } from '@setpoint/shared';
import { useQuery } from '@tanstack/react-query';
import { pedir } from '../../lib/api';

// El link personal de inscripción (decisión 050): de quién es, sin login, y si le sirve a quien lo
// abrió, con la sesión del código.

export function useLinkPersonal(codigo: string) {
  return useQuery({
    queryKey: ['link-personal', codigo],
    queryFn: () => pedir<LinkPersonal>('GET', `/api/links/${encodeURIComponent(codigo)}`),
    retry: false,
  });
}

export function useSituacionDelLink(codigo: string, token: string | undefined) {
  return useQuery({
    queryKey: ['link-personal', codigo, 'situacion', token],
    queryFn: () => pedir<SituacionDelLink>('GET', `/api/links/${encodeURIComponent(codigo)}/situacion`, undefined, token),
    enabled: Boolean(token),
    retry: false,
  });
}
