import Link from 'next/link';
import { Card } from '@/components/ui';

async function getQuizzes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes`, {
    cache: 'no-store'
  });
  return res.json();
}

export default async function Home() {
  const quizzes = await getQuizzes();
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Available Quizzes</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz._id}>
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              {quiz.description && (
                <p className="text-gray-600 mb-4">{quiz.description}</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {quiz.questions.length} questions
                </span>
                <Link
                  href={`/quiz/${quiz._id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Take Quiz →
                </Link>
              </div>
            </Card>
          ))}
          {quizzes.length === 0 && (
            <p className="text-gray-500 col-span-2 text-center py-8">
              No quizzes available yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
