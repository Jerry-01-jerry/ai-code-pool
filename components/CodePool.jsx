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
    <article className="code-card">
      <div className="flex items-start justify-between gap-3 rounded-md border border-line bg-canvas p-3 sm:gap-4">
        <h4 className="code-text self-center">{code.code}</h4>
        <button type="button" onClick={copy} aria-label={`复制邀请码 ${code.code}`} className="button-secondary min-h-10 gap-1.5 px-2.5">
          <Icon name={copyStatus === '已复制' ? 'check' : 'copy'} />
          {copyStatus === '已复制' ? '已复制' : '复制'}
        </button>
      </div>
      <span role="status" className={copyStatus.startsWith('复制失败') ? 'notice mt-3 block' : 'sr-only'}>{copyStatus}</span>
      <p className="mt-4 break-words text-sm leading-relaxed text-ink"><span className="mr-2 text-muted">奖励</span>{code.reward}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.8125rem] text-muted">
        <span className="count-badge">{remaining === null ? '长期有效' : `剩余 ${remaining} 天`}</span>
        {remainingUses !== null && <span className="count-badge text-accent">剩余 {remainingUses} 次（共 {code.maxUses} 次）</span>}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 border-t border-line pt-2 text-[0.8125rem] text-muted">
        <span>提交于 <time dateTime={new Date(code.submittedAt).toISOString()}>{dateFormat.format(code.submittedAt)}</time></span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onReport(code)} disabled={reportBusy || reported} aria-label={`举报 ${code.code}`} className="min-h-9 shrink-0 px-1 underline-offset-4 enabled:hover:text-ink enabled:hover:underline disabled:opacity-60">
            {reported ? '已举报' : reportBusy ? '举报中…' : '举报'}
          </button>
          <button type="button" onClick={() => onRemove(code)} aria-label={`将 ${code.code} 标记为已用完`} className="min-h-9 shrink-0 px-1 underline-offset-4 hover:text-ink hover:underline">已用完</button>
        </div>
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
    <section aria-labelledby="pool-title" className="enter pt-7 sm:pt-9">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <h2 id="pool-title" className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">邀请码池</h2>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div role="group" aria-label="按工具筛选" className="inline-flex rounded-md border border-line bg-panel p-[3px]">
            {[null, ...tools].map((option) => (
              <button key={option ?? 'all'} type="button" aria-pressed={tool === option} onClick={() => setTool(option)} className="filter-button">
                {option ?? '全部'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Icon name="search" className="pointer-events-none absolute inset-y-0 left-3.5 my-auto size-4 text-muted" />
            <input type="search" aria-label="搜索邀请码" placeholder="搜索邀请码" value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" />
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">「已用完」仅在当前浏览器隐藏该邀请码，其他人仍可查看。</p>
      {hiddenIds.size > 0 && (
        <p className="mt-2 text-sm text-muted">你已隐藏 {hiddenIds.size} 个码。<button type="button" onClick={restoreHidden} className="px-1 font-semibold text-accent underline-offset-4 hover:underline">恢复显示</button></p>
      )}
      <p role="status" className="sr-only">{notice || `找到 ${visible.length} 个可用邀请码`}</p>
      {error && <p role="alert" className="notice mt-4">{error}</p>}
      {term && visible.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">没有匹配的邀请码。</p>
      )}
      <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2">
        {tools.map((name) => {
          if (tool && tool !== name) return null;
          const group = visible.filter((code) => code.tool === name);
          if (term && !group.length) return null;

          return (
            <section key={name} aria-label={`${name} 邀请码`} className="min-w-0 sm:row-span-2 sm:grid sm:grid-rows-subgrid sm:gap-y-3">
              <div className="mb-3 overflow-hidden rounded-lg border border-line bg-panel sm:mb-0">
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                  <h3 className="text-xl font-semibold tracking-tight">{name}</h3>
                  <span className="count-badge text-[0.8125rem] tabular-nums text-muted">{group.length} 个可用</span>
                </div>
                <ToolHero name={name} />
              </div>
              <div className="grid content-start gap-3">
                {group.length === 0 && <p className="rounded-lg border border-dashed border-line p-6 text-sm text-muted">暂无可用邀请码。</p>}
                {group.map((code) => <CodeCard key={code.id} code={code} now={now} onRemove={confirmRemoval} onReport={report} reportBusy={reportBusyId === code.id} reported={reportedIds.has(code.id)} />)}
              </div>
            </section>
          );
        })}
      </div>
      <dialog ref={dialog} aria-labelledby="remove-title" onCancel={(event) => { if (busy) event.preventDefault(); }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-panel p-6 text-ink">
        <h2 id="remove-title" className="text-lg font-bold">确认这个码已经用完了？</h2>
        <p className="mt-2 break-words text-sm leading-6 text-muted">邀请码 <strong className="font-mono text-ink [overflow-wrap:anywhere]">{selected?.code}</strong> 点确定后，只会在你的浏览器里隐藏，其他人还能看到。请确认它真的已经没有名额了；如果还能用，请不要点。</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" autoFocus disabled={busy} onClick={() => dialog.current.close()} className="button-secondary">取消</button>
          <button type="button" disabled={busy} onClick={remove} className="button-primary">确认隐藏</button>
        </div>
      </dialog>
    </section>
  );
}

const toolDetails = {
  Muse: {
    image: '/muse-friends.jpg',
    alt: 'Muse 的四个形象',
    width: 1050,
    height: 330,
    title: '邀请好友',
    description: '只要 TA 在加入后 48 小时内通过“设置”兑现邀请码，你们就能分别获得 10 亿个 Muse 词元。',
  },
  Cue: {
    image: '/cue-card.jpg',
    alt: 'Cue 邀请卡',
    width: 1000,
    height: 622,
    label: '仅限受邀',
    title: '为少数人而留，下一位由你决定',
    description: 'Cue 当前限量开放中，每个码只有几次邀请，用完即止。',
  },
  小豆: {
    image: '/xiaodou.jpg',
    alt: '小豆形象',
    width: 1000,
    height: 612,
    label: '豆包旗下 · 邀请制公测',
    title: '懂你、还能主动帮你办事的个人助理',
    description: '小豆 11 月 24 日开启公测，凭邀请码体验并获赠免费额度。一个码只能一人用，复制后会自动下架，请只在马上要用时复制。',
  },
};

function ToolHero({ name }) {
  const details = toolDetails[name];

  return (
    <>
      {details.image ? (
        <div className={`tool-art flex justify-center border-y border-line ${name === '小豆' ? 'items-end bg-[#5ba9fc]' : 'items-center'} ${name === 'Muse' ? 'tool-art-muse' : name === 'Cue' ? 'tool-art-cue' : ''}`}>
          <img src={details.image} alt={details.alt} width={details.width} height={details.height} className={`block w-auto max-w-full object-contain ${name === 'Cue' ? 'max-h-[82%]' : 'max-h-full'}`} />
        </div>
      ) : (
        <div className="tool-art tool-art-cue flex items-center justify-center border-y border-line">
          <span aria-hidden="true" className="text-5xl font-bold tracking-[-0.06em] text-ink sm:text-6xl">{name}</span>
        </div>
      )}
      <div className="px-4 pb-5 pt-4 sm:px-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-base font-semibold">{details.title}</p>
          {details.label && <p className="text-[0.8125rem] text-muted">{details.label}</p>}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{details.description}</p>
      </div>
    </>
  );
}
