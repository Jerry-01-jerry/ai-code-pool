export const tools = ['Muse', 'Cue', '小豆'];
// 小豆：社区反馈一个码只能一人用，留空名额时默认 1 次，复制一次即自动下架。
export const defaultUses = { 小豆: 1 };
export const dayMs = 86_400_000;
export const defaultDays = 30;
export const limits = { code: 64, reward: 200, valid_days: 3650 };

export function validateSubmission(form) {
  const value = (field) => String(form.get(field) ?? '').trim();
  const tool = value('tool');
  const code = value('code');
  const reward = value('reward');
  const daysRaw = value('valid_days');
  const usesRaw = value('max_uses');
  // 留空 = 不限时 / 不限名额。
  const valid_days = daysRaw === '' ? null : Number(daysRaw);
  const max_uses = usesRaw === '' ? (defaultUses[value('tool')] ?? null) : Number(usesRaw);

  if (!tools.includes(tool)) throw new Error('请选择 Muse、Cue 或小豆。');
  if (!code || code.length > limits.code || /\s/.test(code)) {
    throw new Error('请输入不含空格的邀请码，最多 64 个字符。');
  }
  if (!reward || reward.length > limits.reward) throw new Error('请输入奖励说明，最多 200 个字符。');
  if (valid_days !== null && (!Number.isInteger(valid_days) || valid_days < 1 || valid_days > limits.valid_days)) {
    throw new Error('有效天数须为 1 到 3650 之间的整数，留空表示不限时。');
  }
  if (max_uses !== null && (!Number.isInteger(max_uses) || max_uses < 1 || max_uses > 1000)) {
    throw new Error('总名额须为 1 到 1000 之间的整数，留空表示不限名额。');
  }

  return { tool, code, reward, valid_days, max_uses };
}
