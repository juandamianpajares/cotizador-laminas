import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obtener todas las solicitudes (para el encargado)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status: status as any } : {};

    const requests = await prisma.quotationRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        quotation: {
          include: {
            customer: true,
          },
        },
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching quotation requests:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}

// POST: Crear nueva solicitud desde el cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, vehiclePhotos, serviceType, notes } = body;

    // Validación básica
    if (!phone) {
      return NextResponse.json(
        { error: 'El número de teléfono es obligatorio' },
        { status: 400 }
      );
    }

    if (!vehiclePhotos || vehiclePhotos.length === 0) {
      return NextResponse.json(
        { error: 'Debes subir al menos una foto del vehículo' },
        { status: 400 }
      );
    }

    // Crear solicitud
    const quotationRequest = await prisma.quotationRequest.create({
      data: {
        phone,
        vehiclePhotos,
        serviceType: serviceType || null,
        notes: notes || null,
        status: 'PENDING',
        source: 'client_form',
      },
    });

    // TODO: Enviar notificación al encargado (Email, WhatsApp, etc.)

    return NextResponse.json({
      success: true,
      requestId: quotationRequest.id,
      message: '¡Solicitud recibida! Te contactaremos pronto por WhatsApp.',
    });
  } catch (error) {
    console.error('Error creating quotation request:', error);
    return NextResponse.json(
      { error: 'Error al crear la solicitud' },
      { status: 500 }
    );
  }
}
