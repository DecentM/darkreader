import '../polyfills';
import {DEFAULT_THEME} from '../../../src/defaults';
import {createOrUpdateDynamicTheme, removeDynamicTheme} from '../../../src/inject/dynamic-theme';
import {multiline, timeout} from '../../test-utils';

const theme = {
    ...DEFAULT_THEME,
    darkSchemeBackgroundColor: 'black',
    darkSchemeTextColor: 'white',
};
let container: HTMLElement;

beforeEach(() => {
    container = document.body;
    container.innerHTML = '';
});

afterEach(() => {
    removeDynamicTheme();
    container.innerHTML = '';
});

describe('Handle Media Queries', () => {
    it('should not style blacklisted media', async () => {
        container.innerHTML = multiline(
            '<style class="testcase-style">',
            '    h1 { background: green; }',
            '    h1 strong { color: orange; }',
            '</style>',
            '<style class="testcase-style-2" media="print">',
            '    h1 { background: gray; }',
            '    h1 strong { color: red; }',
            '</style>',
            '<h1>Some test foor...... <strong>Oh uhm removing styles :(</strong>!</h1>',
        );

        createOrUpdateDynamicTheme(theme, null, false);
        await timeout(100);

        expect(getComputedStyle(document.querySelector('h1')).backgroundColor).toBe('rgb(0, 102, 0)');
        expect(getComputedStyle(document.querySelector('h1 strong')).color).toBe('rgb(255, 174, 26)');
        expect(document.querySelector('.testcase-style-2').nextElementSibling.classList.contains('darkreader--sync')).toBe(false);
    });

    it('should style lazyloaded media', async () => {
        container.innerHTML = multiline(
            '<style class="testcase-style" media="print" onload="this.media=`screen`">',
            '    h1 { background: green; }',
            '    h1 strong { color: orange; }',
            '</style>',
            '<h1>Some test foor...... <strong>Oh uhm removing styles :(</strong>!</h1>',
        );

        createOrUpdateDynamicTheme(theme, null, false);
        await timeout(100);

        expect(getComputedStyle(document.querySelector('h1')).backgroundColor).toBe('rgb(0, 102, 0)');
        expect(getComputedStyle(document.querySelector('h1 strong')).color).toBe('rgb(255, 174, 26)');
        expect(document.querySelector('.testcase-style').nextElementSibling.classList.contains('darkreader--sync')).toBe(true);
    });

    it('should check for CSS support', async () => {
        container.innerHTML = multiline(
            '<style class="testcase-style">',
            '    @supports (background: green) {',
            '       h1 { background: green; }',
            '    }',
            '    @supports (color: orange) {',
            '       h1 strong { color: orange; }',
            '    }',
            '    @supports (some-non-existing-prop: some-value) {',
            '       body { background: pink; }',
            '    }',
            '</style>',
            '<h1>Some test foor...... <strong>Oh uhm removing styles :(</strong>!</h1>',
        );

        createOrUpdateDynamicTheme(theme, null, false);
        await timeout(100);

        expect(getComputedStyle(document.querySelector('h1')).backgroundColor).toBe('rgb(0, 102, 0)');
        expect(getComputedStyle(document.querySelector('h1 strong')).color).toBe('rgb(255, 174, 26)');
        expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(0, 0, 0)');
    });

});
