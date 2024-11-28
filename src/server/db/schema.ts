import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `restaurant_${name}`);

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "VENDOR_ADMIN",
  "VENDOR_STAFF",
  "CUSTOMER",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const vendorStatusEnum = pgEnum("vendor_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "INACTIVE",
]);

// Users table with enhanced roles and profile
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("CUSTOMER"),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendors (Restaurants)
export const vendors = createTable("vendor", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logo: varchar("logo", { length: 255 }),
  coverImage: varchar("cover_image", { length: 255 }).notNull(),
  status: vendorStatusEnum("status").notNull().default("PENDING"),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  openingHours: json("opening_hours").$type<{
    [key: string]: { open: string; close: string };
  }>(),
  cuisineTypes: json("cuisine_types").$type<string[]>().notNull(),
  deliveryRadius: integer("delivery_radius"),
  minimumOrder: decimal("minimum_order", { precision: 10, scale: 2 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Menu Categories
export const menuCategories = createTable("menu_category", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vendorId: varchar("vendor_id", { length: 255 })
    .notNull()
    .references(() => vendors.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  image: varchar("image", { length: 255 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

// Menu Items
export const menuItems = createTable("menu_item", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: varchar("category_id", { length: 255 })
    .notNull()
    .references(() => menuCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image", { length: 255 }),
  isAvailable: boolean("is_available").default(true),
  preparationTime: integer("preparation_time"),
  allergens: json("allergens").$type<string[]>(),
  nutritionalInfo: json("nutritional_info").$type<{
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }>(),
});

// Orders
export const orders = createTable("order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  vendorId: varchar("vendor_id", { length: 255 })
    .notNull()
    .references(() => vendors.id),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address"),
  specialInstructions: text("special_instructions"),
  estimatedDeliveryTime: timestamp("estimated_delivery_time"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Items
export const orderItems = createTable("order_item", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  menuItemId: varchar("menu_item_id", { length: 255 })
    .notNull()
    .references(() => menuItems.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("special_instructions"),
});

// Reviews
export const reviews = createTable("review", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  vendorId: varchar("vendor_id", { length: 255 })
    .notNull()
    .references(() => vendors.id),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  images: json("images").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  menuCategories: many(menuCategories),
  orders: many(orders),
  reviews: many(reviews),
}));

export const menuCategoriesRelations = relations(
  menuCategories,
  ({ one, many }) => ({
    vendor: one(vendors, {
      fields: [menuCategories.vendorId],
      references: [vendors.id],
    }),
    menuItems: many(menuItems),
  }),
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  vendor: one(vendors, { fields: [orders.vendorId], references: [vendors.id] }),
  orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);
