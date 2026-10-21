// Public runtime config for the BCM Portal front end.
// The Supabase publishable (anon) key is safe to ship to browsers: access is limited by Row Level Security.
window.BCM_CONFIG = {
  supabaseUrl: "https://hhdwvmpquojqkmjsjevk.supabase.co",
  supabaseKey: "sb_publishable_8UMB0GMUtddsozlADZk05A_OTWZ8Xaa",
  liveApi: "/api/hazards",
  // Set to true after the Azure (Microsoft Entra ID) provider is enabled in Supabase Auth.
  // While false, "Sign in with Microsoft" runs in demo mode.
  msLogin: false,
  // Set to true to use Supabase email/password sign-in and sign-up (needs custom SMTP for confirmation emails).
  emailLogin: false
};
