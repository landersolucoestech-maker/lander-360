import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InstitutionalLayout } from "@/components/institutional/Layout";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  Send,
  Building,
  Users,
  Mic,
  Globe
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function InstitutionalContact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    segment: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em até 24 horas úteis.",
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      segment: "",
      phone: "",
      message: ""
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      info: "contato@gestao360.com",
      description: "Resposta em até 24h"
    },
    {
      icon: Phone,
      title: "Telefone",
      info: "+55 (11) 9999-9999",
      description: "Seg a Sex, 9h às 18h"
    },
    {
      icon: MapPin,
      title: "Endereço",
      info: "São Paulo, SP - Brasil",
      description: "Atendimento presencial com agendamento"
    },
    {
      icon: Clock,
      title: "Horário de Funcionamento",
      info: "Segunda a Sexta: 9h às 18h",
      description: "Suporte 24/7 para clientes enterprise"
    }
  ];

  const segments = [
    { value: "gravadora", label: "Gravadora", icon: Building },
    { value: "produtora", label: "Produtora", icon: Users },
    { value: "artista", label: "Artista Independente", icon: Mic },
    { value: "editora", label: "Editora Musical", icon: Globe },
    { value: "outro", label: "Outro", icon: MessageSquare }
  ];

  return (
    <InstitutionalLayout>
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Entre em <span className="text-primary">contato</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos prontos para ajudar você a transformar sua gestão musical. 
            Fale conosco e descubra como podemos impulsionar seu negócio.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Solicite uma proposta</CardTitle>
                <CardDescription>
                  Preencha o formulário e nossa equipe entrará em contato para apresentar 
                  a melhor solução para o seu negócio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="segment">Segmento *</Label>
                    <Select value={formData.segment} onValueChange={(value) => setFormData({ ...formData, segment: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments.map((segment) => (
                          <SelectItem key={segment.value} value={segment.value}>
                            <div className="flex items-center">
                              <segment.icon className="h-4 w-4 mr-2" />
                              {segment.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Conte-nos sobre suas necessidades e como podemos ajudar..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Send className="h-5 w-5 mr-2" />
                    Enviar mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Informações de contato</h2>
                <p className="text-muted-foreground">
                  Nossa equipe está sempre disponível para esclarecer suas dúvidas 
                  e apresentar as melhores soluções para o seu negócio.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-lg font-medium">{item.info}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas frequentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Quanto tempo leva para implementar?</h4>
                    <p className="text-sm text-muted-foreground">
                      A implementação varia de 1 a 4 semanas, dependendo do plano escolhido 
                      e das customizações necessárias.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Oferecem treinamento?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim! Todos os planos incluem treinamento inicial, e clientes enterprise 
                      recebem treinamento personalizado da equipe.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim, nossos contratos são flexíveis e você pode cancelar com aviso 
                      prévio de 30 dias.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Agende uma demonstração gratuita e veja como a Gestão 360 pode 
            transformar sua empresa musical.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Agendar demonstração
            </Button>
            <Button size="lg" variant="outline">
              Baixar material
            </Button>
          </div>
        </div>
      </section>
    </InstitutionalLayout>
  );
}