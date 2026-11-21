'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { validateSubmission } from '../../lib/catalog';
import { addCode } from '../../lib/store';

export async function submitCode(_previous, form) {
  let submission;
  try {
    submission = validateSubmission(form);
  } catch (error) {
    return { error: error.message };
  }

  try {
    await addCode(submission);
  } catch (error) {
    console.error('Unable to publish invitation code', error);
    return { error: '提交失败，请稍后重试。' };
  }

  revalidatePath('/');
  redirect('/?submitted=1');
}
