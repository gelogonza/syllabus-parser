"""
PDF Parsing Microservice
Handles PDF text extraction using PyMuPDF for reliable parsing
"""

import io
import logging
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PDF Parser Service",
    description="Microservice for extracting text from PDF files using PyMuPDF",
    version="1.0.0"
)

# Configure CORS to allow requests from Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "PDF Parser", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "PDF Parser Service",
        "pymupdf_version": fitz.version[0],
        "supported_formats": ["PDF"]
    }

@app.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Extract text from uploaded PDF file
    
    Args:
        file: Uploaded PDF file
        
    Returns:
        Dict containing extracted text and metadata
    """
    
    # Validate file type
    if not file.content_type or file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF files are supported."
        )
    
    # Check file size (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Open PDF with PyMuPDF
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        
        # Extract metadata
        metadata = pdf_document.metadata
        page_count = pdf_document.page_count
        
        # Extract text from all pages
        full_text = ""
        pages_text = []
        
        for page_num in range(page_count):
            page = pdf_document[page_num]
            page_text = page.get_text()
            pages_text.append({
                "page": page_num + 1,
                "text": page_text.strip(),
                "char_count": len(page_text)
            })
            full_text += page_text + "\n"
        
        # Close the document
        pdf_document.close()
        
        # Clean up the text
        full_text = full_text.strip()
        
        # Calculate some basic statistics
        word_count = len(full_text.split())
        char_count = len(full_text)
        
        logger.info(f"Successfully parsed PDF: {file.filename}, {page_count} pages, {word_count} words")
        
        return {
            "success": True,
            "filename": file.filename,
            "text": full_text,
            "metadata": {
                "page_count": page_count,
                "word_count": word_count,
                "char_count": char_count,
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", ""),
                "producer": metadata.get("producer", ""),
                "creation_date": metadata.get("creationDate", ""),
                "modification_date": metadata.get("modDate", "")
            },
            "pages": pages_text[:5] if len(pages_text) > 5 else pages_text  # Limit to first 5 pages for response size
        }
        
    except fitz.FileDataError as e:
        logger.error(f"PDF parsing error for {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Invalid or corrupted PDF file. The file may be password-protected or damaged."
        )
    except fitz.FileNotFoundError as e:
        logger.error(f"PDF file error for {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Could not read PDF file. The file may be corrupted."
        )
    except Exception as e:
        logger.error(f"Unexpected error parsing {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while processing PDF: {str(e)}"
        )
    finally:
        # Reset file pointer for cleanup
        await file.seek(0)

@app.post("/parse-pdf-simple")
async def parse_pdf_simple(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Simple PDF text extraction endpoint
    Returns just the text content for easier integration
    """
    
    if not file.content_type or file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF files are supported."
        )
    
    try:
        file_content = await file.read()
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        
        full_text = ""
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            full_text += page.get_text() + "\n"
        
        pdf_document.close()
        
        return {
            "text": full_text.strip(),
            "filename": file.filename or "unknown.pdf"
        }
        
    except Exception as e:
        logger.error(f"Error in simple PDF parsing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to extract text from PDF"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
