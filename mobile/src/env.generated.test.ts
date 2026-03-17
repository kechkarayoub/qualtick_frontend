import env from './env.generated';

describe('env.generated', () => {
	it('exports a populated env object with key configuration values', () => {
		expect(env).toBeDefined();
		expect(typeof env.REACT_APP_NAME).toBe('string');
		expect(env.REACT_APP_NAME).toBe('Qualitick');
		expect(env.REACT_APP_VERSION).toBe('1.0.0');
		expect(env.REACT_APP_BACKEND_ENDPOINT).toContain('http');
		expect(env.REACT_APP_SUPPORT_EMAIL).toContain('@');
		expect(env.REACT_APP_ENABLE_GOOGLE_LOGIN).toMatch(/^(true|false)$/);
		expect(env.REACT_APP_USE_WEBSOCKETS).toMatch(/^(true|false)$/);
	});

	it('includes expected firebase and websocket related keys', () => {
		expect(env.REACT_APP_FIREBASE_WEB_API_KEY).toBeTruthy();
		expect(env.REACT_APP_FIREBASE_WEB_PROJECT_ID).toBeTruthy();
		expect(env.REACT_APP_WS_BACKEND_HOST).toBeTruthy();
		expect(env.REACT_APP_WS_BACKEND_PORT).toBeTruthy();
	});

	it('contains no undefined values in generated entries', () => {
		const values = Object.values(env);
		expect(values.length).toBeGreaterThan(0);
		expect(values.every(value => value !== undefined)).toBe(true);
	});
});

