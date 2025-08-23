#!/usr/bin/env python3
"""
PDF Text Extraction Script for SowSure AI
Uses pypdf to extract text from hazard report PDFs
"""

import sys
import json
from pathlib import Path
from pypdf import PdfReader
import tempfile
import os

def extract_text_from_pdf(pdf_path_or_data):
    """
    Extract text from a PDF file or binary data
    
    Args:
        pdf_path_or_data: Either a file path (str) or binary data (bytes)
        
    Returns:
        dict: Contains extracted text, page count, and metadata
    """
    try:
        # Handle both file path and binary data
        if isinstance(pdf_path_or_data, (str, Path)):
            # File path provided
            if not os.path.exists(pdf_path_or_data):
                return {"error": f"PDF file not found: {pdf_path_or_data}"}
            reader = PdfReader(pdf_path_or_data)
        else:
            # Binary data provided - save to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                temp_file.write(pdf_path_or_data)
                temp_file.flush()
                reader = PdfReader(temp_file.name)
                # Clean up temp file
                os.unlink(temp_file.name)
        
        # Extract text from all pages
        full_text = ""
        for page_num, page in enumerate(reader.pages, 1):
            try:
                page_text = page.extract_text()
                full_text += f"\n--- Page {page_num} ---\n{page_text}\n"
            except Exception as page_error:
                print(f"Warning: Could not extract text from page {page_num}: {page_error}", file=sys.stderr)
                continue
        
        # Get metadata
        metadata = {}
        if reader.metadata:
            metadata = {
                'title': reader.metadata.get('/Title', ''),
                'author': reader.metadata.get('/Author', ''),
                'subject': reader.metadata.get('/Subject', ''),
                'creator': reader.metadata.get('/Creator', ''),
                'producer': reader.metadata.get('/Producer', ''),
                'creation_date': str(reader.metadata.get('/CreationDate', '')),
                'modification_date': str(reader.metadata.get('/ModDate', ''))
            }
        
        return {
            "success": True,
            "text": full_text.strip(),
            "pages": len(reader.pages),
            "text_length": len(full_text.strip()),
            "metadata": metadata
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"PDF extraction failed: {str(e)}"
        }

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Usage: python pdf_extractor.py <pdf_file_path>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    result = extract_text_from_pdf(pdf_path)
    
    # Output JSON result
    print(json.dumps(result, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if result.get("success", False) else 1)

if __name__ == "__main__":
    main()
