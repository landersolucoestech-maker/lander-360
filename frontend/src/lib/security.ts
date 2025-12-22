import { UserRole } from './permissions';

/**
 * Security configuration and utilities
 */

export const SECURITY_CONFIG = {
  // Content Security Policy headers
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://rlinswqockcnijhojnth.supabase.co', 'https://*.supabase.co'],
    'font-src': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"],
  },
  
  // Additional security headers
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
} as const;

// ============================================
// GRANULAR PERMISSION SYSTEM (ABAC)
// ============================================

// Granular permission types
export type Permission = 
  // Artist permissions
  | 'artists.view' | 'artists.create' | 'artists.edit' | 'artists.delete'
  // Contract permissions
  | 'contracts.view' | 'contracts.create' | 'contracts.edit' | 'contracts.delete' | 'contracts.sign'
  // Financial permissions
  | 'financial.view' | 'financial.create' | 'financial.edit' | 'financial.delete' | 'financial.approve'
  // Music permissions
  | 'music.view' | 'music.create' | 'music.edit' | 'music.delete'
  // Release permissions
  | 'releases.view' | 'releases.create' | 'releases.edit' | 'releases.delete' | 'releases.approve'
  // Project permissions
  | 'projects.view' | 'projects.create' | 'projects.edit' | 'projects.delete'
  // Marketing permissions
  | 'marketing.view' | 'marketing.create' | 'marketing.edit' | 'marketing.delete'
  // CRM permissions
  | 'crm.view' | 'crm.create' | 'crm.edit' | 'crm.delete'
  // User management permissions
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete' | 'users.roles'
  // Settings permissions
  | 'settings.view' | 'settings.edit'
  // Audit permissions
  | 'audit.view'
  // Reports permissions
  | 'reports.view' | 'reports.export';

// Role-based permission matrix (Principle of Least Privilege)
export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    'artists.view', 'artists.create', 'artists.edit', 'artists.delete',
    'contracts.view', 'contracts.create', 'contracts.edit', 'contracts.delete', 'contracts.sign',
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.approve',
    'music.view', 'music.create', 'music.edit', 'music.delete',
    'releases.view', 'releases.create', 'releases.edit', 'releases.delete', 'releases.approve',
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete',
    'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
    'users.view', 'users.create', 'users.edit', 'users.delete', 'users.roles',
    'settings.view', 'settings.edit',
    'audit.view',
    'reports.view', 'reports.export',
  ],
  gestor_artistico: [
    'artists.view', 'artists.create', 'artists.edit',
    'contracts.view', 'contracts.create', 'contracts.edit', 'contracts.sign',
    'financial.view', // Can view but not edit financial
    'music.view', 'music.create', 'music.edit',
    'releases.view', 'releases.create', 'releases.edit', 'releases.approve',
    'projects.view', 'projects.create', 'projects.edit',
    'marketing.view', 'marketing.create', 'marketing.edit',
    'crm.view', 'crm.create', 'crm.edit',
    'reports.view', 'reports.export',
  ],
  financeiro: [
    'artists.view', // Can only view artists
    'contracts.view', // Can view but not edit contracts
    'financial.view', 'financial.create', 'financial.edit', 'financial.delete', 'financial.approve',
    'reports.view', 'reports.export',
    'audit.view',
  ],
  marketing: [
    'artists.view',
    'releases.view',
    'projects.view',
    'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.delete',
    'crm.view', 'crm.create', 'crm.edit',
    'reports.view',
  ],
  artista: [
    'projects.view', // Can only view own projects
    'releases.view', // Can only view own releases
    'reports.view', // Personal reports only
  ],
  colaborador: [
    'projects.view',
    'releases.view',
    'music.view',
  ],
  leitor: [
    'artists.view',
    'projects.view',
    'releases.view',
    'contracts.view',
    'reports.view',
  ],
};

