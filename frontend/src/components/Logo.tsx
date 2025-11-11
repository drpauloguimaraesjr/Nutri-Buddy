'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  href?: string;
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
};

export default function Logo({ 
  variant = 'icon', 
  size = 'md', 
  showText = true,
  href,
  className = ''
}: LogoProps) {
  const logoSize = sizeMap[size];
  const logoSrc = variant === 'full' 
    ? '/logos/nutribuddy-logo.svg' 
    : '/logos/nutribuddy-icon.svg';

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative" style={{ width: logoSize, height: logoSize }}>
        <Image 
          src={logoSrc}
          alt="NutriBuddy Logo" 
          width={logoSize}
          height={logoSize}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${
          size === 'sm' ? 'text-base' :
          size === 'md' ? 'text-lg' :
          size === 'lg' ? 'text-xl' :
          'text-2xl'
        }`}>
          NutriBuddy
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

