import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import api from '@/lib/api';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!post) {
    return <div className="min-h-screen flex flex-col items-center justify-center pt-16 gap-4"><p className="text-slate-400">Post not found</p><Link to="/blog" className="text-blue-400 text-sm">Back to blog</Link></div>;
  }

  return (
    <div className="noise-overlay pt-20 min-h-screen" data-testid="blog-detail-page">
      <article className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white mb-8 transition-colors" data-testid="back-to-blog">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={post.image} alt={post.title} className="w-full aspect-video object-cover" />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
          <span className="px-3 py-1 bg-blue-600/10 text-blue-400 rounded-full">{post.category}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.created_at).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8" style={{ fontFamily: 'Outfit' }} data-testid="blog-title">
          {post.title}
        </h1>

        <div className="prose prose-invert max-w-none">
          {post.content.split('\n').map((p, i) => (
            <p key={i} className="text-slate-300 leading-relaxed mb-4 text-lg">{p}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
