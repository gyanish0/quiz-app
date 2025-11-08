'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';

export default function TakeQuiz({ params }) {
    const router = useRouter();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [questions, setQuestions] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(30);
    // progressBarWidth will be calculated dynamically

    // Utility: Fisher-Yates shuffle
    function shuffleArray(arr) {
        const a = Array.isArray(arr) ? [...arr] : [];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

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
            // shuffle questions once for this attempt
            const shuffled = shuffleArray(data.questions || []);
            // initialize answers based on shuffled questions
            shuffled.forEach((q) => {
                initialAnswers[q._id] = q.type === 'TRUE_FALSE' ? null : '';
            });
            setQuestions(shuffled);
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

            router.push(`/quiz/${quizId}/results?score=${data.score}&total=${data.maxScore}`);
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

    // Timer: reset when currentIndex or questions change
    useEffect(() => {
        setSecondsLeft(30);
        if (!questions) return;
        const timer = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    // time up -> advance
                    clearInterval(timer);
                    // auto-advance after ensuring state set
                    setTimeout(() => {
                        handleAdvanceOnTimeout();
                    }, 0);
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, questions]);

    function handleAdvanceOnTimeout() {
        // If last question -> submit automatically
        if (!questions) return;
        const isLast = currentIndex === questions.length - 1;
        if (isLast) {
            // submit even if unanswered
            handleSubmit(new Event('submit'));
            return;
        }
        setCurrentIndex((i) => i + 1);
    }

    function canAdvance(index) {
        if (!questions) return false;
        const q = questions[index];
        if (!q) return false;
        const a = answers[q._id];
        // consider answered when not null/empty
        if (q.type === 'TRUE_FALSE') return a === true || a === false;
        return a !== '' && a != null;
    }

    function handleNext() {
        if (!questions) return;
        if (!canAdvance(currentIndex)) return; // require answer
        const isLast = currentIndex === questions.length - 1;
        if (isLast) {
            // trigger submit
            handleSubmit(new Event('submit'));
            return;
        }
        setCurrentIndex((i) => i + 1);
    }

    function handlePrev() {
        setCurrentIndex((i) => Math.max(0, i - 1));
    }
    // questions are shuffled and stored in `questions` state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-linear-to-br from-indigo-50 to-white">
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

    const percent = questions ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-linear-to-b from-indigo-50 via-white to-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="w-full h-2 bg-gray-200 rounded mb-6">
                    <div className="h-2 bg-green-500 rounded" style={{ width: `${percent}%` }} />
                </div>
                <Card className="p-8 mb-6 shadow-lg border border-gray-100 bg-white rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">Question {currentIndex + 1} of {questions ? questions.length : 0}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Time left</div>
                            <div className="text-xl font-semibold text-indigo-600">{secondsLeft}s</div>
                        </div>
                    </div>
                </Card>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-8 bg-white border border-gray-100 shadow-md rounded-2xl p-8"
                >
                    {/** Only render current question */}
                    {(() => {
                        const question = questions ? questions[currentIndex] : null;
                        if (!question) return (
                            <div className="p-6 text-center text-gray-500">No question available.</div>
                        );
                        return (
                            <div key={question._id} className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">{currentIndex + 1}. {question.question}</h2>

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
                                                    className="h-6 w-6 text-indigo-600 focus:ring-indigo-500"
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
                                    />
                                )}
                            </div>
                        );
                    })()}

                    <div className="flex justify-between items-center">
                        <div>
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className={`px-4 py-2 rounded-lg border ${currentIndex === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {currentIndex < (questions ? questions.length - 1 : 0) ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!canAdvance(currentIndex)}
                                    className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-base font-medium shadow-sm transition-all ${!canAdvance(currentIndex) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-base font-medium shadow-sm transition-all"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            )}
                        </div>
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
