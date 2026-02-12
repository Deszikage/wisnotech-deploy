import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import api from '@/lib/api';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }
    pollStatus();
  }, [sessionId]);

  const pollStatus = async () => {
    if (attempts >= 5) {
      setStatus('timeout');
      return;
    }
    try {
      const res = await api.get(`/payments/status/${sessionId}`);
      if (res.data.payment_status === 'paid') {
        setStatus('success');
      } else if (res.data.status === 'expired') {
        setStatus('expired');
      } else {
        setAttempts((a) => a + 1);
        setTimeout(pollStatus, 2000);
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16 noise-overlay" data-testid="checkout-success-page">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <div>
            <Loader2 className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>Processing Payment...</h1>
            <p className="text-slate-400">Please wait while we confirm your payment.</p>
          </div>
        )}
        {status === 'success' && (
          <div data-testid="payment-success">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>Payment Successful!</h1>
            <p className="text-slate-400 mb-8">Welcome aboard! You've been enrolled successfully. Head to your dashboard to start learning.</p>
            <Link
              to="/dashboard"
              data-testid="goto-dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
        {(status === 'error' || status === 'timeout' || status === 'expired') && (
          <div data-testid="payment-error">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit' }}>
              {status === 'expired' ? 'Session Expired' : 'Payment Issue'}
            </h1>
            <p className="text-slate-400 mb-8">
              {status === 'expired'
                ? 'Your payment session expired. Please try again.'
                : 'There was an issue confirming your payment. Please contact support or try again.'}
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-500 transition-all"
            >
              Back to Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
