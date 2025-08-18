import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, EllipsisVertical, Plus, Save, Shield, Upload, Users, FileWarning, PlayCircle, PauseCircle, RotateCcw, Building2, Coins, PackageSearch, BarChart3, FlagTriangleRight, Layers, Receipt, BadgeDollarSign } from "lucide-react";

// Types
interface Tenant {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  email: string;
  phone?: string;
  status: "active" | "trial" | "suspended" | "cancelled";
  planId: string;
  createdAt: string;
  renewalAt?: string;
  seats: number;
  usage: {
    projects: number;
    storageGB: number;
    apiCalls: number;
  };
  modules: Record<string, boolean>;
  notes?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  limits: {
    seats: number;
    storageGB: number;
    projects: number;
    apiCalls: number;
  };
}

const DEFAULT_MODULES = [
  { key: "artists", label: "Artistas" },
  { key: "projects", label: "Projetos (Músicas)" },
  { key: "music-registry", label: "Registro de Músicas" },
  { key: "releases", label: "Lançamentos" },
  { key: "contracts", label: "Contratos" },
  { key: "financial", label: "Financeiro" },
  { key: "agenda", label: "Agenda" },
  { key: "invoice", label: "Nota Fiscal" },
  { key: "inventory", label: "Inventário" },
  { key: "users", label: "Usuários" },
  { key: "crm", label: "CRM" },
  { key: "marketing", label: "Marketing" },
  { key: "reports", label: "Relatórios" },
];

// Mock: planos e clientes (substituir por chamadas de API)
const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 149,
    currency: "BRL",
    billingCycle: "monthly",
    limits: { seats: 5, storageGB: 25, projects: 25, apiCalls: 50000 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 499,
    currency: "BRL",
    billingCycle: "monthly",
    limits: { seats: 25, storageGB: 200, projects: 250, apiCalls: 500000 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    currency: "BRL",
    billingCycle: "monthly",
    limits: { seats: 9999, storageGB: 9999, projects: 999999, apiCalls: 99999999 },
  },
];

const INITIAL_TENANTS: Tenant[] = [
  {
    id: "tnt_001",
    name: "Selo Aurora Music",
    legalName: "Aurora Music LTDA",
    taxId: "12.345.678/0001-90",
    email: "contato@auroramusic.com",
    phone: "+55 11 99999-0001",
    status: "active",
    planId: "pro",
    createdAt: "2024-11-03",
    renewalAt: "2025-11-03",
    seats: 12,
    usage: { projects: 142, storageGB: 120, apiCalls: 210345 },
    modules: { artists: true, catalog: true, releases: true, contracts: true, finance: true, agenda: true, crm: true, reports: true },
    notes: "Cliente desde 2021. Integração com QuickBooks e emissão NF-e via parceiro.",
  },
  {
    id: "tnt_002",
    name: "Independente XYZ",
    legalName: "Produtora XYZ ME",
    taxId: "98.765.432/0001-10",
    email: "financeiro@indxyz.com",
    phone: "+55 21 98888-1234",
    status: "trial",
    planId: "starter",
    createdAt: "2025-07-15",
    renewalAt: "2025-08-15",
    seats: 3,
    usage: { projects: 12, storageGB: 4, apiCalls: 2100 },
    modules: { artists: true, catalog: true, releases: false, contracts: false, finance: false, agenda: true, crm: false, reports: false },
    notes: "Trial 30 dias. Alto potencial.",
  },
  {
    id: "tnt_003",
    name: "Editora Harmonia",
    legalName: "Editora Harmonia EIRELI",
    taxId: "11.111.111/0001-11",
    email: "admin@harmonia.com.br",
    phone: "+55 31 97777-1212",
    status: "suspended",
    planId: "pro",
    createdAt: "2023-03-22",
    renewalAt: "2025-04-22",
    seats: 8,
    usage: { projects: 54, storageGB: 60, apiCalls: 95680 },
    modules: { artists: true, catalog: true, releases: true, contracts: true, finance: true, agenda: true, crm: true, reports: true },
    notes: "Suspenso por inadimplência. Reativar após acordo.",
  },
];

// Util: status para badge
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  trial: { label: "Teste", variant: "secondary" },
  suspended: { label: "Suspenso", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

function currency(v: number, currency = "BRL") {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(v);
  } catch {
    return `R$ ${v.toFixed(2)}`;
  }
}

function PlanBadge({ planId }: { planId: string }) {
  const p = PLANS.find((x) => x.id === planId);
  if (!p) return <Badge variant="outline">Sem plano</Badge>;
  return <Badge variant="outline">{p.name}</Badge>;
}

