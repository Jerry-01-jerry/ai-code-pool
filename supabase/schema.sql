-- ai-code-pool · Supabase 建表脚本
-- 在 Supabase 控制台 → SQL Editor 里整段执行即可。
-- 字段与需求一一对应：tool, code, reward, valid_days, submitted_at, expires_at, status, report_count
-- （另加 id 主键用于定位单条，以及 created_at 记录入库时间。）

create table if not exists public.codes (
  id uuid primary key default gen_random_uuid(),
  tool text not null check (tool in ('Muse', 'Cue')),
  code text not null,
  reward text not null,
  valid_days integer check (valid_days is null or valid_days between 1 and 3650),
  submitted_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'used_up')),
  report_count integer not null default 0 check (report_count >= 0),
  max_uses integer check (max_uses is null or max_uses >= 1),
  use_count integer not null default 0 check (use_count >= 0),
  created_at timestamptz not null default now()
);

-- 首页列表用的部分索引：active、未满 3 次举报、按提交时间倒序。
create index if not exists codes_list_idx
  on public.codes (submitted_at desc)
  where status = 'active' and report_count < 3;

-- 举报原子自增，避免并发下丢失计数。
create or replace function public.increment_report(code_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.codes
     set report_count = report_count + 1
   where id = code_id;
$$;

-- 复制计数原子自增；达到总名额后自动下架，避免并发下丢失计数。
create or replace function public.increment_use(code_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.codes
     set use_count = use_count + 1,
         status = case when max_uses is not null and use_count + 1 >= max_uses then 'used_up' else status end
   where id = code_id and status = 'active';
$$;

-- 仅允许服务端 service_role 调用复制计数函数，anon 不可执行。
revoke all on function public.increment_use(uuid) from public;
grant execute on function public.increment_use(uuid) to service_role;

-- 仅允许服务端 service_role 调用举报自增函数，anon 不可执行。
revoke all on function public.increment_report(uuid) from public;
grant execute on function public.increment_report(uuid) to service_role;

-- 服务端使用 service_role key 访问（service_role 绕过 RLS）。
-- 开启 RLS 且不建公开策略，anon key 无法直接读表，保证数据安全。
alter table public.codes enable row level security;
