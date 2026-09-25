import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const landlords = sqliteTable('landlords', {
  id: text('id').primaryKey(), name: text('name').notNull(), city: text('city').notNull(),
  district: text('district').notNull(), createdAt: integer('created_at').notNull(),
}, t => [uniqueIndex('idx_landlords_identity').on(t.name, t.city, t.district)]);
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(), landlordId: text('landlord_id').notNull(), listingId: text('listing_id'),
  session: text('session').notNull(), scope: text('scope').notNull().default(''), maintenance: integer('maintenance').notNull(),
  communication: integer('communication').notNull(), deposit: integer('deposit').notNull(),
  again: integer('again').notNull(), title: text('title').notNull(), body: text('body').notNull(),
  year: integer('year').notNull(), status: text('status').notNull().default('pending'),
  createdAt: integer('created_at').notNull(),
}, t => [index('idx_reviews_landlord_status').on(t.landlordId, t.status),
  uniqueIndex('idx_reviews_session_landlord_scope').on(t.session, t.landlordId, t.scope),
  index('idx_reviews_session_created').on(t.session, t.createdAt)]);
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(), reviewId: text('review_id').notNull(),
  reason: text('reason').notNull(), session: text('session').notNull(), createdAt: integer('created_at').notNull(),
}, t => [uniqueIndex('idx_reports_session_review').on(t.session, t.reviewId)]);
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(), session: text('session').notNull(), createdAt: integer('created_at').notNull(),
}, t => [index('idx_submissions_session_created').on(t.session, t.createdAt)]);
export const buildings = sqliteTable('buildings', {
  id: text('id').primaryKey(), address: text('address').notNull(), city: text('city').notNull(),
  latitude: real('latitude').notNull(), longitude: real('longitude').notNull(),
  createdAt: integer('created_at').notNull(),
}, t => [uniqueIndex('idx_buildings_address').on(t.address, t.city)]);
export const listings = sqliteTable('listings', {
  id: text('id').primaryKey(), buildingId: text('building_id').notNull().references(()=>buildings.id),
  unit: text('unit').notNull(), landlordId: text('landlord_id').notNull().references(()=>landlords.id),
  createdAt: integer('created_at').notNull(),
}, t => [uniqueIndex('idx_listings_building_unit').on(t.buildingId,t.unit)]);
