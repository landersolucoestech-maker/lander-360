import { InstitutionalHeader } from "./Header";
import { InstitutionalFooter } from "./Footer";

interface InstitutionalLayoutProps {
  children: React.ReactNode;
}

export function InstitutionalLayout({ children }: InstitutionalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <InstitutionalHeader />
      <main className="flex-1">
        {children}
      </main>
      <InstitutionalFooter />
    </div>
  );
}