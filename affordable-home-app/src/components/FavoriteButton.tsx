'use client';

/**
 * Presentational heart toggle. State (favorited / logged-in) and the toggle
 * handler live in the parent (results page) so all cards share one favorites
 * set and one auth check.
 */
export function FavoriteButton({
  favorited,
  busy,
  onToggle,
  label,
}: {
  favorited: boolean;
  busy?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? `Remove ${label} from saved` : `Save ${label}`}
      title={favorited ? 'Saved — click to remove' : 'Save this listing'}
      onClick={onToggle}
      disabled={busy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${favorited ? '#FBCFE8' : '#E2E8F0'}`,
        background: favorited ? '#FDF2F8' : '#FFFFFF',
        cursor: busy ? 'default' : 'pointer',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? '#DB2777' : 'none'} stroke={favorited ? '#DB2777' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
    </button>
  );
}
