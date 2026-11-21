// 一次性迁移脚本：把本地 SQLite 的 codes 表迁到 Supabase。
// 用法（项目根目录，先配置好 .env.local）：
//   node scripts/migrate.mjs
//
// 映射关系（旧 SQLite -> 新 Supabase）：
//   tool        -> tool
//   code        -> code
//   reward      -> reward
//   (expiresAt - submittedAt) / 1天 -> valid_days
//   submittedAt -> submitted_at (ISO 字符串)
//   expiresAt   -> expires_at   (ISO 字符串)
//   usedAt      -> status（null => 'active'，否则 => 'used_up'）
//   report_count 固定为 0
//   旧 nickname 字段在新结构中不存在，予以丢弃。

import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile(resolve(process.cwd(), '.env.local'));

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('缺少环境变量：请在 .env.local 中配置 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY');
}

const dayMs = 86_400_000;
const dbPath = resolve(process.cwd(), process.env.CODE_POOL_DB || 'data/code-pool.sqlite');

const sqlite = new DatabaseSync(dbPath, { readOnly: true });
const rows = sqlite.prepare('SELECT * FROM codes').all();
sqlite.close();

if (!rows.length) {
  console.log('本地 SQLite 的 codes 表为空，无需迁移。');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let ok = 0;
let failed = 0;

for (const row of rows) {
  const submittedAt = Number(row.submittedAt);
  const expiresAt = Number(row.expiresAt);
  const valid_days = Math.max(1, Math.round((expiresAt - submittedAt) / dayMs));
  const payload = {
    tool: row.tool,
    code: row.code,
    reward: row.reward,
    valid_days,
    submitted_at: new Date(submittedAt).toISOString(),
    expires_at: new Date(expiresAt).toISOString(),
    status: row.usedAt ? 'used_up' : 'active',
    report_count: 0,
  };

  const { error } = await supabase.from('codes').insert(payload);
  if (error) {
    failed += 1;
    console.error('迁移失败', row.id, row.code, '->', error.message);
  } else {
    ok += 1;
    console.log('已迁移', row.id, '->', row.code);
  }
}

console.log(`\n完成：成功 ${ok} 条，失败 ${failed} 条。`);
process.exit(failed ? 1 : 0);
