
-- Function to check if another function exists
CREATE OR REPLACE FUNCTION public.function_exists(function_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_proc
    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
    WHERE pg_proc.proname = function_name
    AND pg_namespace.nspname = 'public'
  );
END;
$$;

-- Grant access to the anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.function_exists TO anon, authenticated;
