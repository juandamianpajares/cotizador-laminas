import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Obtener una solicitud específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quotationRequest = await prisma.quotationRequest.findUnique({
      where: { id },
      include: {
        quotation: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!quotationRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(quotationRequest);
  } catch (error) {
    console.error('Error fetching quotation request:', error);
    return NextResponse.json(
      { error: 'Error al obtener la solicitud' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar estado de la solicitud
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedTo, quotationId } = body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (quotationId) updateData.quotationId = quotationId;

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const quotationRequest = await prisma.quotationRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(quotationRequest);
  } catch (error) {
    console.error('Error updating quotation request:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la solicitud' },
      { status: 500 }
    );
  }
}

// DELETE: Cancelar/eliminar solicitud
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.quotationRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quotation request:', error);
    return NextResponse.json(
      { error: 'Error al cancelar la solicitud' },
      { status: 500 }
    );
  }
}
