import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMarketingCampaigns } from "@/hooks/useMarketing";
import { 
  Link, Save, BarChart3, TrendingUp, 
  ExternalLink, Copy, QrCode, Calendar,
  Target, Zap, MousePointer
} from "lucide-react";

interface SmartLink {
  id: string;
  title: string;
  artist: string;
  shortUrl: string;
  clicks: number;
  saves: number;
  platforms: { name: string; url: string; clicks: number }[];
  createdAt: string;
  isPreSave: boolean;
  releaseDate?: string;
}

const AdvancedMarketingModule = () => {
  const { toast } = useToast();
  const { data: campaigns = [], isLoading: campaignsLoading } = useMarketingCampaigns();
  const [activeTab, setActiveTab] = useState("smartlinks");

  // Empty arrays - no mocked data
  const smartLinks: SmartLink[] = [];

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  const handleCreateSmartLink = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Em breve você poderá criar smart links.",
    });
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  // Calculate totals from real campaign data
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
  const averageRoas = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.roas || 0), 0) / campaigns.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Marketing Avançado
          </h2>
          <p className="text-muted-foreground">
            Smart Links, Pre-saves e Analytics Detalhado
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Link className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{smartLinks.length}</p>
                <p className="text-xs text-muted-foreground">Smart Links</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MousePointer className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(smartLinks.reduce((sum, l) => sum + l.clicks, 0))}</p>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Save className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatNumber(smartLinks.reduce((sum, l) => sum + l.saves, 0))}</p>
                <p className="text-xs text-muted-foreground">Pre-saves</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRoas.toFixed(1)}x</p>
                <p className="text-xs text-muted-foreground">ROAS Médio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="smartlinks" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Smart Links
          </TabsTrigger>
          <TabsTrigger value="presaves" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Pre-saves
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tracking Campanhas
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Benchmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smartlinks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Smart Links</CardTitle>
                  <CardDescription>
                    Links inteligentes que redirecionam para múltiplas plataformas
                  </CardDescription>
                </div>
                <Button onClick={handleCreateSmartLink}>
                  <Link className="h-4 w-4 mr-2" />
                  Criar Smart Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartLinks.map(link => (
                  <div key={link.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">{link.title}</p>
                          {link.isPreSave && (
                            <Badge variant="secondary">Pre-save</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{link.artist}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyLink(link.shortUrl)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                        <Button variant="outline" size="sm">
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="font-mono">
                        {link.shortUrl}
                      </Badge>
                      <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xl font-bold">{formatNumber(link.clicks)}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xl font-bold">{formatNumber(link.saves)}</p>
                        <p className="text-xs text-muted-foreground">Saves</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xl font-bold">{((link.saves / link.clicks) * 100).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Conv. Rate</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-xl font-bold">{link.platforms.length}</p>
                        <p className="text-xs text-muted-foreground">Plataformas</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Clicks por Plataforma</p>
                      {link.platforms.map(platform => (
                        <div key={platform.name} className="flex items-center gap-3">
                          <span className="text-sm w-24">{platform.name}</span>
                          <Progress 
                            value={(platform.clicks / link.clicks) * 100} 
                            className="flex-1 h-2" 
                          />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {formatNumber(platform.clicks)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Campanhas de Pre-save
              </CardTitle>
              <CardDescription>
                Gerencie campanhas de pre-save para próximos lançamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {smartLinks.filter(l => l.isPreSave).length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Nenhuma campanha de pre-save ativa</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Crie um smart link com pre-save para próximos lançamentos
                  </p>
                  <Button className="mt-4">
                    Criar Pre-save
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {smartLinks.filter(l => l.isPreSave).map(link => (
                    <div key={link.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold">{link.title}</p>
                          <p className="text-sm text-muted-foreground">{link.artist}</p>
                        </div>
                        <Badge variant="secondary">
                          <Calendar className="h-3 w-3 mr-1" />
                          Lança em {link.releaseDate}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{formatNumber(link.saves)}</p>
                          <p className="text-xs text-muted-foreground">Pre-saves</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatNumber(link.clicks)}</p>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {((link.saves / link.clicks) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Taxa Conversão</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Detalhado de Campanhas</CardTitle>
              <CardDescription>
                Métricas avançadas de todas as campanhas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead className="text-right">Impressões</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Carregando campanhas...
                      </TableCell>
                    </TableRow>
                  ) : campaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhuma campanha encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaigns.map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell><Badge variant="outline">{campaign.status || '-'}</Badge></TableCell>
                        <TableCell className="text-right">{formatNumber(campaign.impressions || 0)}</TableCell>
                        <TableCell className="text-right">{formatNumber(campaign.clicks || 0)}</TableCell>
                        <TableCell className="text-right">{(campaign.ctr || 0).toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{campaign.conversions || 0}</TableCell>
                        <TableCell className="text-right">{formatCurrency(campaign.spent || 0)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(campaign.cpc || 0)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={(campaign.roas || 0) >= 3 ? 'default' : (campaign.roas || 0) >= 2 ? 'secondary' : 'destructive'}>
                            {(campaign.roas || 0).toFixed(1)}x
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Benchmarks de Mercado
              </CardTitle>
              <CardDescription>
                Compare seu desempenho com a indústria (estilo Chartmetric)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Benchmarks em Desenvolvimento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Em breve você poderá comparar suas métricas com benchmarks de mercado
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMarketingModule;
