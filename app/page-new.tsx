'use client'

import { useState } from 'react'
import RiskAssessmentForm from './components/RiskAssessmentForm'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            🏛️ SOW SURE AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Philippine Farmer Loan Risk Assessment
          </p>
          <p className="text-lg text-gray-500">
            🌾 Comprehensive risk scoring for agricultural lending
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          <RiskAssessmentForm />
        </div>

        <footer className="text-center mt-12 text-gray-500">
          <p>© 2024 SOW SURE AI - Farmer loan risk assessment platform for the Philippines</p>
        </footer>
      </div>
    </main>
  )
}
