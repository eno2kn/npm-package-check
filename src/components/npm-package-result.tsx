import { cn } from '../lib/utils';

type NpmPackageResultContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const Container: React.FC<NpmPackageResultContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn([
        'flex items-center gap-4 rounded border border-gray-200 bg-gray-50 p-4',
        className,
      ])}
    >
      {children}
    </div>
  );
};

const Content: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="flex flex-col gap-1">{children}</div>;
};

const Result: React.FC<{
  value: unknown;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return value ? <div>{children}</div> : <div className="h-6" />;
};

const Label: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="text-sm text-gray-700">{children}</div>;
};

const IconCircle: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
};

const IconCheckCircle: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-500"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
};

const IconAlertCircle: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-500"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
};

const IconLoader: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400 animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const Icon: React.FC<{
  status: 'initial' | 'loading' | 'success' | 'error';
}> = ({ status }) => {
  switch (status) {
    case 'initial':
      return <IconCircle />;
    case 'loading':
      return <IconLoader />;
    case 'success':
      return <IconCheckCircle />;
    case 'error':
      return <IconAlertCircle />;
    default:
      break;
  }
};

export const NpmPackageResult = Object.assign(
  {},
  {
    Container,
    Content,
    Result,
    Label,
    Icon,
  },
);
