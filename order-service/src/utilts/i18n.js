import i18n from 'i18n';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

i18n.configure({
    locales: ['en', 'ar'],
    directory: join(__dirname, 'locales'),
    defaultLocale: 'en',
    queryParameter: 'lang',
    objectNotation: true
});

export default i18n;