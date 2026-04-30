import { Search, Calendar, CreditCard, ShieldCheck, Wrench, User, Car, ChevronRight, FileText, Mail, ArrowRight } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';

export default function SupportPage() {
  const categories = [
    {
      id: 'booking',
      icon: Calendar,
      title: 'Booking',
      desc: 'Manage reservations, change dates, and vehicle selection guides.',
      links: ['How to modify my booking?', 'Cancellation policies'],
      primary: false
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payments',
      desc: 'Invoices, refunds, and accepted cards.',
      links: [],
      primary: false
    },
    {
      id: 'insurance',
      icon: ShieldCheck,
      title: 'Insurance',
      desc: 'Coverage options and claim process.',
      links: [],
      primary: false
    },
    {
      id: 'roadside',
      icon: Wrench,
      title: 'Roadside Assistance',
      desc: '24/7 emergency support for vehicle breakdowns, flat tires, and accidents.',
      links: [],
      primary: true, // Special styling
      action: 'CALL NOW 📞'
    },
    {
      id: 'account',
      icon: User,
      title: 'Account',
      desc: 'Security and preferences.',
      links: [],
      primary: false
    },
    {
      id: 'fleet',
      icon: Car,
      title: 'The Fleet',
      desc: 'Vehicle specs and features.',
      links: [],
      primary: false
    }
  ];

  const questions = [
    'What documents do I need for pick-up?',
    'Can I extend my rental mid-trip?',
    'How does the fuel policy work?',
    'Are there charges for additional drivers?'
  ];

  return (
    <CustomerLayout>
      <div className="bg-[#FAFAFA] min-h-screen font-sans">
        {/* Header / Search Section */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">How can we help you today?</h1>
          <p className="text-sm text-gray-500 mb-8">Search our knowledge base for instant answers about your rental, payments, and more.</p>
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for 'Insurance policy' or 'Extend rental'..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] shadow-sm"
            />
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-screen-lg mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className={`rounded-xl p-6 relative group cursor-pointer transition-shadow hover:shadow-md border ${
                  cat.primary 
                    ? 'bg-[#5f8471] text-white border-transparent' 
                    : 'bg-white text-gray-900 border-gray-200'
                }`}
              >
                {/* Top Right Arrow for non-primary */}
                {!cat.primary && (
                  <ArrowRight className="absolute top-6 right-6 w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${
                  cat.primary ? 'bg-white/20' : 'bg-[#F4F7F5]'
                }`}>
                  <cat.icon className={`w-5 h-5 ${cat.primary ? 'text-white' : 'text-[#2D6A4F]'}`} />
                </div>

                <h3 className={`text-base font-bold mb-2 ${cat.primary ? 'text-white' : 'text-gray-900'}`}>{cat.title}</h3>
                <p className={`text-sm mb-4 leading-relaxed ${cat.primary ? 'text-white/90' : 'text-gray-500'}`}>{cat.desc}</p>

                {/* Links for Booking category or others */}
                {cat.links.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {cat.links.map(link => (
                      <div key={link} className="text-sm text-[#5f8471] hover:text-[#2D6A4F] font-medium">{link}</div>
                    ))}
                  </div>
                )}

                {/* Action for primary card */}
                {cat.action && (
                  <button className="mt-4 text-xs font-bold tracking-wider text-white hover:text-white/80 transition-colors">
                    {cat.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Popular Questions */}
        <section className="max-w-screen-lg mx-auto px-6 pb-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Popular Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#5f8471]" />
                  <span className="text-sm text-gray-800 font-medium group-hover:text-gray-900">{q}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            ))}
          </div>
        </section>

        {/* About Modern Fleet Section */}
        <section className="max-w-screen-lg mx-auto px-6 pb-20">
          <div className="bg-[#EBECEB] rounded-2xl overflow-hidden flex flex-col md:flex-row relative">
            <div className="p-10 md:p-14 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About Modern Fleet</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Our mission is to provide premium fleet management solutions for the modern professional. We are dedicated to reliability, innovation, and exceptional service, ensuring your mobility needs are met with precision and care.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                By leveraging advanced technology and a customer-first approach, we simplify complex logistics into seamless experiences. Whether it's for business or leisure, FleetDrive is your partner in efficient travel.
              </p>

              <div className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-3">
                HAVE FURTHER QUESTIONS?
              </div>
              <button className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-5 py-2.5 rounded hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Mail className="w-4 h-4" /> EMAIL US
              </button>
            </div>
            
            {/* Image Placeholder */}
            <div className="w-full md:w-[400px] bg-[#6c8672] relative min-h-[250px]">
              <img 
                src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80" 
                alt="Workspace" 
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
              />
            </div>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
