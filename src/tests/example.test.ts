import { describe, it, expect } from 'vitest';

describe('Example setup test', () => {
    it('should run successfully and recognize DOM matchers', () => {
        document.body.innerHTML = '<div data-testid="test-div">Hello</div>';
        const el = document.querySelector('[data-testid="test-div"]');
        expect(el).toBeInTheDocument();
    });
});
