import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import QuizEditor from '@/components/QuizEditor';

async function getQuiz(id) {
    if (!id) {
        console.error('Quiz ID is undefined');
        return notFound();
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    console.log('Fetching quiz with ID:', id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    }); if (!res.ok) {
        return notFound();
    }

    return res.json();
}

export default async function EditQuiz({ params }) {
    const resolvedParams = await Promise.resolve(params);
    const quizId = resolvedParams?.value?.id || resolvedParams?.id;

    const quiz = await getQuiz(quizId);
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Edit Quiz</h1>
            <QuizEditor quiz={quiz} />
        </div>
    );
}