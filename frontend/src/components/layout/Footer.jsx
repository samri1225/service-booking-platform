import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <span className="font-semibold text-slate-800">Service Booking</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Service Booking Platform. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">🇪🇹 Made for Ethiopia</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;