function ModuleToggles({ value, onChange }: { value: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {DEFAULT_MODULES.map((m) => (
        <div key={m.key} className="flex items-center justify-between p-3 rounded-2xl border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">{m.label}</span>
          </div>
          <Switch checked={!!value[m.key]} onCheckedChange={(ck) => onChange({ ...value, [m.key]: ck })} />
        </div>
      ))}
    </div>
  );
}

function CreateTenantDialog({ onCreate }: { onCreate: (t: Tenant) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("starter");
  const [seats, setSeats] = useState(3);
  const [modules, setModules] = useState<Record<string, boolean>>({ artists: true, catalog: true, agenda: true });

  const submit = () => {
    if (!name || !email) return toast.error("Preencha nome e e-mail.");
    const t: Tenant = {
      id: `tnt_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      status: "trial",
      planId,
      createdAt: new Date().toISOString().slice(0, 10),
      renewalAt: undefined,
      seats,
      usage: { projects: 0, storageGB: 0, apiCalls: 0 },
      modules,
    };
    onCreate(t);
    setOpen(false);
    toast.success("Cliente criado com sucesso");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="w-4 h-4"/>Novo Cliente</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Selo Exemplo" />
            </div>
            <div className="space-y-2">
              <Label>E-mail Administrativo</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cliente.com" />
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger><SelectValue placeholder="Selecione"/></SelectTrigger>
                <SelectContent>
                  {PLANS.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {p.price ? currency(p.price, p.currency) : "Custom"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assentos (usuários)</Label>
              <Input type="number" value={seats} onChange={(e) => setSeats(parseInt(e.target.value || "0", 10))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Módulos</Label>
            <ModuleToggles value={modules} onChange={setModules} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} className="gap-2"><Save className="w-4 h-4"/>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditTenantDialog({ tenant, onSave }: { tenant: Tenant; onSave: (t: Tenant) => void }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<Tenant>(tenant);

  const save = () => {
    onSave(local);
    setOpen(false);
    toast.success("Alterações salvas");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2"><Shield className="w-4 h-4"/>Gerenciar</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cliente: {tenant.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid grid-cols-4 gap-2">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="modulos">Módulos</TabsTrigger>
            <TabsTrigger value="limites">Limites</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>
          <TabsContent value="geral" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={local.name} onChange={(e) => setLocal({ ...local, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={local.email} onChange={(e) => setLocal({ ...local, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={local.status} onValueChange={(v) => setLocal({ ...local, status: v as Tenant["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Teste</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={local.planId} onValueChange={(v) => setLocal({ ...local, planId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLANS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assentos</Label>
                <Input type="number" value={local.seats} onChange={(e) => setLocal({ ...local, seats: parseInt(e.target.value || "0", 10) })} />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Projetos</CardTitle></CardHeader>
                <CardContent className="text-2xl font-semibold">{local.usage.projects}</CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Storage (GB)</CardTitle></CardHeader>
                <CardContent className="text-2xl font-semibold">{local.usage.storageGB}</CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-sm">API Calls</CardTitle></CardHeader>
                <CardContent className="text-2xl font-semibold">{local.usage.apiCalls}</CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="modulos" className="mt-4">
            <ModuleToggles value={local.modules || {}} onChange={(v) => setLocal({ ...local, modules: v })} />
          </TabsContent>
          <TabsContent value="limites" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Limite de Projetos</Label>
                <Input type="number" value={local.usage.projects} onChange={(e) => setLocal({ ...local, usage: { ...local.usage, projects: parseInt(e.target.value || "0", 10) } })} />
              </div>
              <div className="space-y-2">
                <Label>Limite de Storage (GB)</Label>
                <Input type="number" value={local.usage.storageGB} onChange={(e) => setLocal({ ...local, usage: { ...local.usage, storageGB: parseInt(e.target.value || "0", 10) } })} />
              </div>
              <div className="space-y-2">
                <Label>Limite de API Calls</Label>
                <Input type="number" value={local.usage.apiCalls} onChange={(e) => setLocal({ ...local, usage: { ...local.usage, apiCalls: parseInt(e.target.value || "0", 10) } })} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="notas" className="mt-4">
            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea value={local.notes || ""} onChange={(e) => setLocal({ ...local, notes: e.target.value })} placeholder="Contexto, histórico, acordos, etc." />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button onClick={save} className="gap-2"><Save className="w-4 h-4"/>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TenantsTable({ data, onUpdate, onDelete }: { data: Tenant[]; onUpdate: (t: Tenant) => void; onDelete: (id: string) => void }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    return data.filter((t) => [t.name, t.email, t.legalName, t.taxId].filter(Boolean).some((f) => (f || "").toLowerCase().includes(q.toLowerCase())));
  }, [q, data]);

  const exportCSV = () => {
    const headers = ["id","name","email","status","plan","seats","projects","storageGB","apiCalls","createdAt","renewalAt"];
    const rows = data.map(t => [t.id, t.name, t.email, t.status, t.planId, t.seats, t.usage.projects, t.usage.storageGB, t.usage.apiCalls, t.createdAt, t.renewalAt || ""]); 
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `clientes_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar por nome, e-mail, CNPJ..." className="w-[300px]" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="outline" onClick={exportCSV} className="gap-2"><Upload className="w-4 h-4"/>Exportar CSV</Button>
        </div>
        <div className="text-sm text-muted-foreground">{filtered.length} resultado(s)</div>
      </div>
      <Table>
        <TableCaption>Clientes do sistema (multi-tenant)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Assentos</TableHead>
            <TableHead>Uso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((t) => (
            <TableRow key={t.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.email}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant={statusConfig[t.status].variant}>{statusConfig[t.status].label}</Badge></TableCell>
              <TableCell><PlanBadge planId={t.planId} /></TableCell>
              <TableCell>{t.seats}</TableCell>
              <TableCell>
                <div className="text-xs leading-tight">
                  <div>Projetos: {t.usage.projects}</div>
                  <div>Storage: {t.usage.storageGB} GB</div>
                  <div>API: {t.usage.apiCalls.toLocaleString("pt-BR")}</div>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditTenantDialog tenant={t} onSave={onUpdate} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><EllipsisVertical className="w-4 h-4"/></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        const updated = { ...t, status: (t.status === "suspended" ? "active" : "suspended") as Tenant["status"] };
                        onUpdate(updated);
                        toast.message(updated.status === "active" ? "Cliente reativado" : "Cliente suspenso");
                      }} className="gap-2">
                        {t.status === "suspended" ? <PlayCircle className="w-4 h-4"/> : <PauseCircle className="w-4 h-4"/>}
                        {t.status === "suspended" ? "Reativar" : "Suspender"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(t.id)} className="gap-2 text-destructive">
                        <FileWarning className="w-4 h-4"/>Excluir
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(t.id)} className="gap-2">
                        <BadgeDollarSign className="w-4 h-4"/>Copiar Tenant ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Kpi({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function PortalAdmin() {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);

  const totals = useMemo(() => {
    const active = tenants.filter(t => t.status === "active").length;
    const mrr = tenants.reduce((acc, t) => {
      const p = PLANS.find(p => p.id === t.planId);
      return acc + (t.status === "cancelled" ? 0 : (p?.price || 0));
    }, 0);
    const suspended = tenants.filter(t => t.status === "suspended").length;
    const trials = tenants.filter(t => t.status === "trial").length;
    return { active, mrr, suspended, trials };
  }, [tenants]);

  const createTenant = (t: Tenant) => setTenants((prev) => [t, ...prev]);
  const updateTenant = (t: Tenant) => setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
  const deleteTenant = (id: string) => setTenants((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Topbar */}
      <div className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="p-2 rounded-2xl border">
              <Building2 className="w-5 h-5" />
            </motion.div>
            <div className="font-semibold">Portal Administrativo — Provedor</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><RotateCcw className="w-4 h-4"/>Sincronizar</Button>
            <CreateTenantDialog onCreate={createTenant} />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi title="Clientes Ativos" value={String(totals.active)} icon={Users} />
          <Kpi title="MRR Estimado" value={currency(totals.mrr)} icon={Coins} />
          <Kpi title="Trials" value={String(totals.trials)} icon={FlagTriangleRight} />
          <Kpi title="Suspensos" value={String(totals.suspended)} icon={PackageSearch} />
        </div>

        {/* Guia principal */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers className="w-4 h-4"/>Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <TenantsTable data={tenants} onUpdate={updateTenant} onDelete={deleteTenant} />
          </CardContent>
        </Card>

        {/* Futuras sessões (placeholders) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Planos & Assinaturas</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Gerencie planos, billing cycle, cupons e preços regionais.</CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Faturamento</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Integre com Stripe, Pagar.me, Asaas, Mercado Pago ou QuickBooks.</CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Auditoria & Relatórios</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">Logs de segurança, uso e relatórios de receita (MRR, churn, LTV).</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}