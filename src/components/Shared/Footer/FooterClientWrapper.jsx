'use client';

import { usePathname } from 'next/navigation';

export default function FooterClientWrapper({ children }) {
  const pathname = usePathname();

  if (pathname === '/checkout') {
    return <div className="hidden lg:block w-full">{children}</div>;
  }

  return <>{children}</>;
}
