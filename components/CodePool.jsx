'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { incrementUseAction, reportCodeAction } from '../app/actions';
import { dayMs, tools } from '../lib/catalog';
import { Icon } from './Icons';

const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai',
});

async function copyCode(code) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(code);
      return;
    } catch {
      // Some browsers deny Clipboard API access while allowing a selection copy.
    }
  }

  const input = document.createElement('textarea');
  const focused = document.activeElement;
  input.value = code;
  input.readOnly = true;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.append(input);
  input.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Copy failed');
  } finally {
    input.remove();
    focused?.focus();
  }
}

function CodeCard({ code, now, onRemove, onReport, reportBusy, reported }) {
  const [copyStatus, setCopyStatus] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await copyCode(code.code);
      setCopyStatus('已复制');
      // 复制记一次使用：达到总名额后服务端自动下架。计数失败不影响复制本身。
      incrementUseAction(code.id).catch(() => {});
    } catch {
      setCopyStatus('复制失败，请手动复制');
    }
    timer.current = setTimeout(() => setCopyStatus(''), 3000);
  }

  const remaining = code.expiresAt === null ? null : Math.ceil((code.expiresAt - now) / dayMs);
  const remainingUses = code.maxUses == null ? null : Math.max(code.maxUses - code.useCount, 0);
  return (
    <article className="min-w-0 rounded-xl border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 select-all break-all font-mono text-2xl font-bold tracking-wide [overflow-wrap:anywhere]">{code.code}</h4>
        <button type="button" onClick={copy} aria-label={`复制邀请码 ${code.code}`} className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-md bg-[#edf4ed] px-2.5 text-sm font-semibold text-accent hover:bg-[#deebde]">
          <Icon name={copyStatus === '已复制' ? 'check' : 'copy'} />
          {copyStatus === '已复制' ? '已复制' : '复制'}
        </button>
      </div>
      <span role="status" className={copyStatus.startsWith('复制失败') ? 'mt-2 block text-sm text-rose-700' : 'sr-only'}>{copyStatus}</span>
      <p className="mt-4 break-words text-sm text-ink"><span className="mr-2 text-muted">奖励</span>{code.reward}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-muted">
        <span>提交于 <time dateTime={new Date(code.submittedAt).toISOString()}>{dateFormat.format(code.submittedAt)}</time></span>
        <span className="rounded-full bg-[#edf4ed] px-2 py-0.5 font-medium text-accent">{remaining === null ? '长期有效' : `剩余 ${remaining} 天`}</span>
        {remainingUses !== null && <span className="rounded-full bg-[#edf4ed] px-2 py-0.5 font-medium text-accent">剩余 {remainingUses} 次（共 {code.maxUses} 次）</span>}
        <button type="button" onClick={() => onReport(code)} disabled={reportBusy || reported} aria-label={`举报 ${code.code}`} className="min-h-8 shrink-0 px-1 text-muted underline-offset-4 hover:text-amber-700 hover:underline disabled:cursor-wait disabled:opacity-60">
          {reported ? '已举报' : reportBusy ? '举报中…' : '举报'}
        </button>
        <button type="button" onClick={() => onRemove(code)} aria-label={`将 ${code.code} 标记为已用完`} className="ml-auto min-h-8 shrink-0 px-1 text-muted underline-offset-4 hover:text-rose-700 hover:underline">已用完</button>
      </div>
    </article>
  );
}

