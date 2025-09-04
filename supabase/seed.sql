-- This file contains seed data for your Supabase project
-- Run this file with: supabase db reset

-- Insert sample rooms for the rest stop booking system
INSERT INTO public.rooms (id, name, description, capacity, base_price, amenities, created_at, updated_at) VALUES
  (1, 'Standard Room', 'Comfortable room with basic amenities', 2, 1500.00, '["WiFi", "Air Conditioning", "Private Bathroom"]', NOW(), NOW()),
  (2, 'Deluxe Room', 'Spacious room with premium amenities', 4, 2500.00, '["WiFi", "Air Conditioning", "Private Bathroom", "Mini Fridge", "TV"]', NOW(), NOW()),
  (3, 'Family Suite', 'Large suite perfect for families', 6, 3500.00, '["WiFi", "Air Conditioning", "Private Bathroom", "Mini Fridge", "TV", "Kitchenette"]', NOW(), NOW()),
  (4, 'Budget Room', 'Affordable option for budget travelers', 2, 1000.00, '["WiFi", "Shared Bathroom"]', NOW(), NOW()),
  (5, 'Executive Room', 'Premium room with business amenities', 2, 3000.00, '["WiFi", "Air Conditioning", "Private Bathroom", "Mini Fridge", "TV", "Work Desk"]', NOW(), NOW());

-- Insert sample booking statuses
INSERT INTO public.booking_status (id, name, description, created_at, updated_at) VALUES
  (1, 'DRAFT', 'Booking is being created', NOW(), NOW()),
  (2, 'PENDING_PAYMENT', 'Waiting for payment confirmation', NOW(), NOW()),
  (3, 'CONFIRMED', 'Booking confirmed and paid', NOW(), NOW()),
  (4, 'COMPLETED', 'Stay completed successfully', NOW(), NOW()),
  (5, 'CANCELLED', 'Booking was cancelled', NOW(), NOW());

-- Insert sample payment statuses
INSERT INTO public.payment_status (id, name, description, created_at, updated_at) VALUES
  (1, 'PENDING', 'Payment is pending', NOW(), NOW()),
  (2, 'PROCESSING', 'Payment is being processed', NOW(), NOW()),
  (3, 'COMPLETED', 'Payment completed successfully', NOW(), NOW()),
  (4, 'FAILED', 'Payment failed', NOW(), NOW()),
  (5, 'REFUNDED', 'Payment was refunded', NOW(), NOW());



