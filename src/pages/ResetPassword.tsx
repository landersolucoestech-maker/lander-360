import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import authBackground from '@/assets/auth-background.jpeg';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword']
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check URL hash for recovery token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
          // Set the session with the recovery token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || ''
          });

          if (!error) {
            setIsValidToken(true);
          }
        } else if (session) {
          // User might have clicked the link and already has a session
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi redefinida com sucesso.'
      });

      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 3000);

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível redefinir a senha',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative bg-black">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider text-primary-foreground">
              REDEFINIR SENHA
            </h1>
          </div>

          {/* Logo */}
          <div className="py-0 flex-col flex items-center justify-center pointer-events-none">
            <img 
              src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" 
              alt="Lander Records" 
              className="h-[200px] w-[200px]" 
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {isSuccess ? (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-primary-foreground mb-2">
                    Senha Redefinida!
                  </h2>
                  <p className="text-sm text-gray-400">
                    Sua senha foi alterada com sucesso. Você será redirecionado para o login...
                  </p>
                </div>
              </div>
            ) : !isValidToken ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">
                    Link inválido ou expirado. Solicite um novo link de recuperação de senha.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
                  <p className="text-sm text-gray-400 text-center mb-6">
                    Digite sua nova senha abaixo.
                  </p>
                  
                  <FormField 
                    control={form.control} 
                    name="password" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="Nova Senha" 
                              className="pl-12 h-14 bg-gray-100 border-0 text-gray-700 placeholder:text-gray-400 rounded-lg" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />

                  <FormField 
                    control={form.control} 
                    name="confirmPassword" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="Confirmar Nova Senha" 
                              className="pl-12 h-14 bg-gray-100 border-0 text-gray-700 placeholder:text-gray-400 rounded-lg" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider rounded-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        REDEFININDO...
                      </>
                    ) : (
                      'REDEFINIR SENHA'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Back to Login Link */}
          {!isSuccess && isValidToken && (
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => navigate('/auth')}
                className="text-sm font-medium underline text-primary-foreground"
              >
                Voltar ao login
              </button>
            </div>
          )}
        </div>

        {/* Copyright Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-500">
            Copyright © GESTÃO 360. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url(${authBackground})`,
            backgroundPosition: 'right center'
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/30" />
        
        {/* Text Overlay */}
        <div className="absolute bottom-12 left-12 z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            Sistema de Gestão
          </h2>
          <p className="text-gray-300 text-lg">
            Plataforma Musical Profissional
          </p>
        </div>
      </div>
    </div>
  );
}
