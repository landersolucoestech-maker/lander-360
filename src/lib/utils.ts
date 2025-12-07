import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o padrão brasileiro (dd/MM/yyyy)
 * Usa o fuso horário local (America/Sao_Paulo quando no Brasil)
 */
export function formatDateBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Formata uma data e hora para o padrão brasileiro (dd/MM/yyyy 'às' HH:mm)
 */
export function formatDateTimeBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Formata uma data por extenso em português (dd 'de' MMMM 'de' yyyy)
 */
export function formatDateFullBR(date: Date | string | null | undefined): string {
  if (!date) return "N/A"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata uma data para salvar no banco de dados (yyyy-MM-dd)
 * Mantém o dia correto sem conversão de timezone
 */
export function formatDateForDB(date: Date | null | undefined): string | null {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Retorna a data de hoje no formato yyyy-MM-dd
 */
export function getTodayDateString(): string {
  const today = new Date()
  return formatDateForDB(today) || ""
}
