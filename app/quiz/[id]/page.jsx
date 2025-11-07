'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';

export default function TakeQuiz({ params }) {
    const router = useRouter();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuiz();
    }, []);

    async function fetchQuiz() {
        const resolvedParams = await Promise.resolve(params);
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;
        try {
            const res = await fetch(`/api/quizzes/${quizId}`);
            const data = await res.json();

            if (!res.ok) throw new Error('Quiz not found');

            setQuiz(data);
            const initialAnswers = {};
            data.questions.forEach((q) => {
                initialAnswers[q._id] = q.type === 'TRUE_FALSE' ? false : '';
            });
            setAnswers(initialAnswers);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        const resolvedParams = await Promise.resolve(params);
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;

        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer,
            }));

            const res = await fetch(`/api/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: formattedAnswers }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit quiz');

            router.push(`/quiz/${params.id}/results?score=${data.score}&total=${data.maxScore}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleAnswerChange(questionId, value) {
        setAnswers({
            ...answers,
            [questionId]: value,
        });
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
                <div className="text-lg font-medium text-gray-600 animate-pulse">
                    Loading quiz...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto mt-20 p-6">
                <div className="bg-red-100 text-red-700 border border-red-200 p-4 rounded-lg shadow-sm text-center">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Card className="p-8 mb-10 shadow-lg border border-gray-100 bg-white rounded-2xl">
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">{quiz.title}</h1>
                    {quiz.description && (
                        <p className="text-gray-600 leading-relaxed">{quiz.description}</p>
                    )}
                </Card>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 bg-white border border-gray-100 shadow-md rounded-2xl p-8"
                >
                    {quiz.questions.map((question, index) => (
                        <div
                            key={question._id}
                            className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {index + 1}. {question.question}
                            </h2>

                            {/* MCQ */}
                            {question.type === 'MCQ' && (
                                <div className="grid gap-3">
                                    {question.options.map((option, optionIndex) => (
                                        <label
                                            key={optionIndex}
                                            className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-all ${answers[question._id] === option
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                }`}
                                        >
                                            <span className="text-gray-700">{option}</span>
                                            <input
                                                type="radio"
                                                name={question._id}
                                                value={option}
                                                checked={answers[question._id] === option}
                                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                                className="h-6 w-6 text-indigo-600 focus:ring-indigo-500 w-0"
                                                required
                                            />
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* TRUE/FALSE */}
                            {question.type === 'TRUE_FALSE' && (
                                <div className="flex gap-4 mt-2">
                                    {['True', 'False'].map((val) => {
                                        const boolValue = val === 'True';
                                        return (
                                            <label
                                                key={val}
                                                className={`flex-1 text-center border rounded-lg py-2 cursor-pointer transition-all ${answers[question._id] === boolValue
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={question._id}
                                                    value={val.toLowerCase()}
                                                    checked={answers[question._id] === boolValue}
                                                    onChange={() => handleAnswerChange(question._id, boolValue)}
                                                    className="hidden"
                                                    required
                                                />
                                                {val}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {/* TEXT */}
                            {question.type === 'TEXT' && (
                                <input
                                    type="text"
                                    value={answers[question._id]}
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    className="mt-2 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm p-2.5"
                                    placeholder="Type your answer here..."
                                    required
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-base font-medium shadow-sm transition-all"
                        >
                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                        </Button>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-700 border border-red-200 p-3 rounded-lg mt-4 text-sm">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
