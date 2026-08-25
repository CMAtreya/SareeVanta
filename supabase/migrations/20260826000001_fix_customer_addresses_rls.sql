-- Fix customer_addresses RLS policy for INSERT, UPDATE, DELETE, and SELECT operations

DROP POLICY IF EXISTS "Customer read own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Customer manage own addresses" ON public.customer_addresses;

CREATE POLICY "Customer manage own addresses"
ON public.customer_addresses
FOR ALL
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);
