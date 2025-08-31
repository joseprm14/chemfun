import { renderWithProviders, screen } from '../test-utils';
import { useI18n, I18nProvider } from '@/src/lib/i18n';
import { act } from 'react';


function Title() {
    const { t } = useI18n();
    return <h1>{t('title')}</h1>;
}


describe('i18n', () => {
    test('traduce title', () => {
        renderWithProviders(<Title />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ChemFun');
    });


    test('cambia de idioma', () => {
        function App() {
            const { setLocale } = useI18n();
            return (
                <div>
                    <Title />
                    <button onClick={() => setLocale('en')}>EN</button>
                </div>
            );
        }


        renderWithProviders(<App />);
        act(() => screen.getByText('EN').click());
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ChemFun');
    });
});