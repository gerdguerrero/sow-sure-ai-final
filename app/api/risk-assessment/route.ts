import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const applicantData = await request.json()
    
    console.log('📊 Risk Assessment Request:', JSON.stringify(applicantData, null, 2))
    
    // Validate required data
    if (!applicantData || typeof applicantData !== 'object') {
      throw new Error('Invalid applicant data format')
    }
    
    // Path to Python script
    const pythonPath = process.platform === 'win32'
      ? '.venv\\Scripts\\python.exe'
      : '.venv/bin/python'
    const scriptPath = 'risk_score.py'
    
    console.log('🐍 Using Python path:', pythonPath)
    
    // Convert JavaScript boolean values to Python boolean values
    const pythonData = JSON.stringify(applicantData).replace(/true/g, 'True').replace(/false/g, 'False')
    
    console.log('📦 Converted data for Python:', pythonData)
    
    // Execute Python risk score calculator
    const result = await new Promise<{score: number, classification: string}>((resolve, reject) => {
      let stdout = ''
      let stderr = ''
      
      const pythonProcess = spawn(pythonPath, ['-c', `
import sys
import json
sys.path.append('.')
from risk_score import compute_risk_score

# Read applicant data from stdin
applicant_data = ${pythonData}

# Calculate risk score
result = compute_risk_score(applicant_data)
print(json.dumps(result))
`], {
        cwd: process.cwd()
      })
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        console.log('🔍 Python process stdout:', stdout)
        console.log('🔍 Python process stderr:', stderr)
        console.log('🔍 Python process exit code:', code)
        
        if (code === 0) {
          try {
            const parsed = JSON.parse(stdout.trim())
            resolve(parsed)
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${parseError}`))
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`))
        }
      })
      
      pythonProcess.on('error', (error) => {
        reject(error)
      })
    })
    
    console.log('✅ Risk Score Result:', result)
    
    // Generate AI recommendations based on risk score and profile
    let recommendations: any = []
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        console.log('🤖 Generating AI recommendations...')
        
        const prompt = `
You are a financial advisor specializing in agricultural loans and risk management for Filipino farmers. Based on the farmer's loan application data and risk assessment, provide specific, actionable recommendations to help them improve their risk profile and qualify for better loan terms.

FARMER PROFILE:
- Current Risk Score: ${result.score} penalty points
- Risk Classification: ${result.classification}
- Monthly Income: ₱${applicantData.income?.toLocaleString() || 'Not provided'}
- Monthly Expenses: ₱${applicantData.expenses?.toLocaleString() || 'Not provided'}
- Monthly Loan Payments: ₱${applicantData.loan_payments?.toLocaleString() || 'Not provided'}
- Income Sources: ${applicantData.income_sources || 'Not specified'}
- Loan History: ${applicantData.loan_history || 'Not specified'}
- Land Ownership: ${applicantData.land_ownership || 'Not specified'}
- Equipment & Savings: ₱${applicantData.equipment_savings?.toLocaleString() || 'Not provided'}
- Crops in Storage: ₱${applicantData.crops_storage?.toLocaleString() || 'Not provided'}
- Collateral Ratio: ${applicantData.collateral_ratio || 'Not provided'}
- Insurance: ${applicantData.insurance || 'Not specified'}
- Banking History: ${applicantData.banking_history || 'Not specified'}
- Cooperative Member: ${applicantData.coop_member ? 'Yes' : 'No'}
- Hazard Risks: Seismic=${applicantData.hazards?.seismic || 'unknown'}, Flood/Typhoon=${applicantData.hazards?.flood_typhoon || 'unknown'}, Other=${applicantData.hazards?.other || 'unknown'}

RISK SCORING SYSTEM (for context):
- Low Risk: 0-20 points (Best loan terms)
- Medium Risk: 21-40 points (Standard loan terms)
- High Risk: 41-60 points (Higher interest rates)
- Very High Risk: 61+ points (May need guarantors/co-signers)

Please provide recommendations in JSON format:
{
  "priorityRecommendations": [
    "Most important action item 1",
    "Most important action item 2",
    "Most important action item 3"
  ],
  "financialImprovements": [
    "Specific financial advice 1",
    "Specific financial advice 2"
  ],
  "riskMitigation": [
    "Risk reduction strategy 1",
    "Risk reduction strategy 2"
  ],
  "nextSteps": [
    "Immediate action 1",
    "Immediate action 2"
  ],
  "potentialScoreImprovement": {
    "description": "Brief explanation of how much the risk score could improve",
    "targetScore": "estimated new score range if recommendations are followed"
  }
}

Focus on practical, achievable steps specific to Filipino farming context. Consider factors like crop insurance programs, cooperative membership benefits, land titling processes, diversification strategies, and disaster preparedness.
`

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert agricultural finance advisor specializing in risk assessment and farmer loan applications in the Philippines. Provide practical, actionable advice."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (aiResponse) {
          try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
            recommendations = JSON.parse(jsonString)
            console.log('✅ AI recommendations generated successfully')
          } catch (parseError) {
            console.error('❌ Failed to parse AI recommendations:', parseError)
            // Provide fallback recommendations
            recommendations = {
              priorityRecommendations: [
                "Improve your net disposable income ratio by reducing monthly expenses",
                "Consider joining a farming cooperative for better support and lower risk classification",
                "Explore crop insurance options to protect against disasters"
              ],
              financialImprovements: [
                "Diversify income sources beyond farming",
                "Build emergency savings equivalent to 3-6 months of expenses"
              ],
              riskMitigation: [
                "Maintain good banking relationships with regular savings deposits",
                "Keep detailed records of all farming activities and finances"
              ],
              nextSteps: [
                "Contact local agricultural extension office for guidance",
                "Research available government support programs for farmers"
              ],
              potentialScoreImprovement: {
                description: "Following these recommendations could improve your risk profile",
                targetScore: "Could potentially reduce penalty score by 10-20 points"
              }
            }
          }
        }
      } catch (aiError) {
        console.error('❌ AI recommendation generation failed:', aiError)
        // Continue without recommendations rather than failing the entire request
      }
    }
    
    return NextResponse.json({
      ...result,
      recommendations
    })
    
  } catch (error) {
    console.error('❌ Risk assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risk score' },
      { status: 500 }
    )
  }
}
