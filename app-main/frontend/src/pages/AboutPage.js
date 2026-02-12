import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Award, Globe, Lightbulb, Handshake } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const team = [
  { name: 'Wisdom Odigie', role: 'Founder & Lead Instructor', bio: 'Full-stack developer with 5+ years of experience in tech education and software development.' },
  { name: 'Favour Osagie', role: 'UI/UX & Design Lead', bio: 'Creative designer passionate about building beautiful digital experiences and mentoring aspiring designers.' },
  { name: 'Success Eromosele', role: 'Digital Marketing Lead', bio: 'Expert in SEO, social media, and growth strategies. Helping businesses thrive online.' },
];

export default function AboutPage() {
  return (
    <div className="noise-overlay pt-20" data-testid="about-page">
      {/* Hero */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={fadeUp} className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-4">About WISNOTECH</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'Outfit' }}>
              Empowering Nigeria's <span className="gradient-text">Digital Future</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-slate-400 text-lg leading-relaxed mb-6">
              Founded in Uromi, Edo State, WISNOTECH is a leading digital training center dedicated to bridging the tech skills gap in Nigeria. We provide hands-on, practical training that transforms beginners into industry-ready professionals.
            </motion.p>
            <motion.p variants={fadeUp} className="text-slate-400 leading-relaxed">
              Our mission is simple: make quality digital education accessible to every Nigerian youth. From web development to digital marketing, we equip our students with the tools and knowledge they need to thrive in the digital economy.
            </motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
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

      {/* Mission & Vision */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: 'Our Mission', text: 'To provide accessible, high-quality digital skills training that empowers Nigerian youth to build successful careers in technology.' },
            { icon: Eye, title: 'Our Vision', text: 'To become West Africa\'s premier digital training institution, producing world-class tech professionals from every community.' },
            { icon: Heart, title: 'Our Values', text: 'Excellence, accessibility, practical learning, community impact, and continuous innovation drive everything we do.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur p-8 hover:border-blue-500/20 transition-all"
              data-testid={`about-value-${i}`}
            >
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-5">
                <item.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-3" style={{ fontFamily: 'Outfit' }}>{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Why WISNOTECH</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>What Sets Us Apart</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lightbulb, title: 'Practical Learning', desc: 'Real projects, not just theory. Build your portfolio while you learn.' },
              { icon: Users, title: 'Expert Mentors', desc: 'Learn from industry professionals with real-world experience.' },
              { icon: Award, title: 'Certified Training', desc: 'Receive a recognized certificate upon successful completion.' },
              { icon: Handshake, title: 'Career Support', desc: 'Job placement guidance, freelancing tips, and networking opportunities.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 text-center hover:border-blue-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-white font-semibold mb-2" style={{ fontFamily: 'Outfit' }}>{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-slate-900/30" data-testid="team-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-3">Our People</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Meet The Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 p-8 text-center hover:border-blue-500/20 transition-all"
                data-testid={`team-member-${i}`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <h4 className="text-white font-bold text-lg" style={{ fontFamily: 'Outfit' }}>{member.name}</h4>
                <p className="text-amber-400 text-sm mb-3">{member.role}</p>
                <p className="text-slate-400 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Image */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1739303987830-ca19742b19bc?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"
              alt="WISNOTECH Community"
              className="w-full aspect-[21/9] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Join Our Community</h3>
              <p className="text-slate-300 text-sm">Be part of a growing network of digital professionals across Nigeria.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
