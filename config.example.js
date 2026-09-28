/**
 * Admin – copy to config.js for production (gitignored).
 * password: admin panel password (see src/admin.js).
 */
window.ADMIN_CONFIG = window.ADMIN_CONFIG || {};
window.ADMIN_CONFIG.password = 'change-me';
// Public project URL and anon key. Leave empty to keep data only on this phone.
// Never put the service_role key here.
window.SUPABASE_URL = window.SUPABASE_URL || '';
window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
