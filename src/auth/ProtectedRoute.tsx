import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import type { JwTPayload } from '../interfaces/interfaces';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  
  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<JwTPayload>(token);
    
    // Verificar si el token ha expirado
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }

    const roles = JSON.parse(decoded.authorities) as { authority: string }[];
    const userRole = roles[0]?.authority;

    // Verificar si el usuario tiene el rol permitido
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error decodificando el token JWT:", error);
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

// Hook personalizado para obtener información del usuario
export const useAuth = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { isAuthenticated: false, user: null, role: null };
  }

  try {
    const decoded = jwtDecode<JwTPayload>(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token');
      return { isAuthenticated: false, user: null, role: null };
    }

    const roles = JSON.parse(decoded.authorities) as { authority: string }[];
    const role = roles[0]?.authority;

    return {
      isAuthenticated: true,
      user: decoded,
      role: role
    };
  } catch (error) {
    localStorage.removeItem('token');
    return { isAuthenticated: false, user: null, role: null };
  }
};

// Componente para rutas públicas (solo usuarios no autenticados)
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, role } = useAuth();
  
  if (isAuthenticated && role) {
    // Si ya está autenticado, redirigir según su rol
    switch (role) {
      case "ROLE_ESTUDIANTE":
        return <Navigate to="/estudiante/evaluaciones" replace />;
      case "ROLE_MENTOR":
        return <Navigate to="/mentor/evaluaciones" replace />;
      case "ROLE_ADMIN":
        return <Navigate to="/dashboard-admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};