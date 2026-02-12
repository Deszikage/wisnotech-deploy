import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, User } from 'lucide-react';
import api from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/blog').then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  return (
    <div className="noise-overlay pt-20 min-h-screen" data-testid="blog-page">
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold text-sm tracking-wider uppercase mb-3">Insights & Resources</p>
            <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>Our Blog</h1>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Stay updated with the latest in tech, career tips, and digital skills.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.post_id || post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  data-testid={`blog-card-${post.slug}`}
                  className="block rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden hover:border-blue-500/30 transition-all duration-300 group"
                >
                  {post.image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="px-2 py-0.5 bg-blue-600/10 text-blue-400 rounded-full">{post.category}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2" style={{ fontFamily: 'Outfit' }}>
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium">
                      Read More <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
