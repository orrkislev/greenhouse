import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const getSupabaseAdminClient = () => createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
})

// import { createServerClient } from "@supabase/ssr";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
//     auth: {
//       // Disable persistSession since we don't need session management server-side
//       persistSession: false,
//       autoRefreshToken: false,
//     },
//   });

// export const createClient = (cookieStore) => {
//     return createServerClient(supabaseUrl, supabaseKey,
//         {
//             cookies: {
//                 getAll() {
//                     return cookieStore.getAll()
//                 },
//                 setAll(cookiesToSet) {
//                     try {
//                         cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
//                     } catch {
//                         // The `setAll` method was called from a Server Component.
//                         // This can be ignored if you have middleware refreshing
//                         // user sessions.
//                     }
//                 },
//             },
//         },
//     );
// };
