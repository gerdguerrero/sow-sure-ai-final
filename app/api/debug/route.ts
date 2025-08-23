import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set (length: ' + process.env.OPENAI_API_KEY.length + ')' : 'Not set',
      },
      pythonCheck: {
        status: 'checking...',
        path: '',
        exists: false,
        error: null as string | null,
        testExecution: null as any
      }
    }

    // Check Python environment
    try {
      const fs = await import('fs')
      const path = await import('path')
      
      const pythonPath = process.platform === 'win32'
        ? '.venv\\Scripts\\python.exe'
        : '.venv/bin/python'
      
      const fullPythonPath = path.resolve(pythonPath)
      diagnostics.pythonCheck.path = fullPythonPath
      
      const pythonExists = await fs.promises.access(fullPythonPath).then(() => true).catch(() => false)
      diagnostics.pythonCheck.exists = pythonExists
      diagnostics.pythonCheck.status = pythonExists ? 'Found' : 'Not found'
      
      if (pythonExists) {
        // Test Python script execution
        const { spawn } = await import('child_process')
        const testResult = await new Promise<{success: boolean, output?: string, error?: string}>((resolve) => {
          let stdout = ''
          let stderr = ''
          
          const pythonProcess = spawn(fullPythonPath, ['-c', 'import pypdf; print("pypdf available")'], {
            cwd: process.cwd()
          })
          
          pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString()
          })
          
          pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString()
          })
          
          pythonProcess.on('close', (code) => {
            resolve({
              success: code === 0,
              output: stdout.trim(),
              error: stderr.trim()
            })
          })
          
          pythonProcess.on('error', (error) => {
            resolve({
              success: false,
              error: error.message
            })
          })
        })
        
        diagnostics.pythonCheck = {
          ...diagnostics.pythonCheck,
          testExecution: testResult
        }
      }
      
    } catch (pythonError) {
      diagnostics.pythonCheck.error = pythonError instanceof Error ? pythonError.message : 'Unknown error'
      diagnostics.pythonCheck.status = 'Error'
    }

    return NextResponse.json(diagnostics, { status: 200 })
    
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Diagnostic failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
