'use server';

import { revalidatePath } from 'next/cache';
import { reportCode } from '../lib/store';

export async function reportCodeAction(id) {
  if (typeof id !== 'string' || id.length > 36) return { error: '邀请码无效。' };
  try {
    await reportCode(id);
  } catch (error) {
    console.error('Unable to report invitation code', error);
    return { error: '举报失败，请稍后重试。' };
  }

  revalidatePath('/');
  return { ok: true };
}
