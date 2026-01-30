import Link from 'next/link';
import { Button } from '@/components/ui';
import { ConsultarSolicitudForm } from '@/components/landing/ConsultarSolicitudForm';

/**
 * Información de los tipos de tarjeta de crédito
 */
const tarjetas = [
  {
    tipo: 'CLASICA',
    nombre: 'Clásica',
    cupoMaximo: '$5.000.000',
    ingresoMinimo: '$1.500.000',
    beneficios: ['Sin cuota de manejo el 1er año', 'Compras sin contacto', 'App móvil 24/7'],
    gradient: 'from-blue-500 to-blue-700',
    shadowColor: 'shadow-blue-500/30',
  },
  {
    tipo: 'ORO',
    nombre: 'Oro',
    cupoMaximo: '$15.000.000',
    ingresoMinimo: '$3.000.000',
    beneficios: ['Millas por cada compra', 'Seguro de viaje', 'Acceso a salas VIP'],
    gradient: 'from-amber-400 to-amber-600',
    shadowColor: 'shadow-amber-500/30',
    destacada: true,
  },
  {
    tipo: 'PLATINUM',
    nombre: 'Platinum',
    cupoMaximo: '$40.000.000',
    ingresoMinimo: '$8.000.000',
    beneficios: ['Concierge 24/7', 'Seguro premium', 'Experiencias exclusivas'],
    gradient: 'from-gray-400 to-gray-600',
    shadowColor: 'shadow-gray-500/30',
  },
  {
    tipo: 'BLACK',
    nombre: 'Black',
    cupoMaximo: 'Sin límite',
    ingresoMinimo: '$15.000.000',
    beneficios: ['Mayordomo personal', 'Acceso ilimitado salas VIP', 'Beneficios premium globales'],
    gradient: 'from-gray-800 to-gray-950',
    shadowColor: 'shadow-gray-800/40',
  },
];

/**
 * Beneficios generales de la tarjeta
 */
const beneficios = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    titulo: 'Aprobación Rápida',
    descripcion: 'Respuesta en menos de 24 horas. Sin papeleos ni filas.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    titulo: 'Seguridad Total',
    descripcion: 'Protección contra fraude y tecnología contactless.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titulo: 'Sin Cuota de Manejo',
    descripcion: 'El primer año sin cuota de manejo en nuestras tarjetas.',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titulo: 'Aceptación Mundial',
    descripcion: 'Visa y Mastercard aceptadas en millones de comercios.',
  },
];

/**
 * Landing Page - Server Component
 * Promoción de tarjetas de crédito bancarias
 */
export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900">Banco Digital</span>
            </div>

            {/* CTA */}
            <Link href="#solicitud-form">
              <Button size="sm">Solicitar Ahora</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                  100% Digital • Sin papeleos
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Tu{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Tarjeta de Crédito
                  </span>{' '}
                  en minutos
                </h1>

                <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                  Solicita tu tarjeta de crédito desde cualquier lugar.
                  Aprobación rápida, cupos desde <strong>$500.000</strong> hasta{' '}
                  <strong>$40.000.000 COP</strong>. Sin filas, sin papeleos.
                </p>

                {/* Form on mobile/tablet - hidden on desktop */}
                <div className="lg:hidden w-full max-w-md mx-auto scroll-mt-32 mb-8">
                  <ConsultarSolicitudForm />
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    +50,000 clientes
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Aprobación 24h
                  </div>
                </div>
              </div>

              {/* Form on desktop - hidden on mobile/tablet */}
              <div id="solicitud-form" className="hidden lg:block scroll-mt-32">
                <ConsultarSolicitudForm />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegirnos?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Tu tarjeta de crédito con los mejores beneficios del mercado
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {beneficios.map((beneficio, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl bg-gray-50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    {beneficio.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {beneficio.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {beneficio.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Elige tu tarjeta ideal
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Cuatro opciones diseñadas para cada estilo de vida
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tarjetas.map((tarjeta) => (
                <div
                  key={tarjeta.tipo}
                  className={`
                    relative rounded-2xl bg-white p-6 transition-all duration-300
                    ${tarjeta.destacada
                      ? 'ring-2 ring-amber-400 shadow-xl scale-105'
                      : 'shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    }
                  `}
                >
                  {tarjeta.destacada && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                      Más Popular
                    </div>
                  )}

                  {/* Mini Card */}
                  <div className={`w-full h-28 bg-gradient-to-br ${tarjeta.gradient} rounded-xl mb-4 p-4 text-white shadow-lg ${tarjeta.shadowColor}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium opacity-80">Tarjeta</span>
                      <span className="font-bold">{tarjeta.nombre}</span>
                    </div>
                    <div className="mt-6 text-xs opacity-60">•••• 1234</div>
                  </div>

                  {/* Card Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Cupo máximo</p>
                      <p className="text-xl font-bold text-gray-900">{tarjeta.cupoMaximo}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase">Ingreso mínimo</p>
                      <p className="text-sm font-medium text-gray-700">{tarjeta.ingresoMinimo}</p>
                    </div>

                    <ul className="space-y-2">
                      {tarjeta.beneficios.map((beneficio, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {beneficio}
                        </li>
                      ))}
                    </ul>


                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              ¿Listo para tu tarjeta de crédito?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Completa tu solicitud en menos de 5 minutos y recibe respuesta en 24 horas
            </p>
            <Link href="#solicitud-form">
              <Button variant="secondary" size="lg">
                Comenzar Solicitud
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
              </div>
              <span className="font-semibold text-white">Banco Digital</span>
            </div>

            <p className="text-sm">
              © 2026 Banco Digital. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Ayuda</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
