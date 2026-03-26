import { type RequestEvent, fail } from '@sveltejs/kit';

function validateURLParam(value: string, name?: string): string {
  return encodeURIComponent(value);
}

// ---- TRUE POSITIVES: should trigger ----

async function unsafeUpdate(event: RequestEvent) {
  const data = await event.request.formData();
  const usageLimitId = data.get('usage_limit_id') as string;
  // ruleid: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/usage-limits/${usageLimitId}`, {
    method: 'PATCH',
  });
}

async function unsafeDelete(event: RequestEvent) {
  const data = await event.request.formData();
  const usageLimitId = data.get('usage_limit_id') as string;
  // ruleid: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/usage-limits/${usageLimitId}`, {
    method: 'DELETE',
  });
}

async function unsafeSessionCheck(event: RequestEvent) {
  const sessionId = event.url.searchParams.get('session_id');
  // ruleid: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/activity-session/status/${sessionId}`);
}

async function unsafeQueryParam(event: RequestEvent) {
  const data = await event.request.formData();
  const tokenId = data.get('token_id') as string;
  // ruleid: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/auth/subscription-tokens?token_id=${tokenId}`, {
    method: 'DELETE',
  });
}

// ---- TRUE NEGATIVES: should NOT trigger ----

async function safeWithSanitizePathParam(event: RequestEvent) {
  const data = await event.request.formData();
  const usageLimitId = validateURLParam(data.get('usage_limit_id') as string, 'usage_limit_id');
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/usage-limits/${usageLimitId}`, {
    method: 'PATCH',
  });
}

async function safeWithEncodeURIComponent(event: RequestEvent) {
  const data = await event.request.formData();
  const planId = encodeURIComponent(data.get('plan_id') as string);
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/plans/${planId}`);
}

async function safeInlineSanitize(event: RequestEvent) {
  const sessionId = event.url.searchParams.get('session_id');
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/activity-session/status/${validateURLParam(sessionId!, 'session_id')}`);
}

async function safeInlineEncode(event: RequestEvent) {
  const data = await event.request.formData();
  const tokenId = data.get('token_id') as string;
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/auth/subscription-tokens?token_id=${encodeURIComponent(tokenId)}`, {
    method: 'DELETE',
  });
}

async function safeStaticPath(event: RequestEvent) {
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch('/api/plans');
}

async function safeNoUserInput(event: RequestEvent) {
  const operation = 'update';
  // ok: sveltekit-event-fetch-path-traversal
  const response = await event.fetch(`/api/billing/payment-method?action=${operation}`, {
    method: 'POST',
  });
}
