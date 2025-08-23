import { NextRequest, NextResponse } from 'next/server'
import { validateCoordinates } from '../../../lib/hazard-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coordinates, address } = body

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return NextResponse.json(
        { error: 'Coordinates are required' },
        { status: 400 }
      )
    }

    const { lat, lng } = coordinates

    // Validate coordinates using shared module
    try {
      validateCoordinates({ lat, lng });
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError instanceof Error ? validationError.message : 'Invalid coordinates' },
        { status: 400 }
      )
    }

    console.log(`🌏 Downloading hazard report for: ${address || 'Unknown location'}`)
    console.log(`📍 Coordinates: ${lat}, ${lng}`)

    // Philippine ULAP API for hazard assessment
    const reportUrl = `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${lng}/${lat}`

    console.log(`🔗 Fetching from ULAP API: ${reportUrl}`)

    const response = await fetch(reportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SowSureAI-HazardAssessment/1.0 (Web Interface)',
        'Accept': 'application/pdf, application/json, */*',
      },
    })

    if (!response.ok) {
      console.error(`❌ ULAP API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `ULAP API error: ${response.status}` },
        { status: response.status }
      )
    }

    // Check content type
    const contentType = response.headers.get('content-type')
    console.log(`📄 Response content type: ${contentType}`)

    if (contentType?.includes('application/pdf')) {
      // Handle PDF response
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log(`✅ Successfully downloaded PDF (${buffer.length} bytes)`)

      // Create filename based on address and coordinates
      const cleanAddress = address ? address.replace(/[^a-zA-Z0-9]/g, '-') : 'unknown-location'
      const filename = `hazard-report-${cleanAddress}-${lat.toFixed(6)}-${lng.toFixed(6)}.pdf`

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': buffer.length.toString(),
        },
      })
    } else {
      // Handle JSON or other response types
      const data = await response.text()
      console.log(`📋 Non-PDF response received: ${data.substring(0, 200)}...`)

      return NextResponse.json(
        { 
          error: 'No PDF report available for this location',
          details: data.substring(0, 500)
        },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('❌ Error in hazard report API:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch hazard report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
