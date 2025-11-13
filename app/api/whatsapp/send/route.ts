import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, quotation } = body;

    if (!phone || !quotation) {
      return NextResponse.json(
        { error: 'Teléfono y cotización son obligatorios' },
        { status: 400 }
      );
    }

    // Format WhatsApp message
    const message = formatQuotationMessage(quotation);

    // For now, we'll return a WhatsApp Web URL
    // In production, this would use Twilio/MessageBird API
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      success: true,
      whatsappUrl,
      message: 'URL de WhatsApp generada',
    });
  } catch (error) {
    console.error('Error generating WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Error al generar mensaje de WhatsApp' },
      { status: 500 }
    );
  }
}

function formatQuotationMessage(quotation: any): string {
  const {
    customer,
    vehicleInfo,
    items,
    subtotalBeforeDiscount,
    discountPercentage,
    subtotalAfterDiscount,
    total,
    customerType,
  } = quotation;

  let message = `*COTIZACIÓN DE LÁMINAS PARA VEHÍCULO*\n\n`;

  // Customer info
  message += `👤 *Cliente:* ${customer.name}\n`;
  if (customerType) {
    message += `🏷️ *Tipo:* ${getCustomerTypeLabel(customerType)}\n`;
  }
  message += `\n`;

  // Vehicle info
  if (vehicleInfo) {
    message += `🚗 *Vehículo:* ${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.año}\n`;
    message += `📋 *Tipo:* ${getVehicleTypeLabel(vehicleInfo.tipo)}\n`;
    if (vehicleInfo.tieneFilmViejo) {
      message += `⚠️ *Film viejo:* Sí (requiere remoción)\n`;
    }
    message += `\n`;
  }

  // Items
  message += `*VIDRIOS Y PRODUCTOS:*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;

  items.forEach((item: any, index: number) => {
    message += `\n${index + 1}. *${item.openingName}*\n`;
    message += `   • Producto: ${item.product.name}\n`;
    message += `   • Área: ${item.finalArea} m²\n`;
    message += `   • Precio: $${item.itemSubtotal}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;

  // Totals
  message += `\n*RESUMEN:*\n`;
  message += `Subtotal: $${subtotalBeforeDiscount}\n`;

  if (discountPercentage > 0) {
    message += `Descuento (${discountPercentage}%): -$${(
      subtotalBeforeDiscount - subtotalAfterDiscount
    ).toFixed(2)}\n`;
    message += `Subtotal con descuento: $${subtotalAfterDiscount}\n`;
  }

  message += `\n*TOTAL: $${total}*\n`;

  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `\n✨ Incluye instalación profesional\n`;
  message += `⏱️ Tiempo estimado: 2-4 horas\n`;
  message += `📅 Agenda tu cita respondiendo este mensaje\n`;

  return message;
}

function getCustomerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    nuevo: 'Cliente Nuevo',
    leal: 'Cliente Leal (10% desc.)',
    mayorista: 'Mayorista (15% desc.)',
    corporativo: 'Corporativo (20% desc.)',
  };
  return labels[type] || type;
}

function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    sedan: 'Sedán',
    suv: 'SUV',
    coupe: 'Coupé',
    pickup: 'Pickup',
  };
  return labels[type] || type;
}
