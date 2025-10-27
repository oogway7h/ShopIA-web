import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-15 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-10 -z-10"></div>

        {/* Main content */}
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent mb-6 drop-shadow-sm animate-pulse">
              Shopia
            </h1>
            <div className="flex items-center justify-center gap-4 text-xl md:text-2xl text-gray-600">
              <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
              <span className="font-medium tracking-wide">Descubre la tecnología del futuro</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400"></div>
            </div>
          </div>

          {/* Main message */}
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
            Bienvenido a una nueva
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> experiencia tecnológica</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Nos estamos preparando para ofrecerte la mejor selección de productos tecnológicos. 
            Una experiencia única donde la innovación y la calidad se encuentran.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link
              to="/register"
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-xl rounded-3xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
            >
              Únete a la comunidad
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 bg-white text-gray-700 font-semibold text-xl rounded-3xl border-2 border-gray-300 shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              Explorar más
            </Link>
          </div>
        </div>

        {/* Technology showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Innovación</h3>
            <p className="text-gray-600 text-sm">Tecnología de vanguardia</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Velocidad</h3>
            <p className="text-gray-600 text-sm">Rendimiento extremo</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Calidad</h3>
            <p className="text-gray-600 text-sm">Productos premium</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 text-center hover:transform hover:scale-105 transition-all duration-300">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Precisión</h3>
            <p className="text-gray-600 text-sm">Experiencia perfecta</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              Nuestra 
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> visión</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Crear un ecosistema tecnológico donde cada producto cuente una historia de innovación, 
              calidad y pasión por la excelencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Velocidad</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Procesamiento ultrarrápido y respuesta inmediata para que no pierdas ni un segundo.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Confianza</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Productos seleccionados y verificados que garantizan la máxima durabilidad y rendimiento.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Pasión</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Cada detalle pensado con amor por la tecnología y el compromiso con nuestros usuarios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="text-8xl mb-6">🔮</div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
              Algo increíble se 
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> aproxima</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Estamos trabajando día y noche para crear una experiencia que revolucionará 
              tu forma de ver la tecnología. Mantente atento a las novedades.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/50">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">¿Quieres ser el primero en saberlo?</h3>
            <p className="text-lg text-gray-600 mb-8">
              Únete a nuestra comunidad y recibe acceso anticipado a nuestras novedades exclusivas.
            </p>
            <Link
              to="/register"
              className="inline-block px-12 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-xl rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
            >
              Únete ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Shopia
            </h3>
            <p className="text-gray-400 text-lg">
              El futuro de la tecnología comienza aquí
            </p>
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center hover:bg-blue-600/30 transition-colors cursor-pointer">
              <span className="text-2xl">💼</span>
            </div>
            <div className="w-12 h-12 bg-cyan-600/20 rounded-full flex items-center justify-center hover:bg-cyan-600/30 transition-colors cursor-pointer">
              <span className="text-2xl">🌐</span>
            </div>
            <div className="w-12 h-12 bg-indigo-600/20 rounded-full flex items-center justify-center hover:bg-indigo-600/30 transition-colors cursor-pointer">
              <span className="text-2xl">📧</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">&copy; 2024 Shopia. Una experiencia que está por llegar.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
