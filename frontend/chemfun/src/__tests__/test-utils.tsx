import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { I18nProvider } from '@/src/lib/i18n';


function AllProviders({ children }: { children: ReactNode }) {
    return <I18nProvider>{children}</I18nProvider>;
}


export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export function renderWithProviders(ui: React.ReactElement) {
    return render(ui, { wrapper: AllProviders });
}