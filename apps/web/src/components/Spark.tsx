/** The logo's four-square pixel sparkle: list marker, divider, clause mark
 *  and loading state. Decorative — meaning always sits in adjacent text. */
export const Spark = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => (
  <span className={`spark${size === 'md' ? '' : ` spark--${size}`}${className ? ` ${className}` : ''}`} aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </span>
);