// Check if user has a specific permission
export function hasPermission(userRoles: UserRole[], permission: Permission): boolean {
  // Admin always has all permissions
  if (userRoles.includes('admin')) return true;
  
  // Check if any user role has the permission
  return userRoles.some(role => 
    rolePermissions[role]?.includes(permission)
  );
}

// Check if user has any of the specified permissions
export function hasAnyPermission(userRoles: UserRole[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRoles, permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(userRoles: UserRole[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRoles, permission));
}

// Get all permissions for a user based on their roles
export function getUserPermissions(userRoles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>();
  
  userRoles.forEach(role => {
    rolePermissions[role]?.forEach(permission => {
      permissions.add(permission);
    });
  });
  
  return Array.from(permissions);
}

// ============================================
// PASSWORD SECURITY - LEAKED PASSWORD PROTECTION
// ============================================

// Top 200 most common leaked passwords (from HaveIBeenPwned and security research)
const COMMON_LEAKED_PASSWORDS = new Set([
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111',
  '1234567', 'dragon', '123123', 'baseball', 'abc123', 'football', 'monkey', 'letmein',
  '696969', 'shadow', 'master', '666666', 'qwertyuiop', '123321', 'mustang', '1234567890',
  'michael', '654321', 'pussy', 'superman', '1qaz2wsx', '7777777', 'fuckyou', '121212',
  '000000', 'qazwsx', '123qwe', 'killer', 'trustno1', 'jordan', 'jennifer', 'zxcvbnm',
  'asdfgh', 'hunter', 'buster', 'soccer', 'harley', 'batman', 'andrew', 'tigger',
  'sunshine', 'iloveyou', 'fuckme', '2000', 'charlie', 'robert', 'thomas', 'hockey',
  'ranger', 'daniel', 'starwars', 'klaster', '112233', 'george', 'asshole', 'computer',
  'michelle', 'jessica', 'pepper', '1111', 'zxcvbn', '555555', '11111111', '131313',
  'freedom', '777777', 'pass', 'fuck', 'maggie', '159753', 'aaaaaa', 'ginger', 'princess',
  'joshua', 'cheese', 'amanda', 'summer', 'love', 'ashley', '6969', 'nicole', 'chelsea',
  'biteme', 'matthew', 'access', 'yankees', '987654321', 'dallas', 'austin', 'thunder',
  'taylor', 'matrix', 'william', 'corvette', 'hello', 'martin', 'heather', 'secret',
  'fucker', 'merlin', 'diamond', '1234qwer', 'gfhjkm', 'hammer', 'silver', '222222',
  '88888888', 'anthony', 'justin', 'test', 'bailey', 'q1w2e3r4t5', 'patrick', 'internet',
  'scooter', 'orange', '11111', 'golfer', 'cookie', 'richard', 'samantha', 'bigdog',
  'guitar', 'jackson', 'whatever', 'mickey', 'chicken', 'sparky', 'snoopy', 'maverick',
  'phoenix', 'camaro', 'sexy', 'peanut', 'morgan', 'welcome', 'falcon', 'cowboy',
  'ferrari', 'samsung', 'andrea', 'smokey', 'steelers', 'joseph', 'mercedes', 'dakota',
  'arsenal', 'eagles', 'melissa', 'boomer', 'booboo', 'spider', 'nascar', 'monster',
  'tigers', 'yellow', 'xxxxxx', '123123123', 'gateway', 'marina', 'diablo', 'bulldog',
  'qwer1234', 'compaq', 'purple', 'hardcore', 'banana', 'junior', 'hannah', '123654',
  'porsche', 'lakers', 'iceman', 'money', 'cowboys', '987654', 'london', 'tennis',
  '999999', 'ncc1701', 'coffee', 'scooby', '0000', 'miller', 'boston', 'q1w2e3r4',
  'fuckoff', 'brandon', 'yamaha', 'chester', 'mother', 'forever', 'johnny', 'edward',
  // Portuguese common passwords
  'senha', 'senha123', 'brasil', 'amor', 'deus', 'jesus', 'flamengo', 'palmeiras',
  'corinthians', 'saopaulo', 'grêmio', 'santos', 'cruzeiro', 'vasco', 'botafogo',
  'futebol', 'familia', 'feliz', 'vida', 'gabriela', 'maria', 'joao', 'pedro',
  'lucas', 'mateus', 'rafael', 'andre', 'carlos', 'paulo', 'fernanda', 'julia',
  'admin', 'admin123', 'root', 'toor', 'administrator', 'user', 'guest', 'default',
  'password1', 'password123', 'pass123', 'p@ssw0rd', 'passw0rd', 'letmein123'
]);

// Check if password is in leaked password list
export function isLeakedPassword(password: string): boolean {
  const normalizedPassword = password.toLowerCase().trim();
  return COMMON_LEAKED_PASSWORDS.has(normalizedPassword);
}

// Password strength checker with leaked password detection
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
  isLeaked: boolean;
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Check if password is in leaked list
  const isLeaked = isLeakedPassword(password);
  if (isLeaked) {
    feedback.push('Esta senha foi vazada em violações de dados conhecidas');
    return {
      score: 0,
      feedback,
      isStrong: false,
      isLeaked: true,
    };
  }
  
  if (password.length >= 8) score += 1;
  else feedback.push('Mínimo 8 caracteres');
  
  if (password.length >= 12) score += 1;
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Adicione letra maiúscula');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Adicione letra minúscula');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Adicione número');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Adicione caractere especial');
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Evite caracteres repetidos');
  }
  
  if (/^(123|abc|qwerty|password|senha)/i.test(password)) {
    score -= 1;
    feedback.push('Evite sequências comuns');
  }
  
  return {
    score: Math.max(0, Math.min(6, score)),
    feedback,
    isStrong: score >= 4 && feedback.length === 0,
    isLeaked: false,
  };
}

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Generate CSP header value from directives
 */
