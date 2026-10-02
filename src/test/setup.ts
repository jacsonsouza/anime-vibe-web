import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Globals desativados no Vitest → o auto-cleanup do RTL não dispara sozinho.
afterEach(cleanup);
