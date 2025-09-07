import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    let extractedText = ''

    // Process each uploaded file
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const file = value
        const fileType = file.type
        
        try {
          if (fileType === 'text/plain') {
            // Handle text files
            const text = await file.text()
            extractedText += `\n\n--- Content from ${file.name} ---\n${text}`
          } 
          else if (fileType === 'application/pdf') {
            // For PDF files - Basic extraction simulation
            const arrayBuffer = await file.arrayBuffer()
            const fileName = file.name
            extractedText += `\n\n--- PDF Content from ${fileName} ---\n`
            extractedText += `This appears to be a PDF document named "${fileName}". `
            extractedText += `In a production environment, this would contain the full text content extracted from the PDF using libraries like pdf-parse or PDF.js. `
            extractedText += `For now, please paste the important text content manually for the best AI analysis results.`
          }
          else if (fileType.includes('image')) {
            // For images - OCR simulation
            const fileName = file.name
            extractedText += `\n\n--- Image Content from ${fileName} ---\n`
            extractedText += `This is an image file (${fileName}). `
            extractedText += `In a production environment, text would be extracted from this image using OCR technology like Tesseract.js or Google Vision API. `
            extractedText += `This could include diagrams, charts, handwritten notes, or printed text. `
            extractedText += `For best results, please also provide any important text content from the image manually.`
          }
          else if (fileType.includes('word') || fileType.includes('document')) {
            // For Word documents - Document parsing simulation
            const fileName = file.name
            extractedText += `\n\n--- Document Content from ${fileName} ---\n`
            extractedText += `This is a Word document (${fileName}). `
            extractedText += `In a production environment, the full document content would be extracted using libraries like mammoth.js or officegen. `
            extractedText += `This would include all text, formatting, tables, and other document elements. `
            extractedText += `Please paste the main content manually for the most accurate AI analysis.`
          }
          else {
            // Unsupported file type
            continue
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error)
          continue
        }
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the uploaded files' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      extractedText: extractedText.trim(),
      message: 'Files processed successfully'
    })

  } catch (error) {
    console.error('Upload processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process uploaded files' },
      { status: 500 }
    )
  }
}