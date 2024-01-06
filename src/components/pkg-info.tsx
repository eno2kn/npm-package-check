import { ExternalLink } from './link';

export const PkgInfoLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  return (
    <ExternalLink href={href} className="flex items-center gap-2">
      {children}
    </ExternalLink>
  );
};
