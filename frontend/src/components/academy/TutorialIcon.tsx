import {
  Rocket,
  LayoutDashboard,
  Users,
  FileMusic,
  Disc,
  Album,
  FolderKanban,
  Globe,
  Radio,
  Film,
  Shield,
  PieChart,
  FileSignature,
  Wallet,
  Calculator,
  Receipt,
  Briefcase,
  Contact,
  MessageCircle,
  Megaphone,
  Sparkles,
  BarChart3,
  Settings,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'rocket': Rocket,
  'layout-dashboard': LayoutDashboard,
  'users': Users,
  'file-music': FileMusic,
  'disc': Disc,
  'album': Album,
  'folder-kanban': FolderKanban,
  'globe': Globe,
  'radio': Radio,
  'film': Film,
  'shield': Shield,
  'pie-chart': PieChart,
  'file-signature': FileSignature,
  'wallet': Wallet,
  'calculator': Calculator,
  'receipt': Receipt,
  'briefcase': Briefcase,
  'contact': Contact,
  'message-circle': MessageCircle,
  'megaphone': Megaphone,
  'sparkles': Sparkles,
  'bar-chart-3': BarChart3,
  'settings': Settings,
};

interface TutorialIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export function TutorialIcon({ icon, className, size = 24 }: TutorialIconProps) {
  const IconComponent = iconMap[icon] || Rocket;
  return <IconComponent className={className} size={size} />;
}
