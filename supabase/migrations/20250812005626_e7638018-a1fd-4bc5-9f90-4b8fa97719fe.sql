-- Configurar OTP e outras configurações de segurança automaticamente

-- Configurar tempo de expiração do OTP para 10 minutos (600 segundos)
UPDATE auth.config 
SET otp_exp = 600 
WHERE parameter = 'OTP_EXPIRY';

-- Se não existe a configuração, inserir
INSERT INTO auth.config (parameter, value) 
VALUES ('OTP_EXPIRY', '600')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configurar outras configurações de segurança
INSERT INTO auth.config (parameter, value) VALUES 
  ('SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION', 'true'),
  ('PASSWORD_MIN_LENGTH', '8'),
  ('SECURITY_MANUAL_LINKING_ENABLED', 'false')
ON CONFLICT (parameter) DO UPDATE SET value = EXCLUDED.value;

-- Configurar políticas de senha
UPDATE auth.config 
SET value = 'true'
WHERE parameter = 'SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION';

-- Configurar expiração de refresh token para 30 dias
UPDATE auth.config 
SET value = '2592000'
WHERE parameter = 'REFRESH_TOKEN_ROTATION_ENABLED';

-- Habilitar proteção contra vazamento de senhas
UPDATE auth.config 
SET value = 'true'
WHERE parameter = 'SECURITY_CAPTCHA_ENABLED';