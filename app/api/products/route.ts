/**
 * API Route: Products
 * GET /api/products - List products
 * POST /api/products - Create product
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const isActive = searchParams.get("isActive");

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { sku, name, description, category, pricePerSqm, installationPerSqm, specifications } = body;

    // Validate required fields
    if (!sku || !name || !category || !pricePerSqm || !installationPerSqm) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        category: category.toUpperCase(),
        pricePerSqm,
        installationPerSqm,
        specifications: specifications || {},
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
