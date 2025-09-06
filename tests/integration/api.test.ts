import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import { GET, PUT } from '@/app/api/syllabi/[id]/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
    },
    syllabus: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    syllabusItem: {
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle file upload successfully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Mock Prisma responses
    (prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'mock-user-id' });
    (prisma.syllabus.create as jest.Mock).mockResolvedValue({
      id: 'mock-syllabus-id',
      title: 'test',
      fileName: 'test.pdf',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('syllabusId');
    expect(data.status).toBe('uploaded');
  });

  it('should reject files that are too large', async () => {
    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)], // 11MB
      'large.pdf',
      { type: 'application/pdf' }
    );
    const formData = new FormData();
    formData.append('file', largeFile);

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('10MB');
  });

  it('should reject unsupported file types', async () => {
    const unsupportedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', unsupportedFile);

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('PDF, DOCX, or TXT');
  });
});

describe('/api/syllabi/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch syllabus with items', async () => {
    const mockSyllabus = {
      id: 'test-id',
      title: 'Test Syllabus',
      items: [
        {
          id: 'item-1',
          title: 'Assignment 1',
          type: 'ASSIGNMENT',
          dueDate: new Date('2024-03-15'),
        },
      ],
    };

    (prisma.syllabus.findUnique as jest.Mock).mockResolvedValue(mockSyllabus);

    const request = new NextRequest('http://localhost/api/syllabi/test-id');
    const response = await GET(request, { params: Promise.resolve({ id: 'test-id' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('test-id');
    expect(data.items).toHaveLength(1);
  });

  it('should return 404 for non-existent syllabus', async () => {
    (prisma.syllabus.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/syllabi/non-existent');
    const response = await GET(request, { params: Promise.resolve({ id: 'non-existent' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Syllabus not found');
  });

  it('should update syllabus successfully', async () => {
    const updateData = {
      title: 'Updated Title',
      courseName: 'Updated Course',
    };

    const updatedSyllabus = {
      id: 'test-id',
      ...updateData,
      items: [],
    };

    (prisma.syllabus.update as jest.Mock).mockResolvedValue(updatedSyllabus);

    const request = new NextRequest('http://localhost/api/syllabi/test-id', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    const response = await PUT(request, { params: Promise.resolve({ id: 'test-id' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.title).toBe('Updated Title');
    expect(data.courseName).toBe('Updated Course');
  });
});
