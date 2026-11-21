export const tools = ['Muse', 'Cue'];
export const dayMs = 86_400_000;
export const defaultDays = 30;
export const limits = { code: 64, reward: 200, valid_days: 3650 };

export function validateSubmission(form) {
  const value = (field) => String(form.get(field) ?? '').trim();
  const tool = value('tool');
  const code = value('code');
  const reward = value('reward');
  const valid_days = Number(value('valid_days'));

  if (!tools.includes(tool)) throw new Error('请选择 Muse 或 Cue。');
  if (!code || code.length > limits.code || /\s/.test(code)) {
    throw new Error('请输入不含空格的邀请码，最多 64 个字符。');
  }
  if (!reward || reward.length > limits.reward) throw new Error('请输入奖励说明，最多 200 个字符。');
  if (!Number.isInteger(valid_days) || valid_days < 1 || valid_days > limits.valid_days) {
    throw new Error('有效天数须为 1 到 3650 之间的整数。');
  }

  return { tool, code, reward, valid_days };
}
