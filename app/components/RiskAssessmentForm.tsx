'use client'

import React, { useState, useRef } from 'react'

interface ApplicantData {
  income: number
  expenses: number
  loan_payments: number
  income_sources: string
  loan_history: string
  land_ownership: string
  equipment_savings: number
  crops_storage: number
  collateral_ratio: number
  insurance: string
  banking_history: string
  coop_member: boolean
  hazards: {
    seismic: string
    flood_typhoon: string
    other: string
  }
}

interface RiskResult {
  score: number
  classification: string
  recommendations?: {
    priorityRecommendations: string[]
    financialImprovements: string[]
    riskMitigation: string[]
    nextSteps: string[]
    potentialScoreImprovement: {
      description: string
      targetScore: string
    }
  }
}

// SVG Icons for sections
const DollarIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
)

const LeafIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function RiskAssessmentForm() {
  const [formData, setFormData] = useState<ApplicantData>({
    income: 0,
    expenses: 0,
    loan_payments: 0,
    income_sources: '',
    loan_history: '',
    land_ownership: '',
    equipment_savings: 0,
    crops_storage: 0,
    collateral_ratio: 0,
    insurance: '',
    banking_history: '',
    coop_member: false,
    hazards: {
      seismic: '',
      flood_typhoon: '',
      other: ''
    }
  })

  const [riskResult, setRiskResult] = useState<RiskResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [location, setLocation] = useState('')
  const [isLoadingHazards, setIsLoadingHazards] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [hazardStatus, setHazardStatus] = useState<string | null>(null)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Calculate form completion percentage
  const calculateFormCompletion = () => {
    const totalFields = 14 // Total number of form fields
    let completedFields = 0

    // Check numeric fields (consider non-zero as completed)
    if (formData.income > 0) completedFields++
    if (formData.expenses > 0) completedFields++
    if (formData.loan_payments > 0) completedFields++
    if (formData.equipment_savings > 0) completedFields++
    if (formData.crops_storage > 0) completedFields++
    if (formData.collateral_ratio > 0) completedFields++

    // Check string fields (consider non-empty as completed)
    if (formData.income_sources) completedFields++
    if (formData.loan_history) completedFields++
    if (formData.land_ownership) completedFields++
    if (formData.insurance) completedFields++
    if (formData.banking_history) completedFields++

    // Check boolean field (always completed since it has a default)
    completedFields++ // coop_member

    // Check hazards (consider any hazard field filled as 1 completion)
    if (formData.hazards.seismic || formData.hazards.flood_typhoon || formData.hazards.other) {
      completedFields++
    }

    // Check location
    if (location.trim()) completedFields++

    return Math.round((completedFields / totalFields) * 100)
  }

  const completionPercentage = calculateFormCompletion()
  const [selectedCoordinates, setSelectedCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Refs to prevent multiple operations
  const fetchInProgressRef = useRef(false)

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('hazards.')) {
      const hazardType = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        hazards: {
          ...prev.hazards,
          [hazardType]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const searchAddresses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setAddressSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const suggestions = await response.json()
        setAddressSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
      } else {
        setAddressSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      // Don't show error to user, just clear suggestions
      setAddressSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsSearching(false)
    }
  }

  const selectAddress = (suggestion: any) => {
    setLocation(suggestion.display_name)
    setSelectedCoordinates({ lat: suggestion.lat, lng: suggestion.lon })
    setShowSuggestions(false)
    setAddressSuggestions([])
  }

  // Add debounced search to avoid too many API calls
  
  const handleLocationChange = (value: string) => {
    setLocation(value)
    
    // Reset coordinates when manually typing
    if (selectedCoordinates) {
      setSelectedCoordinates(null)
    }
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for search
    const timeout = setTimeout(() => {
      searchAddresses(value)
    }, 300) // Wait 300ms after user stops typing
    
    setSearchTimeout(timeout)
  }

  const fetchHazardData = async () => {
    if (!location.trim()) {
      alert('Please enter a location first')
      return
    }

    // Prevent multiple simultaneous calls
    if (fetchInProgressRef.current || isLoadingHazards) {
      return
    }

    fetchInProgressRef.current = true
    setIsLoadingHazards(true)
    setHazardStatus('🔍 Processing location...')

    try {
      let lat, lon

      // Use selected coordinates if available, otherwise geocode
      if (selectedCoordinates) {
        lat = selectedCoordinates.lat.toString()
        lon = selectedCoordinates.lng.toString()
      } else {
        setHazardStatus('🔍 Geocoding location...')
        // Step 1: Geocode the location using our backend API
        const geocodeResponse = await fetch(`/api/geocode?q=${encodeURIComponent(location)}`)
        
        if (!geocodeResponse.ok) {
          throw new Error('Failed to geocode location. Please try a different address.')
        }
        
        const geocodeData = await geocodeResponse.json()

        if (!geocodeData || geocodeData.length === 0) {
          throw new Error('Location not found. Please try a different address.')
        }

        lat = geocodeData[0].lat.toString()
        lon = geocodeData[0].lon.toString()
        setSelectedCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) })
      }

      setHazardStatus('📥 Downloading hazard assessment...')

      // Step 2: Download hazard report from ULAP API
      const hazardResponse = await fetch('/api/hazard-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) },
          address: location
        }),
      })

      // Enhanced debugging for hazard API response
      console.log('🔍 Hazard API Status:', hazardResponse.status)
      console.log('🔍 Hazard API URL:', hazardResponse.url)
      console.log('🔍 Response headers:', [...hazardResponse.headers.entries()])
      console.log('🔍 Request coordinates:', { lat: parseFloat(lat), lng: parseFloat(lon) })
      console.log('🔍 Request address:', location)

      if (!hazardResponse.ok) {
        // Get detailed error information
        let errorBody = ''
        try {
          errorBody = await hazardResponse.text()
          console.error('❌ API Error Body:', errorBody)
        } catch (readError) {
          console.error('❌ Failed to read error response:', readError)
          errorBody = 'Unable to read error response'
        }

        // Check for specific error types
        if (hazardResponse.status === 404) {
          console.warn('⚠️ Hazard report not available for this location')
          setHazardStatus('⚠️ No hazard report available for this location. Using sample data.')
          
          // Use mock hazard data as fallback
          const mockHazards = {
            seismic: 'moderate' as const,
            flood_typhoon: 'moderate' as const,
            other: 'low' as const
          }
          
          setFormData(prev => ({
            ...prev,
            hazards: mockHazards
          }))
          
          setHazardStatus('⚠️ Using sample hazard data - report not available for this location')
          setTimeout(() => setHazardStatus(null), 5000)
          return // Exit early with fallback data
          
        } else if (hazardResponse.status === 500) {
          console.warn('⚠️ Hazard API server error, using fallback data')
          setHazardStatus('⚠️ Hazard service temporarily unavailable. Using default moderate risk levels.')
          
          // Use moderate risk levels as fallback
          const fallbackHazards = {
            seismic: 'moderate' as const,
            flood_typhoon: 'moderate' as const,
            other: 'moderate' as const
          }
          
          setFormData(prev => ({
            ...prev,
            hazards: fallbackHazards
          }))
          
          setHazardStatus('⚠️ Using default moderate risk levels due to service unavailability')
          setTimeout(() => setHazardStatus(null), 5000)
          return // Exit early with fallback data
          
        } else {
          // For other errors, throw with detailed information
          const errorMessage = `Failed to download hazard report: ${hazardResponse.status} - ${errorBody}`
          console.error('❌ Hazard API Error:', errorMessage)
          throw new Error(errorMessage)
        }
      }

      // Log successful response details
      const contentType = hazardResponse.headers.get('content-type')
      console.log('✅ Hazard API success - Content-Type:', contentType)

      setHazardStatus('🤖 Analyzing hazard data with AI...')

      // Step 3: Get AI analysis of the hazard report
      const aiResponse = await fetch('/api/ai-risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) },
          address: location
        }),
      })

      // Enhanced error handling for AI API call
      if (!aiResponse.ok) {
        console.error('❌ AI API Error:', aiResponse.status, aiResponse.statusText)
        
        let errorDetails = 'Unknown error'
        try {
          const errorText = await aiResponse.text()
          console.error('❌ Error details:', errorText)
          
          // Try to parse as JSON for structured error
          try {
            const errorJson = JSON.parse(errorText)
            errorDetails = errorJson.error || errorText
          } catch {
            errorDetails = errorText
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError)
        }

        // Provide specific error messages based on status code
        let userMessage = ''
        switch (aiResponse.status) {
          case 400:
            userMessage = 'Invalid location data. Please try a different address.'
            break
          case 503:
            userMessage = 'AI analysis service is temporarily unavailable. Using default hazard levels.'
            break
          case 500:
            userMessage = 'Server error during hazard analysis. Using default hazard levels.'
            break
          default:
            userMessage = `Failed to analyze hazard data (${aiResponse.status}). Using default hazard levels.`
        }

        console.warn('⚠️ Using fallback hazard data due to API error')
        
        // Fallback: Use moderate risk levels for all hazards
        const fallbackHazards = {
          seismic: 'moderate' as const,
          flood_typhoon: 'moderate' as const,
          other: 'moderate' as const
        }

        setFormData(prev => ({
          ...prev,
          hazards: fallbackHazards
        }))

        setHazardStatus(`⚠️ ${userMessage}`)
        
        // Still show success but with warning
        setTimeout(() => {
          setHazardStatus('⚠️ Hazard data set to moderate levels')
        }, 3000)
        
        return // Exit early with fallback data
      }

      const aiData = await aiResponse.json()
      console.log('🤖 AI Analysis Response:', aiData)
      
      // Extract hazard levels from AI analysis
      const hazardLevels = {
        seismic: 'moderate', // Default values
        flood_typhoon: 'moderate',
        other: 'moderate'
      }

      // Map AI risk levels to our system (AI uses: LOW, MODERATE, HIGH, VERY HIGH)
      const mapRiskLevel = (aiRisk: string): 'low' | 'moderate' | 'high' => {
        const normalized = aiRisk.toLowerCase()
        if (normalized.includes('low')) return 'low'
        if (normalized.includes('high') || normalized.includes('very high')) return 'high'
        return 'moderate' // Default for moderate/unknown
      }

      // Process AI analysis results
      if (aiData.aiAnalysis && aiData.aiAnalysis.hazardTypes && Array.isArray(aiData.aiAnalysis.hazardTypes)) {
        aiData.aiAnalysis.hazardTypes.forEach((hazard: any) => {
          const type = hazard.type.toLowerCase()
          const mappedRisk = mapRiskLevel(hazard.risk)
          
          console.log(`📊 Processing hazard: ${type} -> ${hazard.risk} -> ${mappedRisk}`)
          
          if (type.includes('earthquake') || type.includes('seismic') || type.includes('fault')) {
            hazardLevels.seismic = mappedRisk
          } else if (type.includes('flood') || type.includes('typhoon') || type.includes('storm') || type.includes('cyclone')) {
            hazardLevels.flood_typhoon = mappedRisk
          } else {
            hazardLevels.other = mappedRisk
          }
        })
      }

      // Also check overall risk level if specific hazards not found
      if (aiData.aiAnalysis && aiData.aiAnalysis.riskLevel) {
        const overallRisk = mapRiskLevel(aiData.aiAnalysis.riskLevel)
        console.log(`📊 Overall risk level: ${aiData.aiAnalysis.riskLevel} -> ${overallRisk}`)
        
        // If no specific hazards were mapped, use overall risk for all categories
        if (hazardLevels.seismic === 'moderate' && hazardLevels.flood_typhoon === 'moderate' && hazardLevels.other === 'moderate') {
          hazardLevels.seismic = overallRisk
          hazardLevels.flood_typhoon = overallRisk
          hazardLevels.other = overallRisk
        }
      }

      console.log('📊 Final hazard levels:', hazardLevels)

      // Update form data with extracted hazard levels
      setFormData(prev => ({
        ...prev,
        hazards: hazardLevels
      }))

      setHazardStatus('✅ Hazard data loaded successfully!')
      
      // PDF download is now manual only
      setTimeout(() => setHazardStatus(null), 3000)

    } catch (error) {
      console.error('❌ Hazard data fetch error:', error)
      
      // Detailed error logging
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
      }
      
      // Provide user-friendly error messages based on error type
      let userMessage = 'Failed to load hazard data. Please try again.'
      let fallbackApplied = false
      
      if (error instanceof Error) {
        if (error.message.includes('geocode')) {
          userMessage = 'Unable to find location. Please check the address and try again.'
        } else if (error.message.includes('hazard report')) {
          userMessage = 'Hazard report unavailable for this location. Using default moderate risk levels.'
          fallbackApplied = true
        } else if (error.message.includes('analyze hazard data')) {
          userMessage = 'AI analysis failed. Using default moderate risk levels.'
          fallbackApplied = true
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          userMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      // Apply fallback hazard levels if appropriate
      if (fallbackApplied) {
        console.warn('⚠️ Applying fallback hazard levels due to API failure')
        setFormData(prev => ({
          ...prev,
          hazards: {
            seismic: 'moderate',
            flood_typhoon: 'moderate',
            other: 'moderate'
          }
        }))
        userMessage += ' ✓ Form updated with moderate risk levels.'
      }
      
      setHazardStatus(`❌ ${userMessage}`)
      setTimeout(() => setHazardStatus(null), 8000) // Longer timeout for error messages
    } finally {
      setIsLoadingHazards(false)
      fetchInProgressRef.current = false
    }
  }

  const manualDownloadHazardPDF = async () => {
    if (!selectedCoordinates || !location) {
      alert('Please select a location first')
      return
    }
    
    if (isDownloadingPDF) {
      return
    }
    
    setIsDownloadingPDF(true)
    
    try {
      const downloadUrl = `/api/download-hazard-pdf?lat=${selectedCoordinates.lat}&lng=${selectedCoordinates.lng}&address=${encodeURIComponent(location)}`
      
      // Create and trigger download directly (more reliable than HEAD check)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `Hazard_Report_${location.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30)}.pdf`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to download PDF: ${errorMessage}`)
    } finally {
      // Add a delay to prevent rapid successive clicks
      setTimeout(() => {
        setIsDownloadingPDF(false)
      }, 2000)
    }
  }

  const calculateRiskScore = async () => {
    setIsCalculating(true)
    
    try {
      // Validate that all required fields have values
      const requiredFields = [
        'income', 'expenses', 'loan_payments', 'income_sources', 
        'loan_history', 'land_ownership', 'equipment_savings',
        'crops_storage', 'collateral_ratio', 'insurance', 
        'banking_history'
      ]
      
      const missingFields = requiredFields.filter(field => {
        const value = formData[field as keyof ApplicantData]
        return !value || value === '' || value === 0
      })
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
        return
      }
      
      // Validate hazards data
      if (!formData.hazards.seismic || !formData.hazards.flood_typhoon || !formData.hazards.other) {
        alert('Please fetch hazard assessment data by entering a location and clicking "Get Hazards"')
        return
      }
      
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        setRiskResult(result)
      } else {
        const errorText = await response.text()
        alert(`Error calculating risk score: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      alert(`Error calculating risk score: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCalculating(false)
    }
  }

  const getRiskColor = (classification: string) => {
    switch (classification) {
      case 'Low Risk': return 'text-green-600 bg-green-100'
      case 'Medium Risk': return 'text-yellow-600 bg-yellow-100'
      case 'High Risk': return 'text-orange-600 bg-orange-100'
      case 'Very High Risk': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Dashboard component for real-time visualization
  const Dashboard = () => {
    const netIncome = formData.income - formData.expenses - formData.loan_payments
    const monthlyNetIncome = netIncome / 12
    const debtToIncomeRatio = formData.income > 0 ? ((formData.loan_payments / formData.income) * 100) : 0
    
    // Cashflow Projections (12-month forward looking)
    const monthlyCropStorage = formData.crops_storage / 12
    const monthlyIncome = formData.income / 12
    const monthlyExpenses = formData.expenses / 12
    const monthlyLoanPayments = formData.loan_payments / 12
    const projectedMonthlyCashflow = monthlyIncome - monthlyExpenses - monthlyLoanPayments + monthlyCropStorage
    const projectedAnnualCashflow = projectedMonthlyCashflow * 12
    
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 sticky top-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Financial Analysis</h3>
          <p className="text-gray-600">Real-time calculations as you fill the form</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Form Completion</span>
            <span className="text-sm font-bold text-red-600">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="space-y-4">
          {/* Monthly Net Income with Calculation Breakdown */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">Monthly Net Income</span>
              <span className="text-lg font-bold text-gray-900">
                ₱{monthlyNetIncome.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
              </span>
            </div>
            
            {/* Calculation Breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Income ÷ 12:</span>
                <span className="font-medium">₱{(formData.income / 12).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Expenses ÷ 12:</span>
                <span className="font-medium text-red-600">-₱{(formData.expenses / 12).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Payments ÷ 12:</span>
                <span className="font-medium text-red-600">-₱{(formData.loan_payments / 12).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-semibold">
                <span className="text-gray-700">Net Monthly:</span>
                <span className={monthlyNetIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₱{monthlyNetIncome.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  monthlyNetIncome > 0 ? 'bg-green-500' : monthlyNetIncome < 0 ? 'bg-red-500' : 'bg-gray-300'
                }`}
                style={{ width: `${Math.min(Math.max((monthlyNetIncome / Math.max(formData.income / 12, 1)) * 100, 0), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Debt-to-Income Ratio with Calculation Breakdown */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">Debt-to-Income Ratio</span>
              <span className="text-lg font-bold text-gray-900">{debtToIncomeRatio.toFixed(1)}%</span>
            </div>
            
            {/* Calculation Breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Loan Payments:</span>
                <span className="font-medium">₱{formData.loan_payments.toLocaleString('en-PH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Income:</span>
                <span className="font-medium">₱{formData.income.toLocaleString('en-PH')}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-semibold">
                <span className="text-gray-700">Ratio (Debt ÷ Income × 100):</span>
                <span className={debtToIncomeRatio <= 20 ? 'text-green-600' : debtToIncomeRatio <= 40 ? 'text-yellow-600' : 'text-red-600'}>
                  {debtToIncomeRatio.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  debtToIncomeRatio <= 20 ? 'bg-green-500' : 
                  debtToIncomeRatio <= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(debtToIncomeRatio, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Excellent (≤20%)</span>
              <span>Good (≤40%)</span>
              <span>High (&gt;40%)</span>
            </div>
          </div>

          {/* Cashflow Projections (replacing Equipment Savings) */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">12-Month Cashflow Projection</span>
              <span className="text-lg font-bold text-gray-900">
                ₱{projectedAnnualCashflow.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
              </span>
            </div>
            
            {/* Calculation Breakdown */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Income:</span>
                <span className="font-medium text-green-600">+₱{monthlyIncome.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Expenses:</span>
                <span className="font-medium text-red-600">-₱{monthlyExpenses.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Loan Payments:</span>
                <span className="font-medium text-red-600">-₱{monthlyLoanPayments.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Crop Revenue:</span>
                <span className="font-medium text-green-600">+₱{monthlyCropStorage.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="border-t pt-1 flex justify-between font-semibold">
                <span className="text-gray-700">Net Monthly Cashflow:</span>
                <span className={projectedMonthlyCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₱{projectedMonthlyCashflow.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  projectedAnnualCashflow > 100000 ? 'bg-green-500' : 
                  projectedAnnualCashflow > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.max((projectedAnnualCashflow / 500000) * 100, 0), 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Projection based on current income, expenses, and crop storage value
            </div>
          </div>

          {/* Risk Indicator */}
          {riskResult && (
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Risk Score</span>
                <span className="text-2xl font-bold text-red-600">{riskResult.score}</span>
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(riskResult.classification)}`}>
                  {riskResult.classification}
                </span>
              </div>
            </div>
          )}

          {/* Completion Status */}
          <div className="text-center mt-6">
            {completionPercentage === 100 ? (
              <div className="flex items-center justify-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">Form Complete!</span>
              </div>
            ) : (
              <div className="text-gray-500">
                <span className="text-sm">{14 - Math.round((completionPercentage / 100) * 14)} fields remaining</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#F8F8F8'}}>
      {/* Main Container with Two-Column Layout */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section - Full Width */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl leading-tight mb-4">
            <span className="font-bold text-gray-900">Your Path to</span>
            <br />
            <span className="font-extrabold text-red-600">Growth.</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your data is secure and encrypted. This assessment helps lenders understand your financial profile for better loan terms.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Form (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

        {/* Form Sections */}
        <div className="space-y-12">
          
          {/* Financial Information Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <DollarIcon />
              <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Annual Income (₱)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.income || ''}
                  onChange={(e) => handleInputChange('income', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 300,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Annual Expenses (₱)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.expenses || ''}
                  onChange={(e) => handleInputChange('expenses', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 150,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Annual Loan Payments (₱)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.loan_payments || ''}
                  onChange={(e) => handleInputChange('loan_payments', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 50,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Income Sources
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg bg-white"
                  value={formData.income_sources}
                  onChange={(e) => handleInputChange('income_sources', e.target.value)}
                >
                  <option value="">Select income source</option>
                  <option value="multiple">Multiple income sources</option>
                  <option value="rice">Rice farming</option>
                  <option value="corn">Corn farming</option>
                  <option value="vegetables">Vegetable farming</option>
                  <option value="livestock">Livestock</option>
                  <option value="other">Other crops</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Loan Payment History
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg bg-white"
                  value={formData.loan_history}
                  onChange={(e) => handleInputChange('loan_history', e.target.value)}
                >
                  <option value="">Select payment history</option>
                  <option value="on_time">Always on time</option>
                  <option value="late_1_2">1-2 late payments</option>
                  <option value="late_3_5">3-5 late payments</option>
                  <option value="late_5_plus">More than 5 late payments</option>
                </select>
              </div>
            </div>
          </section>

          {/* Assets & Capital Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <BuildingIcon />
              <h2 className="text-2xl font-bold text-gray-900">Assets & Capital</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Land Ownership
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg bg-white"
                  value={formData.land_ownership}
                  onChange={(e) => handleInputChange('land_ownership', e.target.value)}
                >
                  <option value="">Select land ownership</option>
                  <option value="owned_large">Owned large farm (5+ hectares)</option>
                  <option value="owned_medium">Owned medium farm (2-5 hectares)</option>
                  <option value="titled_1ha_plus">Titled land (1+ hectare)</option>
                  <option value="small_or_shared">Small plot or shared ownership</option>
                  <option value="tenant">Tenant farmer</option>
                  <option value="none">No land ownership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Equipment & Savings Value (₱)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.equipment_savings || ''}
                  onChange={(e) => handleInputChange('equipment_savings', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 75,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Crops in Storage Value (₱)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.crops_storage || ''}
                  onChange={(e) => handleInputChange('crops_storage', parseInt(e.target.value) || 0)}
                  placeholder="e.g., 30,000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Collateral Ratio
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                  value={formData.collateral_ratio || ''}
                  onChange={(e) => handleInputChange('collateral_ratio', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 1.2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Insurance Coverage
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg bg-white"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                >
                  <option value="">Select insurance type</option>
                  <option value="crop_life">Crop & Life insurance</option>
                  <option value="crop_only">Crop insurance only</option>
                  <option value="none">No insurance</option>
                </select>
              </div>
            </div>
          </section>

          {/* Credit History Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <ShieldIcon />
              <h2 className="text-2xl font-bold text-gray-900">Credit History & Character</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Banking History
                </label>
                <select
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg bg-white"
                  value={formData.banking_history}
                  onChange={(e) => handleInputChange('banking_history', e.target.value)}
                >
                  <option value="">Select banking history</option>
                  <option value="savings_and_good_loans">Savings & good loan history</option>
                  <option value="savings_only">Savings account only</option>
                  <option value="none">No banking history</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  checked={formData.coop_member}
                  onChange={(e) => handleInputChange('coop_member', e.target.checked)}
                />
                <label className="text-lg font-medium text-gray-800">
                  Member of farmers' cooperative
                </label>
              </div>
            </div>
          </section>

          {/* Environmental Hazards Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <LocationIcon />
              <h2 className="text-2xl font-bold text-gray-900">Environmental Hazards</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Farm/Property Location (Address)
                </label>
                <div className="relative">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
                        value={location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true)
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowSuggestions(false), 200)
                        }}
                        placeholder="e.g., Cabanatuan City, Nueva Ecija"
                      />
                      {isSearching && (
                        <div className="absolute right-4 top-4">
                          <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      
                      {/* Address Suggestions Dropdown */}
                      {showSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {addressSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="p-4 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                selectAddress(suggestion)
                              }}
                            >
                              <div className="font-medium text-gray-800 text-sm leading-tight">{suggestion.display_name}</div>
                              {suggestion.address && (
                                <div className="text-xs text-gray-500 mt-1 leading-tight">
                                  {suggestion.address.municipality || suggestion.address.city || ''} 
                                  {suggestion.address.province ? `, ${suggestion.address.province}` : ''}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {showSuggestions && addressSuggestions.length === 0 && !isSearching && location.length >= 3 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4">
                          <div className="text-gray-500 text-sm">No locations found. Try a different search term.</div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        fetchHazardData()
                      }}
                      disabled={isLoadingHazards || !location.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap"
                    >
                      {isLoadingHazards ? 'Getting...' : 'Get Hazards'}
                    </button>
                  </div>
                </div>
                {hazardStatus && (
                  <p className={`mt-3 text-sm font-medium ${hazardStatus.includes('❌') ? 'text-red-600' : hazardStatus.includes('✅') ? 'text-green-600' : 'text-blue-600'}`}>
                    {hazardStatus}
                  </p>
                )}
              </div>

              {/* Interactive Map */}
              {selectedCoordinates && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Location on Map</h3>
                    <button
                      type="button"
                      onClick={manualDownloadHazardPDF}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        !selectedCoordinates || isDownloadingPDF
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                      disabled={!selectedCoordinates || isDownloadingPDF}
                    >
                      {isDownloadingPDF ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </div>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoordinates.lng-0.01},${selectedCoordinates.lat-0.01},${selectedCoordinates.lng+0.01},${selectedCoordinates.lat+0.01}&layer=mapnik&marker=${selectedCoordinates.lat},${selectedCoordinates.lng}`}
                      width="100%"
                      height="300"
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen
                      title="Location Map"
                    ></iframe>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    📌 Coordinates: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Hazard Assessment Display */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4">Current Hazard Assessment</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Seismic Risk</div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      formData.hazards.seismic === 'low' ? 'bg-green-100 text-green-800' :
                      formData.hazards.seismic === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      formData.hazards.seismic === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.hazards.seismic || 'Not assessed'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Flood/Typhoon</div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      formData.hazards.flood_typhoon === 'low' ? 'bg-green-100 text-green-800' :
                      formData.hazards.flood_typhoon === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      formData.hazards.flood_typhoon === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.hazards.flood_typhoon || 'Not assessed'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Other Risks</div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      formData.hazards.other === 'low' ? 'bg-green-100 text-green-800' :
                      formData.hazards.other === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      formData.hazards.other === 'high' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.hazards.other || 'Not assessed'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Hazard data is automatically fetched from official Philippine government sources (ULAP) based on your location.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            type="button"
            onClick={() => {
              setFormData({
                income: 50000,
                expenses: 30000,
                loan_payments: 5000,
                income_sources: 'multiple',
                loan_history: 'on_time',
                land_ownership: 'owned_medium',
                equipment_savings: 75000,
                crops_storage: 30000,
                collateral_ratio: 1.2,
                insurance: 'crop_life',
                banking_history: 'savings_and_good_loans',
                coop_member: true,
                hazards: {
                  seismic: '',
                  flood_typhoon: '',
                  other: ''
                }
              })
            }}
            className="bg-transparent border border-gray-300 text-red-600 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:text-red-700 transition-all duration-200"
          >
            Fill Sample Data
          </button>
          
          <button
            onClick={calculateRiskScore}
            disabled={isCalculating}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-12 rounded-full text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Risk Score'}
          </button>
        </div>
      </div>

      {/* Risk Result - Outside main card */}
      {riskResult && (
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">Risk Assessment Result</h3>
          <div className="text-center">
            <div className="text-6xl font-bold mb-6 text-gray-800">{riskResult.score}</div>
            <div className={`inline-block px-8 py-4 rounded-2xl font-bold text-xl ${getRiskColor(riskResult.classification)}`}>
              {riskResult.classification}
            </div>
            <p className="mt-6 text-gray-600 max-w-md mx-auto">
              Lower scores indicate lower risk for lenders. Score range: 0-100+
            </p>
          </div>
        </div>
      )}

      {/* AI Recommendations - Outside main card */}
      {riskResult && riskResult.recommendations && (
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">
            AI-Powered Recommendations
          </h3>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Personalized suggestions to help you improve your risk profile and qualify for better loan terms
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Priority Recommendations */}
            <div className="bg-red-50 p-8 rounded-2xl border-l-4 border-red-500">
              <h4 className="text-xl font-bold text-red-700 mb-6">
                🔥 Priority Actions
              </h4>
              <ul className="space-y-3">
                {riskResult.recommendations.priorityRecommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-3">
                    <span className="text-red-500 font-bold text-lg">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial Improvements */}
            <div className="bg-green-50 p-8 rounded-2xl border-l-4 border-green-500">
              <h4 className="text-xl font-bold text-green-700 mb-6">
                💰 Financial Improvements
              </h4>
              <ul className="space-y-3">
                {riskResult.recommendations.financialImprovements.map((rec, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Mitigation */}
            <div className="bg-yellow-50 p-8 rounded-2xl border-l-4 border-yellow-500">
              <h4 className="text-xl font-bold text-yellow-700 mb-6">
                🛡️ Risk Mitigation
              </h4>
              <ul className="space-y-3">
                {riskResult.recommendations.riskMitigation.map((rec, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-3">
                    <span className="text-yellow-500 font-bold text-lg">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 p-8 rounded-2xl border-l-4 border-blue-500">
              <h4 className="text-xl font-bold text-blue-700 mb-6">
                🎯 Next Steps
              </h4>
              <ul className="space-y-3">
                {riskResult.recommendations.nextSteps.map((rec, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-3">
                    <span className="text-blue-500 font-bold text-lg">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Potential Score Improvement */}
          {riskResult.recommendations.potentialScoreImprovement && (
            <div className="mt-8 p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
              <h4 className="text-xl font-bold text-purple-700 mb-4">
                📈 Potential Improvement
              </h4>
              <p className="text-purple-600 mb-2 text-lg">{riskResult.recommendations.potentialScoreImprovement.description}</p>
              <p className="text-purple-500 font-semibold">
                Target: {riskResult.recommendations.potentialScoreImprovement.targetScore}
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💡 These recommendations are AI-generated based on your profile and current risk factors. 
              Always consult with financial advisors for personalized guidance.
            </p>
          </div>
        </div>
      )}
          </div>

          {/* Right Column - Dashboard (1/3 width) */}
          <div className="lg:col-span-1">
            <Dashboard />
          </div>

        </div>
      </div>
    </div>
  )
}
