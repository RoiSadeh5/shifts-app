-- מוציא רק את שכ״ש מהפרויקט המשותף.
-- לא מוחק טבלאות בסכמה public, ולא מוחק משתמשי התחברות של הפרויקט השני.

drop trigger if exists sachash_on_auth_user_created on auth.users;
drop schema if exists sachash cascade;
