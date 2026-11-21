-- 可选：全新 Supabase 项目预置数据（与本地 SQLite 原两条种子一致）。
-- 如已运行 scripts/migrate.mjs 迁移过数据，无需再执行本文件。

insert into public.codes (tool, code, reward, valid_days, submitted_at, expires_at, status, report_count, max_uses, use_count)
values
  ('Muse', 'HB0VU1', '双方各得 10 亿 Muse 词元，48 小时内兑换，一个账号一生只能兑一次。', 30, now(), now() + interval '30 days', 'active', 0, null, 0),
  ('Cue',  'RJ94U',  '免费内测，共 5 次邀请。',                                    null, now(), null, 'active', 0, 5, 0);
