import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Loader2 } from 'lucide-react';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useGoogleCalendar();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/configuracoes?tab=integracoes&error=oauth_failed');
      return;
    }

    if (code) {
      handleCallback(code).then((success) => {
        if (success) {
          navigate('/configuracoes?tab=integracoes&success=google_connected');
        } else {
          navigate('/configuracoes?tab=integracoes&error=token_exchange_failed');
        }
      });
    } else {
      navigate('/configuracoes?tab=integracoes');
    }
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Conectando ao Google Calendar...</p>
      </div>
    </div>
  );
}
