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

            if (!res.ok) {
                throw new Error('Quiz not found');
            }

            setQuiz(data);
            // Initialize answers
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers: formattedAnswers }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit quiz');
            }

            // Redirect to results page with score
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
        return <div className="text-center py-8">Loading quiz...</div>;
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <Card className="mb-8">
                <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
                {quiz.description && (
                    <p className="text-gray-600">{quiz.description}</p>
                )}
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
                {quiz.questions.map((question, index) => (
                    <Card key={question._id}>
                        <div className="space-y-4">
                            <h2 className="font-medium">
                                Question {index + 1}: {question.question}
                            </h2>

                            {question.type === 'MCQ' && (
                                <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <label key={optionIndex} className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                name={question._id}
                                                value={option}
                                                checked={answers[question._id] === option}
                                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                required
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {question.type === 'TRUE_FALSE' && (
                                <div className="space-x-4">
                                    <label className="inline-flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={question._id}
                                            value="true"
                                            checked={answers[question._id] === true}
                                            onChange={() => handleAnswerChange(question._id, true)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            required
                                        />
                                        <span>True</span>
                                    </label>
                                    <label className="inline-flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={question._id}
                                            value="false"
                                            checked={answers[question._id] === false}
                                            onChange={() => handleAnswerChange(question._id, false)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                            required
                                        />
                                        <span>False</span>
                                    </label>
                                </div>
                            )}

                            {question.type === 'TEXT' && (
                                <input
                                    type="text"
                                    value={answers[question._id]}
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                />
                            )}
                        </div>
                    </Card>
                ))}

                <div className="flex justify-end space-x-4">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                </div>
            </form>
        </div>
    );
}