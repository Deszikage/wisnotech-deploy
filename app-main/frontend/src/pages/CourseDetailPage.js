import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Award, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/courses/${slug}`);
        setCourse(res.data);
        if (user) {
          const enrollRes = await api.get(`/enrollments/check/${res.data.course_id}`);
          setEnrolled(enrollRes.data.enrolled);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setEnrolling(true);
    try {
      const origin = window.location.origin;
      const res = await api.post('/payments/checkout', {
        course_id: course.course_id,
        origin_url: origin,
      });
      window.location.href = res.data.url;
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment error. Please try again.');
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16 gap-4">
        <p className="text-slate-400">Course not found</p>
        <Link to="/courses" className="text-blue-400 text-sm hover:underline">Back to courses</Link>
      </div>
    );
  }

  return (
    <div className="noise-overlay pt-20 min-h-screen" data-testid="course-detail-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link to="/courses" className="inline-flex items-center gap-2 text-slate-400 text-sm hover:text-white mb-8 transition-colors" data-testid="back-to-courses">
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl overflow-hidden mb-8">
                <img src={course.image} alt={course.title} className="w-full aspect-video object-cover" />
              </div>

              <span className="text-xs text-blue-400 font-medium bg-blue-600/10 px-3 py-1 rounded-full">{course.category}</span>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-4 mb-4" style={{ fontFamily: 'Outfit' }} data-testid="course-title">
                {course.title}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">{course.long_description || course.description}</p>

              {/* Curriculum */}
              {course.curriculum?.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>What You'll Learn</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {course.curriculum.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800" data-testid={`curriculum-item-${i}`}>
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {course.highlights?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit' }}>Course Highlights</h2>
                  <div className="flex flex-wrap gap-3">
                    {course.highlights.map((h, i) => (
                      <span key={i} className="px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium border border-amber-500/20">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 sticky top-24"
            >
              <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Outfit' }} data-testid="course-price">
                &#8358;{course.price?.toLocaleString()}
              </p>
              <p className="text-slate-500 text-sm mb-6">One-time payment</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Duration: {course.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">{course.students_count || 0} students enrolled</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300">Level: {course.level}</span>
                </div>
              </div>

              {enrolled ? (
                <div className="py-3.5 bg-green-600/20 text-green-400 rounded-full text-center font-semibold text-sm border border-green-500/20" data-testid="enrolled-badge">
                  Already Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  data-testid="enroll-btn"
                  className="w-full py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enrolling ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Enroll Now - Pay with Stripe'}
                </button>
              )}

              <p className="text-xs text-slate-500 text-center mt-4">
                60% deposit option available. Contact us for details.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <p className="text-slate-400 text-sm mb-3">Instructor</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-amber-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {course.instructor?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-white font-medium text-sm">{course.instructor}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
