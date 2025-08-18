import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Instagram, MessageCircle, Globe, User, Key } from "lucide-react";
import { CreateAdminButton } from "@/components/CreateAdminButton";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro de Login",
            description: "Email ou senha incorretos. Se é a primeira vez, clique em 'Configuração Inicial'.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro de Login",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, digite seu email primeiro.",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir a senha."
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  return <div className="flex min-h-screen">
      {/* Left Side - Login Form (DSU Show Style) */}
      <section className="min-h-screen w-full md:w-1/2 flex flex-col justify-center items-center px-4 xl:px-32 py-20 xl:py-12" style={{
      backgroundColor: "#000000"
    }}>
        <div className="h-full w-full flex flex-col justify-between items-center">
          
          {/* Top Section */}
          <div className="w-4/5 flex flex-col items-center space-y-16">
            {/* Welcome Text */}
            <h2 className="text-white text-xl text-center">
              SEJA VEM VINDO!
            </h2>
            
            {/* Logo */}
            <div className="text-center">
              <img src="/lovable-uploads/689c827e-2c73-45d3-aa81-618d147389c5.png" alt="GESTÃO 360 Logo" className="w-80 h-80 mx-auto object-contain" />
            </div>
          </div>
          
          {/* Form Section */}
          <div className="w-full 2xl:w-4/5">
            <form onSubmit={handleAuth} className="flex flex-col space-y-4 px-8 py-8">
              
              {/* Username/Email Input */}
              <div className="flex flex-row space-x-4 bg-white py-3 md:py-2 2xl:py-4 rounded-xl pl-4 items-center">
                <User className="text-gray-400 text-xl h-5 w-5" />
                <Input type="email" placeholder="Digite o Usuário" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="w-full border-none outline-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-gray-500" />
              </div>

              {/* Password Input */}
              <div className="flex flex-row space-x-4 bg-white py-3 md:py-2 2xl:py-4 rounded-xl pl-4 items-center">
                <Key className="text-gray-400 text-xl h-5 w-5" />
                <Input type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border-none outline-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black placeholder:text-gray-500" />
              </div>

              {/* Login Button */}
              <Button type="submit" disabled={loading} className="w-full text-white font-bold py-3 md:py-2 2xl:py-4 text-sm mt-6 rounded-xl hover:opacity-90 transition-opacity" style={{
              backgroundColor: "#dc2626"
            }}>
                {loading ? "Carregando..." : "ACESSAR O SISTEMA"}
              </Button>

              {/* Reset Password Button */}
              <Button type="button" variant="ghost" onClick={handleResetPassword} className="w-full text-white text-sm mt-2 hover:bg-white/10 transition-colors">
                Esqueci minha senha
              </Button>

              {/* Setup Button */}
              

              {/* Create Admin Section */}
              {showCreateAdmin && <div className="mt-4">
                  <CreateAdminButton />
                </div>}
            </form>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
              <MessageCircle className="h-6 w-6" />
            </a>
            <a href="#" className="text-white opacity-80 hover:opacity-100 transition-opacity">
              <Globe className="h-6 w-6" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-white text-sm opacity-80">
            Copyright © GESTÃO 360. Todos os direitos reservados.
          </div>
        </div>
      </section>

      {/* Right Side - Image Background */}
      <section className="hidden md:block md:w-1/2 relative overflow-hidden">
        {/* Image Background */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/c5dc90f6-8743-4cc3-9243-2fc9249e9dc8.png')"
      }}></div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Text overlay */}
        <div className="absolute bottom-16 left-16 text-white">
          <h2 className="text-3xl font-light">Sistema de Gestão</h2>
          <p className="text-lg opacity-90 mt-2">Plataforma Musical Profissional</p>
        </div>
      </section>
    </div>;
};
export default Auth;