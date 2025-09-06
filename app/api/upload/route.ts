import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fileUploadSchema } from '@/lib/utils/validation';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { getLimiter } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limiter = getLimiter();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rate = await limiter.limit(`upload:${ip}`);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      );
    }

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

    // Auth: get user session and resolve to a real user via email
    const session = await getServerSession();
    const email = session?.user?.email || null;
    // Allow anonymous uploads; associate with a placeholder user if not signed in
    let userId: string;
    if (email) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: session?.user?.name || null,
        },
      });
      userId = user.id;
    } else {
      // Create or reuse a single anonymous user record
      const anon = await prisma.user.upsert({
        where: { email: 'anonymous@example.com' },
        update: {},
        create: { email: 'anonymous@example.com', name: 'Anonymous' },
      });
      userId = anon.id;
    }

    // Create syllabus record
    const syllabus = await prisma.syllabus.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        courseName: 'Unknown Course', // Will be updated after parsing
        fileName: file.name,
        fileSize: file.size,
        fileMimeType: file.type,
        status: 'PARSING',
        userId,
      },
    });

    // After syllabus creation
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'UPLOAD',
        entity: 'Syllabus',
        entityId: syllabus.id,
        changes: { fileName: file.name },
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
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
