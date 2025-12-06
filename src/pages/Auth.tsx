import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Facebook, Instagram, MessageCircle, Globe, Mail, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MFAVerification } from '@/components/auth/MFAVerification';
import authBackground from '@/assets/auth-background.jpeg';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme sua senha')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword']
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

type AuthMode = "login" | "signup" | "forgot-password";

interface MFAState {
  required: boolean;
  hasTotp: boolean;
  hasEmailOtp: boolean;
  userEmail: string;
  userId: string;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; remainingMinutes: number } | null>(null);
  const [mfaState, setMfaState] = useState<MFAState>({
    required: false,
    hasTotp: false,
    hasEmailOtp: false,
    userEmail: "",
    userId: ""
  });

  useEffect(() => {
    if (user && !authLoading && !mfaState.required) {
      navigate('/');
    }
  }, [user, authLoading, navigate, mfaState.required]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const checkAccountLocked = async (email: string): Promise<{ locked: boolean; remainingMinutes: number }> => {
    try {
      const { data: attempt } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (!attempt) {
        return { locked: false, remainingMinutes: 0 };
      }

      if (attempt.locked_until) {
        const lockedUntil = new Date(attempt.locked_until);
        const now = new Date();
        
        if (lockedUntil > now) {
          const remainingMs = lockedUntil.getTime() - now.getTime();
          const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
          return { locked: true, remainingMinutes };
        } else {
          // Lockout expired, reset attempts
          await supabase
            .from("login_attempts")
            .delete()
            .eq("email", email.toLowerCase());
          return { locked: false, remainingMinutes: 0 };
        }
      }

      return { locked: false, remainingMinutes: 0 };
    } catch (error) {
      console.error("Error checking account lock:", error);
      return { locked: false, remainingMinutes: 0 };
    }
  };

  const recordFailedAttempt = async (email: string): Promise<{ attemptsRemaining: number; locked: boolean }> => {
    try {
      const normalizedEmail = email.toLowerCase();
      
      const { data: existing } = await supabase
        .from("login_attempts")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existing) {
        const newAttemptCount = existing.attempt_count + 1;
        
        if (newAttemptCount >= MAX_LOGIN_ATTEMPTS) {
          const lockedUntil = new Date();
          lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
          
          await supabase
            .from("login_attempts")
            .update({
              attempt_count: newAttemptCount,
              locked_until: lockedUntil.toISOString(),
              last_attempt_at: new Date().toISOString()
            })
            .eq("email", normalizedEmail);
          
          return { attemptsRemaining: 0, locked: true };
        } else {
          await supabase
            .from("login_attempts")
            .update({
              attempt_count: newAttemptCount,
              last_attempt_at: new Date().toISOString()
            })
            .eq("email", normalizedEmail);
          
          return { attemptsRemaining: MAX_LOGIN_ATTEMPTS - newAttemptCount, locked: false };
        }
      } else {
        await supabase
          .from("login_attempts")
          .insert({
            email: normalizedEmail,
            attempt_count: 1,
            last_attempt_at: new Date().toISOString()
          });
        
        return { attemptsRemaining: MAX_LOGIN_ATTEMPTS - 1, locked: false };
      }
    } catch (error) {
      console.error("Error recording failed attempt:", error);
      return { attemptsRemaining: MAX_LOGIN_ATTEMPTS, locked: false };
    }
  };

  const clearLoginAttempts = async (email: string) => {
    try {
      await supabase
        .from("login_attempts")
        .delete()
        .eq("email", email.toLowerCase());
    } catch (error) {
      console.error("Error clearing login attempts:", error);
    }
  };

  const checkMFARequired = async (userId: string, userEmail: string): Promise<boolean> => {
    try {
      // Check TOTP factors
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasTotp = factors?.totp?.some(f => f.status === "verified") || false;

      // Check email 2FA settings
      const { data: settings } = await supabase
        .from("user_2fa_settings")
        .select("email_2fa_enabled")
        .eq("user_id", userId)
        .maybeSingle();
      
      const hasEmailOtp = settings?.email_2fa_enabled || false;

      if (hasTotp || hasEmailOtp) {
        setMfaState({
          required: true,
          hasTotp,
          hasEmailOtp,
          userEmail,
          userId
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking MFA:", error);
      return false;
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setLockoutInfo(null);
    
    try {
      // Check if account is locked
      const lockStatus = await checkAccountLocked(data.email);
      if (lockStatus.locked) {
        setLockoutInfo(lockStatus);
        toast({
          title: 'Conta bloqueada',
          description: `Muitas tentativas de login falhas. Tente novamente em ${lockStatus.remainingMinutes} minuto(s).`,
          variant: 'destructive'
        });
        return;
      }

      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          const result = await recordFailedAttempt(data.email);
          
          if (result.locked) {
            setLockoutInfo({ locked: true, remainingMinutes: LOCKOUT_DURATION_MINUTES });
            toast({
              title: 'Conta bloqueada',
              description: `Muitas tentativas de login falhas. Sua conta foi bloqueada por ${LOCKOUT_DURATION_MINUTES} minutos.`,
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Erro de autenticação',
              description: `Email ou senha incorretos. ${result.attemptsRemaining} tentativa(s) restante(s).`,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive'
          });
        }
      } else {
        // Login successful, clear attempts
        await clearLoginAttempts(data.email);
        
        // Get the current user to check MFA
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const mfaRequired = await checkMFARequired(user.id, user.email || data.email);
          if (!mfaRequired) {
            toast({
              title: 'Bem-vindo!',
              description: 'Login realizado com sucesso'
            });
            navigate('/');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.fullName);
      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: 'Usuário já cadastrado',
            description: 'Este email já está em uso. Tente fazer login.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Erro',
            description: error.message,
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Conta criada!',
          description: 'Você já pode acessar o sistema'
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setResetEmailSent(true);
      toast({
        title: 'E-mail enviado!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.'
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar o e-mail de recuperação',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerified = () => {
    setMfaState({
      required: false,
      hasTotp: false,
      hasEmailOtp: false,
      userEmail: "",
      userId: ""
    });
    toast({
      title: 'Bem-vindo!',
      description: 'Login realizado com sucesso'
    });
    navigate('/');
  };

  const handleMFACancel = async () => {
    // Sign out and reset state
    await supabase.auth.signOut();
    setMfaState({
      required: false,
      hasTotp: false,
      hasEmailOtp: false,
      userEmail: "",
      userId: ""
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative bg-black">
        <div className="w-full max-w-md space-y-8">
          {/* Welcome Text */}
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-wider text-primary-foreground">
              SEJA BEM VINDO!
            </h1>
          </div>

          {/* Logo */}
          <div className="py-0 flex-col flex items-center justify-center pointer-events-none">
            <img 
              src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" 
              alt="Lander Records" 
              className="h-[280px] w-[280px]" 
            />
          </div>

          {/* MFA Verification or Auth Forms */}
          <div className="relative z-10">
            {mfaState.required ? (
              <MFAVerification
                onVerified={handleMFAVerified}
                onCancel={handleMFACancel}
                hasTotp={mfaState.hasTotp}
                hasEmailOtp={mfaState.hasEmailOtp}
                userEmail={mfaState.userEmail}
                userId={mfaState.userId}
              />
            ) : authMode === "forgot-password" ? (
              // Forgot Password Form
              resetEmailSent ? (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-primary-foreground mb-2">
                      E-mail Enviado!
                    </h2>
                    <p className="text-sm text-gray-400">
                      Verifique sua caixa de entrada para redefinir sua senha.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setAuthMode("login");
                      setResetEmailSent(false);
                    }}
                    className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Login
                  </Button>
                </div>
              ) : (
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <p className="text-sm text-gray-400 text-center mb-4">
                      Digite seu e-mail para receber um link de recuperação de senha.
                    </p>
                    <FormField 
                      control={forgotPasswordForm.control} 
                      name="email" 
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input 
                                type="email" 
                                placeholder="Digite seu e-mail" 
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
                          ENVIANDO...
                        </>
                      ) : (
                        'ENVIAR LINK DE RECUPERAÇÃO'
                      )}
                    </Button>
                  </form>
                </Form>
              )
            ) : authMode === "login" ? (
              // Login Form
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  {lockoutInfo?.locked && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                      <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-500">Conta temporariamente bloqueada</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Muitas tentativas de login falhas. Tente novamente em {lockoutInfo.remainingMinutes} minuto(s).
                        </p>
                      </div>
                    </div>
                  )}
                  <FormField 
                    control={loginForm.control} 
                    name="email" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="email" 
                              placeholder="Digite o Usuário" 
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
                    control={loginForm.control} 
                    name="password" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="••••••" 
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
                    disabled={isLoading || lockoutInfo?.locked}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ACESSANDO...
                      </>
                    ) : lockoutInfo?.locked ? (
                      'CONTA BLOQUEADA'
                    ) : (
                      'ACESSAR O SISTEMA'
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              // Signup Form
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField 
                    control={signupForm.control} 
                    name="fullName" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              placeholder="Nome Completo" 
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
                    control={signupForm.control} 
                    name="email" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="email" 
                              placeholder="Digite o Email" 
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
                    control={signupForm.control} 
                    name="password" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="Senha" 
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
                    control={signupForm.control} 
                    name="confirmPassword" 
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input 
                              type="password" 
                              placeholder="Confirmar Senha" 
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
                        CADASTRANDO...
                      </>
                    ) : (
                      'CRIAR CONTA'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Toggle Mode & Forgot Password - Hide during MFA */}
          {!mfaState.required && authMode !== "forgot-password" && (
            <div className="text-center space-y-3">
              {authMode === "login" ? (
                <>
                  <button 
                    type="button" 
                    onClick={() => setAuthMode("forgot-password")} 
                    className="text-sm font-medium underline text-primary-foreground"
                  >
                    Esqueci minha senha
                  </button>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode("signup")} 
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Criar nova conta
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setAuthMode("login")} 
                  className="text-sm font-medium underline text-primary-foreground"
                >
                  Já tenho uma conta
                </button>
              )}
            </div>
          )}

          {/* Back to login for forgot password */}
          {authMode === "forgot-password" && !resetEmailSent && (
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setAuthMode("login")} 
                className="text-sm font-medium underline text-primary-foreground"
              >
                Voltar ao login
              </button>
            </div>
          )}

          {/* Social Icons */}
          <div className="flex justify-center gap-6 pt-4">
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
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
