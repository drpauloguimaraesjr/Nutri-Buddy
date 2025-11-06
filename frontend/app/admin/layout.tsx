'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout simples sem sidebar ou header do dashboard
  // Apenas renderiza o conteúdo da página admin
  return <>{children}</>;
}

