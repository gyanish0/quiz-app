'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button, Card } from '@/components/ui';

const questionTypes = [
    { id: 'MCQ', label: 'Multiple Choice' },
    { id: 'TRUE_FALSE', label: 'True/False' },
    { id: 'TEXT', label: 'Text' },
];

export default function QuizEditor({ quiz = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [questions, setQuestions] = useState(quiz?.questions || []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.target);
        const quizData = {
            title: formData.get('title'),
            description: formData.get('description'),
            questions,
        };

        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('admin_token='))
                ?.split('=')[1];

            const url = quiz ? `/api/quizzes/${quiz._id}` : '/api/quizzes';
            const method = quiz ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(quizData),
            });

            if (!res.ok) throw new Error('Failed to save quiz');
            router.push('/admin/quizzes');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function addQuestion() {
        setQuestions([
            ...questions,
            {
                type: 'MCQ',
                question: '',
                options: ['', ''],
                correctAnswer: '',
                points: 1,
            },
        ]);
    }

    function updateQuestion(index, field, value) {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    }

    function removeQuestion(index) {
        setQuestions(questions.filter((_, i) => i !== index));
    }

    function addOption(questionIndex) {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.push('');
        setQuestions(newQuestions);
    }

    function updateOption(questionIndex, optionIndex, value) {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(newQuestions);
    }

    function removeOption(questionIndex, optionIndex) {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
            (_, i) => i !== optionIndex
        );
        setQuestions(newQuestions);
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <form
                onSubmit={handleSubmit}
                className="space-y-10 bg-white shadow-xl rounded-2xl p-8 border border-gray-100 transition-all"
            >
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        {quiz ? 'Edit Quiz' : 'Create New Quiz'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fill in the quiz details and add your questions below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Quiz Title"
                        name="title"
                        defaultValue={quiz?.title}
                        required
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    />
                    <Input
                        label="Description (Optional)"
                        name="description"
                        defaultValue={quiz?.description}
                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Questions Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-medium text-gray-800">Questions</h2>
                        <Button
                            type="button"
                            onClick={addQuestion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-all"
                        >
                            + Add Question
                        </Button>
                    </div>

                    {questions.length === 0 && (
                        <div className="p-6 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                            No questions added yet. Click “Add Question” to get started.
                        </div>
                    )}

                    {questions.map((question, questionIndex) => (
                        <div
                            key={questionIndex}
                            className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Question {questionIndex + 1}
                                </h3>
                                <Button
                                    type="button"
                                    onClick={() => removeQuestion(questionIndex)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                                >
                                    Remove
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Question Type
                                    </label>
                                    <select
                                        value={question.type}
                                        onChange={(e) =>
                                            updateQuestion(questionIndex, 'type', e.target.value)
                                        }
                                        className="block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {questionTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Points"
                                    type="number"
                                    min="1"
                                    value={question.points}
                                    onChange={(e) =>
                                        updateQuestion(questionIndex, 'points', parseInt(e.target.value))
                                    }
                                    className="rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <Input
                                label="Question Text"
                                value={question.question}
                                onChange={(e) =>
                                    updateQuestion(questionIndex, 'question', e.target.value)
                                }
                                required
                                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            />

                            {question.type === 'MCQ' && (
                                <div className="mt-4 space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Options
                                    </label>
                                    {question.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className="flex items-center gap-2 mb-2"
                                        >
                                            <Input
                                                value={option}
                                                onChange={(e) =>
                                                    updateOption(questionIndex, optionIndex, e.target.value)
                                                }
                                                required
                                                className="flex-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => removeOption(questionIndex, optionIndex)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                                                disabled={question.options.length <= 2}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() => addOption(questionIndex)}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        + Add Option
                                    </Button>
                                </div>
                            )}

                            <div className="mt-5">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Correct Answer
                                </label>
                                {question.type === 'MCQ' ? (
                                    <select
                                        value={question.correctAnswer}
                                        onChange={(e) =>
                                            updateQuestion(questionIndex, 'correctAnswer', e.target.value)
                                        }
                                        required
                                        className="block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select correct answer</option>
                                        {question.options.map((option, i) => (
                                            <option key={i} value={option}>
                                                {option || `Option ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : question.type === 'TRUE_FALSE' ? (
                                    <select
                                        value={question.correctAnswer}
                                        onChange={(e) =>
                                            updateQuestion(
                                                questionIndex,
                                                'correctAnswer',
                                                e.target.value === 'true'
                                            )
                                        }
                                        required
                                        className="block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                ) : (
                                    <Input
                                        value={question.correctAnswer}
                                        onChange={(e) =>
                                            updateQuestion(questionIndex, 'correctAnswer', e.target.value)
                                        }
                                        required
                                        className="rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all"
                    >
                        {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
                    </Button>
                </div>

                {error && (
                    <div className="mt-4 bg-red-100 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
}
