/**
 * Quotation Calculation Engine
 * Motor de cálculo de cotizaciones - Migrado desde Python
 */

import { Decimal } from "decimal.js";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type OpeningType =
  | "window"
  | "door"
  | "sliding_door"
  | "shower_enclosure"
  | "partition"
  | "skylight"
  | "curtain_wall"
  | "strip_horizontal"
  | "strip_vertical"
  | "automotive_curved"
  | "automotive_flat";

export type ProductType =
  | "laminate_security"
  | "solar_control"
  | "vinyl_decorative"
  | "privacy";

export interface OpeningData {
  opening_id: string;
  opening_type: OpeningType;
  width: number;
  height: number;
  quantity: number;
  specifications: {
    glassType?: string;
    curved?: boolean;
    difficultAccess?: boolean;
    floor?: number;
    irregularShape?: boolean;
    extremeWeather?: boolean;
    nightInstall?: boolean;
    requiresScaffolding?: boolean;
    automotive?: boolean;
  };
  room_name: string;
  floor: number;
}

export interface ProductData {
  product_id: string;
  product_type: ProductType;
  sku: string;
  name: string;
  price_per_sqm: number;
  installation_per_sqm: number;
  specifications?: Record<string, any>;
}

export interface CalculationItem {
  opening_id: string;
  product_id: string;
  opening_name: string;
  product_name: string;

  // Dimensions
  base_width: number;
  base_height: number;
  base_area: number;
  waste_percentage: number;
  waste_area: number;
  final_area: number;
  quantity: number;

  // Costs
  material_cost_per_sqm: number;
  installation_cost_per_sqm: number;
  complexity_factor: number;

  material_subtotal: number;
  installation_subtotal: number;
  item_subtotal: number;

  // Metadata
  unit: string;
  specifications: Record<string, any>;
}

export interface QuotationCalculationResult {
  items: CalculationItem[];

  // Totals
  total_base_area: number;
  total_waste_area: number;
  total_final_area: number;

  // Amounts
  material_subtotal: number;
  installation_subtotal: number;
  subtotal_before_discount: number;

  volume_discount_percentage: number;
  volume_discount_amount: number;

  subtotal_after_discount: number;

  tax_rate: number;
  tax_amount: number;

  total: number;

