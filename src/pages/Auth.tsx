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
import { Loader2, User, Lock, Facebook, Instagram, Globe } from 'lucide-react';
import authHero from '@/assets/auth-hero.jpeg';
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

// WhatsApp icon component
const WhatsAppIcon = () => <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>;
export default function Auth() {
  const navigate = useNavigate();
  const {
    user,
    signIn,
    signUp,
    loading: authLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);
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
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const {
        error
      } = await signIn(data.email, data.password);
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
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso'
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const {
        error
      } = await signUp(data.email, data.password, data.fullName);
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
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>;
  }
  return <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div style={{
      background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'
    }} className="w-full lg:w-[45%] flex flex-col items-center justify-center relative bg-black py-[32px] px-[32px]">
        
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Welcome Text */}
          <h1 className="text-xl font-light tracking-wide text-white/90 mb-6">
            Seja bem vindo!
          </h1>

          {/* Logo Card */}
          <div className="bg-black rounded-lg p-6 mb-8 shadow-2xl">
            <img src="/lovable-uploads/a21a1ab1-df8a-4b7b-a1e4-0e36f63eff02.png" alt="Lander Records" className="h-[200px] w-[200px] object-contain" />
          </div>

          {/* Form */}
          <div className="w-full space-y-4">
            {!isSignupMode ? <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="email" placeholder="Digite o Email" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <FormField control={loginForm.control} name="password" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="password" placeholder="••••••" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <Button type="submit" className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold text-sm tracking-wide rounded-md transition-colors" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ACESSANDO...
                      </> : 'ACESSAR O SISTEMA'}
                  </Button>
                </form>
              </Form> : <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                  <FormField control={signupForm.control} name="fullName" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input placeholder="Nome Completo" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <FormField control={signupForm.control} name="email" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="email" placeholder="Digite o Email" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <FormField control={signupForm.control} name="password" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="password" placeholder="Senha" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <FormField control={signupForm.control} name="confirmPassword" render={({
                field
              }) => <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input type="password" placeholder="Confirmar Senha" className="pl-12 h-12 bg-[#3a3a3a] border-0 text-white placeholder:text-gray-400 rounded-md focus:ring-1 focus:ring-white/20" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>} />
                  <Button type="submit" className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold text-sm tracking-wide rounded-md transition-colors" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        CADASTRANDO...
                      </> : 'CRIAR CONTA'}
                  </Button>
                </form>
              </Form>}
          </div>

          {/* Toggle Mode */}
          <div className="text-center mt-6 space-y-2">
            <button type="button" onClick={() => setIsSignupMode(!isSignupMode)} className="text-sm text-gray-400 hover:text-white transition-colors">
              {isSignupMode ? 'Já tenho uma conta' : 'Esqueci minha senha'}
            </button>
            {!isSignupMode && <div>
                <button type="button" onClick={() => setIsSignupMode(true)} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Criar nova conta
                </button>
              </div>}
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-6 mt-8">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <WhatsAppIcon />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-500">
            Copyright © LANDER RECORDS. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        <img alt="Lander Records" className="absolute inset-0 w-full h-full object-cover object-left" src="/lovable-uploads/b1c6d72e-e2ad-4641-83ea-5cb4a105828f.jpg" />
        
        {/* Text Overlay */}
        <div className="absolute bottom-12 left-12 z-10">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Sistema de Gestão
          </h2>
        </div>
      </div>
    </div>;
}