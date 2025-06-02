import { Link } from "react-router-dom"
import {
  Server,
  Smartphone,
  TestTube,
  Code,
  CheckCircle,
  Users,
  FileText,
  DollarSign,
  Clock,
  MessageCircle,
  Star,
  Play,
} from "lucide-react"
import TikTok from "../../components/icons/Tiktok"
import Instagram from "../../components/icons/Instagram"
import LinkedIn from "../../components/icons/LinkeIn"

const Index = () => {
  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-1">
              <img src="/img/logo.png" alt="zonatech" className="w-7" />
              <span className="text-xl font-semibold text-gray-900">ZonaTech Perú</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#especialidades" className="text-gray-600 hover:text-gray-900">
                Especialidades
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-gray-900">
                Beneficios
              </a>
              <a href="#proceso" className="text-gray-600 hover:text-gray-900">
                Nuestro proceso
              </a>
              <a href="#contacto" className="text-gray-600 hover:text-gray-900">
                Contacto
              </a>
            </nav>

            {/* CTA Button */}
            <Link to={"/login"} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors">
              Inscribirse
            </Link>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-white">

        {/* Hero Section */}
        <section className="relative py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Empoderando a la Próxima Generación de Desarrolladores de Software
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Sigue nuestros roadmap personalizados y obtén certificaciones que validen tu conocimiento en el sector
                  tecnológico.
                </p>

                <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors text-lg">
                  Únete Gratis
                </button>
              </div>

              {/* Right Content - Hero Image */}
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-16 h-16 text-purple-300">
                  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                    <path d="M32 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" />
                  </svg>
                </div>

                <div className="absolute -top-8 -right-8 w-12 h-12 text-yellow-300">
                  <svg viewBox="0 0 48 48" fill="currentColor" className="w-full h-full">
                    <circle cx="24" cy="24" r="20" />
                  </svg>
                </div>

                <div className="absolute -bottom-8 -left-8 w-20 h-20 text-pink-300">
                  <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                    <path d="M40 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" />
                  </svg>
                </div>

                {/* Main hero image */}
                <div className="relative flex justify-center">
                  <img
                    src="/img/mujer.png"
                    alt="Mujer sonriente señalando con chaqueta amarilla"
                    className=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specializations Section */}
        <section id="especialidades" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-16">
              ¿En qué te quieres especializar?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Backend Development */}
              <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Server className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Desarrollo Backend</h3>
              </div>

              {/* Mobile Development */}
              <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Desarrollo Móvil</h3>
              </div>

              {/* QA Engineering */}
              <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <TestTube className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ingeniería QA</h3>
              </div>

              {/* Frontend Development */}
              <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Code className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Desarrollo Frontend</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content - Image */}
              <div className="relative">
                <div className="flex justify-center w-auto">
                  <img
                    src="/img/mujer2.png"
                    alt="Mujer sosteniendo certificado"
                    className="w-full  rounded-full"
                  />
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 text-yellow-300">
                    <svg viewBox="0 0 48 48" fill="currentColor" className="w-full h-full">
                      <circle cx="24" cy="24" r="20" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="space-y-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  ¿Qué obtendrás al certificarte con nosotros?
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Incrementa tus oportunidades laborales en el sector tecnológico.</p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Certificado para validar tu experiencia y conocimientos.</p>
                  </div>

                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Acceso al soporte de la comunidad de ZonaTech.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Platform Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-16">
              ¿Por qué elegir nuestra plataforma?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Certifications */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Certificaciones respaldadas</h3>
                <p className="text-gray-600">
                  Nuestros instructores son líderes en la industria con experiencia práctica.
                </p>
              </div>

              {/* Flexible Process */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                  <FileText className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Proceso flexible</h3>
                <p className="text-gray-600">Avanza a tu ritmo con módulos y evaluaciones personalizadas.</p>
              </div>

              {/* Accessible Cost */}
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto">
                  <DollarSign className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Costo accesible</h3>
                <p className="text-gray-600">Ofrecemos planes a tu medida con opciones de financiamiento.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Process Section */}
        <section id="proceso" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">¿Cómo es el proceso de certificación?</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Estudia nuestros módulos con recursos interactivos y validados por expertos. Aprueba la evaluación para
                completar cada módulo. Certifícate al completar todos los módulos del roadmap.
              </p>
            </div>

            <div className="text-center mb-12">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors">
                Quiero mi roadmap
              </button>
            </div>

            {/* Video Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/VvAXL3DVb9A?si=Qt0kGIWzyxTAlZSR" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
                </iframe>
              </div>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-2 gap-12 mt-20">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Evaluaciones en vivo</h3>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Mentorías personalizadas</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-16">
              ¿Qué dicen nuestros certificados?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Frank Silvestre"
                    className="w-15 h-15 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Frank Silvestre</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Gracias muy buena la plataforma más rápido de lo que me lo esperaba para conseguir trabajo."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Alder Dominguez"
                    className="w-15 h-15 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Alder Dominguez</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "La certificación me ayudó a mejorar mis habilidades y conseguir un mejor puesto en mi empresa."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Reynan Maldonado"
                    className="w-15 h-15 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Reynan Maldonado</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "El material es muy completo y el ritmo de estudio en Flexbox y me mantiene siempre motivado."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ/Contact Section */}
        <section id="contacto" className="py-20 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">¿Tienes alguna duda?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Déjanos tus datos y te contactaremos para responder cualquier pregunta sobre nuestras certificaciones y
              roadmaps.
            </p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-8 py-3 rounded-lg transition-colors">
              Contactar
            </button>
          </div>
        </section>

        <footer className="bg-white py-12 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Company Info */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-full mr-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">ZonaTech Perú</span>
                </div>
                <p className="text-gray-600 text-sm">©2024 ZonaTech Perú. Todos los derechos reservados.</p>
                <div className="flex space-x-4 mt-4">
                  <TikTok className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  <LinkedIn className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              </div>

              {/* Community */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Comunidad</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>WhatsApp</li>
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Enlaces rápidos</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Inicio</li>
                  <li>Especialidades</li>
                  <li>Beneficios</li>
                  <li>Nuestro proceso</li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default Index