import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';


// Polyfills necesarios en JSDOM
(global as any).TextEncoder = TextEncoder as any;
(global as any).TextDecoder = TextDecoder as any;


// Mock por defecto de next/navigation (se puede sobreescribir por test)
jest.mock('next/navigation', () => require('./__mocks__/nextNavigationMock'));

beforeEach(() => {
  // Evita que I18nProvider haga setState por efecto
  try { localStorage.removeItem('locale'); } catch {}
});