  // Details
  calculation_details: {
    items_count: number;
    average_waste_percentage: number;
    volume_discount_threshold_reached: boolean;
    tax_rate: number;
    has_complex_installation: boolean;
    total_rooms: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Waste matrix by opening type and product type
const WASTE_MATRIX: Record<
  OpeningType,
  Partial<Record<ProductType, number>>
> = {
  window: {
    laminate_security: 0.15,
    solar_control: 0.15,
    vinyl_decorative: 0.12,
    privacy: 0.12,
  },
  door: {
    laminate_security: 0.18,
    solar_control: 0.18,
    vinyl_decorative: 0.15,
    privacy: 0.15,
  },
  sliding_door: {
    laminate_security: 0.2,
    solar_control: 0.2,
    vinyl_decorative: 0.18,
    privacy: 0.18,
  },
  shower_enclosure: {
    laminate_security: 0.22,
    solar_control: 0.22,
    vinyl_decorative: 0.2,
    privacy: 0.18,
  },
  partition: {
    laminate_security: 0.2,
    solar_control: 0.2,
    vinyl_decorative: 0.15,
    privacy: 0.15,
  },
  skylight: {
    laminate_security: 0.25,
    solar_control: 0.25,
    vinyl_decorative: 0.22,
    privacy: 0.22,
  },
  curtain_wall: {
    laminate_security: 0.2,
    solar_control: 0.2,
    vinyl_decorative: 0.18,
    privacy: 0.18,
  },
  strip_horizontal: {
    vinyl_decorative: 0.08,
    privacy: 0.08,
  },
  strip_vertical: {
    vinyl_decorative: 0.08,
    privacy: 0.08,
  },
  automotive_curved: {
    laminate_security: 0.3,
    solar_control: 0.3,
    vinyl_decorative: 0.28,
  },
  automotive_flat: {
    laminate_security: 0.2,
    solar_control: 0.2,
    vinyl_decorative: 0.18,
  },
};

const DEFAULT_TAX_RATE = 0.21; // 21% VAT

// Volume discounts (m² thresholds)
const VOLUME_DISCOUNTS: [number, number][] = [
  [500, 0.2], // 500+ m² = 20% discount
  [200, 0.15], // 200+ m² = 15% discount
  [100, 0.1], // 100+ m² = 10% discount
  [50, 0.05], // 50+ m² = 5% discount
];

// ============================================================================
// CALCULATOR CLASS
// ============================================================================

export class QuotationCalculator {
  private taxRate: number;

  constructor(taxRate?: number) {
    this.taxRate = taxRate ?? DEFAULT_TAX_RATE;
  }

  /**
   * Calculate waste percentage based on opening type and product type
   */
  calculateWastePercentage(
    openingType: OpeningType,
    productType: ProductType,
    specifications: OpeningData["specifications"] = {}
  ): number {
    let adjustedOpeningType = openingType;

    // Adjust type for automotive
    if (specifications.curved) {
      adjustedOpeningType = "automotive_curved";
    } else if (specifications.automotive) {
      adjustedOpeningType = "automotive_flat";
    }

    // Get base waste percentage
    let wastePct =
      WASTE_MATRIX[adjustedOpeningType]?.[productType] ?? 0.15;

    // Additional adjustments
    if (specifications.difficultAccess) {
      wastePct += 0.05;
    }

    if (specifications.irregularShape) {
      wastePct += 0.08;
    }

    // Cap at 35%
    return Math.min(wastePct, 0.35);
  }

  /**
   * Calculate complexity factor for installation
   */
  calculateComplexityFactor(
    specifications: OpeningData["specifications"]
  ): number {
    let factor = 1.0;

    // Height (by floor)
    const floor = specifications.floor ?? 1;
    if (floor > 6) {
      factor *= 1.4;
    } else if (floor > 3) {
      factor *= 1.2;
    }

    // Difficult access
    if (specifications.difficultAccess) {
      factor *= 1.3;
    }

    // Curved glass
    if (specifications.curved) {
      factor *= 1.5;
    }

    // Extreme weather
    if (specifications.extremeWeather) {
      factor *= 1.15;
    }

    // Night installation
    if (specifications.nightInstall) {
      factor *= 1.25;
    }

    // Requires scaffolding
    if (specifications.requiresScaffolding) {
      factor *= 1.4;
    }

    return factor;
  }

  /**
   * Calculate volume discount
   */
  calculateVolumeDiscount(
    totalArea: number
  ): { percentage: number; amount: number } {
    for (const [threshold, discountPct] of VOLUME_DISCOUNTS) {
      if (totalArea >= threshold) {
        return { percentage: discountPct, amount: discountPct };
      }
    }

    return { percentage: 0, amount: 0 };
  }

  /**
   * Calculate opening area
   */
  calculateOpeningArea(opening: OpeningData): {
    baseArea: number;
    wasteArea: number;
    finalArea: number;
  } {
    let baseArea = opening.width * opening.height * opening.quantity;

    // Special calculation for strips
    if (opening.opening_type.includes("strip")) {
      const filmWidth = 1.52; // Standard film width in meters
      const linearMeters =
        opening.opening_type === "strip_horizontal"
          ? opening.width * opening.quantity
          : opening.height * opening.quantity;

      baseArea = linearMeters * filmWidth;
    }

    const dec = new Decimal(baseArea);
    baseArea = dec.toDecimalPlaces(2).toNumber();

    return {
      baseArea,
      wasteArea: 0,
      finalArea: baseArea,
    };
  }

  /**
   * Calculate a single quotation item
   */
  calculateItem(
    opening: OpeningData,
    product: ProductData
  ): CalculationItem {
    const dec = Decimal.clone({ precision: 10 });

    // Calculate areas
    const { baseArea } = this.calculateOpeningArea(opening);

    // Calculate waste
    const wastePct = this.calculateWastePercentage(
      opening.opening_type,
      product.product_type,
      opening.specifications
    );

    const wasteArea = baseArea * wastePct;
    const finalArea = baseArea + wasteArea;

    // Calculate complexity
    const complexityFactor = this.calculateComplexityFactor(
      opening.specifications
    );

    // Material costs
    const materialCostPerSqm = product.price_per_sqm;
    const materialSubtotal = finalArea * materialCostPerSqm;

    // Installation costs (with complexity factor)
    const installationCostPerSqm =
      product.installation_per_sqm * complexityFactor;
    const installationSubtotal = finalArea * installationCostPerSqm;

    // Item subtotal
    const itemSubtotal = materialSubtotal + installationSubtotal;

    return {
      opening_id: opening.opening_id,
      product_id: product.product_id,
      opening_name: `${opening.room_name} - ${opening.opening_type}`,
      product_name: product.name,

      base_width: opening.width,
      base_height: opening.height,
      base_area: Number(new dec(baseArea).toFixed(2)),
      waste_percentage: wastePct,
      waste_area: Number(new dec(wasteArea).toFixed(2)),
      final_area: Number(new dec(finalArea).toFixed(2)),
      quantity: opening.quantity,

      material_cost_per_sqm: materialCostPerSqm,
      installation_cost_per_sqm: installationCostPerSqm,
      complexity_factor: complexityFactor,

      material_subtotal: Number(new dec(materialSubtotal).toFixed(2)),
      installation_subtotal: Number(new dec(installationSubtotal).toFixed(2)),
      item_subtotal: Number(new dec(itemSubtotal).toFixed(2)),

      unit: "m²",
      specifications: opening.specifications,
    };
  }

  /**
   * Calculate complete quotation
   */
  calculateQuotation(
    openings: OpeningData[],
    products: ProductData[],
    customTaxRate?: number
  ): QuotationCalculationResult {
    if (openings.length !== products.length) {
      throw new Error("Must have one product per opening");
    }

    const dec = Decimal.clone({ precision: 10 });
    const taxRate = customTaxRate ?? this.taxRate;

    // Calculate items
    const items = openings.map((opening, i) =>
      this.calculateItem(opening, products[i])
    );

    // Area totals
    const totalBaseArea = items.reduce((sum, item) => sum + item.base_area, 0);
    const totalWasteArea = items.reduce((sum, item) => sum + item.waste_area, 0);
    const totalFinalArea = items.reduce((sum, item) => sum + item.final_area, 0);

    // Amount totals
    const materialSubtotal = items.reduce(
      (sum, item) => sum + item.material_subtotal,
      0
    );
    const installationSubtotal = items.reduce(
      (sum, item) => sum + item.installation_subtotal,
      0
    );
    const subtotalBeforeDiscount = materialSubtotal + installationSubtotal;

    // Volume discount
    const { percentage: volumeDiscountPct } =
      this.calculateVolumeDiscount(totalFinalArea);
    const volumeDiscountAmount = subtotalBeforeDiscount * volumeDiscountPct;

    // Subtotal after discount
    const subtotalAfterDiscount = subtotalBeforeDiscount - volumeDiscountAmount;

    // Tax
    const taxAmount = subtotalAfterDiscount * taxRate;

    // Total
    const total = subtotalAfterDiscount + taxAmount;

    // Details
    const uniqueRooms = new Set(
      items.map((item) => item.opening_name.split(" - ")[0])
    );

    return {
      items,

      total_base_area: Number(new dec(totalBaseArea).toFixed(2)),
      total_waste_area: Number(new dec(totalWasteArea).toFixed(2)),
      total_final_area: Number(new dec(totalFinalArea).toFixed(2)),

      material_subtotal: Number(new dec(materialSubtotal).toFixed(2)),
      installation_subtotal: Number(new dec(installationSubtotal).toFixed(2)),
      subtotal_before_discount: Number(
        new dec(subtotalBeforeDiscount).toFixed(2)
      ),

      volume_discount_percentage: volumeDiscountPct,
      volume_discount_amount: Number(new dec(volumeDiscountAmount).toFixed(2)),

      subtotal_after_discount: Number(
        new dec(subtotalAfterDiscount).toFixed(2)
      ),

      tax_rate: taxRate,
      tax_amount: Number(new dec(taxAmount).toFixed(2)),

      total: Number(new dec(total).toFixed(2)),

      calculation_details: {
        items_count: items.length,
        average_waste_percentage:
          totalBaseArea > 0 ? totalWasteArea / totalBaseArea : 0,
        volume_discount_threshold_reached: totalFinalArea >= 50,
        tax_rate: taxRate,
        has_complex_installation: items.some(
          (item) => item.complexity_factor > 1.0
        ),
        total_rooms: uniqueRooms.size,
      },
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const symbols: Record<string, string> = {
    USD: "$",
    ARS: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = symbols[currency] ?? "$";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate quotation summary for display
 */
export function generateQuotationSummary(
  result: QuotationCalculationResult
): any {
  return {
    items_count: result.items.length,
    total_area: {
      value: result.total_final_area,
      formatted: `${result.total_final_area.toFixed(2)} m²`,
    },
    pricing: {
      material: {
        value: result.material_subtotal,
        formatted: formatCurrency(result.material_subtotal),
      },
      installation: {
        value: result.installation_subtotal,
        formatted: formatCurrency(result.installation_subtotal),
      },
      subtotal: {
        value: result.subtotal_before_discount,
        formatted: formatCurrency(result.subtotal_before_discount),
      },
      discount: {
        percentage: result.volume_discount_percentage * 100,
        value: result.volume_discount_amount,
        formatted: formatCurrency(result.volume_discount_amount),
      },
      tax: {
        rate: result.tax_rate * 100,
        value: result.tax_amount,
        formatted: formatCurrency(result.tax_amount),
      },
      total: {
        value: result.total,
        formatted: formatCurrency(result.total),
      },
    },
    details: result.calculation_details,
  };
}
