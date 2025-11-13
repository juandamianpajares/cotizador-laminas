/**
 * API Route: Calculate Quotation
 * POST /api/quotations/calculate
 */

import { NextRequest, NextResponse } from "next/server";
import { QuotationCalculator, OpeningData, ProductData } from "@/lib/calculator";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { vertical, customer, property, rooms } = body;

    // Validate required fields
    if (!vertical || !customer || !rooms || rooms.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process rooms and openings to create calculation data
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

    // Fetch products from database
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    // Map products to calculation format
    const productDataMap = new Map(
      products.map((p) => [
        p.id,
        {
          product_id: p.id,
          product_type: p.category.toLowerCase().replace(/_/g, "_") as any,
          sku: p.sku,
          name: p.name,
          price_per_sqm: parseFloat(p.pricePerSqm.toString()),
          installation_per_sqm: parseFloat(p.installationPerSqm.toString()),
          specifications: p.specifications as any,
        } as ProductData,
      ])
    );

    const productsList = productIds.map((id) => productDataMap.get(id)!);

    // Validate all products found
    if (productsList.some((p) => !p)) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 404 }
      );
    }

    // Calculate quotation
    const calculator = new QuotationCalculator();
    const result = calculator.calculateQuotation(openings, productsList);

    // Return result
    return NextResponse.json({
      success: true,
      quotation: result,
    });
  } catch (error) {
    console.error("Error calculating quotation:", error);
    return NextResponse.json(
      {
        error: "Failed to calculate quotation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
