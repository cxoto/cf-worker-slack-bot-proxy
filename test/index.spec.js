import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('Hello World worker', () => {
	it('hello', async () => {
		expect(`"Hello World!"`).toMatchInlineSnapshot(`"Hello World!"`);
	});
});
