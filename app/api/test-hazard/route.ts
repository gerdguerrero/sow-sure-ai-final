import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat') || '14.5605166' // Default to Pasig
  const lng = searchParams.get('lng') || '121.0764343'
  const address = searchParams.get('address') || 'Test Location'

  try {
    console.log(`🧪 Testing hazard API for: ${address}`)
    console.log(`📍 Coordinates: ${lat}, ${lng}`)

    // Test the external ULAP API directly
    const reportUrl = `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${lng}/${lat}`
    console.log(`🔗 Testing URL: ${reportUrl}`)

    const startTime = Date.now()
    
    const response = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SowSureAI-DEBUG/1.0 (Testing)',
        'Accept': 'application/pdf, application/json, */*',
      },
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    // Collect response details
    const responseDetails = {
      url: reportUrl,
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`,
      headers: Object.fromEntries(response.headers.entries()),
      redirected: response.redirected,
      type: response.type,
      ok: response.ok
    }

    console.log('📊 Response details:', responseDetails)

    let bodyInfo = {}
    
    if (response.ok) {
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/pdf')) {
        const arrayBuffer = await response.arrayBuffer()
        bodyInfo = {
          type: 'PDF',
          size: `${arrayBuffer.byteLength} bytes`,
          sizeKB: `${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`
        }
      } else {
        const text = await response.text()
        bodyInfo = {
          type: 'Text/JSON',
          size: `${text.length} characters`,
          preview: text.substring(0, 500),
          full: text.length <= 1000 ? text : undefined
        }
      }
    } else {
      try {
        const errorText = await response.text()
        bodyInfo = {
          type: 'Error Response',
          error: errorText,
          size: `${errorText.length} characters`
        }
      } catch (readError) {
        bodyInfo = {
          type: 'Unreadable Error',
          error: 'Could not read error response'
        }
      }
    }

    // Test our internal API endpoint
    let internalApiTest: any = {}
    try {
      const internalResponse = await fetch(`${request.nextUrl.origin}/api/hazard-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
          address: address
        }),
      })

      internalApiTest = {
        status: internalResponse.status,
        statusText: internalResponse.statusText,
        ok: internalResponse.ok,
        headers: Object.fromEntries(internalResponse.headers.entries())
      }

      if (!internalResponse.ok) {
        const errorText = await internalResponse.text()
        internalApiTest.error = errorText
      }
    } catch (internalError) {
      internalApiTest = {
        error: internalError instanceof Error ? internalError.message : 'Unknown error',
        failed: true
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      testParameters: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address
      },
      externalApi: {
        ...responseDetails,
        body: bodyInfo
      },
      internalApi: internalApiTest,
      recommendations: {
        status: response.ok ? 'API is working' : 'API has issues',
        nextSteps: response.ok 
          ? ['Test with your actual coordinates', 'Check if PDF parsing works']
          : ['Check network connectivity', 'Verify coordinates are in Philippines', 'Try different location'],
        fallbackNeeded: !response.ok
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Hazard API test failed:', error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      testParameters: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address
      },
      recommendations: {
        status: 'Test failed',
        nextSteps: [
          'Check network connectivity',
          'Verify external API is accessible',
          'Check for firewall/proxy issues'
        ],
        fallbackNeeded: true
      }
    }, { status: 500 })
  }
}
