import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Users, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/courses').then((r) => setCourses(r.data)).catch(() => {});
  }, []);

  const categories = ['All', ...new Set(courses.map((c) => c.category))];
  const filtered = courses.filter((c) => {
    const matchCat = filter === 'All' || c.category === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="noise-overlay pt-20 min-h-screen" data-testid="courses-page">
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-3">Our Programs</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>
              Explore Our Courses
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose from our carefully designed programs to kickstart your digital career.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..." data-testid="courses-search"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 h-12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  data-testid={`filter-${cat.toLowerCase()}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === cat ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.div
                key={c.course_id || c.slug}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/courses/${c.slug}`}
                  data-testid={`course-card-${c.slug}`}
                  className="block rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden hover:border-blue-500/30 transition-all duration-300 group"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-blue-400 font-medium bg-blue-600/10 px-3 py-1 rounded-full">{c.category}</span>
                    <h3 className="text-white font-bold text-lg mt-3 mb-2 group-hover:text-blue-400 transition-colors" style={{ fontFamily: 'Outfit' }}>
                      {c.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">{c.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <span className="text-amber-400 font-bold text-lg">&#8358;{c.price?.toLocaleString()}</span>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.students_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500">No courses found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
