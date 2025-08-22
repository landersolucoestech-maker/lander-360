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
      <section className="relative py-20 px-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Líder em Gestão Musical
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                O futuro da gestão musical
                <span className="text-primary"> está aqui</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Transformamos a forma como gravadoras, produtoras e artistas gerenciam seus negócios. 
                Uma plataforma completa, segura e intuitiva para o mercado musical.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/institutional/contact">
                    Fale conosco
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/institutional/services">
                    Conheça nossos serviços
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="bg-background rounded-lg p-6 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Dashboard Principal</h3>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm text-muted-foreground">Artistas Ativos</p>
                        <p className="text-2xl font-bold text-primary">247</p>
                      </div>
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-sm text-muted-foreground">Receita Mensal</p>
                        <p className="text-2xl font-bold text-green-600">R$ 1.2M</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-sm text-muted-foreground">Projetos em Andamento</p>
                      <div className="flex items-center mt-2">
                        <div className="flex-1 bg-background rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-3/4"></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">75%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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