export default function CodePool({ codes, now }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [tool, setTool] = useState(null);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reportBusyId, setReportBusyId] = useState(null);
  const [reportedIds, setReportedIds] = useState(() => new Set());
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const dialog = useRef(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ai-code-pool-hidden') ?? '[]');
      if (Array.isArray(stored)) setHiddenIds(new Set(stored));
    } catch {
      // Ignore a corrupt local hide list; start with nothing hidden.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ai-code-pool-hidden', JSON.stringify([...hiddenIds]));
    } catch {
      // Private mode may block storage; the hide still applies for this visit.
    }
  }, [hiddenIds]);

  useEffect(() => {
    function refresh() {
      if (document.visibilityState === 'visible') router.refresh();
    }
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router]);

  function confirmRemoval(code) {
    setSelected(code);
    setError('');
    dialog.current.showModal();
  }

  function remove() {
    if (!selected) return;
    // Local-only hide: only this browser stops showing the code.
    // Nothing is written to the server, so other visitors still see it.
    setHiddenIds((prev) => new Set(prev).add(selected.id));
    setNotice(`${selected.code} 已在你的浏览器里隐藏，其他人还能看到。`);
    dialog.current.close();
  }

  function restoreHidden() {
    setHiddenIds(new Set());
    setNotice('已恢复显示你隐藏的邀请码。');
  }

  async function report(code) {
    if (reportBusyId) return;
    setReportBusyId(code.id);
    setError('');
    try {
      const result = await reportCodeAction(code.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setReportedIds((prev) => new Set(prev).add(code.id));
      setNotice(`已举报 ${code.code}。`);
      router.refresh();
    } catch {
      setError('举报失败，请稍后重试。');
    } finally {
      setReportBusyId(null);
    }
  }

  const term = query.trim().toLowerCase();
  const visible = codes.filter((code) => !hiddenIds.has(code.id) && (!tool || code.tool === tool) && code.code.toLowerCase().includes(term));

  return (
    <section aria-labelledby="pool-title" className="mt-8 sm:mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="pool-title" className="text-2xl font-bold tracking-tight">邀请码池</h2>
        <div className="relative w-full sm:w-64">
          <Icon name="search" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
          <input type="search" aria-label="搜索邀请码" placeholder="搜索邀请码" value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-9" />
        </div>
      </div>
      <div role="group" aria-label="按工具筛选" className="mt-4 flex flex-wrap gap-2">
        {[null, ...tools].map((option) => (
          <button key={option ?? 'all'} type="button" aria-pressed={tool === option} onClick={() => setTool(option)} className={`min-h-10 rounded-lg border px-4 text-sm font-semibold transition ${tool === option ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-accent hover:text-accent'}`}>
            {option ?? '全部'}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">点“已用完”只会在你的浏览器里隐藏这个码，不会影响其他人；码还能用的话请不要点。</p>
      {hiddenIds.size > 0 && (
        <p className="mt-2 text-xs text-muted">你已隐藏 {hiddenIds.size} 个码。<button type="button" onClick={restoreHidden} className="px-1 font-semibold text-accent underline-offset-4 hover:underline">恢复显示</button></p>
      )}
      <p role="status" className="sr-only">{notice || `找到 ${visible.length} 个可用邀请码`}</p>
      {visible.length === 0 && (
        <p className="mt-5 rounded-xl border border-dashed border-line py-10 text-center text-sm text-muted">{term ? '没有匹配的邀请码。' : '暂无可用邀请码。'}</p>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {tools.map((name) => {
          const group = visible.filter((code) => code.tool === name);
          if (!group.length) return null;
          return (
            <section key={name} aria-label={`${name} 邀请码`} className="min-w-0">
              <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
                <h3 className="flex items-center gap-2.5 text-lg font-bold">
                  <span aria-hidden="true" className={`h-2 w-2 rounded-full ${name === 'Muse' ? 'bg-[#4d8a5f]' : 'bg-[#8268a8]'}`} />
                  {name}
                </h3>
                <span className="text-xs text-muted">{group.length} 个可用</span>
              </div>
              <div className="grid gap-3">
                {group.map((code) => <CodeCard key={code.id} code={code} now={now} onRemove={confirmRemoval} onReport={report} reportBusy={reportBusyId === code.id} reported={reportedIds.has(code.id)} />)}
              </div>
            </section>
          );
        })}
      </div>
      <dialog ref={dialog} aria-labelledby="remove-title" onCancel={(event) => { if (busy) event.preventDefault(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-6 text-ink shadow-xl">
        <h2 id="remove-title" className="text-lg font-bold">确认这个码已经用完了？</h2>
        <p className="mt-2 break-words text-sm leading-6 text-muted">邀请码 <strong>{selected?.code}</strong> 点确定后，只会在你的浏览器里隐藏，其他人还能看到。请确认它真的已经没有名额了；如果还能用，请不要点。</p>
        {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" autoFocus disabled={busy} onClick={() => dialog.current.close()} className="min-h-11 rounded-lg border border-line px-4 text-sm font-semibold hover:bg-canvas">取消</button>
          <button type="button" disabled={busy} onClick={remove} className="button-primary">确认隐藏</button>
        </div>
      </dialog>
    </section>
  );
}
