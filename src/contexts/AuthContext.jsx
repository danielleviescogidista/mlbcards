import React, { createContext, useContext, useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Escuchar cambios en el almacén de autenticación
    const unsubscribe = pb.authStore.onChange(() => {
      if (pb.authStore.isValid) {
        setCurrentUser(pb.authStore.model);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  const signup = async (email, password, passwordConfirm, name) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        name,
      };
      const record = await pb.collection('users').create(data);
      const authData = await pb.collection('users').authWithPassword(email, password);
      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      return authData;
    } catch (error) {
      console.error('Error al registrarse:', error);
      throw error;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    try {
      const record = await pb.collection('users').update(currentUser.id, data);
      setCurrentUser(record);
      return record;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
