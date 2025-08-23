import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstitutionalLayout } from "@/components/institutional/Layout";
import { Link } from "react-router-dom";
import { 
  Music, 
  Users, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Quote
} from "lucide-react";

export default function InstitutionalHome() {
  const features = [
    {
      icon: Music,
      title: "Gestão Musical Completa",
      description: "Centralize toda a administração de sua empresa musical em uma única plataforma."
    },
    {
      icon: Users,
      title: "Gestão de Artistas",
      description: "Organize contratos, projetos e relacionamentos com artistas de forma profissional."
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description: "Tome decisões baseadas em dados com nossos relatórios avançados e dashboards."
    },
    {
      icon: Shield,
      title: "Segurança Garantida",
      description: "Seus dados protegidos com os mais altos padrões de segurança da indústria."
    }
  ];

  const stats = [
    { number: "500+", label: "Empresas atendidas" },
    { number: "10k+", label: "Artistas gerenciados" },
    { number: "99.9%", label: "Uptime garantido" },
    { number: "24/7", label: "Suporte disponível" }
  ];

  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-black"></div>
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-red-600 text-white border-red-600 hover:bg-red-700">
                  Sistema #1 em Gestão Musical
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Gestão Musical
                  <span className="block text-red-500">Inteligente</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                  A plataforma completa para gravadoras, produtoras e artistas. 
                  Gerencie contratos, lançamentos, finanças e marketing em um só lugar.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-6 text-lg" asChild>
                  <Link to="/institutional/contact">
                    Solicitar Demonstração
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg" asChild>
                  <Link to="/institutional/services">
                    Conhecer Recursos
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">500+</p>
                  <p className="text-sm text-gray-400">Empresas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">10k+</p>
                  <p className="text-sm text-gray-400">Artistas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">99.9%</p>
                  <p className="text-sm text-gray-400">Uptime</p>
                </div>
              </div>
            </div>
            <div className="relative lg:pl-12">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl blur opacity-30"></div>
                <div className="relative bg-gray-900 rounded-2xl p-8 border border-gray-800">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Dashboard Gestão 360</h3>
                      <Badge className="bg-green-600 text-white">Online</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Receita Mensal</p>
                        <p className="text-2xl font-bold text-green-400">R$ 2.1M</p>
                        <p className="text-xs text-green-400">+15% vs mês anterior</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Artistas Ativos</p>
                        <p className="text-2xl font-bold text-blue-400">347</p>
                        <p className="text-xs text-blue-400">+23 novos</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-3">Lançamentos Programados</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white">Single "Verão 2024"</span>
                          <span className="text-xs text-red-400">Em 5 dias</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-red-800/5 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center text-white">
                <p className="text-3xl lg:text-4xl font-bold">{stat.number}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Por que escolher a Gestão 360?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Oferecemos as ferramentas mais avançadas do mercado para transformar 
              sua empresa musical em uma operação eficiente e lucrativa.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que dizem nossos clientes
            </h2>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center">
                <Quote className="h-12 w-12 text-primary mx-auto mb-6" />
                <blockquote className="text-2xl font-medium mb-6">
                  "A Gestão 360 revolucionou nossa operação. Conseguimos aumentar nossa 
                  eficiência em 300% e ter controle total sobre todos os aspectos do negócio."
                </blockquote>
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">Marina Santos</p>
                  <p className="text-muted-foreground">CEO, Harmonia Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Pronto para transformar sua gestão musical?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Entre em contato conosco e descubra como podemos ajudar sua empresa 
              a alcançar o próximo nível.
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
                  Saiba mais sobre nós
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}