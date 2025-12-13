import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSpotifyForArtists } from '@/hooks/useSpotifyForArtists';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SpotifyForArtistsCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useSpotifyForArtists();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' 
          ? 'Acesso negado. O artista não autorizou a conexão.'
          : `Erro: ${error}`
        );
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Parâmetros de callback inválidos');
        return;
      }

      try {
        await handleOAuthCallback(code, state);
        setStatus('success');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/artistas');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Processando autorização...</h1>
            <p className="text-muted-foreground">
              Conectando com Spotify for Artists
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Conectado com sucesso!</h1>
            <p className="text-muted-foreground mb-4">
              O artista foi conectado ao Spotify for Artists.
              Redirecionando...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Erro na conexão</h1>
            <p className="text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <Button onClick={() => navigate('/artistas')}>
              Voltar para Artistas
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyForArtistsCallback;
