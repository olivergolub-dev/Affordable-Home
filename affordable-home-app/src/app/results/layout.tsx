import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affordable Housing Listings',
  description:
    'Browse verified affordable housing listings in Essex County, NJ — Section 8, LIHTC, senior housing, and more, each with its official source and last-verified date.',
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
