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
      questions: questions,
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

      if (!res.ok) {
        throw new Error('Failed to save quiz');
      }

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
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <div className="space-y-4">
          <Input
            label="Quiz Title"
            name="title"
            defaultValue={quiz?.title}
            required
          />
          <Input
            label="Description (Optional)"
            name="description"
            defaultValue={quiz?.description}
          />
        </div>
      </Card>

      <div className="space-y-4">
        {questions.map((question, questionIndex) => (
          <Card key={questionIndex}>
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
                <Button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove Question
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Type
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(questionIndex, 'type', e.target.value)
                    }
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
                />
              </div>

              <Input
                label="Question Text"
                value={question.question}
                onChange={(e) =>
                  updateQuestion(questionIndex, 'question', e.target.value)
                }
                required
              />

              {question.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateOption(questionIndex, optionIndex, e.target.value)
                        }
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={question.options.length <= 2}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correct Answer
                </label>
                {question.type === 'MCQ' ? (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(questionIndex, 'correctAnswer', e.target.value)
                    }
                    required
                  >
                    <option value="">Select correct answer</option>
                    {question.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option || `Option ${optionIndex + 1}`}
                      </option>
                    ))}
                  </select>
                ) : question.type === 'TRUE_FALSE' ? (
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(
                        questionIndex,
                        'correctAnswer',
                        e.target.value === 'true'
                      )
                    }
                    required
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
                  />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button type="button" onClick={addQuestion}>
          Add Question
        </Button>
        <div className="flex gap-4">
          <Button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      )}
    </form>
  );
}