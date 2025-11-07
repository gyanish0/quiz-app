import QuizEditor from '@/components/QuizEditor';

export default function NewQuiz() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Quiz</h1>
      <QuizEditor />
    </div>
  );
}