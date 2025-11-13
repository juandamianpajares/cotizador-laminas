/**
 * Seed script to populate database with initial products
 * Run: npm run db:seed
 */

import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing products...");
  await prisma.product.deleteMany({});

  // Seed products
  console.log("📦 Creating products...");

  const products = [
    // LAMINATE SECURITY
    {
      sku: "SEC-CLEAR-4",
      name: "Laminado Seguridad Clear 4mil",
      description: "Film de seguridad transparente 4mil - Protección anti-impacto básica",
      category: ProductCategory.LAMINATE_SECURITY,
      pricePerSqm: 22.0,
      installationPerSqm: 12.0,
      specifications: {
        thickness: "4mil",
        uv_protection: "99%",
        clarity: "high",
      },
    },
    {
      sku: "SEC-CLEAR-8",
      name: "Laminado Seguridad Clear 8mil",
      description: "Film de seguridad transparente 8mil - Protección media",
      category: ProductCategory.LAMINATE_SECURITY,
      pricePerSqm: 32.0,
      installationPerSqm: 15.0,
      specifications: {
        thickness: "8mil",
        uv_protection: "99%",
        clarity: "high",
      },
    },
    {
      sku: "SEC-CLEAR-12",
      name: "Laminado Seguridad Clear 12mil",
      description: "Film de seguridad transparente 12mil - Máxima protección",
      category: ProductCategory.LAMINATE_SECURITY,
      pricePerSqm: 45.0,
      installationPerSqm: 18.0,
      specifications: {
        thickness: "12mil",
        uv_protection: "99%",
        clarity: "high",
      },
    },

    // SOLAR CONTROL
    {
      sku: "SOL-CER-70",
      name: "Control Solar Cerámico 70%",
      description: "Film cerámico con 70% de visibilidad - Alto rechazo de calor",
      category: ProductCategory.SOLAR_CONTROL,
      pricePerSqm: 38.0,
      installationPerSqm: 16.0,
      specifications: {
        vlt: "70%",
        heat_rejection: "65%",
        uv_protection: "99%",
        type: "ceramic",
      },
    },
    {
      sku: "SOL-CER-50",
      name: "Control Solar Cerámico 50%",
      description: "Film cerámico con 50% de visibilidad - Rechazo medio",
      category: ProductCategory.SOLAR_CONTROL,
      pricePerSqm: 42.0,
      installationPerSqm: 16.0,
      specifications: {
        vlt: "50%",
        heat_rejection: "75%",
        uv_protection: "99%",
        type: "ceramic",
      },
    },
    {
      sku: "SOL-CHAR-5",
      name: "Control Solar Charcoal 5%",
      description: "Film oscuro con 5% de visibilidad - Máximo rechazo",
      category: ProductCategory.SOLAR_CONTROL,
      pricePerSqm: 35.0,
      installationPerSqm: 15.0,
      specifications: {
        vlt: "5%",
        heat_rejection: "85%",
        uv_protection: "99%",
        type: "dyed",
      },
    },
    {
      sku: "SOL-BRONZE-20",
      name: "Control Solar Bronze 20%",
      description: "Film color bronce con 20% de visibilidad",
      category: ProductCategory.SOLAR_CONTROL,
      pricePerSqm: 30.0,
      installationPerSqm: 14.0,
      specifications: {
        vlt: "20%",
        heat_rejection: "70%",
        uv_protection: "99%",
        type: "dyed",
      },
    },

    // VINYL DECORATIVE
    {
      sku: "DEC-FROST",
      name: "Vinílico Esmerilado",
      description: "Film decorativo efecto esmerilado - Privacidad y elegancia",
      category: ProductCategory.VINYL_DECORATIVE,
      pricePerSqm: 25.0,
      installationPerSqm: 13.0,
      specifications: {
        effect: "frosted",
        opacity: "translucent",
        privacy: "high",
      },
    },
    {
      sku: "DEC-WHITE",
      name: "Vinílico Blanco",
      description: "Film vinílico blanco - Privacidad total",
      category: ProductCategory.VINYL_DECORATIVE,
      pricePerSqm: 22.0,
      installationPerSqm: 12.0,
      specifications: {
        effect: "solid_color",
        color: "white",
        opacity: "opaque",
        privacy: "total",
      },
    },
    {
      sku: "DEC-STRIPE",
      name: "Vinílico Franjas",
      description: "Film con franjas horizontales/verticales personalizables",
      category: ProductCategory.VINYL_DECORATIVE,
      pricePerSqm: 28.0,
      installationPerSqm: 15.0,
      specifications: {
        effect: "stripes",
        customizable: true,
        privacy: "medium",
      },
    },

    // PRIVACY
    {
      sku: "PRIV-MIRROR",
      name: "Privacidad Espejado One-Way",
      description: "Film espejado de privacidad unidireccional",
      category: ProductCategory.PRIVACY,
      pricePerSqm: 33.0,
      installationPerSqm: 15.0,
      specifications: {
        effect: "mirror",
        one_way: true,
        daytime_privacy: "excellent",
      },
    },
    {
      sku: "PRIV-BLACKOUT",
      name: "Privacidad Blackout",
      description: "Film opaco total - Bloqueo completo de luz",
      category: ProductCategory.PRIVACY,
      pricePerSqm: 28.0,
      installationPerSqm: 14.0,
      specifications: {
        effect: "blackout",
        light_blockage: "100%",
        privacy: "total",
      },
    },
    {
      sku: "PRIV-GRADIENT",
      name: "Privacidad Degradado",
      description: "Film con efecto degradado - Privacidad gradual",
      category: ProductCategory.PRIVACY,
      pricePerSqm: 30.0,
      installationPerSqm: 14.0,
      specifications: {
        effect: "gradient",
        privacy: "variable",
      },
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`  ✅ Created: ${product.name}`);
  }

  console.log("\n✨ Seeding completed!");
  console.log(`📊 Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
