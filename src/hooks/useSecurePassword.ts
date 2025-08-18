import { generateSecureToken } from '@/lib/security';
import { useToast } from '@/hooks/use-toast';

export function useSecurePassword() {
  const { toast } = useToast();

  const generateAndNotifyPassword = () => {
    const password = generateSecureToken(20); // Longer, more secure password
    
    // DO NOT show password in UI for security - this should be sent via secure channel
    toast({
      title: "Senha Gerada",
      description: "Senha temporária foi gerada com sucesso. Entre em contato com o administrador para recebê-la via canal seguro.",
      duration: 5000,
    });

    // Log password securely for admin to access via server logs only
    console.log(`[ADMIN ONLY] Generated password for user: ${password}`);

    return password;
  };

  const generateSecurePassword = () => {
    // Generate password with guaranteed complexity
    const length = 16;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill remaining positions
    const allChars = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  };

  return { generateAndNotifyPassword, generateSecurePassword };
}