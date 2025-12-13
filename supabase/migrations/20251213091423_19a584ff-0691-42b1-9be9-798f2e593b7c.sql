-- Tabela de conversas do LanderZap
CREATE TABLE IF NOT EXISTS public.landerzap_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_initials TEXT NOT NULL,
  contact_image TEXT,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('artist', 'crm')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  last_message TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  starred BOOLEAN NOT NULL DEFAULT false,
  unread BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens do LanderZap
CREATE TABLE IF NOT EXISTS public.landerzap_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.landerzap_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  from_me BOOLEAN NOT NULL DEFAULT true,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_landerzap_conv_contact ON public.landerzap_conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_landerzap_conv_channel ON public.landerzap_conversations(channel);
CREATE INDEX IF NOT EXISTS idx_landerzap_conv_archived ON public.landerzap_conversations(archived);
CREATE INDEX IF NOT EXISTS idx_landerzap_conv_last_message ON public.landerzap_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_landerzap_msg_conversation ON public.landerzap_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_landerzap_msg_sent ON public.landerzap_messages(sent_at);

-- RLS
ALTER TABLE public.landerzap_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landerzap_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados (admin/manager)
CREATE POLICY "Admin/Manager can manage conversations"
ON public.landerzap_conversations
FOR ALL
USING (
  auth.role() = 'authenticated' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

CREATE POLICY "Admin/Manager can manage messages"
ON public.landerzap_messages
FOR ALL
USING (
  auth.role() = 'authenticated' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'))
);

-- Triggers para updated_at
CREATE TRIGGER update_landerzap_conversations_updated_at
  BEFORE UPDATE ON public.landerzap_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();