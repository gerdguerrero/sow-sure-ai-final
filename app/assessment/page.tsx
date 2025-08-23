'use client'

import RiskAssessmentForm from '../components/RiskAssessmentForm'

export default function AssessmentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Loan Application Form - Sow Sure
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Fill out the form below to assess farmer loan risk using AI-powered analysis.
          </p>
        </header>
        <div className="max-w-6xl mx-auto">
          <RiskAssessmentForm />
        </div>
        <footer className="text-center mt-12 text-gray-500">
          <p>© 2025 Sow Sure AI</p>
        </footer>
      </div>
    </main>
  )
}
