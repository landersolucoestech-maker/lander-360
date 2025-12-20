import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const confirmEmailChange = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token não fornecido na URL');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-email-change', {
          body: { token },
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          setStatus('error');
          setMessage(data.error);
        } else {
          setStatus('success');
          setMessage(data.message);
          setNewEmail(data.newEmail);
        }
      } catch (error: any) {
        console.error('Error confirming email change:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao confirmar alteração de email');
      }
    };

    confirmEmailChange();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'loading' && 'Confirmando alteração...'}
            {status === 'success' && 'Email alterado com sucesso!'}
            {status === 'error' && 'Erro na confirmação'}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Aguarde enquanto processamos sua solicitação'}
            {status === 'success' && (
              <>
                Seu email foi alterado para <strong>{newEmail}</strong>
              </>
            )}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {status !== 'loading' && (
            <Button onClick={() => navigate('/auth')} variant="default">
              {status === 'success' ? 'Fazer Login' : 'Voltar para o Login'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailChange;
