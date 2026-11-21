import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('缺少 Supabase 环境变量：SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY（请配置到 .env.local，服务端使用，不进入客户端）');
}

// 仅服务端使用：service_role key 绕过 RLS，用于无登录的公开码池读写。
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
