import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Smartphone, Mail, Shield, CheckCircle, XCircle, Copy, Send } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface TwoFactorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "enroll-totp" | "verify-totp" | "enroll-email" | "verify-email" | "manage";

interface MFAFactor {
  id: string;
  factor_type: string;
  status: string;
  friendly_name?: string;
}

interface Email2FASettings {
  email_2fa_enabled: boolean;
}

export function TwoFactorModal({ open, onOpenChange }: TwoFactorModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("choose");
  const [isLoading, setIsLoading] = useState(false);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [email2FAEnabled, setEmail2FAEnabled] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      checkExistingFactors();
    }
  }, [open]);

  const checkExistingFactors = async () => {
    setIsLoading(true);
    try {
      // Check TOTP factors
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const allFactors = [...(data.totp || []), ...(data.phone || [])];
      setFactors(allFactors);

      // Check email 2FA settings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: settings } = await supabase
          .from("user_2fa_settings")
          .select("email_2fa_enabled")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setEmail2FAEnabled(settings?.email_2fa_enabled || false);
      }
      
      const hasTOTP = allFactors.some(f => f.status === "verified");
      if (hasTOTP || email2FAEnabled) {
        setStep("manage");
      } else {
        setStep("choose");
      }
    } catch (error: any) {
      console.error("Error checking MFA factors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const enrollTOTP = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator App"
      });

      if (error) throw error;

      setTotpUri(data.totp.uri);
      setTotpSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("verify-totp");
    } catch (error: any) {
      setError(error.message || "Erro ao configurar TOTP");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível configurar o autenticador",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enrollEmailOTP = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "send" }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Código Enviado",
        description: "Verifique seu e-mail para o código de verificação"
      });

      setStep("verify-email");
    } catch (error: any) {
      setError(error.message || "Erro ao enviar código");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o código",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (verifyCode.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      toast({
        title: "2FA Ativado",
        description: "Autenticação de dois fatores configurada com sucesso!"
      });

      await checkExistingFactors();
      setVerifyCode("");
    } catch (error: any) {
      setError(error.message || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOTP = async () => {
    if (verifyCode.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "verify", code: verifyCode }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "E-mail 2FA Ativado",
        description: "Autenticação por e-mail configurada com sucesso!"
      });

      setEmail2FAEnabled(true);
      await checkExistingFactors();
      setVerifyCode("");
      setStep("manage");
    } catch (error: any) {
      setError(error.message || "Código inválido ou expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmailCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "send" }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Código Reenviado",
        description: "Um novo código foi enviado para seu e-mail"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível reenviar o código",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unenrollFactor = async (factorId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      toast({
        title: "2FA Desativado",
        description: "Fator de autenticação removido com sucesso"
      });

      await checkExistingFactors();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível remover o fator",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableEmail2FA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "disable" }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEmail2FAEnabled(false);
      toast({
        title: "E-mail 2FA Desativado",
        description: "Autenticação por e-mail foi desativada"
      });

      await checkExistingFactors();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível desativar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    toast({
      title: "Copiado",
      description: "Chave secreta copiada para a área de transferência"
    });
  };

  const handleClose = () => {
    setStep("choose");
    setVerifyCode("");
    setError("");
    setTotpUri("");
    setTotpSecret("");
    setFactorId("");
    onOpenChange(false);
  };

  const renderChooseMethod = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Escolha um método para adicionar uma camada extra de segurança à sua conta.
      </p>
      
      <div className="grid gap-4">
        <Button
          variant="outline"
          className="h-auto p-4 justify-start gap-4"
          onClick={enrollTOTP}
          disabled={isLoading}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">App Autenticador (TOTP)</p>
            <p className="text-sm text-muted-foreground">
              Use Google Authenticator, Authy ou similar
            </p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 justify-start gap-4"
          onClick={enrollEmailOTP}
          disabled={isLoading}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">E-mail OTP</p>
            <p className="text-sm text-muted-foreground">
              Receba códigos de verificação por e-mail
            </p>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderEnrollTOTP = () => (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Escaneie o QR Code com seu app autenticador
        </p>
        
        {totpUri && (
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={totpUri} size={180} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 justify-center">
          <p className="text-xs text-muted-foreground">
            Ou insira manualmente:
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md">
          <code className="text-xs flex-1 break-all">{totpSecret}</code>
          <Button size="icon" variant="ghost" onClick={copySecret}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button onClick={() => setStep("verify-totp")} className="w-full">
        Continuar
      </Button>
    </div>
  );

  const renderVerifyTOTP = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Digite o código de 6 dígitos do seu app autenticador para confirmar.
      </p>

      <div className="space-y-2">
        <Label htmlFor="verify-code">Código de Verificação</Label>
        <Input
          id="verify-code"
          value={verifyCode}
          onChange={(e) => {
            setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("enroll-totp")}
          className="flex-1"
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button
          onClick={verifyTOTP}
          className="flex-1"
          disabled={isLoading || verifyCode.length !== 6}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
        </Button>
      </div>
    </div>
  );

  const renderVerifyEmail = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
        <Mail className="h-5 w-5 text-blue-500" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Um código foi enviado para seu e-mail
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Digite o código de 6 dígitos que você recebeu por e-mail.
      </p>

      <div className="space-y-2">
        <Label htmlFor="verify-email-code">Código de Verificação</Label>
        <Input
          id="verify-email-code"
          value={verifyCode}
          onChange={(e) => {
            setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep("choose")}
          className="flex-1"
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button
          onClick={verifyEmailOTP}
          className="flex-1"
          disabled={isLoading || verifyCode.length !== 6}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
        </Button>
      </div>

      <Button
        variant="ghost"
        onClick={resendEmailCode}
        disabled={isLoading}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        Reenviar código
      </Button>
    </div>
  );

  const renderManage = () => {
    const verifiedFactors = factors.filter(f => f.status === "verified");
    const hasAnyFactor = verifiedFactors.length > 0 || email2FAEnabled;
    
    return (
      <div className="space-y-4">
        {hasAnyFactor && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Autenticação de dois fatores está ativada
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Métodos Configurados</Label>
          
          {verifiedFactors.map((factor) => (
            <div
              key={factor.id}
              className="flex items-center justify-between p-3 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">App Autenticador</p>
                  <p className="text-xs text-muted-foreground">
                    {factor.friendly_name || "TOTP"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                  Ativo
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => unenrollFactor(factor.id)}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {email2FAEnabled && (
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">E-mail OTP</p>
                  <p className="text-xs text-muted-foreground">
                    Códigos enviados por e-mail
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                  Ativo
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disableEmail2FA}
                  disabled={isLoading}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}

          {!hasAnyFactor && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum método de 2FA configurado
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep("choose")}
            disabled={isLoading}
            className="w-full"
          >
            Adicionar Método
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de Dois Fatores
          </DialogTitle>
          <DialogDescription>
            {step === "manage"
              ? "Gerencie suas configurações de 2FA"
              : "Adicione uma camada extra de segurança à sua conta"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && step === "choose" ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {step === "choose" && renderChooseMethod()}
            {step === "enroll-totp" && renderEnrollTOTP()}
            {step === "verify-totp" && renderVerifyTOTP()}
            {step === "verify-email" && renderVerifyEmail()}
            {step === "manage" && renderManage()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
