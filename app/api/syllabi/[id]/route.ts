import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const syllabus = await prisma.syllabus.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [
            { dueDate: 'asc' },
            { createdAt: 'asc' }
          ]
        },
      },
    });

    if (!syllabus) {
      return NextResponse.json(
        { error: 'Syllabus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(syllabus);

  } catch (error) {
    console.error('Get syllabus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the update data
    const allowedFields = ['title', 'courseName', 'semester', 'year', 'instructor'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const syllabus = await prisma.syllabus.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        items: {
          orderBy: [
            { dueDate: 'asc' },
            { createdAt: 'asc' }
          ]
        },
      },
    });

    return NextResponse.json(syllabus);

  } catch (error) {
    console.error('Update syllabus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
