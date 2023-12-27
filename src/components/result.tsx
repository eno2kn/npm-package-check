import { memo } from 'react';
import { cn } from '../lib/utils';

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

export type Status = 'initial' | 'loading' | 'success' | 'error';

export const ResultIcon: React.FC<{
  status: Status;
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

export const Result: React.FC<{
  status: Status;
  label: string;
  value: undefined | string | number;
}> = memo(function Result({ status, label, value }) {
  return (
    <div
      className={cn([
        'flex items-center gap-4 rounded border border-gray-200 bg-gray-50 p-4',
        status === 'initial' && 'opacity-50',
      ])}
    >
      <ResultIcon status={status} />
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-700">{label}</div>
        {typeof value === 'undefined' ? (
          <div className="h-6" />
        ) : (
          <div className="text-base leading-6">
            {typeof value === 'number' ? value.toLocaleString('ja-JP') : value}
          </div>
        )}
      </div>
    </div>
  );
});
