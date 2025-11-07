'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';

export default function QuizResults() {
  const searchParams = useSearchParams();
  const score = searchParams.get('score');
  const total = searchParams.get('total');
  const percentage = ((score / total) * 100).toFixed(1);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <div className="text-4xl font-bold text-blue-600">
            {score} / {total}
          </div>
          <p className="text-xl">
            You scored {percentage}%
          </p>
          <div className="pt-6">
            <Link href="/">
              <Button>Return to Quiz List</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}