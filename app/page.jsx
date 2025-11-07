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
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-3">
            Explore Available Quizzes
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Challenge yourself and test your knowledge across multiple topics.
          </p>
        </div>

        {/* Quizzes Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h2>

                  {quiz.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {quiz.questions.length} Questions
                  </span>
                  <Link
                    href={`/quiz/${quiz._id}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1 transition-colors"
                  >
                    Take Quiz
                    <span className="text-lg">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {quizzes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No quizzes available yet
              </h3>
              <p className="text-gray-500">
                Check back soon — new quizzes are on the way!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
