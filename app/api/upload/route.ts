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
          { error: error.errors[0].message },
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

    // In production, you would:
    // 1. Upload file to blob storage (Vercel Blob, S3, etc.)
    // 2. Start background parsing job
    // 3. Return job ID for status polling
    
    // For now, we'll simulate parsing by creating some mock data
    setTimeout(async () => {
      try {
        await prisma.syllabus.update({
          where: { id: syllabus.id },
          data: {
            status: 'PARSED',
            parsedAt: new Date(),
            courseName: 'Computer Science 101',
            semester: 'Fall',
            year: 2024,
            instructor: 'Dr. Smith',
          },
        });

        // Create some mock syllabus items
        await prisma.syllabusItem.createMany({
          data: [
            {
              title: 'Assignment 1: Introduction to Programming',
              type: 'ASSIGNMENT',
              dueDate: new Date('2024-09-15T23:59:00Z'),
              weight: 10,
              description: 'Basic programming exercises using Python',
              confidence: 0.9,
              sourceLine: 'Assignment 1 due September 15th at 11:59 PM',
              syllabusId: syllabus.id,
            },
            {
              title: 'Midterm Exam',
              type: 'EXAM',
              dueDate: new Date('2024-10-15T14:00:00Z'),
              weight: 30,
              description: 'Covers chapters 1-5',
              confidence: 0.95,
              sourceLine: 'Midterm exam on October 15th at 2:00 PM',
              syllabusId: syllabus.id,
            },
            {
              title: 'Final Project Proposal',
              type: 'PROJECT',
              dueDate: new Date('2024-11-01T23:59:00Z'),
              weight: 15,
              description: 'Submit your final project proposal',
              confidence: 0.8,
              sourceLine: 'Project proposal due November 1st',
              syllabusId: syllabus.id,
            },
            {
              title: 'Reading: Chapter 3-4',
              type: 'READING',
              dueDate: new Date('2024-09-20T09:00:00Z'),
              confidence: 0.7,
              sourceLine: 'Read chapters 3-4 by September 20th class',
              syllabusId: syllabus.id,
            },
          ],
        });
      } catch (error) {
        console.error('Error creating mock data:', error);
        await prisma.syllabus.update({
          where: { id: syllabus.id },
          data: { status: 'ERROR' },
        });
      }
    }, 2000); // Simulate 2 second parsing time

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
