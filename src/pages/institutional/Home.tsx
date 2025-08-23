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
  Quote,
  Play,
  Calendar,
  DollarSign
} from "lucide-react";

export default function InstitutionalHome() {
  return (
    <InstitutionalLayout>
      {/* Hero Section - Inspired by Music360 */}
      <section className="relative min-h-screen bg-background overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 elegant-gradient opacity-90"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="space-y-8 text-foreground">
              <div className="space-y-6">
                <Badge className="bg-primary text-primary-foreground border-primary hover:bg-primary-hover">
                  🎵 Plataforma Líder em Gestão Musical
                </Badge>
                
                <h1 className="text-6xl lg:text-8xl font-black leading-none tracking-tight">
                  MUSIC
                  <span className="block text-primary">360°</span>
                </h1>
                
                <p className="text-2xl lg:text-3xl font-light text-muted-foreground leading-relaxed">
                  A revolução na gestão musical completa para 
                  <span className="text-primary font-semibold"> gravadoras, produtoras e artistas</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary-hover text-primary-foreground border-0 px-10 py-8 text-xl font-semibold"
                  asChild
                >
                  <Link to="/institutional/contact">
                    <Play className="mr-3 h-6 w-6" />
                    DEMO GRATUITA
                  </Link>
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background px-10 py-8 text-xl font-semibold"
                  asChild
                >
                  <Link to="/institutional/services">
                    EXPLORAR RECURSOS
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-12">
                <div className="text-center">
                  <div className="text-5xl font-black text-primary mb-2">500+</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">EMPRESAS</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-primary mb-2">10K+</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">ARTISTAS</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-black text-primary mb-2">24/7</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">SUPORTE</div>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="relative lg:pl-12">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-primary rounded-3xl blur-3xl opacity-20 animate-glow"></div>
                
                {/* Main dashboard card */}
                <div className="relative glass-effect rounded-3xl p-8 border-2 border-border">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">MUSIC 360° DASHBOARD</h3>
                        <p className="text-sm text-muted-foreground">Sistema Completo de Gestão</p>
                      </div>
                      <Badge className="bg-success text-success-foreground animate-pulse">LIVE</Badge>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card rounded-xl p-6 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <DollarSign className="h-6 w-6 text-success" />
                          <span className="text-sm font-medium text-muted-foreground">Receita Mensal</span>
                        </div>
                        <div className="text-3xl font-black text-success">R$ 2.8M</div>
                        <div className="text-sm text-success font-medium">+32% vs mês anterior</div>
                      </div>
                      
                      <div className="bg-card rounded-xl p-6 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="h-6 w-6 text-info" />
                          <span className="text-sm font-medium text-muted-foreground">Artistas Ativos</span>
                        </div>
                        <div className="text-3xl font-black text-info">428</div>
                        <div className="text-sm text-info font-medium">+47 novos artistas</div>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Lançamentos Programados</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">EP "Horizonte Infinito"</span>
                            <span className="text-xs text-primary font-bold">EM 3 DIAS</span>
                          </div>
                          <div className="w-full bg-accent rounded-full h-3">
                            <div className="bg-primary h-3 rounded-full w-4/5 animate-pulse"></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">Single "Batida do Verão"</span>
                            <span className="text-xs text-warning font-bold">EM 12 DIAS</span>
                          </div>
                          <div className="w-full bg-accent rounded-full h-3">
                            <div className="bg-warning h-3 rounded-full w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live Activity */}
                    <div className="bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-muted-foreground">Atividade em Tempo Real</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-foreground">• Contrato assinado - MC Rhythm</span>
                          <span className="text-muted-foreground">agora</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">• Pagamento processado - R$ 45k</span>
                          <span className="text-muted-foreground">2min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">• Nova música registrada</span>
                          <span className="text-muted-foreground">5min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-32 right-32 w-64 h-64 bg-primary rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-96 h-96 bg-primary rounded-full blur-3xl opacity-5"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black mb-6 text-foreground">
              TUDO EM UM 
              <span className="text-primary"> SÓ LUGAR</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Centralize todas as operações da sua empresa musical. Do contrato ao lançamento, 
              do financeiro ao marketing - uma plataforma completa e inteligente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Music,
                title: "GESTÃO MUSICAL",
                description: "Administre todo seu catálogo musical, direitos autorais e registros em uma única plataforma."
              },
              {
                icon: Users,
                title: "ARTISTAS & CONTRATOS",
                description: "Gerencie contratos, royalties e relacionamentos com artistas de forma profissional."
              },
              {
                icon: BarChart3,
                title: "ANALYTICS AVANÇADO",
                description: "Relatórios inteligentes e dashboards em tempo real para decisões estratégicas."
              },
              {
                icon: Shield,
                title: "SEGURANÇA TOTAL",
                description: "Máxima proteção de dados com criptografia de nível bancário e backups automáticos."
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-background border-2 border-border hover:border-primary transition-all hover:shadow-2xl group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-black mb-6 text-foreground">
              QUEM JÁ <span className="text-primary">CONFIA</span>
            </h2>
          </div>

          <Card className="max-w-5xl mx-auto bg-card border-2 border-border">
            <CardContent className="p-12">
              <div className="text-center">
                <Quote className="h-16 w-16 text-primary mx-auto mb-8" />
                <blockquote className="text-3xl lg:text-4xl font-medium mb-8 text-foreground leading-relaxed">
                  "O Music 360° transformou completamente nossa operação. Aumentamos a eficiência 
                  em <span className="text-primary font-bold">400%</span> e temos controle total sobre todo o negócio."
                </blockquote>
                <div className="flex items-center justify-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-primary text-primary" />
                  ))}
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">Marina Santos</p>
                  <p className="text-muted-foreground font-medium">CEO, Harmonia Records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 elegant-gradient">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto text-foreground">
            <h2 className="text-5xl lg:text-6xl font-black mb-8">
              PRONTO PARA A
              <span className="block text-primary">REVOLUÇÃO?</span>
            </h2>
            <p className="text-2xl mb-12 text-muted-foreground leading-relaxed">
              Junte-se às centenas de empresas que já transformaram sua gestão musical. 
              <span className="text-foreground font-semibold"> Comece sua demonstração gratuita hoje mesmo.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-accent border-2 border-background px-12 py-8 text-xl font-bold"
                asChild
              >
                <Link to="/institutional/contact">
                  <Play className="mr-3 h-6 w-6" />
                  DEMONSTRAÇÃO GRATUITA
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-foreground text-foreground hover:bg-foreground hover:text-background px-12 py-8 text-xl font-bold"
                asChild
              >
                <Link to="/institutional/about">
                  CONHECER A EMPRESA
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}