'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card } from '@/components/ui';

export default function AdminQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuizzes();
    }, []);

    async function fetchQuizzes() {
        try {
            const res = await fetch('/api/quizzes');
            const data = await res.json();
            setQuizzes(data);
        } catch (err) {
            setError('Failed to fetch quizzes');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Are you sure you want to delete this quiz?')) {
            return;
        }

        try {
            const token = document.cookie
                .split('; ')
                .find((row) => row.startsWith('admin_token='))
                ?.split('=')[1];

            const res = await fetch(`/api/quizzes/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to delete quiz');
            }

            fetchQuizzes();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-600">
                    <svg
                        className="animate-spin h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-lg">Loading quizzes…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Quizzes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage and review all quizzes. Create, edit or delete as needed.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/admin/quizzes/new" className="block">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow">
                            + Create New Quiz
                        </Button>
                    </Link>
                </div>
            </header>

            {error && (
                <div className="mb-6">
                    <div className="rounded-md bg-red-50 border border-red-100 p-4 text-red-700">
                        {error}
                    </div>
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {quizzes.length === 0 && (
                    <div className="col-span-full">
                        <Card className="p-8 text-center border-dashed border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800">No quizzes created yet</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Use the <strong>Create New Quiz</strong> button to add your first quiz.
                            </p>
                        </Card>
                    </div>
                )}

                {quizzes.map((quiz) => (
                    <Card
                        key={quiz._id}
                        className="relative overflow-hidden p-4 rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                        {/* Gradient accent */}
                        <div className="absolute -top-6 -right-20 w-56 h-56 bg-gradient-to-tr from-indigo-200 to-transparent opacity-30 transform rotate-45 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="pr-2">
                                        <h2 className="text-lg font-semibold text-gray-900">{quiz.title}</h2>
                                        {quiz.description && (
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-3">{quiz.description}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 010 4H7a2 2 0 010-4m5-8v8" />
                                            </svg>
                                            {quiz.questions.length}
                                            <span className="sr-only">questions</span>
                                        </span>
                                        <span className="text-xs text-gray-400 mt-2">Questions</span>
                                    </div>
                                </div>

                                <div className="mt-4 text-sm text-gray-500">
                                    {/* You can show more meta here later */}
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <Link href={`/admin/quizzes/${quiz._id}/edit`}>
                                    <Button
                                        className="bg-indigo-50 text-black!  border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                                    >
                                        Edit
                                    </Button>
                                </Link>


                                <div className="flex items-center gap-2 ml-auto">
                                    <Button
                                        onClick={() => handleDelete(quiz._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md shadow-sm"
                                    >
                                        Delete
                                    </Button>

                                    <Link
                                        href={`/quiz/${quiz._id}`}
                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-all"
                                    >
                                        View
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 ml-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
