import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Smartphone, Mail, ArrowLeft, Send } from "lucide-react";

interface MFAVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  hasTotp: boolean;
  hasEmailOtp: boolean;
  userEmail: string;
  userId: string;
}

type VerificationMethod = "totp" | "email";

export function MFAVerification({ 
  onVerified, 
  onCancel, 
  hasTotp, 
  hasEmailOtp,
  userEmail,
  userId 
}: MFAVerificationProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [method, setMethod] = useState<VerificationMethod | null>(
    hasTotp ? "totp" : hasEmailOtp ? "email" : null
  );
  const [emailCodeSent, setEmailCodeSent] = useState(false);

  const verifyTOTP = async () => {
    if (verifyCode.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // Get factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factors.totp?.[0];
      if (!totpFactor) throw new Error("Fator TOTP não encontrado");

      // Challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });
      if (challengeError) throw challengeError;

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      toast({
        title: "Verificado!",
        description: "Autenticação de dois fatores concluída"
      });

      onVerified();
    } catch (error: any) {
      setError(error.message || "Código inválido");
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailCode = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { action: "send" }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setEmailCodeSent(true);
      toast({
        title: "Código Enviado",
        description: `Um código foi enviado para ${userEmail}`
      });
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

  const verifyEmailOTP = async () => {
    if (verifyCode.length !== 6) {
      setError("Digite um código de 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      // For email OTP during login, we just verify the code matches
      const { data: otpData, error: otpError } = await supabase
        .from("email_otp_codes")
        .select("*")
        .eq("user_id", userId)
        .eq("code", verifyCode)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (otpError || !otpData) {
        throw new Error("Código inválido ou expirado");
      }

      // Mark as verified
      await supabase
        .from("email_otp_codes")
        .update({ verified: true })
        .eq("id", otpData.id);

      toast({
        title: "Verificado!",
        description: "Autenticação de dois fatores concluída"
      });

      onVerified();
    } catch (error: any) {
      setError(error.message || "Código inválido ou expirado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = () => {
    if (method === "totp") {
      verifyTOTP();
    } else if (method === "email") {
      verifyEmailOTP();
    }
  };

  const selectMethod = (selectedMethod: VerificationMethod) => {
    setMethod(selectedMethod);
    setVerifyCode("");
    setError("");
    if (selectedMethod === "email") {
      sendEmailCode();
    }
  };

  // Show method selection if both are available
  if (!method && hasTotp && hasEmailOtp) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold text-primary-foreground mb-2">
            Verificação de Dois Fatores
          </h2>
          <p className="text-sm text-gray-400">
            Escolha como deseja verificar sua identidade
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-4 bg-gray-100 border-0 text-gray-700"
            onClick={() => selectMethod("totp")}
            disabled={isLoading}
          >
            <Smartphone className="h-5 w-5" />
            <span>App Autenticador</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-4 bg-gray-100 border-0 text-gray-700"
            onClick={() => selectMethod("email")}
            disabled={isLoading}
          >
            <Mail className="h-5 w-5" />
            <span>Código por E-mail</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-gray-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>
      </div>
    );
  }

  // Email OTP - need to send code first
  if (method === "email" && !emailCodeSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold text-primary-foreground mb-2">
            Verificação por E-mail
          </h2>
          <p className="text-sm text-gray-400">
            Enviaremos um código para {userEmail}
          </p>
        </div>

        <Button
          onClick={sendEmailCode}
          className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Enviar Código
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-gray-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>
      </div>
    );
  }

  // Show verification input
  return (
    <div className="space-y-6">
      <div className="text-center">
        {method === "totp" ? (
          <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
        ) : (
          <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
        )}
        <h2 className="text-xl font-bold text-primary-foreground mb-2">
          {method === "totp" ? "App Autenticador" : "Verificação por E-mail"}
        </h2>
        <p className="text-sm text-gray-400">
          {method === "totp" 
            ? "Digite o código do seu app autenticador" 
            : `Digite o código enviado para ${userEmail}`}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code" className="text-primary-foreground">
            Código de Verificação
          </Label>
          <Input
            id="mfa-code"
            value={verifyCode}
            onChange={(e) => {
              setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder="000000"
            maxLength={6}
            className="h-14 bg-gray-100 border-0 text-gray-700 text-center text-2xl tracking-widest"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold"
          disabled={isLoading || verifyCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </>
          ) : (
            "Verificar"
          )}
        </Button>

        {method === "email" && (
          <Button
            variant="ghost"
            onClick={sendEmailCode}
            disabled={isLoading}
            className="w-full text-gray-400"
          >
            <Send className="h-4 w-4 mr-2" />
            Reenviar código
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full text-gray-400"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>
      </div>
    </div>
  );
}
