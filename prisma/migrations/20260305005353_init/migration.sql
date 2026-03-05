-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `mercado_pago_id` VARCHAR(191) NULL,
    `external_ref` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_last_name` VARCHAR(191) NOT NULL,
    `customer_dni` VARCHAR(191) NOT NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `customer_phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `zip` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `subtotal` DOUBLE NOT NULL,
    `shipping_cost` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `shipping_service` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'SHIPPED', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_mercado_pago_id_key`(`mercado_pago_id`),
    UNIQUE INDEX `orders_external_ref_key`(`external_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` VARCHAR(191) NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,
    `product_slug` VARCHAR(191) NOT NULL,
    `product_title` VARCHAR(191) NOT NULL,
    `size` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `color_hex` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_stock` (
    `slug` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
