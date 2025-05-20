// imports/contexts/RoleContext.jsx
import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const RoleContext = createContext('guest'); // Default to guest

export function RoleProvider({ children }) {
  const location = useLocation();
  const path = location.pathname;

  const role = useMemo(() => {
    console.log('RoleContext path:', path);
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/viewer')) return 'viewer';
    if (path.startsWith('/guest')) return 'guest';
    return 'guest'; // Fallback
  }, [path]);

  return (
    <RoleContext.Provider value={role}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
