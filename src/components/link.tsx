type ExternalLinkProps = Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'target' | 'rel'
>;

export const ExternalLink: React.FC<ExternalLinkProps> = (props) => {
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
};
