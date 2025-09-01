import { Navigate, Outlet } from 'react-router-dom';
import { useMockAuth } from '../hooks/useMockAuth';
import { Layout } from '../components';

export const PrivateLayout = () => {
  const { token, loading } = useMockAuth();

  // Mientras carga la sesión del localStorage, puedes mostrar un loader o null
  if (loading) {
    return <div>Cargando sesión...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};
