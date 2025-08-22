import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";

export function InstitutionalFooter() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">G360</span>
              </div>
              <span className="text-xl font-bold">Gestão 360</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transformando a gestão musical com tecnologia e inovação.
            </p>
            <div className="flex space-x-4">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/institutional" className="text-muted-foreground hover:text-primary">Início</Link></li>
              <li><Link to="/institutional/services" className="text-muted-foreground hover:text-primary">Funcionalidades</Link></li>
              <li><Link to="/institutional/about" className="text-muted-foreground hover:text-primary">Preços</Link></li>
              <li><Link to="/institutional/contact" className="text-muted-foreground hover:text-primary">Contato</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Serviços</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Gestão de Artistas</li>
              <li>Controle Financeiro</li>
              <li>Marketing Musical</li>
              <li>Relatórios Avançados</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contato</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contato@gestao360.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Gestão 360. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}