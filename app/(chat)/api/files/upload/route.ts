import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import { PDFDocument } from 'pdf-lib';

// Schema mejorado con mensajes en español
const FileSchema = z.object({
  file: z
    .instanceof(File, { message: 'Debe ser un archivo válido' })
    .refine(file => file.size <= 10 * 1024 * 1024, {
      message: 'El tamaño máximo permitido es 10MB'
    })
    .refine(file => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), {
      message: 'Solo se aceptan JPG, PNG o PDF'
    })
});

export async function POST(request: Request) {
  try {
    // Autenticación
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 401 });
    }

    // Parsear FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validar archivo
    const validation = FileSchema.safeParse({ file });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(e => e.message).join('. ') },
        { status: 400 }
      );
    }

    // Procesar archivo PDF
    let pdfInfo = null;
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfInfo = {
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || 'Sin título',
      };
    }

    // Subir a Vercel Blob
    const { url, downloadUrl } = await put(file.name, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true // Evitar colisiones
    });

    return NextResponse.json({
      success: true,
      url,
      downloadUrl,
      fileType: file.type,
      fileName: file.name,
      fileSize: file.size,
      pdfInfo
    });

  } catch (error) {
    console.error('🚨 Error en /api/upload:', error);
    return NextResponse.json(
      { error: (error instanceof Error) ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}