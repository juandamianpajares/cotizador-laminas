/**
 * API Route: Quotations
 * GET /api/quotations - List quotations
 * POST /api/quotations - Create quotation
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { QuotationCalculator, OpeningData, ProductData } from "@/lib/calculator";

// GET - List quotations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const quotations = await prisma.quotation.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(status && { status: status as any }),
      },
      include: {
        customer: true,
        property: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

// POST - Create quotation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vertical, customer, property, rooms } = body;

    // Create or find customer
    let customerRecord = await prisma.customer.findUnique({
      where: { email: customer.email },
    });

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          whatsapp: customer.whatsapp,
        },
      });
    }

    // Create property if provided
    let propertyRecord = null;
    if (property && (vertical === "RESIDENTIAL" || vertical === "COMMERCIAL")) {
      propertyRecord = await prisma.property.create({
        data: {
          type: property.type.toUpperCase(),
          address: property.address,
          city: property.city,
          floors: property.floors,
          rooms: {
            create: rooms.map((room: any) => ({
              name: room.name,
              type: room.type.toUpperCase(),
              floor: room.floor,
              openings: {
                create: (room.openings || []).map((opening: any) => ({
                  type: opening.type.toUpperCase(),
                  name: opening.name,
                  width: opening.width,
                  height: opening.height,
                  quantity: opening.quantity,
                  specifications: opening.specifications || {},
                })),
              },
            })),
          },
        },
      });
    }

    // Process openings for calculation
    const openings: OpeningData[] = [];
    const productIds: string[] = [];

    for (const room of rooms) {
      for (const opening of room.openings || []) {
        openings.push({
          opening_id: opening.id || `opening-${Date.now()}-${Math.random()}`,
          opening_type: opening.type,
          width: opening.width,
          height: opening.height,
          quantity: opening.quantity,
          specifications: opening.specifications || {},
          room_name: room.name || "Unnamed Room",
          floor: room.floor || 1,
        });
        productIds.push(opening.productId);
      }
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    const productDataMap = new Map(
      products.map((p) => [
        p.id,
        {
          product_id: p.id,
          product_type: p.category.toLowerCase() as any,
          sku: p.sku,
          name: p.name,
          price_per_sqm: parseFloat(p.pricePerSqm.toString()),
          installation_per_sqm: parseFloat(p.installationPerSqm.toString()),
          specifications: p.specifications as any,
        } as ProductData,
      ])
    );

    const productsList = productIds.map((id) => productDataMap.get(id)!);

    // Calculate quotation
    const calculator = new QuotationCalculator();
    const result = calculator.calculateQuotation(openings, productsList);

    // Save quotation to database
    const quotation = await prisma.quotation.create({
      data: {
        vertical: vertical.toUpperCase(),
        status: "DRAFT",
        customerId: customerRecord.id,
        propertyId: propertyRecord?.id,

        totalBaseArea: result.total_base_area,
        totalWasteArea: result.total_waste_area,
        totalFinalArea: result.total_final_area,

        materialSubtotal: result.material_subtotal,
        installationSubtotal: result.installation_subtotal,
        subtotalBeforeDiscount: result.subtotal_before_discount,

        volumeDiscountPercentage: result.volume_discount_percentage,
        volumeDiscountAmount: result.volume_discount_amount,

        subtotalAfterDiscount: result.subtotal_after_discount,

        taxRate: result.tax_rate,
        taxAmount: result.tax_amount,

        total: result.total,

        calculationDetails: result.calculation_details as any,

        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days

        items: {
          create: result.items.map((item, index) => ({
            productId: productIds[index],
            openingId: item.opening_id,
            openingName: item.opening_name,
            openingType: item.opening_name.split(" - ")[1] || "unknown",

            baseWidth: item.base_width,
            baseHeight: item.base_height,
            baseArea: item.base_area,

            wastePercentage: item.waste_percentage,
            wasteArea: item.waste_area,
            finalArea: item.final_area,

            quantity: item.quantity,

            materialCostPerSqm: item.material_cost_per_sqm,
            installationCostPerSqm: item.installation_cost_per_sqm,
            complexityFactor: item.complexity_factor,

            materialSubtotal: item.material_subtotal,
            installationSubtotal: item.installation_subtotal,
            itemSubtotal: item.item_subtotal,

            specifications: item.specifications as any,
          })),
        },
      },
      include: {
        customer: true,
        property: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      quotation,
    });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      {
        error: "Failed to create quotation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
