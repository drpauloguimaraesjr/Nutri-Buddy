'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface UseRoleProtectionOptions {
  allowedRoles: UserRole[];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export function useRoleProtection({
  allowedRoles,
  redirectTo,
  onUnauthorized,
}: UseRoleProtectionOptions) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Not logged in
      router.push('/login');
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      // User doesn't have required role
      if (onUnauthorized) {
        onUnauthorized();
      }
      
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Redirect based on actual role
        if (user.role === 'prescriber') {
          router.push('/prescriber/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, onUnauthorized, router]);

  return {
    user,
    loading,
    isAuthorized: user ? allowedRoles.includes(user.role) : false,
  };
}

// Specific hooks for each role
export function usePrescriberProtection() {
  return useRoleProtection({
    allowedRoles: ['prescriber'],
    redirectTo: '/patient/dashboard',
  });
}

export function usePatientProtection() {
  return useRoleProtection({
    allowedRoles: ['patient'],
    redirectTo: '/prescriber/dashboard',
  });
}

// Hook to check if user has specific role (without redirect)
export function useHasRole(role: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

// Hook to check if user is any of the specified roles
export function useHasAnyRole(roles: UserRole[]): boolean {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
}

