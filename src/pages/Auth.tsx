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
import { Loader2, User, Lock, Facebook, Instagram, MessageCircle, Globe } from 'lucide-react';
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

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

interface MFAState {
  required: boolean;
  hasTotp: boolean;
  hasEmailOtp: boolean;
  userEmail: string;
  userId: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
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
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Erro de autenticação',
            description: 'Email ou senha incorretos',
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

          {/* MFA Verification or Login Form */}
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
            ) : !isSignupMode ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ACESSANDO...
                      </>
                    ) : (
                      'ACESSAR O SISTEMA'
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
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
          {!mfaState.required && (
            <div className="text-center space-y-3">
              <button 
                type="button" 
                onClick={() => setIsSignupMode(!isSignupMode)} 
                className="text-sm font-medium underline text-primary-foreground"
              >
                {isSignupMode ? 'Já tenho uma conta' : 'Esqueci minha senha'}
              </button>
              {!isSignupMode && (
                <div>
                  <button 
                    type="button" 
                    onClick={() => setIsSignupMode(true)} 
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Criar nova conta
                  </button>
                </div>
              )}
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
