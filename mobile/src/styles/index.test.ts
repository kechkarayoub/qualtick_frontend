import styles, {
	borderRadius,
	componentStyles,
	createButtonStyle,
	createCardStyle,
	createInputStyle,
	darkColors,
	globalStyles,
	lightColors,
	shadows,
	spacing,
	typography,
} from './index';

describe('styles index', () => {
	it('exports core design tokens', () => {
		expect(lightColors.primary).toBe('#007AFF');
		expect(darkColors.background).toBe('#000000');
		expect(typography.fontSize.base).toBe(16);
		expect(spacing.base).toBe(16);
		expect(borderRadius.base).toBe(8);
		expect(shadows.base.elevation).toBe(2);
	});

	it('creates button styles with variant, size, and custom overrides', () => {
		const buttonStyle = createButtonStyle('primary', 'md', lightColors, {
			borderWidth: 2,
		});

		expect(buttonStyle.backgroundColor).toBe(lightColors.primary);
		expect(buttonStyle.minHeight).toBe(componentStyles.button.sizes.md.minHeight);
		expect(buttonStyle.borderRadius).toBe(componentStyles.button.base.borderRadius);
		expect(buttonStyle.borderWidth).toBe(2);
	});

	it('creates input and card styles with expected color bindings', () => {
		const inputStyle = createInputStyle('sm', lightColors, { marginTop: 10 });
		expect(inputStyle.backgroundColor).toBe(lightColors.surface);
		expect(inputStyle.borderColor).toBe(lightColors.border);
		expect(inputStyle.color).toBe(lightColors.text);
		expect(inputStyle.minHeight).toBe(componentStyles.input.sizes.sm.minHeight);
		expect(inputStyle.marginTop).toBe(10);

		const cardStyle = createCardStyle(lightColors, { marginBottom: 12 });
		expect(cardStyle.backgroundColor).toBe(lightColors.surface);
		expect(cardStyle.shadowColor).toBe(lightColors.shadow);
		expect(cardStyle.elevation).toBe(shadows.base.elevation);
		expect(cardStyle.marginBottom).toBe(12);
	});

	it('includes expected global style presets and default export members', () => {
		expect(globalStyles.container.flex).toBe(1);
		expect(globalStyles.centerContent.justifyContent).toBe('center');
		expect(globalStyles.buttonBase.minHeight).toBe(componentStyles.button.sizes.md.minHeight);
		expect(globalStyles.inputBase.fontSize).toBe(componentStyles.input.sizes.md.fontSize);

		expect(styles.createButtonStyle).toBe(createButtonStyle);
		expect(styles.lightColors).toBe(lightColors);
		expect(styles.darkColors).toBe(darkColors);
	});
});

