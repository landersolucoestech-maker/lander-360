import { useSessionActivity } from '@/hooks/useSessionActivity';

export function SessionActivityMonitor({ children }: { children: React.ReactNode }) {
  // Initialize session activity monitoring
  useSessionActivity();
  
  return <>{children}</>;
}
