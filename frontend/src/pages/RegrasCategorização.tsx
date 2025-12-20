import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ArrowLeft, Search, Tag, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  categorizationRules, 
  CategorizationRule, 
  getCategoryLabel 
} from "@/lib/categorization-rules";

interface CustomRule extends CategorizationRule {
  id: string;
  isCustom: boolean;
}

const RegrasCategorização = () => {
  const { toast } = useToast();
  
  // Load custom rules from localStorage
  const loadCustomRules = (): CustomRule[] => {
    const stored = localStorage.getItem('customCategorizationRules');
    return stored ? JSON.parse(stored) : [];
  };

  // Load deleted system rules from localStorage
  const loadDeletedSystemRules = (): string[] => {
    const stored = localStorage.getItem('deletedSystemRules');
    return stored ? JSON.parse(stored) : [];
  };

  const [customRules, setCustomRules] = useState<CustomRule[]>(loadCustomRules);
  const [deletedSystemRules, setDeletedSystemRules] = useState<string[]>(loadDeletedSystemRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<'receitas' | 'despesas' | 'investimentos'>('despesas');

  // Combine built-in and custom rules (excluding deleted system rules)
  const allRules: CustomRule[] = [
    ...categorizationRules
      .map((rule, index) => ({
        ...rule,
        id: `builtin-${index}`,
        isCustom: false,
      }))
      .filter(rule => !deletedSystemRules.includes(rule.id)),
    ...customRules,
  ];

  // Filter rules
  const filteredRules = allRules.filter(rule => {
    const matchesSearch = !searchTerm || 
      rule.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || rule.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const saveCustomRules = (rules: CustomRule[]) => {
    localStorage.setItem('customCategorizationRules', JSON.stringify(rules));
    setCustomRules(rules);
  };

  const handleOpenModal = (rule?: CustomRule) => {
    if (rule) {
      setEditingRule(rule);
      setKeywords(rule.keywords.join(", "));
      setCategory(rule.category);
      setType(rule.type);
    } else {
      setEditingRule(null);
      setKeywords("");
      setCategory("");
      setType('despesas');
    }
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!keywords.trim() || !category.trim()) {
      toast({
        title: "Erro",
        description: "Preencha as palavras-chave e a categoria.",
        variant: "destructive",
      });
      return;
    }

    const keywordList = keywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k);
    
    if (keywordList.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma palavra-chave.",
        variant: "destructive",
      });
      return;
    }

    const newRule: CustomRule = {
      id: editingRule?.isCustom ? editingRule.id : `custom-${Date.now()}`,
      keywords: keywordList,
      category: category.toLowerCase().replace(/\s+/g, '_'),
      type,
      isCustom: true,
    };

    let updatedRules: CustomRule[];
    if (editingRule && editingRule.isCustom) {
      // Editing existing custom rule
      updatedRules = customRules.map(r => r.id === editingRule.id ? newRule : r);
    } else {
      // Creating new rule or converting system rule to custom
      updatedRules = [...customRules, newRule];
    }

    saveCustomRules(updatedRules);
    setIsModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: editingRule ? "Regra atualizada com sucesso." : "Regra criada com sucesso.",
    });
  };

  const handleDeleteRule = (rule: CustomRule) => {
    if (rule.isCustom) {
      const updatedRules = customRules.filter(r => r.id !== rule.id);
      saveCustomRules(updatedRules);
    } else {
      // For system rules, save to deleted list and update state
      const updatedDeletedRules = [...deletedSystemRules, rule.id];
      localStorage.setItem('deletedSystemRules', JSON.stringify(updatedDeletedRules));
      setDeletedSystemRules(updatedDeletedRules);
    }
    
    toast({
      title: "Sucesso",
      description: "Regra excluída com sucesso.",
    });
  };

  const getTypeBadge = (ruleType: string) => {
    switch (ruleType) {
      case 'receitas':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Receitas</Badge>;
      case 'despesas':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Despesas</Badge>;
      case 'investimentos':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Investimentos</Badge>;
      default:
        return <Badge variant="outline">{ruleType}</Badge>;
    }
  };

  // Category options by type
  const categoryOptions = {
    receitas: [
      'streaming', 'onerpm', 'distrokid', '30por1', 'shows', 
      'licenciamento', 'merchandising', 'publicidade', 'producao', 'outros'
    ],
    despesas: [
      'caches', 'comissao', 'marketing', 'salarios', 'aluguel', 'manutencao', 
      'viagens', 'juridicos', 'contabilidade', 'estudio', 'equipamentos', 
      'registros', 'licencas', 'infraestrutura', 'servicos', 'equipe', 'outros'
    ],
    investimentos: [
      'clipes', 'turnê', 'capacitacao', 'producao_musical', 'marketing_digital', 'outros'
    ],
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full h-full px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9" />
                <Link to="/financeiro">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Regras de Categorização</h1>
                  <p className="text-muted-foreground">Gerencie regras para categorização automática de transações</p>
                </div>
              </div>
              <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Nova Regra
              </Button>
            </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{categorizationRules.length}</p>
                    <p className="text-sm text-muted-foreground">Regras do Sistema</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{customRules.length}</p>
                    <p className="text-sm text-muted-foreground">Regras Personalizadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {allRules.filter(r => r.type === 'receitas').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Regras de Receitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {allRules.filter(r => r.type === 'despesas').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Regras de Despesas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por palavra-chave ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="receitas">Receitas</SelectItem>
                    <SelectItem value="despesas">Despesas</SelectItem>
                    <SelectItem value="investimentos">Investimentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Regras de Categorização</CardTitle>
              <CardDescription>
                Lista de todas as regras para categorização automática de transações OFX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavras-chave</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.keywords.slice(0, 5).map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {rule.keywords.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{rule.keywords.length - 5}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getCategoryLabel(rule.category)}
                      </TableCell>
                      <TableCell>{getTypeBadge(rule.type)}</TableCell>
                      <TableCell>
                        {rule.isCustom ? (
                          <Badge variant="outline" className="border-primary text-primary">
                            Personalizada
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sistema</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(rule)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRule(rule)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhuma regra encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add/Edit Rule Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? "Editar Regra" : "Nova Regra de Categorização"}
                </DialogTitle>
                <DialogDescription>
                  Defina palavras-chave que identificam a categoria da transação
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Palavras-chave</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="spotify, apple music, deezer (separadas por vírgula)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe múltiplas palavras-chave por vírgula
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Transação</Label>
                  <Select value={type} onValueChange={(v: 'receitas' | 'despesas' | 'investimentos') => setType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receitas">Receitas</SelectItem>
                      <SelectItem value="despesas">Despesas</SelectItem>
                      <SelectItem value="investimentos">Investimentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions[type].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryLabel(cat)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveRule}>
                  {editingRule ? "Atualizar" : "Criar Regra"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default RegrasCategorização;
