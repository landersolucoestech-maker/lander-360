import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export function CreateAdminButton() {
  const [isCreating, setIsCreating] = useState(false);
  const {
    toast
  } = useToast();
  const createAdminUser = async () => {
    setIsCreating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        body: {
          email: 'admin@example.com', // Admin should change this
          full_name: 'Administrador Sistema'
        }
      });
      if (error) {
        console.error('Error creating admin user:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar usuário administrador: " + error.message,
          variant: "destructive"
        });
        return;
      }
      console.log('Admin user created successfully:', data);
      toast({
        title: "Sucesso!",
        description: `Usuário administrador criado com sucesso!`
      });
    } catch (error) {
      console.error('Failed to create admin user:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar usuário administrador",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração Inicial</CardTitle>
        <CardDescription>
          Criar usuário administrador padrão do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createAdminUser} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Criando..." : "Criar Usuário Administrador"}
        </Button>
      </CardContent>
    </Card>
  );
}