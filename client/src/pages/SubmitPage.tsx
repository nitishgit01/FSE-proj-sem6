import React from 'react';
import SubmissionForm from '../components/forms/SubmissionForm';

const SubmitPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Page Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <span className="text-lg font-extrabold text-blue-600 tracking-tight">WageGlass</span>
          <span className="text-gray-200 text-lg">·</span>
          <span className="text-sm font-medium text-gray-500">Submit salary</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-10 pb-20">
        {/* Hero text */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-5">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">100% Anonymous</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            Share your salary.{' '}
            <span className="text-blue-600">Anonymously.</span>
          </h1>

          <p className="text-base text-gray-500 mt-4 max-w-lg mx-auto leading-relaxed">
            Your submission is anonymised before storage. We{' '}
            <strong className="text-gray-700 font-semibold">never</strong>{' '}
            link data to your identity — no name, no email, no IP is
            attached to your salary record. Aggregated only after 5+ submissions per category.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-xs text-gray-400">
            {[
              { icon: '🔒', text: 'No account required' },
              { icon: '📊', text: 'Aggregated, never individual' },
              { icon: '🚫', text: 'No ads, no data selling' },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <span>{icon}</span>
                <span>{text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* The Form */}
        <SubmissionForm />
      </main>
    </div>
  );
};

export default SubmitPage;
