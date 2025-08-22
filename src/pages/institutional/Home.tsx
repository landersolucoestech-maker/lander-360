import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InstitutionalLayout } from "@/components/institutional/Layout";
import { ArrowRight, Music, Users, DollarSign, Calendar, TrendingUp, CheckCircle, Play, BarChart3, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function InstitutionalHome() {
  const steps = [
    {
      number: "1",
      title: "Configure seu Perfil",
      description: "Crie sua conta e configure seu perfil específico: artista individual, banda, gravadora ou editora musical."
    },
    {
      number: "2", 
      title: "Organize seu Catálogo",
      description: "Cadastre obras musicais, fonogramas e videogramas. Gerencie titularidades e participações em um só lugar."
    },
    {
      number: "3",
      title: "Gerencie e Monitore", 
      description: "Acompanhe contratos, projetos de lançamento, relatórios de performance e conecte-se com seu público."
    }
  ];

  const features = [
    {
      icon: Music,
      title: "Gestão de Obras",
      description: "Cadastre e gerencie composições musicais com registro completo de autores, editoras e participações."
    },
    {
      icon: Users,
      title: "Controle de Artistas",
      description: "Gerencie seu catálogo de artistas com informações detalhadas sobre contratos e projetos."
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description: "Controle completo de finanças com emissão de notas fiscais e relatórios de royalties."
    },
    {
      icon: Calendar,
      title: "Agenda Inteligente",
      description: "Organize eventos, lançamentos e atividades com sistema de lembretes automatizado."
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboards e relatórios detalhados para acompanhar performance e resultados."
    },
    {
      icon: Shield,
      title: "Contratos Seguros",
      description: "Gerencie contratos digitalmente com assinaturas eletrônicas e controle de vencimentos."
    }
  ];

  return (
    <InstitutionalLayout>
      {/* Hero Section - Inspired by Music360 */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <span className="bg-primary rounded-full w-2 h-2 mr-2"></span>
                100% Brasileiro
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                A plataforma completa que{" "}
                <span className="text-blue-400">revoluciona</span>{" "}
                a gestão musical
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                Centralize obras, fonogramas, contratos e projetos em uma única plataforma. 
                Transforme dados em insights e impulsione sua carreira no mercado musical brasileiro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link to="/auth">
                    Escolher Plano e Assinar
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" asChild>
                  <Link to="/institutional/services">
                    Ver Funcionalidades
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Dashboard mockup */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="bg-white rounded-xl p-4 shadow-2xl">
                  {/* Mock dashboard header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock dashboard content */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-24 h-4 bg-slate-900 rounded"></div>
                      <div className="w-16 h-4 bg-blue-600 rounded"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 bg-blue-100 rounded"></div>
                      <div className="h-12 bg-blue-200 rounded"></div>
                      <div className="h-12 bg-blue-300 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-blue-200 rounded"></div>
                      <div className="w-4/5 h-3 bg-blue-100 rounded"></div>
                      <div className="w-3/5 h-3 bg-blue-50 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-medium">Dashboard</div>
                      <div className="h-8 bg-blue-500 rounded text-xs text-white flex items-center justify-center font-medium">Relatórios</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-xs font-bold">
                  <span className="text-lg">100%</span>
                  <span>Brasileiro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Como o Gestão 360 Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma intuitiva que simplifica a gestão completa da sua carreira musical em poucos passos.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-10 transform translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="outline" asChild>
              <Link to="/institutional/about">
                Ver Guia Completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Descubra as ferramentas que fazem do Gestão 360 a escolha preferida de artistas, selos e editoras musicais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transforme sua gestão musical hoje mesmo
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Junte-se a centenas de artistas, produtoras e editoras que já revolucionaram 
              seus negócios com o Gestão 360.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/auth">
                  Começar agora gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" asChild>
                <Link to="/institutional/contact">
                  Falar com especialista
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}