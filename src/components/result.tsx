import { memo } from 'react';
import { Circle, CheckCircle, AlertCircle, LoaderCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export type Status = 'initial' | 'loading' | 'success' | 'error';

export const ResultIcon: React.FC<{
  status: Status;
}> = ({ status }) => {
  switch (status) {
    case 'initial':
      return <Circle className="w-6 h-6 text-gray-400" />;
    case 'loading':
      return <LoaderCircle className="w-6 h-6 text-gray-400 animate-spin" />;
    case 'success':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    default:
      break;
  }
};

export const Result: React.FC<{
  status: Status;
  label: string;
  value: undefined | string | number;
  counter?: string;
}> = memo(function Result({ status, label, value, counter }) {
  return (
    <div
      className={cn([
        'flex flex-col gap-x-4 gap-y-1 relative rounded border border-gray-200 bg-gray-50 p-4 pl-14',
        status === 'initial' && 'opacity-50',
      ])}
    >
      <dt className="text-sm text-gray-700">{label}</dt>
      <dd>
        {typeof value === 'undefined' ? (
          <div className="h-6" />
        ) : (
          <div className="text-base leading-6">
            {typeof value === 'number' ? value.toLocaleString('ja-JP') : value}
            {counter && <span className="text-sm">{counter}</span>}
          </div>
        )}
        <div
          className="absolute top-1/2 left-4 -translate-y-1/2"
          aria-hidden="true"
        >
          <ResultIcon status={status} />
        </div>
      </dd>
    </div>
  );
});
