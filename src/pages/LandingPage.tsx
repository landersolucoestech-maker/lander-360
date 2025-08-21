import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Check,
  Star,
  Building,
  Mic,
  Users2,
  BarChart3,
  Shield,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const benefits = [
    {
      icon: Target,
      title: "Centralização total",
      description: "Gerencie artistas, obras, fonogramas, contratos, lançamentos e finanças em uma única plataforma."
    },
    {
      icon: BarChart3,
      title: "Estratégia inteligente", 
      description: "Transforme dados em relatórios, insights e decisões que potencializam resultados."
    },
    {
      icon: Zap,
      title: "Automação profissional",
      description: "Emissão de nota fiscal, controle de agenda, inventário e CRM."
    },
    {
      icon: TrendingUp,
      title: "Crescimento real",
      description: "Ferramentas feitas sob medida para quem deseja expandir carreira e negócios musicais."
    }
  ];

  const targetAudience = [
    {
      icon: Building,
      title: "Gravadoras, Produtoras e Editoras",
      description: "Organize seu catálogo, contratos e equipe."
    },
    {
      icon: Mic,
      title: "Artistas independentes",
      description: "Controle sua carreira com profissionalismo."
    },
    {
      icon: Users2,
      title: "Gestores e profissionais da música",
      description: "Tenha visão estratégica para tomar decisões com segurança."
    }
  ];

  const features = [
    { icon: Users, title: "Gestão de artistas e projetos musicais" },
    { icon: Music, title: "Registro de obras e fonogramas" },
    { icon: FileText, title: "Controle de contratos e lançamentos" },
    { icon: DollarSign, title: "Financeiro completo + emissão de NF" },
    { icon: Calendar, title: "Agenda inteligente e inventário" },
    { icon: TrendingUp, title: "CRM e Marketing integrado" },
    { icon: BarChart3, title: "Relatórios e dashboards estratégicos" }
  ];

  const plans = [
    {
      name: "Individual",
      icon: "🎤",
      price: "R$ 59",
      period: "/mês",
      description: "Para artistas independentes que querem organizar a própria carreira.",
      features: [
        "Gestão de 1 artista",
        "Projetos ilimitados", 
        "Registro de obras e fonogramas ilimitados",
        "Controle básico de contratos e lançamentos",
        "Financeiro simplificado (sem emissão de NF)",
        "Agenda e lembretes",
        "Suporte por e-mail"
      ],
      highlighted: false
    },
    {
      name: "Profissional",
      icon: "🎼", 
      price: "R$ 179",
      period: "/mês",
      description: "Para pequenas produtoras e editoras que precisam centralizar processos.",
      features: [
        "Tudo do plano Individual +",
        "Gestão de até 10 artistas",
        "Registro ilimitado de obras/fonogramas", 
        "Emissão de Nota Fiscal integrada",
        "Relatórios financeiros e de royalties",
        "CRM básico e gestão de campanhas de marketing",
        "Suporte por e-mail e chat"
      ],
      highlighted: true
    },
    {
      name: "Corporativo",
      icon: "🏢",
      price: "a partir de R$ 499",
      period: "/mês",
      description: "Para grandes gravadoras e empresas musicais que precisam de alta performance.",
      features: [
        "Tudo do plano Profissional +",
        "Gestão de artistas e projetos ilimitados",
        "Dashboards avançados de relatórios e KPIs", 
        "CRM completo e automações de marketing",
        "Gestão de equipe (usuários ilimitados)",
        "Suporte prioritário (dedicado)",
        "Onboarding personalizado"
      ],
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 text-sm">
            🎵 Sistema de Gestão Musical
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 elegant-gradient bg-clip-text text-transparent">
            Gestão musical inteligente para quem quer crescer de verdade
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Um sistema completo para gravadoras, produtoras, editoras, artistas e profissionais da música. 
            Organize tudo em um só lugar: artistas, projetos, contratos, lançamentos, finanças, agenda, marketing e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Solicite uma demonstração gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Comece agora
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher o Gestão 360?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center glass-effect hover:scale-105 transition-transform">
                <CardHeader>
                  <benefit.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Para quem é o sistema?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {targetAudience.map((audience, index) => (
              <Card key={index} className="hover:scale-105 transition-transform">
                <CardHeader>
                  <audience.icon className="h-10 w-10 text-primary mb-3" />
                  <CardTitle className="text-xl">{audience.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{audience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Funcionalidades em destaque
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:scale-105 transition-transform">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-medium">{feature.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            O que nossos clientes dizem
          </h2>
          <Card className="max-w-4xl mx-auto glass-effect">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl italic mb-4">
                "O Gestão 360 transformou a forma como gerimos nossos artistas. 
                Agora temos clareza e controle de tudo em um só lugar."
              </blockquote>
              <p className="text-muted-foreground">
                — João Silva, Produtor Musical
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Escolha seu plano
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.highlighted ? 'border-primary shadow-lg scale-105' : ''} hover:scale-105 transition-transform`}>
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {plan.price}
                    <span className="text-lg text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    Escolher plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              💡 Sua música merece gestão inteligente
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Deixe de perder tempo com planilhas e processos manuais.<br />
              O futuro da gestão musical está aqui.
            </p>
            <Button size="lg" className="text-lg px-8 py-6">
              ⚡ Solicite sua demonstração gratuita agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Gestão 360. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}