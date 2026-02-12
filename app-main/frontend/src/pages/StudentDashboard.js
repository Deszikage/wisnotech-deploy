import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, CreditCard, Sparkles, Clock, TrendingUp, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [enrollRes, coursesRes, payRes] = await Promise.all([
        api.get('/enrollments'),
        api.get('/courses'),
        api.get('/payments/history'),
      ]);
      setEnrollments(enrollRes.data);
      setCourses(coursesRes.data);
      setPayments(payRes.data);

      // Get AI recommendations
      try {
        const recRes = await api.get('/chat/recommend');
        setRecommendations(recRes.data.recommendations);
      } catch { /* ignore if AI fails */ }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const enrolledCourses = courses.filter((c) =>
    enrollments.some((e) => e.course_id === c.course_id)
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-20 noise-overlay" data-testid="student-dashboard">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }} data-testid="dashboard-welcome">
              Welcome back, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your learning progress and enrolled courses</p>
          </div>
          <button onClick={logout} className="mt-3 sm:mt-0 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors" data-testid="dashboard-logout">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Enrolled Courses', value: enrollments.length, color: 'blue' },
            { icon: CreditCard, label: 'Total Payments', value: payments.length, color: 'amber' },
            { icon: TrendingUp, label: 'Progress', value: `${enrollments.length > 0 ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / enrollments.length) : 0}%`, color: 'green' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-slate-900/60 border border-slate-800 p-6"
              data-testid={`stat-card-${i}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  s.color === 'blue' ? 'bg-blue-600/10' : s.color === 'amber' ? 'bg-amber-500/10' : 'bg-green-500/10'
                }`}>
                  <s.icon className={`w-5 h-5 ${
                    s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' : 'text-green-400'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enrolled Courses */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>My Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((c) => {
                const enrollment = enrollments.find((e) => e.course_id === c.course_id);
                return (
                  <Link
                    key={c.course_id}
                    to={`/courses/${c.slug}`}
                    className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden hover:border-blue-500/30 transition-all group"
                    data-testid={`enrolled-course-${c.slug}`}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-sm mb-2" style={{ fontFamily: 'Outfit' }}>{c.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" /> {c.duration}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-blue-400">{enrollment?.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${enrollment?.progress || 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/40 border border-slate-800 p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="text-blue-400 text-sm hover:underline" data-testid="browse-courses-link">Browse Courses</Link>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {recommendations && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
              <Sparkles className="w-5 h-5 text-amber-400" /> AI Recommendations
            </h2>
            <div className="rounded-xl bg-gradient-to-br from-blue-600/10 to-amber-500/10 border border-blue-500/20 p-6" data-testid="ai-recommendations">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{typeof recommendations === 'string' ? recommendations : JSON.stringify(recommendations)}</p>
            </div>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>Payment History</h2>
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="payment-history-table">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Course</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-slate-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i} className="border-b border-slate-800/50">
                        <td className="py-3 px-4 text-white">{p.metadata?.course_title || 'N/A'}</td>
                        <td className="py-3 px-4 text-slate-300">&#8358;{p.amount?.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            p.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
