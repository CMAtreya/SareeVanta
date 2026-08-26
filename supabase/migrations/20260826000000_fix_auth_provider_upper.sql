-- Fix auth_provider case sensitivity in user sync trigger
-- Source: Ensure auth_provider is converted to uppercase to satisfy CHECK (auth_provider IN ('EMAIL', 'GOOGLE', 'OTP'))

CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, email, name, auth_provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        UPPER(COALESCE(NEW.raw_app_meta_data->>'provider', 'EMAIL'))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
