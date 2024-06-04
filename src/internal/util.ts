import { FrontendLocaleData } from 'custom-card-helpers';
import memoizeOne from 'memoize-one';

// Creates a type predicate function for determining if an array literal includes a given value
export const arrayLiteralIncludes =
  <T extends readonly unknown[]>(array: T) =>
  (searchElement: unknown, fromIndex?: number): searchElement is T[number] =>
    array.includes(searchElement as T[number], fromIndex);

export const UNAVAILABLE = 'unavailable';
export const UNKNOWN = 'unknown';

export const UNAVAILABLE_STATES = [UNAVAILABLE, UNKNOWN] as const;

export const isUnavailableState = arrayLiteralIncludes(UNAVAILABLE_STATES);

export const blankBeforeUnit = (unit: string, localeOptions: FrontendLocaleData | undefined): string => {
  if (unit === '°') {
    return '';
  }
  if (localeOptions && unit === '%') {
    return blankBeforePercent(localeOptions);
  }
  return ' ';
};

// Logic based on https://en.wikipedia.org/wiki/Percent_sign#Form_and_spacing
export const blankBeforePercent = (localeOptions: FrontendLocaleData): string => {
  switch (localeOptions.language) {
    case 'cz':
    case 'de':
    case 'fi':
    case 'fr':
    case 'sk':
    case 'sv':
      return ' ';
    default:
      return '';
  }
};

// Handle 16x9, 16:9, 1.78x1, 1.78:1, 1.78
// Ignore everything else
const parseOrThrow = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) {
    throw new Error(`${num} is not a number`);
  }
  return parsed;
};

export default function parseAspectRatio(input: string) {
  if (!input) {
    return null;
  }
  try {
    if (input.endsWith('%')) {
      return { w: 100, h: parseOrThrow(input.substr(0, input.length - 1)) };
    }

    const arr = input.replace(':', 'x').split('x');
    if (arr.length === 0) {
      return null;
    }

    return arr.length === 1 ? { w: parseOrThrow(arr[0]), h: 1 } : { w: parseOrThrow(arr[0]), h: parseOrThrow(arr[1]) };
  } catch (err: any) {
    // Ignore the error
  }
  return null;
}

const collator = memoizeOne((language: string | undefined) => new Intl.Collator(language));

const fallbackStringCompare = (a: string, b: string) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }

  return 0;
};

export const stringCompare = (a: string, b: string, language: string | undefined = undefined) => {
  // @ts-ignore
  if (Intl?.Collator) {
    return collator(language).compare(a, b);
  }

  return fallbackStringCompare(a, b);
};
