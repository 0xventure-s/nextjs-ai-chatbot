import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';

const FileSchema = z.object({
  file: z
    .instanceof(File) // Usar File en lugar de Blob
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), {
      message: 'File type should be JPEG, PNG, or PDF',
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      return NextResponse.json(
        { error: validatedFile.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const blob = await put(file.name, buffer, {
      access: 'public',
      contentType: file.type // Añadir tipo MIME correcto
    });

    return NextResponse.json(blob);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}