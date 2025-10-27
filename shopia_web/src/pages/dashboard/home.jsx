import { Link } from "react-router-dom";
import { getUser } from "../../services/auth.js";

export default function DashboardHome() {
  const user = getUser();
  
  const stats = [
    { label: "Usuarios Registrados", value: "1,247", icon: "👥", color: "blue" },
    { label: "Productos Activos", value: "892", icon: "📦", color: "green" },
    { label: "Ventas del Mes", value: "$24,567", icon: "💰", color: "yellow" },
    { label: "Pedidos Pendientes", value: "34", icon: "📋", color: "red" },
  ];

  const quickActions = [
    {
      title: "Gestión de Usuarios",
      description: "Administra usuarios, roles y permisos del sistema",
      icon: "👥",
      color: "from-blue-500 to-blue-700",
      link: "/dashboard/usuarios"
    },
    {
      title: "Productos",
      description: "Gestiona el catálogo de productos y categorías",
      icon: "📦", 
      color: "from-green-500 to-green-700",
      link: "/dashboard/productos"
    },
    {
      title: "Ventas y Pedidos",
      description: "Supervisa pedidos, facturación y reportes de ventas",
      icon: "🛒",
      color: "from-purple-500 to-purple-700", 
      link: "/dashboard/ventas"
    },
    {
      title: "Marketing",
      description: "Campañas, cupones y promociones para impulsar ventas",
      icon: "📢",
      color: "from-pink-500 to-pink-700",
      link: "/dashboard/marketing"
    },
    {
      title: "Configuración",
      description: "Ajustes generales, métodos de pago y envío",
      icon: "⚙️",
      color: "from-gray-500 to-gray-700",
      link: "/dashboard/configuracion"
    },
    {
      title: "Analíticas",
      description: "Reportes detallados y métricas de rendimiento",
      icon: "📊",
      color: "from-indigo-500 to-indigo-700",
      link: "/dashboard/analytics"
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              ¡Bienvenido de vuelta, {user?.nombre || 'Administrador'}! 🚀
            </h1>
            <p className="text-blue-100 text-lg">
              Tu plataforma de ecommerce está funcionando perfectamente
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-4xl bg-${stat.color}-50 p-3 rounded-xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, idx) => (
            <Link 
              key={idx}
              to={action.link} 
              className="group relative bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl bg-gradient-to-br ${action.color} bg-clip-text text-transparent bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-sm`}>
                    {action.icon}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer informativo */}
      <div className="bg-gray-50 rounded-xl p-6 border">
        <div className="flex items-center gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-600">
              Consulta la documentación o contacta al equipo de soporte técnico para resolver cualquier duda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}