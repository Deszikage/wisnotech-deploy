import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Users, Award, CheckCircle, ChevronDown, ChevronUp, MessageSquare, Mail, Phone, MapPin, Code, Smartphone, Palette, Video, Megaphone, FileText } from 'lucide-react';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const serviceIcons = {
  'Web Development': Code,
  'App Development': Smartphone,
  'UI/UX & Graphics Design': Palette,
  'Video Editing & Production': Video,
  'Digital Marketing': Megaphone,
  'Content Creation': FileText,
};

const testimonials = [
  { name: 'Emeka Okonkwo', role: 'Web Developer', text: 'WISNOTECH transformed my career. I went from knowing nothing about coding to landing my first dev job in just 4 months!', initials: 'EO' },
  { name: 'Blessing Adeyemi', role: 'UI/UX Designer', text: 'The practical approach to learning made everything easy to understand. I now run my own design studio.', initials: 'BA' },
  { name: 'Oluwaseun Adeleke', role: 'Digital Marketer', text: 'From zero to hero! The digital marketing program gave me all the tools I needed to start my own agency.', initials: 'OA' },
];

const faqs = [
  { q: 'Do I need a laptop to start?', a: 'Yes, having a personal laptop is recommended, but you can start with our facility\'s computers.' },
  { q: 'Will I get a certificate?', a: 'Absolutely! Upon successful completion, you will be issued a recognized WISNOTECH certificate.' },
  { q: 'Do you offer payment plans?', a: 'Yes, we allow a 60% initial deposit with the remaining balance paid within the first month.' },
  { q: 'Is there job placement support?', a: 'Yes! We provide career guidance, portfolio reviews, and connect graduates with employers and freelance opportunities.' },
];

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    api.get('/courses').then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  const submitContact = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', contactForm);
      setContactSent(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch { /* ignore */ }
  };

  return (
    <div className="noise-overlay" data-testid="home-page">
      {/* Hero */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-16" data-testid="hero-section">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/8 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 py-20">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-4">
              Transform Your Digital Skills
            </motion.p>
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Outfit' }}>
              We Are Experts In{' '}
              <span className="gradient-text">Digital Excellence</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              Empowering your digital future with professional skills, creative solutions, and world-class training programs in Uromi, Nigeria.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                to="/courses"
                data-testid="hero-explore-btn"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                data-testid="hero-about-btn"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white rounded-full font-semibold text-sm hover:bg-white/15 backdrop-blur border border-white/10 transition-all"
              >
                Learn About Us
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="flex gap-8 mt-12">
              {[
                { num: '50+', label: 'Students Trained' },
                { num: '99%', label: 'Success Rate' },
                { num: '30+', label: 'Projects Delivered' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>{s.num}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-600/20 to-amber-500/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1739300293396-9ad79111c8e4?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                alt="WISNOTECH Team"
                className="relative rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">What We Offer</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Our Services</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => {
              const Icon = serviceIcons[c.title] || Code;
              return (
                <motion.div key={c.course_id || c.slug} variants={fadeUp}>
                  <Link
                    to={`/courses/${c.slug}`}
                    data-testid={`service-card-${c.slug}`}
                    className="block rounded-2xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 overflow-hidden group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-white" style={{ fontFamily: 'Outfit' }}>{c.title}</h3>
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{c.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold">&#8358;{c.price?.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">{c.duration}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-slate-900/30" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Student Stories</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-slate-900/50 backdrop-blur border border-slate-800 p-6 hover:border-blue-500/20 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" data-testid="faq-section">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Got Questions?</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl bg-slate-900/40 border border-slate-800 overflow-hidden" data-testid={`faq-item-${i}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-white font-medium text-sm">{f.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-400 text-sm leading-relaxed">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-slate-900/30" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Investment</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Course Pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'UI/UX & Graphics', price: '100,000', features: ['Design Principles', 'Figma & Adobe XD', 'Logo & Branding', 'Portfolio Creation'], slug: 'ui-ux-graphics' },
              { title: 'Web Development', price: '200,000', features: ['HTML5, CSS, JS', 'React & Node.js', 'Backend Basics', 'Hosting & Deployment'], popular: true, slug: 'web-development' },
              { title: 'App Development', price: '200,000', features: ['Flutter & Dart', 'iOS & Android', 'API Integration', 'App Publishing'], slug: 'app-development' },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 ${
                  p.popular
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                }`}
                data-testid={`pricing-card-${i}`}
              >
                {p.popular && <span className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-2 block">Most Popular</span>}
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>{p.title}</h3>
                <p className="text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit' }}>&#8358;{p.price}<span className="text-sm font-normal opacity-70">/course</span></p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 ${p.popular ? 'text-blue-200' : 'text-blue-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/courses/${p.slug}`}
                  data-testid={`pricing-enroll-${i}`}
                  className={`block text-center py-3 rounded-full font-semibold text-sm transition-all ${
                    p.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20'
                  }`}
                >
                  Enroll Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
            Ready to Transform Your Career?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join WISNOTECH today and start your journey towards digital excellence. Register for a course or reach out to us.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              data-testid="cta-register-btn"
              className="px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)]"
            >
              Register Now
            </Link>
            <a
              href="https://wa.me/2349153541297"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-whatsapp-btn"
              className="px-8 py-3.5 bg-green-600/20 text-green-400 rounded-full font-semibold text-sm hover:bg-green-600/30 border border-green-500/20 transition-all"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 px-6 bg-slate-900/30" data-testid="contact-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Get In Touch</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Contact Us</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1" style={{ fontFamily: 'Outfit' }}>Address</h4>
                  <p className="text-slate-400 text-sm">No. 7 Forest Guard Street, Uromi, Edo State, Nigeria</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1" style={{ fontFamily: 'Outfit' }}>Email</h4>
                  <p className="text-slate-400 text-sm">contact@wisnotech.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1" style={{ fontFamily: 'Outfit' }}>Phone</h4>
                  <p className="text-slate-400 text-sm">+234 915 354 1297</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-800 h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.0!2d6.33!3d6.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNDInMDAuMCJOIDYCsDE5JzQ4LjAiRQ!5e0!3m2!1sen!2sng!4v1"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  title="WISNOTECH Location"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-8">
              <h3 className="text-white font-bold text-xl mb-6" style={{ fontFamily: 'Outfit' }}>Send a Message</h3>
              {contactSent ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-white font-semibold">Message Sent!</p>
                  <p className="text-slate-400 text-sm mt-2">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={submitContact} className="space-y-4">
                  <input
                    type="text" required placeholder="Your Name" data-testid="contact-name-input"
                    value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 h-12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email" required placeholder="Your Email" data-testid="contact-email-input"
                    value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 h-12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    required placeholder="Your Message" rows={4} data-testid="contact-message-input"
                    value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <button
                    type="submit" data-testid="contact-submit-btn"
                    className="w-full py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
