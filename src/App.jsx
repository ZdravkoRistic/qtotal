import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Check,
  ArrowRight,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Shield,
  Cpu,
  Users,
  Lightbulb,
  Target,
  Award,
  BarChart,
  ExternalLink,
} from "lucide-react";

// --- KOMPONENTE I ASSETI ---

// 1. Logo Komponenta (SVG)
const QTotalLogo = ({ className = "h-10 w-auto" }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="qGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ea580c" /> {/* Dark Orange */}
        <stop offset="100%" stopColor="#9333ea" /> {/* Purple */}
      </linearGradient>
    </defs>
    {/* Tech Q Shape */}
    <path
      d="M50 10 C 27.9 10 10 27.9 10 50 C 10 72.1 27.9 90 50 90 C 65 90 78 82 85 70 L 75 65 C 70 72 60 78 50 78 C 34.5 78 22 65.5 22 50 C 22 34.5 34.5 22 50 22 C 65.5 22 78 34.5 78 50 C 78 56 76 61 73 65 L 82 74 C 87 67 90 59 90 50 C 90 27.9 72.1 10 50 10 Z"
      fill="url(#qGradient)"
    />
    <rect
      x="60"
      y="60"
      width="25"
      height="8"
      rx="4"
      transform="rotate(45 60 60)"
      fill="url(#qGradient)"
    />
    <circle cx="50" cy="50" r="12" fill="#fff" fillOpacity="0.1" />
    <circle cx="50" cy="50" r="6" fill="url(#qGradient)" />
  </svg>
);

