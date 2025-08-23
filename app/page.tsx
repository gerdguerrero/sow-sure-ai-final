'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fff8f3] to-[#f7fafc]">
      {/* Navigation Bar */}
      <nav className="w-full bg-white border-b border-gray-200 pl-0 pr-6 py-2 font-inter">
        <div className="w-full flex items-center justify-between">
          {/* Left Side: Logo + Main Navigation */}
          <div className="flex items-center gap-10 pl-4">
            <div className="flex items-center gap-2">
              <img src="/sow-sure-logo.jpg" alt="Sow Sure Logo" className="h-6 w-auto" />
              <span className="text-base font-medium text-gray-900">Sow Sure</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Platform</span>
              <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Solutions</span>
              <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Resources</span>
              <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Pricing</span>
              <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Company</span>
            </div>
          </div>
          
          {/* Right Side: Search + Contact + Login + CTA */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search documentation..." 
                className="pl-8 pr-4 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 font-inter"
              />
              <svg className="w-4 h-4 absolute left-2 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Contact</span>
            <span className="text-gray-600 hover:text-gray-800 cursor-pointer text-sm font-normal px-2 py-1">Login</span>
            <Link href="/assessment" className="px-4 py-2 bg-red-600 text-white rounded font-medium text-sm hover:bg-red-700 transition">
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between py-16 px-8">
        {/* Left Side: Hero Text */}
        <div className="flex-1 flex flex-col items-start justify-center pr-0 lg:pr-16">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <div className="text-gray-900">Smarter Lending.</div>
            <div className="text-red-600">Stronger Harvests.</div>
          </h1>
          <p className="text-lg text-gray-700 mb-2">Your approval.</p>
          <p className="text-lg text-gray-700 mb-8 max-w-lg">
            Leverage enterprise-grade AI risk assessment on comprehensive farmer data to make <span className="font-semibold text-gray-900">intelligent, data-driven loan decisions</span> with confidence.
          </p>
          <div className="flex gap-4 mb-8">
            <Link href="/assessment" className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
              Apply for Loan →
            </Link>
            <button 
              onClick={() => {
                const aboutSection = document.getElementById('about-section');
                aboutSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition bg-white flex items-center gap-2"
            >
              <span className="w-4 h-4 border border-gray-400 rounded-full flex items-center justify-center">
                <span className="w-0 h-0 border-l-2 border-l-gray-400 border-t border-t-transparent border-b border-b-transparent ml-0.5"></span>
              </span>
              Learn More
            </button>
          </div>
          {/* Feature indicators */}
          <div className="flex gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              <span className="text-sm text-gray-600">Enterprise Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-sm text-gray-600">AI Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
              <span className="text-sm text-gray-600">Real-time Analysis</span>
            </div>
          </div>
        </div>
        
        {/* Right Side: Risk Dashboard */}
        <div className="flex-1 flex items-center justify-center mt-12 lg:mt-0">
          <div className="relative">
            {/* Dashboard Window */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100" style={{ width: '500px' }}>
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="font-bold text-gray-900">Risk Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-xs text-green-600 font-medium animate-pulse">Real-time</span>
                </div>
              </div>
              
              {/* Risk Assessment Section */}
              <div className="mb-6 bg-gradient-to-br from-white to-red-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-900">Risk Assessment</span>
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium animate-pulse">Low Risk</span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">23</span>
                  <span className="text-sm text-gray-500 ml-2">Score out of 100</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse transition-all duration-[1000ms] ease-out"
                    style={{ 
                      width: '0%',
                      animation: 'progressFill 1s ease-out 1s forwards'
                    }}
                  ></div>
                </div>
                <style jsx>{`
                  @keyframes progressFill {
                    from { width: 0%; }
                    to { width: 23%; }
                  }
                `}</style>
              </div>
              
              {/* Financial Health & Environmental */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-gray-900 mb-3 block">Financial Health</span>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Income</div>
                      <div className="w-0 h-2 bg-red-400 rounded-full transition-all duration-[1000ms] ease-out" 
                           style={{ animation: 'incomeBar 1s ease-out 1s forwards' }}></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Assets</div>
                      <div className="w-0 h-2 bg-red-500 rounded-full transition-all duration-[1000ms] ease-out"
                           style={{ animation: 'assetsBar 1s ease-out 1.2s forwards' }}></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Debt Ratio</div>
                      <div className="w-0 h-2 bg-red-600 rounded-full transition-all duration-[1000ms] ease-out"
                           style={{ animation: 'debtBar 1s ease-out 1.4s forwards' }}></div>
                    </div>
                  </div>
                </div>
                <style jsx>{`
                  @keyframes incomeBar {
                    from { width: 0; }
                    to { width: 6rem; }
                  }
                  @keyframes assetsBar {
                    from { width: 0; }
                    to { width: 5rem; }
                  }
                  @keyframes debtBar {
                    from { width: 0; }
                    to { width: 4rem; }
                  }
                `}</style>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-sm font-medium text-gray-900 mb-3 block">Environmental</span>
                  <div className="w-full h-32 bg-red-50 rounded-lg flex items-center justify-center border border-red-100 relative overflow-hidden p-1">
                    <svg width="100%" height="100%" viewBox="0 0 200 120" className="absolute inset-1">
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="20" height="15" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 15" fill="none" stroke="#fecaca" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="200" height="120" fill="url(#grid)" />
                      
                      {/* Animated line path - RED THEME */}
                      <path
                        d="M 10 100 Q 40 75 70 60 Q 100 45 130 35 Q 160 25 190 15"
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray="400"
                        strokeDashoffset="400"
                        style={{ 
                          animation: 'drawLine 1s ease-out 1s forwards'
                        }}
                      />
                      
                      {/* Data points - RED THEME */}
                      <circle cx="10" cy="100" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 1.2s forwards', opacity: '0' }} />
                      <circle cx="40" cy="75" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 1.4s forwards', opacity: '0' }} />
                      <circle cx="70" cy="60" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 1.6s forwards', opacity: '0' }} />
                      <circle cx="100" cy="45" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 1.8s forwards', opacity: '0' }} />
                      <circle cx="130" cy="35" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 2.0s forwards', opacity: '0' }} />
                      <circle cx="160" cy="25" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 2.2s forwards', opacity: '0' }} />
                      <circle cx="190" cy="15" r="5" fill="#dc2626" style={{ animation: 'fadeInPoint 0.3s ease-out 2.4s forwards', opacity: '0' }} />
                    </svg>
                  </div>
                </div>
                <style jsx>{`
                  @keyframes drawLine {
                    from { stroke-dashoffset: 400; }
                    to { stroke-dashoffset: 0; }
                  }
                  @keyframes fadeInPoint {
                    from { opacity: 0; transform: scale(0); }
                    to { opacity: 1; transform: scale(1); }
                  }
                `}</style>
              </div>
              
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  Approved
                </span>
                <span className="text-xs text-gray-400">Updated 2 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Our Mission */}
      <section id="about-section" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          {/* Small Subtitle */}
          <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-6">
            PLATFORM
          </p>
          
          {/* Main Heading - Two Lines */}
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Sow Sure<br />
            Risk Intelligence.
          </h2>
          
          {/* Main Description */}
          <p className="text-xl text-gray-600 mb-20 max-w-4xl mx-auto leading-relaxed">
            We empower farmers with technology to create sustainable and profitable futures.
          </p>
          
          {/* Three-Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Pillar 1: Empower Farmers */}
            <div className="space-y-6 p-6 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-center">
                <svg className="w-12 h-12 text-gray-700 transition-all duration-300 hover:text-red-600 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Empower Farmers</h3>
              <p className="text-gray-600 leading-relaxed">
                Provide access to fair and flexible financing options that recognize the unique challenges and opportunities in agriculture.
              </p>
            </div>
            
            {/* Pillar 2: Leverage AI */}
            <div className="space-y-6 p-6 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-center">
                <svg className="w-12 h-12 text-gray-700 transition-all duration-300 hover:text-red-600 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Leverage AI</h3>
              <p className="text-gray-600 leading-relaxed">
                Leverage AI and data analytics to minimize risk while making faster, more accurate lending decisions.
              </p>
            </div>
            
            {/* Pillar 3: Sustainable Future */}
            <div className="space-y-6 p-6 rounded-lg transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-center">
                <svg className="w-12 h-12 text-gray-700 transition-all duration-300 hover:text-red-600 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057-3A1.5 1.5 0 0 1 9.514.857L15.55 6.893a1.5 1.5 0 0 1-.857 2.457L9.514 10.857a1.5 1.5 0 0 1-1.457-1.457L5 6.893z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sustainable Future</h3>
              <p className="text-gray-600 leading-relaxed">
                Support agricultural practices that are both profitable and environmentally sound for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Column 1: Company Logo & Mission */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Sow Sure</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering farmers with intelligent risk assessment and data-driven lending solutions.
              </p>
            </div>

            {/* Column 2: Product Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    Platform
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#about-section" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Sow Sure. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
