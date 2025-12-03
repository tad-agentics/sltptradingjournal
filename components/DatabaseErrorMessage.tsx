import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface DatabaseErrorMessageProps {
  onRetry: () => void;
}

export function DatabaseErrorMessage({ onRetry }: DatabaseErrorMessageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="size-16 mx-auto text-yellow-500" />
        <h2 className="text-xl font-bold">Database Setup Required</h2>
        <p className="text-muted-foreground">
          It looks like the database migration hasn't been run yet. Please run the SQL migration in your Supabase dashboard.
        </p>
        <div className="bg-muted rounded-lg p-4 text-left text-sm space-y-2">
          <p className="font-medium">Quick Fix:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Go to Supabase SQL Editor</li>
            <li>Run the migration from <code className="bg-background px-1 rounded">supabase-auth-migration.sql</code></li>
            <li>Come back and click Retry</li>
          </ol>
        </div>
        <Button onClick={onRetry} className="w-full">
          Retry Loading
        </Button>
      </div>
    </div>
  );
}
