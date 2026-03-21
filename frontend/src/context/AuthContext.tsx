import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/config/supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'vendedor' | null;
  nombre: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(userId: string): Promise<{ rol: string; nombre: string } | null> {
  try {
    const { data, error } = await supabase
      .from('perfiles_usuario')
      .select('rol, nombre')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Unexpected error fetching user profile:', err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    nombre: null,
    isLoading: true,
  });

  // Carga el perfil y actualiza el estado.
  // Se llama de forma diferida (fuera del callback de onAuthStateChange).
  const loadProfile = useCallback(async (session: Session) => {
    const profile = await fetchUserProfile(session.user.id);
    setState({
      user: session.user,
      session,
      role: (profile?.rol as 'admin' | 'vendedor') || null,
      nombre: profile?.nombre || null,
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    // ── Fuente ÚNICA de verdad: onAuthStateChange ──────────────
    // El callback es SINCRÓNICO — solo guarda session e invoca
    // la carga del perfil de forma diferida con setTimeout(0).
    // Esto evita bloquear la cadena interna de procesamiento de Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          if (session?.user) {
            // Diferir la carga del perfil para no bloquear el listener
            setTimeout(() => {
              if (mounted) loadProfile(session);
            }, 0);
          } else {
            // INITIAL_SESSION sin sesión = no hay usuario logueado
            setState({
              user: null,
              session: null,
              role: null,
              nombre: null,
              isLoading: false,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            session: null,
            role: null,
            nombre: null,
            isLoading: false,
          });
        } else if (event === 'USER_UPDATED') {
          setState(prev => ({ ...prev, user: session?.user || null, session }));
        }
      }
    );

    // ── Timeout de seguridad ───────────────────────────────────
    // Si después de 5 segundos isLoading sigue en true, forzamos false
    // para que ProtectedRoute pueda redirigir al login.
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        setState(prev => {
          if (prev.isLoading) {
            console.warn('Auth safety timeout: forcing isLoading to false');
            return { ...prev, isLoading: false };
          }
          return prev;
        });
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [loadProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during sign out:', err);
    }
    // Limpiar SOLO las claves de Supabase, no todo el localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setState({
      user: null,
      session: null,
      role: null,
      nombre: null,
      isLoading: false,
    });

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
