import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const address = searchParams.get('address') || 'Unknown Location'
    
    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }
    
    console.log(`📄 PDF Download request for: ${address}`)
    console.log(`📍 Coordinates: ${lat}, ${lng}`)
    
    // Fetch PDF from ULAP API
    const response = await fetch(
      `https://ulap-reports.georisk.gov.ph/api/reports/hazard-assessments/${lng}/${lat}`,
      {
        headers: {
          'User-Agent': 'SowSureAI-PDFDownload/1.0 (Hazard Assessment)',
        },
      }
    )
    
    if (!response.ok) {
      console.error(`❌ ULAP API error: ${response.status}`)
      return NextResponse.json({ error: 'Failed to fetch hazard report' }, { status: response.status })
    }
    
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/pdf')) {
      console.error(`❌ Invalid content type: ${contentType}`)
      return NextResponse.json({ error: 'Invalid response format' }, { status: 400 })
    }
    
    const pdfBuffer = await response.arrayBuffer()
    console.log(`✅ PDF downloaded successfully (${pdfBuffer.byteLength} bytes)`)
    
    // Create a clean filename
    const cleanAddress = address.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50)
    const filename = `Hazard_Report_${cleanAddress}_${lat}_${lng}.pdf`
    
    // Return the PDF with appropriate headers for download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
    
  } catch (error) {
    console.error('❌ PDF download error:', error)
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    )
  }
}
