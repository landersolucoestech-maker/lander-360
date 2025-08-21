import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstitutionalLayout } from "@/components/institutional/Layout";
import { Link } from "react-router-dom";
import { 
  Music, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Headphones,
  Building,
  Globe
} from "lucide-react";

export default function InstitutionalServices() {
  const services = [
    {
      icon: Music,
      title: "Gestão de Artistas",
      description: "Centralize todas as informações dos seus artistas em um só lugar.",
      features: [
        "Cadastro completo de artistas",
        "Histórico de atividades",
        "Documentos e contratos",
        "Agenda e cronogramas"
      ]
    },
    {
      icon: FileText,
      title: "Gestão de Contratos",
      description: "Controle total sobre contratos e acordos comerciais.",
      features: [
        "Templates personalizados",
        "Vencimentos automáticos",
        "Assinaturas digitais",
        "Histórico de alterações"
      ]
    },
    {
      icon: DollarSign,
      title: "Gestão Financeira",
      description: "Controle financeiro completo com relatórios detalhados.",
      features: [
        "Fluxo de caixa em tempo real",
        "Emissão de notas fiscais",
        "Controle de royalties",
        "Relatórios financeiros"
      ]
    },
    {
      icon: TrendingUp,
      title: "Marketing e Campanhas",
      description: "Gerencie suas estratégias de marketing de forma integrada.",
      features: [
        "Planejamento de campanhas",
        "Gestão de conteúdo",
        "Métricas e analytics",
        "Automação de tarefas"
      ]
    },
    {
      icon: BarChart3,
      title: "Relatórios e Analytics",
      description: "Insights poderosos para tomada de decisões estratégicas.",
      features: [
        "Dashboards personalizados",
        "Relatórios automatizados",
        "Análise de performance",
        "Exportação de dados"
      ]
    },
    {
      icon: Calendar,
      title: "Agenda e Eventos",
      description: "Organize eventos, shows e compromissos profissionais.",
      features: [
        "Calendário integrado",
        "Notificações automáticas",
        "Gestão de equipe",
        "Sincronização móvel"
      ]
    }
  ];

  const industries = [
    {
      icon: Building,
      title: "Gravadoras",
      description: "Soluções completas para grandes gravadoras e selos musicais.",
      benefits: [
        "Gestão de catálogo musical",
        "Controle de direitos autorais", 
        "Distribuição digital",
        "Relatórios de vendas"
      ]
    },
    {
      icon: Users,
      title: "Produtoras",
      description: "Ferramentas especializadas para produtoras musicais.",
      benefits: [
        "Gestão de projetos",
        "Controle de orçamentos",
        "Agenda de estúdio",
        "Colaboração em equipe"
      ]
    },
    {
      icon: Headphones,
      title: "Artistas Independentes",
      description: "Empodere artistas independentes com ferramentas profissionais.",
      benefits: [
        "Autogestão simplificada",
        "Controle de carreira",
        "Marketing pessoal",
        "Análise de audiência"
      ]
    },
    {
      icon: Globe,
      title: "Editoras",
      description: "Gestão especializada para editoras musicais.",
      benefits: [
        "Administração de obras",
        "Controle de sincronização",
        "Gestão de publishers",
        "Relatórios de arrecadação"
      ]
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 299",
      period: "/mês",
      description: "Ideal para pequenas produtoras e artistas independentes",
      features: [
        "Até 10 artistas",
        "Gestão básica de contratos",
        "Relatórios essenciais",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "R$ 599",
      period: "/mês", 
      description: "Perfeito para empresas em crescimento",
      features: [
        "Até 50 artistas",
        "Gestão avançada de contratos",
        "Analytics completos",
        "Suporte prioritário",
        "Integrações personalizadas"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      period: "",
      description: "Solução completa para grandes gravadoras",
      features: [
        "Artistas ilimitados",
        "Customizações avançadas",
        "Suporte dedicado",
        "Treinamento da equipe",
        "SLA garantido"
      ],
      popular: false
    }
  ];

  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Nossos Serviços
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Soluções completas para a 
            <span className="text-primary"> indústria musical</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Oferecemos um ecossistema integrado de ferramentas especializadas 
            para cada necessidade do mercado musical moderno.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubra como nossas ferramentas podem transformar sua gestão musical.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Soluções por Segmento
            </h2>
            <p className="text-xl text-muted-foreground">
              Atendemos todos os players da indústria musical com soluções especializadas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {industries.map((industry, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <industry.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{industry.title}</CardTitle>
                  <CardDescription>{industry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {industry.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para o seu negócio musical.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} hover:shadow-lg transition-all`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
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
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/institutional/contact">
                      Solicitar proposta
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Pronto para revolucionar sua gestão musical?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Entre em contato conosco e descubra como nossas soluções podem 
              impulsionar seu negócio musical.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/institutional/contact">
                  Solicitar demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/institutional/about">
                  Conhecer a empresa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}