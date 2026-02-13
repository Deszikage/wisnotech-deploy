import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Users, BookOpen, CreditCard, FileText, Mail, BarChart3, LogOut, Plus, Trash2, Shield } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, paymentsRes, enrollmentsRes, contactsRes, coursesRes, blogRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/payments'),
        api.get('/admin/enrollments'),
        api.get('/admin/contacts'),
        api.get('/courses'),
        api.get('/blog'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPayments(paymentsRes.data);
      setEnrollments(enrollmentsRes.data);
      setContacts(contactsRes.data);
      setCourses(coursesRes.data);
      setBlogPosts(blogRes.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'contacts', label: 'Messages', icon: Mail },
  ];

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      loadData();
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-16"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-16 noise-overlay" data-testid="admin-dashboard">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 h-[calc(100vh-64px)] sticky top-16 bg-slate-950 border-r border-slate-800 p-4">
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Admin Panel</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-white font-medium">{user?.name}</span>
            </div>
          </div>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                data-testid={`admin-tab-${t.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  tab === t.id ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </nav>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-white mt-8" data-testid="admin-logout">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </aside>

        {/* Mobile Tabs */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 flex z-40 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[60px] flex flex-col items-center py-2 text-xs ${
                tab === t.id ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <t.icon className="w-4 h-4 mb-1" /> {t.label}
            </button>
          ))}

<button
  onClick={logout}
  className="flex-1 min-w-[60px] flex flex-col items-center py-2 text-xs text-red-400"
>
  <LogOut className="w-4 h-4 mb-1" />
  Logout
</button>

        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 pb-20 lg:pb-8">
          {/* Overview */}
          {tab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Dashboard Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: stats.total_users || 0, icon: Users, color: 'blue' },
                  { label: 'Courses', value: stats.total_courses || 0, icon: BookOpen, color: 'amber' },
                  { label: 'Enrollments', value: stats.total_enrollments || 0, icon: BarChart3, color: 'green' },
                  { label: 'Revenue', value: `₦${(stats.total_revenue || 0).toLocaleString()}`, icon: CreditCard, color: 'purple' },
                  { label: 'Blog Posts', value: stats.total_posts || 0, icon: FileText, color: 'cyan' },
                  { label: 'Messages', value: stats.unread_contacts || 0, icon: Mail, color: 'red' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl bg-slate-900/60 border border-slate-800 p-5"
                    data-testid={`admin-stat-${i}`}
                  >
                    <s.icon className={`w-5 h-5 mb-3 ${
                      s.color === 'blue' ? 'text-blue-400' : s.color === 'amber' ? 'text-amber-400' :
                      s.color === 'green' ? 'text-green-400' : s.color === 'purple' ? 'text-purple-400' :
                      s.color === 'cyan' ? 'text-cyan-400' : 'text-red-400'
                    }`} />
                    <p className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Payments */}
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Outfit' }}>Recent Payments</h3>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Course</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 5).map((p, i) => (
                        <tr key={i} className="border-b border-slate-800/50">
                          <td className="py-3 px-4 text-white">{p.metadata?.user_email || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-300">{p.metadata?.course_title || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-300">₦{p.amount?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              p.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>{p.payment_status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Users ({users.length})</h2>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="admin-users-table">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Name</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={i} className="border-b border-slate-800/50">
                          <td className="py-3 px-4 text-white">{u.name}</td>
                          <td className="py-3 px-4 text-slate-300">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-3 px-4">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => updateRole(u.user_id, 'admin')}
                                className="text-xs text-blue-400 hover:underline"
                              >
                                Make Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Courses */}
          {tab === 'courses' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Courses ({courses.length})</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {courses.map((c) => (
                  <div key={c.course_id} className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex gap-4" data-testid={`admin-course-${c.slug}`}>
                    <img src={c.image} alt={c.title} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{c.title}</h4>
                      <p className="text-slate-500 text-xs mt-1">₦{c.price?.toLocaleString()} | {c.students_count || 0} students</p>
                      <p className="text-slate-400 text-xs mt-1">{c.duration} | {c.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {tab === 'payments' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>All Payments ({payments.length})</h2>
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="admin-payments-table">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Course</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-slate-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={i} className="border-b border-slate-800/50">
                          <td className="py-3 px-4 text-white">{p.metadata?.user_email || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-300">{p.metadata?.course_title || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-300">₦{p.amount?.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              p.payment_status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>{p.payment_status}</span>
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

          {/* Blog */}
          {tab === 'blog' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Blog Posts ({blogPosts.length})</h2>
              <div className="space-y-3">
                {blogPosts.map((p) => (
                  <div key={p.post_id} className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 flex items-center gap-4" data-testid={`admin-blog-${p.slug}`}>
                    {p.image && <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{p.title}</h4>
                      <p className="text-slate-500 text-xs mt-1">{p.category} | {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {tab === 'contacts' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Contact Messages ({contacts.length})</h2>
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={i} className="rounded-xl bg-slate-900/60 border border-slate-800 p-5" data-testid={`admin-contact-${i}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{c.name}</span>
                      <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-2">{c.email}</p>
                    <p className="text-slate-300 text-sm">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
