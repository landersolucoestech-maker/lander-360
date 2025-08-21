import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstitutionalLayout } from "@/components/institutional/Layout";
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Calendar,
  Award,
  Lightbulb,
  Globe
} from "lucide-react";

export default function InstitutionalAbout() {
  const values = [
    {
      icon: Lightbulb,
      title: "Inovação",
      description: "Sempre buscamos as melhores tecnologias para criar soluções revolucionárias."
    },
    {
      icon: Heart,
      title: "Paixão pela Música",
      description: "Nosso amor pela música nos motiva a criar ferramentas excepcionais."
    },
    {
      icon: Users,
      title: "Foco no Cliente",
      description: "Cada decisão é tomada pensando no sucesso de nossos clientes."
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Comprometidos com a qualidade e superação de expectativas."
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "Fundação",
      description: "Nascemos com a missão de revolucionar a gestão musical no Brasil."
    },
    {
      year: "2021",
      title: "Primeiros Clientes",
      description: "Conquistamos as primeiras gravadoras e produtoras independentes."
    },
    {
      year: "2022",
      title: "Expansão Nacional",
      description: "Expandimos para todo o território nacional com mais de 100 clientes."
    },
    {
      year: "2023",
      title: "Liderança de Mercado",
      description: "Nos tornamos a principal plataforma de gestão musical do país."
    },
    {
      year: "2024",
      title: "Expansão Internacional",
      description: "Iniciamos nossa jornada para conquistar o mercado latino-americano."
    }
  ];

  const team = [
    {
      name: "Carlos Silva",
      role: "CEO & Fundador",
      description: "15 anos de experiência na indústria musical e tecnologia.",
      image: "/placeholder.svg"
    },
    {
      name: "Ana Costa",
      role: "CTO",
      description: "Especialista em desenvolvimento de software e arquitetura de sistemas.",
      image: "/placeholder.svg"
    },
    {
      name: "Pedro Santos",
      role: "Head de Produto",
      description: "Expert em UX/UI e experiência do usuário em plataformas musicais.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            Nossa História
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Sobre a <span className="text-primary">Gestão 360</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Fundada por profissionais apaixonados pela música e tecnologia, a Gestão 360 
            nasceu para resolver os desafios complexos da indústria musical moderna.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Nossa Missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Democratizar o acesso a ferramentas profissionais de gestão musical, 
                  capacitando artistas e empresas a focarem no que realmente importa: a música.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Nossa Visão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ser a plataforma líder mundial em gestão musical, conectando 
                  artistas, produtores e empresas em um ecossistema integrado e eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Nosso Impacto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Transformamos a gestão de mais de 500 empresas musicais, 
                  impactando positivamente a carreira de milhares de artistas.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nossos Valores</h2>
            <p className="text-xl text-muted-foreground">
              Os princípios que guiam cada decisão e ação da nossa empresa.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <value.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nossa Jornada</h2>
            <p className="text-xl text-muted-foreground">
              Desde o início, nossa trajetória tem sido marcada por inovação e crescimento.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start mb-8">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <Badge variant="secondary" className="text-lg font-bold">
                    {item.year}
                  </Badge>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-primary rounded-full mt-2 mr-6"></div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nossa Equipe</h2>
            <p className="text-xl text-muted-foreground">
              Conheça os profissionais que lideram a inovação na gestão musical.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>{member.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}