// 2. Navigacija
const Navigation = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Početna" },
    { id: "trainings", label: "Obuke" },
    { id: "contact", label: "Kontakt" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800 py-4"
        : "bg-transparent py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo + Ime */}
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => setActiveTab("home")}
        >
          <QTotalLogo className="h-10 w-10 mr-3 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-2xl font-bold tracking-tighter text-white">
            Q-TOTAL
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`text-sm font-medium transition-colors duration-300 hover:text-orange-400 uppercase tracking-widest ${activeTab === link.id
                ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500 border border-white px-3 py-1 rounded-md"
                : "text-white "
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-4 flex flex-col space-y-4 shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setIsMenuOpen(false);
              }}
              className={`text-left py-3 px-4 rounded-lg text-lg font-medium ${activeTab === link.id
                ? "bg-slate-800 text-orange-400"
                : "text-slate-300 hover:bg-slate-900"
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// 3. Footer
const Footer = ({ setActiveTab }) => (
  <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 relative overflow-hidden">
    {/* Dekorativni sjaj */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {/* Brand */}
        <div>
          <div className="flex items-center mb-6">
            <QTotalLogo className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-white">Q-TOTAL</span>
          </div>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Vaš partner za poslovnu izvrsnost, ISO standarde i digitalnu
            transformaciju. Gradimo budućnost vašeg poslovanja kroz kvalitet i
            inovacije.
          </p>
        </div>

        {/* Brzi Linkovi */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider">
            Navigacija
          </h3>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveTab("home")}
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                Početna / O nama
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("trainings")}
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                Obuke & Edukacija
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("contact")}
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                Kontakt & Lokacija
              </button>
            </li>
          </ul>
        </div>

        {/* Kontakt Info */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider">
            Kontakt Info
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start text-slate-400">
              <Mail className="w-5 h-5 mr-3 text-orange-500 mt-1 shrink-0" />
              <span>qtotal.rs@gmail.com</span>
            </li>
            <li className="flex items-start text-slate-400">
              <Phone className="w-5 h-5 mr-3 text-orange-500 mt-1 shrink-0" />
              <span>+381 62 232 119</span>
            </li>
            <li className="flex items-start text-slate-400">
              <MapPin className="w-5 h-5 mr-3 text-orange-500 mt-1 shrink-0" />
              <span>Beograd, Srbija</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-8 text-center">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Q-TOTAL. Sva prava zadržana.
        </p>
      </div>
    </div>
  </footer>
);

// --- STRANICE ---

// Stranica: HOME
const Home = ({ setActiveTab }) => {
  return (
    <div className="pt-20 animate-fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-600/20 to-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-8 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-slate-300 text-sm font-medium tracking-wide">
              INNOVATION MANAGEMENT
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Kvalitet. Unapređenje.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">
              Poslovna Izvrsnost.
            </span>
          </h1>

          <p className=" text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Kontinuirano unapređujemo poslovne performanse kroz inovativna
            rešenja, ISO standardizaciju i ekspertske obuke.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setActiveTab("trainings")}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-orange-600 to-purple-700 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105 flex items-center justify-center"
            >
              Saznaj više <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setActiveTab("contact");
              }}
              className="px-8 py-4 rounded-lg bg-slate-800  font-semibold text-lg border border-slate-700 hover:bg-slate-700 transition-all hover:scale-105 "
            >
              Kontaktiraj nas
            </button>
          </div>
          <div className="hidden text-black text-white"></div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Misija */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Naša Misija
              </h3>
              <p className="text-slate-300 text-lg">
                "Kontinuirano unapređujemo poslovne performanse."
              </p>
              <p className="text-slate-500 text-sm mt-2 italic">
                Continuously improving business performance.
              </p>
            </div>

            {/* Vizija */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Lightbulb className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Naša Vizija
              </h3>
              <p className="text-slate-300 text-lg">
                "Samo kvalitet i dinamika opstaju."
              </p>
              <p className="text-slate-500 text-sm mt-2 italic">
                Only quality and dynamic survive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Naše Usluge
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-blue-400" />,
                title: "ISO Standardi",
                desc: "Implementacija sistema menadžmenta (ISO 9001, 14001, 27001, 45001) za optimalne procese.",
              },
              {
                icon: <Cpu className="w-8 h-8 text-purple-400" />,
                title: "AI & Digital",
                desc: "Digitalna transformacija i AI-pomognuta rešenja za modernizaciju poslovanja.",
              },
              {
                icon: <Lightbulb className="w-8 h-8 text-yellow-400" />,
                title: "Inovacije",
                desc: "Strateško upravljanje inovacijama radi ostvarivanja konkurentske prednosti.",
              },
              {
                icon: <Users className="w-8 h-8 text-orange-400" />,
                title: "Obuke",
                desc: "Specijalizovane korporativne obuke prilagođene specifičnim potrebama vašeg tima.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="p-6 bg-slate-800/50 rounded-xl border border-slate-700 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-400 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Q-TOTAL */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 border border-slate-700 shadow-2xl relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Zašto odabrati Q-TOTAL?
                </h2>
                <p className="text-slate-300 mb-8">
                  Spoj dugogodišnjeg iskustva i modernih tehnologija čini nas
                  idealnim partnerom za vaš rast.
                </p>
                <ul className="space-y-4">
                  {[
                    "Prilagođena rešenja specifična za vašu industriju",
                    "Stručni tim sa međunarodnim sertifikatima",
                    "Fokus na praktičnu primenu i merljive rezultate",
                    "Pouzdanost i dugoročna podrška",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-slate-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-slate-900 p-8 rounded-2xl border border-slate-700 max-w-sm">
                    <Award className="w-12 h-12 text-purple-400 mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">
                      Dokazan uspeh
                    </h4>
                    <p className="text-slate-400">
                      Pomažemo kompanijama da dostignu svoj puni potencijal kroz
                      strateško planiranje i optimizaciju resursa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Stranica: OBUKE
const Trainings = ({ setActiveTab }) => {
  const trainings = [
    {
      id: 1,
      category: "ISO Standardi",
      title: "Informaciona Bezbednost (ISO 27001)",
      level: "Početni / Auditor",
      description:
        "Sveobuhvatna obuka o zaštiti informacija, proceni rizika i implementaciji kontrola prema standardu ISO 27001.",
      benefits: [
        "Povećana sigurnost podataka",
        "Usklađenost sa regulativom",
        "Smanjenje rizika od curenja informacija",
      ],
      target: "IT menadžeri, oficiri za bezbednost, sistem administratori",
      duration: "2-3 dana (modularno)",
      icon: <Shield className="w-10 h-10 text-blue-500" />,
    },
    {
      id: 2,
      category: "Tehnologija",
      title: "AI u Poslovanju",
      level: "Svi nivoi",
      description:
        "Praktična primena veštačke inteligencije u svakodnevnom poslovanju, etika korišćenja i prompt inženjering.",
      benefits: [
        "Automatizacija rutinskih zadataka",
        "Brže donošenje odluka",
        "Povećanje produktivnosti",
      ],
      target: "Menadžeri, preduzetnici, marketing timovi",
      duration: "1 dan (intenzivno)",
      icon: <Cpu className="w-10 h-10 text-purple-500" />,
    },
    {
      id: 3,
      category: "Menadžment",
      title: "Liderstvo i Upravljanje Timovima",
      level: "Napredni",
      description:
        "Razvoj liderskih veština, motivacija zaposlenih i efikasno upravljanje poslovnim procesima.",
      benefits: [
        "Bolja timska kohezija",
        "Efikasnije rešavanje konflikata",
        "Strateško razmišljanje",
      ],
      target: "Team leadovi, direktori sektora, HR menadžeri",
      duration: "2 dana",
      icon: <Users className="w-10 h-10 text-orange-500" />,
    },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-950 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stručne Obuke
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Unapredite znanje svog tima kroz naše interaktivne i praktične
            radionice.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-600 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="p-8 bg-slate-800/30 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors"></div>
                <div className="mb-4">{training.icon}</div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 block">
                  {training.category}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {training.title}
                </h3>
                <span className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700">
                  {training.level}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-8 flex-grow flex flex-col">
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  {training.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-white font-semibold text-sm mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500" /> Ključne
                    koristi:
                  </h4>
                  <ul className="space-y-2">
                    {training.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className="text-slate-400 text-sm pl-6 relative"
                      >
                        <span className="absolute left-1 top-2 w-1 h-1 bg-slate-500 rounded-full"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800">
                  <div className="flex justify-between items-center text-sm text-slate-400 mb-6">
                    <span>
                      <BarChart className="w-4 h-4 inline mr-1" />{" "}
                      {training.duration}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="py-3 rounded-lg bg-gray-800 text-white font-medium text-sm transition-colors text-center"
                    >
                      Rezerviši obuku
                    </button>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="py-3 rounded-lg border border-slate-600 hover:border-slate-400 text-white font-medium text-sm transition-colors text-center bg-gray-800"
                    >
                      Zatraži detalje
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section Brief */}
        <div className="mt-24 bg-slate-900 rounded-2xl p-8 md:p-12 text-center border border-slate-800">
          <h3 className="text-2xl font-bold text-white mb-4">
            Imate posebne zahteve?
          </h3>
          <p className="text-slate-400 mb-8">
            Možemo kreirati "In-house" obuku prilagođenu specifično za vašu
            kompaniju i zaposlene.
          </p>
          <button
            onClick={() => setActiveTab("contact")}
            className="px-8 py-3 rounded-full bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 transition-all"
          >
            Kontaktirajte nas za ponudu
          </button>
        </div>
      </div>
    </div>
  );
};
//
// Stranica: KONTAKT
const Contact = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'success' | 'error'
  const FORMSPREE_ENDPOINT = "http://localhost:5000/api/contact";

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 FORM SUBMIT STARTED');
    console.log('📝 Form State:', formState);
    console.log('🌐 Sending to:', FORMSPREE_ENDPOINT);

    setIsSubmitting(true);
    try {
      console.log('⏳ Sending fetch request...');
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      console.log('✅ Response received:', res.status, res.statusText);
      console.log('📊 Response OK?', res.ok);

      setFeedback(res.ok ? "success" : "error");
      if (res.ok) {
        console.log('✅ Form submitted successfully! Clearing form...');
        setFormState({ name: "", email: "", phone: "", message: "" });
      } else {
        console.log('❌ Response not OK');
      }
    } catch (error) {
      console.error('❌ FETCH ERROR:', error);
      setFeedback("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
      console.log('🔵 FORM SUBMIT COMPLETED');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-950 animate-fade-in relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Kontaktirajte Nas
          </h1>
          <p className="text-xl text-slate-400">
            Spremni smo da unapredimo vaše poslovanje.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Contact Info & Map Placeholder */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">
                Informacije
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-4 shrink-0">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Email
                    </p>
                    <a
                      href="mailto:qtotal.rs@gmail.com"
                      className="text-lg text-white hover:text-orange-400 transition-colors"
                    >
                      qtotal.rs@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-4 shrink-0">
                    <Phone className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Telefon
                    </p>
                    <a
                      href="tel:+38162232119"
                      className="text-lg text-white hover:text-purple-400 transition-colors"
                    >
                      +381 62 232 119
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mr-4 shrink-0">
                    <MapPin className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                      Lokacija
                    </p>
                    <p className="text-lg text-white">Beograd, Srbija</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Dostupni za sastanke uživo i online.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Area */}
            <div className="w-full h-64 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 relative group">
              {/* Placeholder za Google Maps iframe */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p>Interaktivna mapa</p>
                  <p className="text-xs">(Ovde ubaciti Google Maps Iframe)</p>
                </div>
              </div>
              {/* Primer kako bi izgledao iframe kod (zakomentarisan):
               <iframe 
                 src="https://www.google.com/maps/embed?..." 
                 width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" 
               ></iframe> 
               */}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-800 shadow-2xl relative">
            {feedback === "success" ? (
              <div className="absolute inset-0 bg-slate-900 rounded-3xl flex flex-col items-center justify-center z-20 p-8 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Poruka poslata!
                </h3>
                <p className="text-slate-400">
                  Hvala na interesovanju. Odgovorićemo vam u roku od 48h.
                </p>
                <button
                  onClick={() => setFeedback(null)}
                  className="mt-8 px-6 py-2 bg-slate-800 rounded-lg text-white text-sm"
                >
                  Pošalji novu poruku
                </button>
              </div>
            ) : null}

            <h3 className="text-2xl font-bold text-white mb-8">
              Pošaljite nam poruku
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-400 mb-2"
                >
                  Ime i Prezime
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600"
                  placeholder="Vaše ime"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Email Adresa
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600"
                    placeholder="ime@primer.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-slate-400 mb-2"
                  >
                    Broj Telefona
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600"
                    placeholder="+381..."
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-400 mb-2"
                >
                  Poruka
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  value={formState.message}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600 resize-none"
                  placeholder="Kako vam možemo pomoći?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${isSubmitting
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 to-purple-700 hover:shadow-purple-500/25"
                  }`}
              >
                {isSubmitting ? "Slanje..." : "Pošalji Poruku"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Reset scroll on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="bg-slate-950 min-h-screen font-sans text-slate-200 selection:bg-orange-500 selection:text-white">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === "home" && <Home setActiveTab={setActiveTab} />}
        {activeTab === "trainings" && <Trainings setActiveTab={setActiveTab} />}
        {activeTab === "contact" && <Contact />}
      </main>
      <Footer setActiveTab={setActiveTab} />
      {/* Global Styles for utilities not in Tailwind standard set if needed
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
      `}</style> */}
    </div>
  );
};

export default App;
