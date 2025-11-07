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
        .find(row => row.startsWith('admin_token='))
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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Link href="/admin/quizzes/new">
          <Button>Create New Quiz</Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}

      <div className="grid gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz._id}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-gray-600 mt-1">{quiz.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {quiz.questions.length} questions
                </p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/admin/quizzes/${quiz._id}/edit`}>
                  <Button className="bg-gray-600 hover:bg-gray-700">Edit</Button>
                </Link>
                <Button
                  onClick={() => handleDelete(quiz._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {quizzes.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No quizzes created yet.
          </p>
        )}
      </div>
    </div>
  );
}