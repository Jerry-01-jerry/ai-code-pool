'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitCode } from '../app/submit/actions';
import { defaultDays, limits, tools } from '../lib/catalog';
import { Icon } from './Icons';

function PublishButton() {
  const { pending } = useFormStatus();
  return <button className="button-primary w-full sm:w-auto" type="submit" disabled={pending}>{pending ? '提交中…' : '公开邀请码'}</button>;
}

export default function SubmitForm() {
  const [state, action] = useFormState(submitCode, { error: '' });

  return (
    <form action={action} className="grid min-w-0 gap-5 rounded-xl border border-line bg-panel p-5 sm:gap-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-4">
        <label className="grid min-w-0 gap-2 text-sm font-semibold">
          工具
          <span className="relative block">
            <select name="tool" required defaultValue={tools[0]} className="field select-field">
              {tools.map((tool) => <option key={tool}>{tool}</option>)}
            </select>
            <Icon name="chevron" className="pointer-events-none absolute inset-y-0 right-3 my-auto size-4 text-muted" />
          </span>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-semibold">
          邀请码
          <input name="code" required maxLength={limits.code} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="输入邀请码" className="field font-mono" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold">
        奖励说明
        <textarea name="reward" required maxLength={limits.reward} rows={3} placeholder="例如 5 次使用机会" className="field resize-y" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <label className="grid min-w-0 gap-2 text-sm font-semibold">
          <span>总名额 <span className="font-normal text-muted">（可选）</span></span>
          <input name="max_uses" type="number" min={1} max={1000} step={1} placeholder="留空表示不限名额" className="field" />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-semibold">
          <span>有效天数 <span className="font-normal text-muted">（可选）</span></span>
          <input name="valid_days" type="number" min={1} max={limits.valid_days} step={1} defaultValue={defaultDays} placeholder="留空表示不限时" className="field" />
        </label>
      </div>
      {state.error && <p role="alert" className="notice">{state.error}</p>}
      <div className="border-t border-line pt-5"><PublishButton /></div>
    </form>
  );
}
