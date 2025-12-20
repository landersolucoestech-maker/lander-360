import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'email' | 'sms' | 'whatsapp';

export interface NotificationOptions {
  type: NotificationType;
  to: string;
  subject?: string;
  message: string;
  templateData?: Record<string, any>;
}

export class NotificationService {
  // Send notification via email, SMS, or WhatsApp
  static async send(options: NotificationOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: options
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  static async sendEmail(to: string, subject: string, message: string): Promise<{ success: boolean; error?: string }> {
    return this.send({ type: 'email', to, subject, message });
  }

  // Send SMS notification
  static async sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
    return this.send({ type: 'sms', to, message });
  }

  // Send WhatsApp notification
  static async sendWhatsApp(to: string, message: string): Promise<{ success: boolean; error?: string }> {
    return this.send({ type: 'whatsapp', to, message });
  }

  // Send agenda event notification to artist
  static async notifyArtistAboutEvent(
    artistPhone: string,
    artistEmail: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    location?: string
  ): Promise<void> {
    const message = `🎵 Lander 360º - Novo Evento\n\n` +
      `Evento: ${eventTitle}\n` +
      `Data: ${eventDate}\n` +
      `Horário: ${eventTime}\n` +
      (location ? `Local: ${location}\n` : '') +
      `\nAcesse sua agenda para mais detalhes.`;

    // Send WhatsApp if phone available
    if (artistPhone) {
      await this.sendWhatsApp(artistPhone, message);
    }

    // Also send email
    if (artistEmail) {
      await this.sendEmail(
        artistEmail,
        `Novo Evento: ${eventTitle}`,
        message.replace(/\n/g, '<br>')
      );
    }
  }

  // Send reminder before event
  static async sendEventReminder(
    artistPhone: string,
    artistEmail: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    hoursBeforeEvent: number = 24
  ): Promise<void> {
    const message = `⏰ Lembrete Lander 360º\n\n` +
      `Seu evento "${eventTitle}" acontecerá em ${hoursBeforeEvent} horas.\n` +
      `Data: ${eventDate}\n` +
      `Horário: ${eventTime}\n` +
      `\nNão esqueça!`;

    if (artistPhone) {
      await this.sendWhatsApp(artistPhone, message);
    }

    if (artistEmail) {
      await this.sendEmail(
        artistEmail,
        `Lembrete: ${eventTitle} em ${hoursBeforeEvent}h`,
        message.replace(/\n/g, '<br>')
      );
    }
  }

  // Send contract signature notification
  static async notifyContractReady(
    artistPhone: string,
    artistEmail: string,
    contractTitle: string,
    signatureLink: string
  ): Promise<void> {
    const message = `📝 Lander 360º - Contrato Pronto\n\n` +
      `O contrato "${contractTitle}" está pronto para assinatura.\n\n` +
      `Acesse o link para assinar digitalmente:\n${signatureLink}\n\n` +
      `Dúvidas? Entre em contato conosco.`;

    if (artistPhone) {
      await this.sendWhatsApp(artistPhone, message);
    }

    if (artistEmail) {
      await this.sendEmail(
        artistEmail,
        `Contrato Pronto para Assinatura: ${contractTitle}`,
        message.replace(/\n/g, '<br>')
      );
    }
  }
}
