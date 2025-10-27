import React from "react";
import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/ecommerceLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ClienteLayout from "../layouts/clienteLayout.jsx";

import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import RecuperarPassword from "../pages/RecuperarPassword.jsx";

import DashboardHome from "../pages/dashboard/home.jsx";
import CuentasPage from "../pages/dashboard/usuarios/index.jsx";
import RolesPage from "../pages/dashboard/roles/roles.jsx";
import RolCreatePage from "../pages/dashboard/roles/RolCreatePage.jsx";
import RolEditPage from "../pages/dashboard/roles/RolEditPage.jsx";
import BitacoraPage from "../pages/dashboard/bitacora/bitacora.jsx";
import UsuarioCreatePage from "../pages/dashboard/usuarios/create.jsx";
import UsuarioEditPage from "../pages/dashboard/usuarios/edit.jsx";
import NotificacionesPage from "../pages/dashboard/notificaciones/index.jsx";
import NotificacionCreatePage from "../pages/dashboard/notificaciones/create.jsx";
import NotificacionEditPage from "../pages/dashboard/notificaciones/edit.jsx";
import ClientesPage from "../pages/dashboard/clientes/index.jsx";
import ClienteCreatePage from "../pages/dashboard/clientes/create.jsx";
import ClienteEditPage from "../pages/dashboard/clientes/edit.jsx";

//############cliente routes
import PerfilPage from "../pages/ecommerce/cliente/perfil.jsx";
import NotificacionPage from "../pages/ecommerce/cliente/Notificaciones.jsx";
import ComprasPage from "../pages/ecommerce/cliente/Compras.jsx";

import ErrorBoundaryPage from "../pages/ErrorBoundaryPage.jsx";
import ProtectedRoute from "../components/routing/ProtectedRoute.jsx";

//productos
import ProductosIndexPage from "../pages/dashboard/productos/ProdIndex.jsx";
import ProductoCreatePage from "../pages/dashboard/productos/create.jsx";
import ProductoEditPage from "../pages/dashboard/productos/edit.jsx";


//categorias
import CategoriaCreatePage from "../pages/dashboard/categorias/create.jsx";
import CategoriaEditPage from "../pages/dashboard/categorias/edit.jsx";
import CategoriasIndexPage from "../pages/dashboard/categorias/CatIndex.jsx";


//catalogo
import CatalogoProductos from "../pages/ecommerce/tienda/Catalogo.jsx"
import ProductoDetallePage from "../pages/ecommerce/tienda/VistaProducto.jsx";
import CategoriaProductos from "../pages/ecommerce/tienda/CategoriaProductos.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      { index: true, element: <CatalogoProductos /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      // Cambia aquí:
      { path: "categoria/:id", element: <CategoriaProductos /> },
      { path: "producto/:id", element: <ProductoDetallePage /> }
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute roles={["admin", "administrador"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryPage />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "usuarios", element: <CuentasPage /> },
      { path: "usuarios/roles", element: <RolesPage /> },
      { path: "usuarios/roles/nuevo", element: <RolCreatePage /> },
      { path: "usuarios/roles/:id/editar", element: <RolEditPage /> },
      { path: "usuarios/bitacora", element: <BitacoraPage /> },
      { path: "/dashboard/usuarios/create", element: <UsuarioCreatePage /> },
      { path: "/dashboard/usuarios/edit/:id", element: <UsuarioEditPage /> },
      // Rutas para notificaciones
      { path: "notificaciones", element: <NotificacionesPage /> },
      { path: "notificaciones/create", element: <NotificacionCreatePage /> },
      { path: "notificaciones/edit/:id", element: <NotificacionEditPage /> },
      { path: "clientes", element: <ClientesPage /> },
      { path: "clientes/create", element: <ClienteCreatePage /> },
      { path: "clientes/edit/:id", element: <ClienteEditPage /> },

      
      //rutas para categorias
      {path: "categorias/create",element:<CategoriaCreatePage/>},
      {path: "categorias/edit/:id",element:<CategoriaEditPage/>},
      {path:"categorias",element:<CategoriasIndexPage/>},

      //rutas para productos
      {path:"productos",element:<ProductosIndexPage/>},
      {path:"productos/create",element:<ProductoCreatePage/>},
      {path: "productos/edit/:id", element:<ProductoEditPage/>},

    ],
  },
  {
    path: "/cliente",
    element: (
      <ProtectedRoute roles={["cliente"]}>
        <ClienteLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundaryPage />,
    children: [
      { path: "perfil", element: <PerfilPage /> },
      { path: "notificaciones", element: <NotificacionPage /> },
      { path: "compras", element: <ComprasPage /> },
      
    ],
  },
  {
    path: "/recuperar-password",
    element: <RecuperarPassword />,
  },
  { path: "*", element: <ErrorBoundaryPage /> },
]);

export { router };
