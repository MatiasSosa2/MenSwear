require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const p = new PrismaClient();

async function main() {
  console.log("🌱 Insertando datos de prueba...\n");

  // Stock de algunos productos
  await p.productStock.createMany({
    data: [
      { slug: "remera-algodon-pima-regular",    stock: 15 },
      { slug: "camisa-lino-premium-blend",       stock: 8  },
      { slug: "pantalon-chino-gabardina-saten",  stock: 12 },
      { slug: "chomba-pique-mercenizado",        stock: 3  },
      { slug: "musculosa-algodon-flame",         stock: 0  },
      { slug: "remera-henley-botones",           stock: 20 },
      { slug: "buzo-algodon-rustico-lightweight",stock: 5  },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Stock cargado");

  // Pedido 1 - Aprobado
  await p.order.create({
    data: {
      externalRef:      "ORDER-TEST-001",
      mercadoPagoId:    "MP-123456789",
      customerName:     "Lucía",
      customerLastName: "Fernández",
      customerDni:      "38521490",
      customerEmail:    "lucia@gmail.com",
      customerPhone:    "+54 11 4455 6677",
      address:          "Av. Corrientes 1234",
      city:             "Buenos Aires",
      province:         "Buenos Aires",
      zip:              "1043",
      subtotal:         104998,
      shippingCost:     4500,
      total:            109498,
      shippingService:  "Andreani Estándar",
      status:           "APPROVED",
      createdAt:        new Date("2026-02-10T14:30:00"),
      items: {
        create: [
          {
            productSlug:  "remera-algodon-pima-regular",
            productTitle: "Remera de Algodón Pima (Regular)",
            size:         "M",
            color:        "Blanco",
            colorHex:     "#ffffff",
            quantity:     2,
            unitPrice:    34999,
            totalPrice:   69998,
          },
          {
            productSlug:  "camisa-lino-premium-blend",
            productTitle: "Camisa de Lino Premium Blend",
            size:         "L",
            color:        "Natural",
            colorHex:     "#e5ded1",
            quantity:     1,
            unitPrice:    69999,
            totalPrice:   69999,
          },
        ],
      },
    },
  });
  console.log("✅ Pedido 1 (APROVADO) - Lucía Fernández");

  // Pedido 2 - Pendiente
  await p.order.create({
    data: {
      externalRef:      "ORDER-TEST-002",
      customerName:     "Matías",
      customerLastName: "Gómez",
      customerDni:      "40112233",
      customerEmail:    "matias@hotmail.com",
      customerPhone:    "+54 11 2233 4455",
      address:          "San Martín 567",
      city:             "Rosario",
      province:         "Santa Fe",
      zip:              "2000",
      subtotal:         79999,
      shippingCost:     6200,
      total:            86199,
      shippingService:  "Andreani Estándar",
      status:           "PENDING",
      createdAt:        new Date("2026-02-18T09:15:00"),
      items: {
        create: [
          {
            productSlug:  "pantalon-chino-gabardina-saten",
            productTitle: "Pantalón Chino Gabardina con Satén",
            size:         "L",
            color:        "Arena",
            colorHex:     "#c9b08f",
            quantity:     1,
            unitPrice:    79999,
            totalPrice:   79999,
          },
        ],
      },
    },
  });
  console.log("✅ Pedido 2 (PENDIENTE) - Matías Gómez");

  // Pedido 3 - Despachado
  await p.order.create({
    data: {
      externalRef:      "ORDER-TEST-003",
      mercadoPagoId:    "MP-987654321",
      customerName:     "Valentina",
      customerLastName: "Torres",
      customerDni:      "41987654",
      customerEmail:    "vale.torres@gmail.com",
      customerPhone:    "+54 351 666 7788",
      address:          "Bv. Illia 890 Piso 3B",
      city:             "Córdoba",
      province:         "Córdoba",
      zip:              "5000",
      notes:            "Dejar en portería",
      subtotal:         169997,
      shippingCost:     5800,
      total:            175797,
      shippingService:  "Andreani Express",
      status:           "SHIPPED",
      createdAt:        new Date("2026-02-25T16:45:00"),
      items: {
        create: [
          {
            productSlug:  "chomba-pique-mercenizado",
            productTitle: "Chomba de Piqué Mercenizado",
            size:         "M",
            color:        "Azul Marino",
            colorHex:     "#0b1b3f",
            quantity:     1,
            unitPrice:    55999,
            totalPrice:   55999,
          },
          {
            productSlug:  "remera-algodon-pima-regular",
            productTitle: "Remera de Algodón Pima (Regular)",
            size:         "S",
            color:        "Negro",
            colorHex:     "#000000",
            quantity:     2,
            unitPrice:    34999,
            totalPrice:   69998,
          },
          {
            productSlug:  "buzo-algodon-rustico-lightweight",
            productTitle: "Buzo de Algodón Rústico (Lightweight)",
            size:         "L",
            color:        "Gris",
            colorHex:     "#9ca3af",
            quantity:     1,
            unitPrice:    56999,
            totalPrice:   56999,
          },
        ],
      },
    },
  });
  console.log("✅ Pedido 3 (DESPACHADO) - Valentina Torres");

  // Pedido 4 - Entregado (mes pasado)
  await p.order.create({
    data: {
      externalRef:      "ORDER-TEST-004",
      mercadoPagoId:    "MP-555666777",
      customerName:     "Carlos",
      customerLastName: "Méndez",
      customerDni:      "35200100",
      customerEmail:    "carlosm@yahoo.com",
      customerPhone:    "+54 11 5544 3322",
      address:          "Rivadavia 2100",
      city:             "Mendoza",
      province:         "Mendoza",
      zip:              "5500",
      subtotal:         56999,
      shippingCost:     7100,
      total:            64099,
      shippingService:  "Andreani Estándar",
      status:           "DELIVERED",
      createdAt:        new Date("2026-01-15T11:00:00"),
      items: {
        create: [
          {
            productSlug:  "remera-henley-botones",
            productTitle: "Remera Henley (Cuello con botones)",
            size:         "XL",
            color:        "Crudo",
            colorHex:     "#f5f5f4",
            quantity:     1,
            unitPrice:    39999,
            totalPrice:   39999,
          },
          {
            productSlug:  "musculosa-algodon-flame",
            productTitle: "Musculosa de Algodón Flamé",
            size:         "L",
            color:        "Negro",
            colorHex:     "#000000",
            quantity:     1,
            unitPrice:    24999,
            totalPrice:   24999,
          },
        ],
      },
    },
  });
  console.log("✅ Pedido 4 (ENTREGADO) - Carlos Méndez");

  // Pedido 5 - Rechazado
  await p.order.create({
    data: {
      externalRef:      "ORDER-TEST-005",
      customerName:     "Sofía",
      customerLastName: "Ramírez",
      customerDni:      "42300400",
      customerEmail:    "sofi.ramirez@gmail.com",
      customerPhone:    "+54 11 9988 7766",
      address:          "Lavalle 333",
      city:             "La Plata",
      province:         "Buenos Aires",
      zip:              "1900",
      subtotal:         69999,
      shippingCost:     4200,
      total:            74199,
      shippingService:  "Andreani Estándar",
      status:           "REJECTED",
      createdAt:        new Date("2026-03-01T20:00:00"),
      items: {
        create: [
          {
            productSlug:  "camisa-lino-premium-blend",
            productTitle: "Camisa de Lino Premium Blend",
            size:         "M",
            color:        "Celeste",
            colorHex:     "#cde3ff",
            quantity:     1,
            unitPrice:    69999,
            totalPrice:   69999,
          },
        ],
      },
    },
  });
  console.log("✅ Pedido 5 (RECHAZADO) - Sofía Ramírez");

  console.log("\n🎉 Datos de prueba cargados correctamente.");
  console.log("   Entrá al panel: http://localhost:3000/admin/dashboard\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