export function generateCSPHeader(): string {
  return Object.entries(SECURITY_CONFIG.CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Enhanced input sanitization to prevent XSS attacks
 */
export function sanitizeInputEnhanced(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove dangerous HTML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
    .slice(0, 1000); // Limit length
}

// Sanitize and encode URL parameters
export function sanitizeUrlParam(param: string): string {
  return encodeURIComponent(param.trim());
}

// ============================================
// FILE VALIDATION
// ============================================

/**
 * Validate file uploads for security
 */
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
  ];
  
  const maxSize = 25 * 1024 * 1024; // 25MB
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'Arquivo muito grande (máximo 25MB)' };
  }
  
  return { isValid: true };
}

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate secure random string for tokens with improved entropy
 */
export function generateSecureToken(length: number = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use crypto API for better security
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  } else {
    // Fallback for environments without crypto API
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
}

// ============================================
// RATE LIMITING
// ============================================

/**
 * Rate limiting utility for authentication attempts
 */
export function createRateLimiter(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return {
    check: (identifier: string): boolean => {
      const now = Date.now();
      const userAttempts = attempts.get(identifier);
      
      if (!userAttempts || now > userAttempts.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (userAttempts.count >= maxAttempts) {
        return false;
      }
      
      userAttempts.count++;
      return true;
    },
    
    reset: (identifier: string): void => {
      attempts.delete(identifier);
    },
    
    getRemainingAttempts: (identifier: string): number => {
      const userAttempts = attempts.get(identifier);
      if (!userAttempts || Date.now() > userAttempts.resetTime) {
        return maxAttempts;
      }
      return Math.max(0, maxAttempts - userAttempts.count);
    },
    
    getTimeUntilReset: (identifier: string): number => {
      const userAttempts = attempts.get(identifier);
      if (!userAttempts || Date.now() > userAttempts.resetTime) {
        return 0;
      }
      return Math.max(0, userAttempts.resetTime - Date.now());
    }
  };
}

// Global rate limiter for auth attempts
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes