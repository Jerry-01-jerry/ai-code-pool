import { supabase } from './supabase';
import { dayMs } from './catalog';

const TABLE = 'codes';

// Supabase 返回 timestamptz 为 ISO 字符串，这里统一转成毫秒时间戳，
// 保持组件层仍按 submittedAt / expiresAt 使用。
function toCode(row) {
  return {
    id: row.id,
    tool: row.tool,
    code: row.code,
    reward: row.reward,
    validDays: row.valid_days,
    submittedAt: Date.parse(row.submitted_at),
    expiresAt: Date.parse(row.expires_at),
    status: row.status,
    reportCount: row.report_count,
  };
}

// 列表接口：只返回 active 且未过期、举报未满 3 次的记录。
export async function listActiveCodes() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tool, code, reward, valid_days, submitted_at, expires_at, status, report_count')
    .eq('status', 'active')
    .lt('report_count', 3)
    .gt('expires_at', now)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toCode);
}

export async function addCode({ tool, code, reward, valid_days }) {
  const submittedAt = new Date();
  const expiresAt = new Date(submittedAt.getTime() + valid_days * dayMs);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      tool,
      code,
      reward,
      valid_days,
      submitted_at: submittedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      status: 'active',
      report_count: 0,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id;
}

// mark_used_up：点一次立即把 status 置为 used_up，列表即不再返回。
export async function markCodeUsedUp(id) {
  const { error } = await supabase
    .from(TABLE)
    .update({ status: 'used_up' })
    .eq('id', id);

  if (error) throw error;
}

// 举报：report_count 自增，达到 3 后由列表接口自动隐藏。
export async function reportCode(id) {
  const { error } = await supabase.rpc('increment_report', { code_id: id });
  if (error) throw error;
}
