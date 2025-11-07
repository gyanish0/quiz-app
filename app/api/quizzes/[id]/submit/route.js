import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Quiz, QuizAttempt } from '@/lib/models';

export async function POST(request, context) {
    try {
        // Resolve params Promise-like object
        const resolvedContext = await Promise.resolve(context);
        const resolvedParams = await Promise.resolve(resolvedContext.params);
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;

        if (!quizId) {
            console.error('Quiz ID is undefined in params');
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        // Validate ObjectId format
        if (!mongoose.isValidObjectId(quizId)) {
            console.error('Invalid ObjectId format:', quizId);
            return NextResponse.json(
                { error: 'Invalid quiz ID format' },
                { status: 400 }
            );
        }

        const body = await request.json();
        await connectDB();

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.log('Quiz not found:', quizId);
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Calculate score
        let score = 0;
        const maxScore = quiz.questions.reduce((acc, q) => acc + q.points, 0);

        body.answers.forEach(answer => {
            const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
            if (question && answer.answer === question.correctAnswer) {
                score += question.points;
            }
        });

        // Create quiz attempt
        const attempt = new QuizAttempt({
            quizId: quizId,
            answers: body.answers,
            score,
            maxScore
        }); await attempt.save();

        return NextResponse.json({
            score,
            maxScore,
            percentage: (score / maxScore) * 100
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to submit quiz' },
            { status: 500 }
        );
    }
}