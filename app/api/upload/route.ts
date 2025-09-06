import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fileUploadSchema } from '@/lib/utils/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    try {
      fileUploadSchema.parse({ file });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues[0].message },
          { status: 400 }
        );
      }
      throw error;
    }

    // For now, we'll create a mock user. In production, you'd get this from authentication
    const userId = 'mock-user-id';
    
    // Ensure user exists (in production, this would be handled by auth)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });

    // Create syllabus record
    const syllabus = await prisma.syllabus.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        courseName: 'Unknown Course', // Will be updated after parsing
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        status: 'UPLOADED',
        userId,
      },
    });

    // Parse the uploaded file content
    setTimeout(async () => {
      try {
        // Extract text from file based on type (PDF, DOCX, or TXT)
        const { extractTextFromFile } = await import('@/server/parsers/file-parser');
        const fileContent = await extractTextFromFile(file);
        
        // Parse the extracted text
        const { parseSyllabusText } = await import('@/server/parsers/text-parser');
        const parseResult = parseSyllabusText(fileContent);

        // Update syllabus with parsed course info
        await prisma.syllabus.update({
          where: { id: syllabus.id },
          data: {
            status: 'PARSED',
            parsedAt: new Date(),
            courseName: parseResult.courseName || 'Unknown Course',
            semester: parseResult.semester || null,
            year: parseResult.year || null,
            instructor: parseResult.instructor || null,
          },
        });

        // Create syllabus items from parsed content
        if (parseResult.items.length > 0) {
          await prisma.syllabusItem.createMany({
            data: parseResult.items.map(item => ({
              title: item.title,
              type: item.type,
              dueDate: item.dueDate || null,
              weight: item.weight || null,
              description: item.description || null,
              confidence: item.confidence,
              sourceLine: item.sourceLine,
              syllabusId: syllabus.id,
            })),
          });
        }
      } catch (error) {
        console.error('Error parsing syllabus:', error);
        await prisma.syllabus.update({
          where: { id: syllabus.id },
          data: { status: 'ERROR' },
        });
      }
    }, 2000); // Simulate processing time

    return NextResponse.json({
      syllabusId: syllabus.id,
      status: 'uploaded',
      message: 'File uploaded successfully and parsing started',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
