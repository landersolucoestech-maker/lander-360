import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, Calendar, Clock, Globe, Smartphone } from 'lucide-react';

// Mock data - replace with real analytics data
const userGrowthData = [
  { month: 'Jan', users: 1200, active: 980, new: 220 },
  { month: 'Fev', users: 1480, active: 1180, new: 280 },
  { month: 'Mar', users: 1850, active: 1520, new: 370 },
  { month: 'Abr', users: 2100, active: 1750, new: 250 },
  { month: 'Mai', users: 2600, active: 2180, new: 500 },
  { month: 'Jun', users: 3200, active: 2680, new: 600 }
];

const revenueData = [
  { month: 'Jan', revenue: 48000, subscriptions: 1200 },
  { month: 'Fev', revenue: 59200, subscriptions: 1480 },
  { month: 'Mar', revenue: 74000, subscriptions: 1850 },
  { month: 'Abr', revenue: 84000, subscriptions: 2100 },
  { month: 'Mai', revenue: 104000, subscriptions: 2600 },
  { month: 'Jun', revenue: 128000, subscriptions: 3200 }
];

const planDistribution = [
  { name: 'Básico', value: 45, color: '#8884d8' },
  { name: 'Profissional', value: 35, color: '#82ca9d' },
  { name: 'Enterprise', value: 20, color: '#ffc658' }
];

const deviceData = [
  { device: 'Desktop', sessions: 3500, percentage: 55 },
  { device: 'Mobile', sessions: 2200, percentage: 35 },
  { device: 'Tablet', sessions: 630, percentage: 10 }
];

const dailyActiveUsers = [
  { day: 'Seg', users: 1850 },
  { day: 'Ter', users: 2100 },
  { day: 'Qua', users: 1980 },
  { day: 'Qui', users: 2250 },
  { day: 'Sex', users: 2400 },
  { day: 'Sáb', users: 1650 },
  { day: 'Dom', users: 1420 }
];

export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Métricas e Analytics</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho e crescimento da plataforma</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Totais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,200</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 128.000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+23%</span> crescimento mensal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.5%</span> vs. mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,680</div>
            <p className="text-xs text-muted-foreground">
              83.8% dos usuários totais
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
                <CardDescription>
                  Evolução do número total de usuários ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" name="Total" />
                    <Area type="monotone" dataKey="active" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Ativos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Planos</CardTitle>
                <CardDescription>
                  Percentual de usuários por tipo de plano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={planDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos Diários</CardTitle>
              <CardDescription>
                Número de usuários únicos ativos por dia da semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" name="Usuários Ativos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>
                Receita mensal e número de assinaturas ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `R$ ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Receita' : 'Assinaturas'
                  ]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Receita (R$)" />
                  <Line yAxisId="right" type="monotone" dataKey="subscriptions" stroke="#ff7300" name="Assinaturas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARR (Receita Anual)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 1.536.000</div>
                <p className="text-xs text-muted-foreground">
                  Baseado na receita atual
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 40</div>
                <p className="text-xs text-muted-foreground">
                  Receita média por usuário
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.1%</div>
                <p className="text-xs text-muted-foreground">
                  Taxa de cancelamento mensal
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Sessão</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24min</div>
                <p className="text-xs text-muted-foreground">
                  +5min vs. mês anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pages por Sessão</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">
                  Páginas visitadas por sessão
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Rejeição</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28%</div>
                <p className="text-xs text-muted-foreground">
                  -5% vs. mês anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões por Usuário</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.5</div>
                <p className="text-xs text-muted-foreground">
                  Sessões médias por mês
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Acesso por Dispositivo</CardTitle>
                <CardDescription>
                  Distribuição de sessões por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>{device.device}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{device.percentage}%</span>
                        <span className="text-sm text-muted-foreground">{device.sessions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Principais Navegadores</CardTitle>
                <CardDescription>
                  Navegadores mais utilizados pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Chrome</span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[65%]" />
                      </div>
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Safari</span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[20%]" />
                      </div>
                      <span className="text-sm">20%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Firefox</span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[10%]" />
                      </div>
                      <span className="text-sm">10%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Edge</span>
                    <div className="flex items-center gap-4">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-[5%]" />
                      </div>
                      <span className="text-sm">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};