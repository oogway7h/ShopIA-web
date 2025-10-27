import React, { useState, useEffect, useRef } from "react";
import logo from "../../assets/shopia-horizontals.png";
import { useAuth } from "../../hooks/useAuth";
import AuthButtons from "./AuthButtons";
import UserMenu from "./UserMenu";
import CartButton from "./CartButton";
import { api } from "../../services/apiClient";
import { useLocation, Link } from "react-router-dom";

function ListItem({ children, to }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={`block px-3 py-2 rounded-md font-medium transition-colors duration-200
          ${
            isActive
              ? "text-blue-600 bg-blue-100"
              : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
          }
        `}
      >
        {children}
      </Link>
    </li>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, loading, logout, isClient, isAdmin, isAuthenticated } =
    useAuth();

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const navRef = useRef(null);

  useEffect(() => {
    setLoadingCategorias(true);
    api
      .get("/api/categorias/")
      .then((data) => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error al cargar categorías:", err))
      .finally(() => setLoadingCategorias(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra el menú si se redimensiona la ventana a tamaño de escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scrollNav = (dir) => {
    const nav = navRef.current;
    if (!nav) return;
    const scrollAmount = nav.offsetWidth * 0.7;
    nav.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
  };

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <img src={logo} alt="Shopia" className="h-12 w-auto" />
            </div>
            <div className="animate-pulse flex space-x-4">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm transition-shadow duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* --- BARRA SUPERIOR: Logo, Buscador y Acciones --- */}
        <div className="relative flex items-center justify-between h-16">
          {/* Lado Izquierdo: Logo */}
          <div className="flex-shrink-0">
            <a href="/" aria-label="Página de inicio de Shopia">
              <img
                src={logo}
                alt="Shopia"
                className="h-12 w-auto"
                style={{ marginRight: "12px" }}
              />
            </a>
          </div>

          {/* Centro: Buscador (ocupa el espacio disponible) */}
          <div className="flex-1 flex justify-center pr-4 lg:px-8">
            <form className="w-full max-w-lg">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Buscar ..."
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 bottom-0 px-4 text-gray-500 hover:text-blue-600"
                  aria-label="Buscar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Lado Derecho: Acciones y Menú Móvil */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated && typeof isAdmin === "function" && isAdmin() && (
              <div className="hidden lg:block">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Volver al panel
                </Link>
              </div>
            )}

            {/* Estado de autenticación */}
            {isAuthenticated && isClient() ? (
              <>
                {/* Usuario logueado como cliente */}
                <div className="hidden lg:flex items-center gap-4">
                  <CartButton itemCount={3} />
                  <div className="h-6 w-px bg-gray-200"></div>
                  <UserMenu user={user} onLogout={logout} />
                </div>

                {/* Carrito visible en móvil para clientes */}
                <CartButton itemCount={3} className="lg:hidden" />
              </>
            ) : !isAuthenticated ? (
              <>
                {/* Usuario no logueado */}
                <AuthButtons className="hidden lg:flex" />
                <div className="hidden lg:block h-6 w-px bg-gray-200"></div>
              </>
            ) : null}

            {/* Botón Hamburguesa Móvil */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-7 h-7"
              >
                {open ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* --- BARRA DE CATEGORÍAS --- */}
        {/* PC: centrado, sin botones */}
        <nav className="hidden lg:flex items-center h-12 border-t border-gray-200 select-none justify-center">
          <div className="max-w-2xl w-full flex justify-center">
            {loadingCategorias ? (
              <div className="flex items-center gap-2 animate-pulse px-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <ul className="flex items-center gap-4 text-base w-full justify-center">
                <ListItem to="/">Todos</ListItem>
                {categorias.map((categoria) => (
                  <ListItem key={categoria.id} to={`/categoria/${categoria.id}`}>
                    {categoria.nombre}
                  </ListItem>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* MÓVIL: botones y padding */}
        <nav className="flex lg:hidden items-center h-12 border-t border-gray-200 select-none relative">
          {/* Botón izquierda con padding */}
          <div className="pl-2 flex items-center h-full">
            <button
              onClick={() => scrollNav(-1)}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow"
              aria-label="Ver categorías anteriores"
              type="button"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* Lista de categorías con padding horizontal para los botones */}
          <div
            ref={navRef}
            className="flex-1 flex overflow-x-hidden scrollbar-hide px-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {loadingCategorias ? (
              <div className="flex items-center gap-2 animate-pulse px-4">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <ul className="flex items-center gap-4 text-base w-full">
                <ListItem to="/">Todos</ListItem>
                {categorias.map((categoria) => (
                  <ListItem key={categoria.id} to={`/categoria/${categoria.id}`}>
                    {categoria.nombre}
                  </ListItem>
                ))}
              </ul>
            )}
          </div>

          {/* Botón derecha con padding */}
          <div className="pr-2 flex items-center h-full">
            <button
              onClick={() => scrollNav(1)}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow"
              aria-label="Ver más categorías"
              type="button"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* --- MENÚ MÓVIL (Overlay, solo visible si open=true) --- */}
      {open && (
        <div className="fixed lg:hidden top-16 left-0 w-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out">
          <div className="p-4 border-t border-gray-200">
            {/* Acciones según estado de autenticación */}
            <div className="border-t border-gray-200 pt-4 flex justify-center">
              {isAuthenticated &&
                typeof isAdmin === "function" &&
                isAdmin() && (
                  <div className="block">
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                      Volver al panel
                    </Link>
                  </div>
                )}
              {isAuthenticated && isClient() ? (
                // Cliente logueado - Menú móvil
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {user?.nombre_completo ||
                          `${user?.nombre || ""} ${
                            user?.apellido || ""
                          }`.trim() ||
                          "Usuario"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.correo}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="/cliente/perfil"
                      className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Mi Perfil
                    </a>
                    <a
                      href="/cliente/compras"
                      className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      Mis Compras
                    </a>
                    <a
                      href="/cliente/notificaciones"
                      className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      Notificaciones
                    </a>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-3 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              ) : !isAuthenticated ? (
                // Usuario no logueado
                <AuthButtons className="flex gap-3" />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
