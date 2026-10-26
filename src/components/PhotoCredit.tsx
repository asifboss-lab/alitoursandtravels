import { imageCreditByKey, imageCredits, type ImageCredit } from '../content/imageCredits';

interface PhotoCreditProps {
  /** Key from src/content/imageCredits.ts. */
  name: string;
  /** Prefix describing what the photograph illustrates. */
  prefix?: string;
  className?: string;
}

/**
 * Attribution line for a photograph.
 *
 * Every photograph on this site is used under a Creative Commons licence, which
 * requires the photographer, the licence and a link to the source to be shown
 * wherever the image appears. Rendering that here rather than inline keeps the
 * obligation in one place and impossible to forget.
 */
export function PhotoCredit({ name, prefix, className }: PhotoCreditProps) {
  const credit: ImageCredit | undefined = imageCreditByKey[name];
  if (!credit) return null;

  return (
    <span className={className}>
      {prefix ? `${prefix} ` : 'Photograph: '}
      <a href={credit.source} target="_blank" rel="noopener noreferrer">
        {credit.title}
      </a>{' '}
      by {credit.artist}, licensed under{' '}
      <a href={credit.licenceUrl} target="_blank" rel="noopener noreferrer">
        {credit.licence}
      </a>
      .
    </span>
  );
}

/**
 * Full list of every photograph used on the site, with its author and licence.
 *
 * Defaults to every image in the credits file, so a newly added photograph is
 * credited automatically instead of being missed.
 */
export function PhotoCreditsList({ names }: { names?: string[] }) {
  const credits = (names
    ? names.map((name) => imageCreditByKey[name]).filter(Boolean)
    : imageCredits
  ) as ImageCredit[];

  return (
    <ul className="credit-list">
      {credits.map((credit) => (
        <li key={credit.key}>
          <a href={credit.source} target="_blank" rel="noopener noreferrer">
            {credit.title}
          </a>{' '}
          by {credit.artist}, licensed under{' '}
          <a href={credit.licenceUrl} target="_blank" rel="noopener noreferrer">
            {credit.licence}
          </a>
          .
        </li>
      ))}
    </ul>
  );
}
