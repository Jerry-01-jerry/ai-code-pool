'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitCode } from '../app/submit/actions';
import { defaultDays, limits, tools } from '../lib/catalog';

function PublishButton() {
  const { pending } = useFormStatus();
  return <button className="button-primary w-full sm:w-auto" type="submit" disabled={pending}>{pending ? '提交中…' : '公开邀请码'}</button>;
}

export default function SubmitForm() {
  const [state, action] = useFormState(submitCode, { error: '' });

  return (
    <form action={action} className="mt-7 grid gap-5 rounded-xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <label className="grid gap-2 text-sm font-semibold">
        工具
        <select name="tool" required defaultValue={tools[0]} className="field">
          {tools.map((tool) => <option key={tool}>{tool}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        邀请码
        <input name="code" required maxLength={limits.code} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="输入邀请码" className="field font-mono" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        奖励说明
        <textarea name="reward" required maxLength={limits.reward} rows={3} placeholder="例如 5 次使用机会" className="field resize-y" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        总名额（可选）
        <input name="max_uses" type="number" min={1} max={1000} step={1} placeholder="例如 5，留空表示不限名额" className="field" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        有效天数（可选）
        <input name="valid_days" type="number" min={1} max={limits.valid_days} step={1} defaultValue={defaultDays} placeholder="留空表示不限时" className="field" />
      </label>
      {state.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{state.error}</p>}
      <div className="border-t border-line pt-5"><PublishButton /></div>
    </form>
  );
}
