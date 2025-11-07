import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Quiz } from '@/lib/models';
import { validateAdminRoute } from '@/lib/auth';

export async function GET(request) {
    try {
        await connectDB();
        const quizzes = await Quiz.find({}).select('title description questions');
        return NextResponse.json(quizzes);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch quizzes' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    const authError = await validateAdminRoute(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        await connectDB();

        const quiz = new Quiz(body);
        await quiz.save();

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Create quiz error:', error);
        const message = process.env.NODE_ENV === 'development' ? error.message || String(error) : 'Failed to create quiz';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}