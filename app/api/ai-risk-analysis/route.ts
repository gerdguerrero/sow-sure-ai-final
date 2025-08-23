import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📥 Received request body:', JSON.stringify(body, null, 2))
    
    const { coordinates, address } = body

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      console.error('❌ Missing coordinates in request')
      return NextResponse.json(
        { error: 'Coordinates are required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'AI analysis service not configured. Please set OPENAI_API_KEY.' },
        { status: 503 }
      )
    }

    const { lat, lng } = coordinates

    console.log(`🤖 AI Risk Analysis for: ${address || 'Unknown location'}`)
    console.log(`📍 Coordinates: ${lat}, ${lng}`)

    // Step 1: Download hazard report from ULAP API
    const reportUrl = `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${lng}/${lat}`
    
    console.log(`📥 Downloading PDF from ULAP API: ${reportUrl}`)
    const pdfResponse = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SowSureAI-AI-Analysis/1.0 (AI Risk Assessment)',
        'Accept': 'application/pdf, */*',
      },
    })

    if (!pdfResponse.ok) {
      console.error(`❌ ULAP API error: ${pdfResponse.status} ${pdfResponse.statusText}`)
      return NextResponse.json(
        { error: `ULAP API error: ${pdfResponse.status}` },
        { status: pdfResponse.status }
      )
    }

    // Step 2: Extract text from PDF using Python script
    console.log(`📄 Extracting text from PDF using Python...`)
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    
    let extractedText: string
    try {
      // Save PDF to temporary file
      const fs = await import('fs')
      const path = await import('path')
      const os = await import('os')
      
      const tempDir = os.tmpdir()
      const tempFileName = `hazard-report-${Date.now()}.pdf`
      const tempFilePath = path.join(tempDir, tempFileName)
      
      // Write PDF to temporary file
      await fs.promises.writeFile(tempFilePath, pdfBuffer)
      console.log(`📁 Saved PDF to temporary file: ${tempFilePath}`)
      
      // Execute Python PDF extractor
      const { spawn } = await import('child_process')
        const pythonPath = process.platform === 'win32'
          ? '.venv\\Scripts\\python.exe'
          : '.venv/bin/python';
      const scriptPath = 'pdf_extractor.py'
      
      const result = await new Promise<{success: boolean, text?: string, error?: string}>((resolve, reject) => {
        let stdout = ''
        let stderr = ''
        
        const pythonProcess = spawn(pythonPath, [scriptPath, tempFilePath], {
          cwd: process.cwd()
        })
        
        pythonProcess.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        pythonProcess.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        pythonProcess.on('close', (code) => {
          // Clean up temporary file
          fs.promises.unlink(tempFilePath).catch(() => {})
          
          if (code === 0) {
            try {
              const parsed = JSON.parse(stdout)
              resolve(parsed)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${parseError}`))
            }
          } else {
            reject(new Error(`Python script failed with code ${code}: ${stderr}`))
          }
        })
        
        pythonProcess.on('error', (error) => {
          // Clean up temporary file
          fs.promises.unlink(tempFilePath).catch(() => {})
          reject(error)
        })
      })
      
      if (!result.success) {
        throw new Error(result.error || 'PDF extraction failed')
      }
      
      extractedText = result.text || ''
      console.log(`✅ Python extracted ${extractedText.length} characters successfully`)
      
    } catch (pdfError) {
      console.error('❌ PDF extraction failed:', pdfError)
      
      // Enhanced error details
      if (pdfError instanceof Error) {
        console.error('❌ PDF Error message:', pdfError.message)
        console.error('❌ PDF Error stack:', pdfError.stack)
      }
      
      // Check if Python environment is accessible
      try {
        const { spawn } = await import('child_process')
        const pythonPath = process.platform === 'win32'
          ? '.venv\\Scripts\\python.exe'
          : '.venv/bin/python'
        
        console.log(`🔍 Checking Python environment: ${pythonPath}`)
        const fs = await import('fs')
        const pythonExists = await fs.promises.access(pythonPath).then(() => true).catch(() => false)
        console.log(`🐍 Python executable exists: ${pythonExists}`)
        
        if (!pythonExists) {
          return NextResponse.json(
            { error: 'Python environment not found. Please run: uv venv .venv && .venv\\Scripts\\activate && uv pip install pypdf' },
            { status: 500 }
          )
        }
      } catch (envError) {
        console.error('❌ Environment check failed:', envError)
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to extract text from hazard report PDF using Python extractor',
          details: pdfError instanceof Error ? pdfError.message : 'Unknown PDF extraction error',
          suggestion: 'Check if Python virtual environment is activated and pypdf is installed'
        },
        { status: 500 }
      )
    }

    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or unreadable' },
        { status: 400 }
      )
    }

    // Step 3: Analyze with GPT-4o-mini
    console.log(`🧠 Analyzing hazard data with AI...`)
    
    const prompt = `
You are a disaster risk assessment expert analyzing a Philippine hazard report. Please provide a comprehensive but concise risk analysis based on the following hazard assessment data.

Location: ${address}
Coordinates: ${lat}, ${lng}

HAZARD REPORT DATA:
${extractedText.substring(0, 8000)} // Limit to ~8k chars for API efficiency

Please provide a structured analysis in JSON format with the following structure:
{
  "riskLevel": "LOW|MODERATE|HIGH|VERY HIGH",
  "overallSummary": "Brief 2-3 sentence summary of main risks",
  "hazardTypes": [
    {
      "type": "hazard name (e.g., Flooding, Earthquake, Landslide)",
      "risk": "LOW|MODERATE|HIGH|VERY HIGH", 
      "description": "Brief description of this specific hazard"
    }
  ],
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ],
  "keyFindings": [
    "Important finding 1",
    "Important finding 2"
  ]
}

Focus on practical, actionable insights for residents and property owners. Be specific about the types of hazards and their severity levels found in the report.
`

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional disaster risk assessment expert specializing in Philippine hazards. Provide accurate, actionable risk analysis in the exact JSON format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1500,
      })

      const aiResponse = completion.choices[0]?.message?.content
      if (!aiResponse) {
        throw new Error('No response from AI analysis')
      }

      console.log(`✅ AI analysis completed`)

      // Parse AI response as JSON
      let riskAnalysis
      try {
        // Extract JSON from response (handle potential markdown formatting)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
        riskAnalysis = JSON.parse(jsonString)
      } catch (parseError) {
        console.error('❌ Failed to parse AI response as JSON:', parseError)
        // Fallback: return raw AI response
        riskAnalysis = {
          riskLevel: "UNKNOWN",
          overallSummary: aiResponse.substring(0, 300),
          hazardTypes: [],
          recommendations: ["Please download the full PDF report for detailed analysis"],
          keyFindings: ["AI analysis format error - raw data available in PDF"]
        }
      }

      // Step 4: Return both AI analysis and PDF data
      return NextResponse.json({
        success: true,
        location: {
          address,
          coordinates: { lat, lng }
        },
        aiAnalysis: riskAnalysis,
        pdfInfo: {
          downloadUrl: reportUrl,
          textLength: extractedText.length,
          extractedAt: new Date().toISOString()
        }
      })

    } catch (aiError) {
      console.error('❌ AI analysis failed:', aiError)
      return NextResponse.json(
        { 
          error: 'AI analysis failed',
          details: aiError instanceof Error ? aiError.message : 'Unknown AI error',
          pdfAvailable: true,
          downloadUrl: reportUrl
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error in AI risk analysis API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to perform AI risk analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
