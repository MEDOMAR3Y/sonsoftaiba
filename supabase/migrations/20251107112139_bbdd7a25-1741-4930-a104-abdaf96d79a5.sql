-- إنشاء المستخدم admin@localhost في auth.users مباشرة
-- ملاحظة: هذا مجرد placeholder لأن Supabase يجب أن ينشئ المستخدم عبر API

-- إضافة دور admin للمستخدم الجديد تلقائياً بعد التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إذا كان البريد الإلكتروني هو medo.mar3y.1@gmail.com، أضف دور admin تلقائياً
  IF NEW.email = 'medo.mar3y.1@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- إنشاء trigger لإضافة دور admin تلقائياً
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin_user();