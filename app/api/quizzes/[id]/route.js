import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Quiz } from '@/lib/models';
import { validateAdminRoute } from '@/lib/auth';

export async function GET(request, context) {
    try {
        // Resolve params Promise-like object
        const resolvedContext = await Promise.resolve(context);
        const resolvedParams = await Promise.resolve(resolvedContext.params);

        // Get ID from either value.id or direct id property
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;

        if (!quizId) {
            console.error('Quiz ID is undefined in params');
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        console.log('GET Quiz - ID:', quizId);

        // Validate ObjectId
        if (!mongoose.isValidObjectId(quizId)) {
            console.log('Invalid ObjectId format');
            return NextResponse.json(
                { error: 'Invalid quiz ID format' },
                { status: 400 }
            );
        }

        await connectDB();
        console.log('Database connected');

        const quiz = await Quiz.findById(quizId).exec();
        console.log('Query result:', quiz);

        if (!quiz) {
            console.log('Quiz not found in database');
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(quiz);
    } catch (error) {
        console.error('GET Quiz Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
} export async function PUT(request, context) {
    try {
        // Resolve params Promise-like object
        const resolvedContext = await Promise.resolve(context);
        const resolvedParams = await Promise.resolve(resolvedContext.params);

        // Get ID from either value.id or direct id property
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;

        if (!quizId) {
            console.error('Quiz ID is undefined in params');
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        const authError = await validateAdminRoute(request);
        if (authError) return authError;

        const body = await request.json();
        await connectDB();

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            body,
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('PUT Quiz Error:', error);
        return NextResponse.json(
            { error: 'Failed to update quiz' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
        // Resolve params Promise-like object
        const resolvedContext = await Promise.resolve(context);
        const resolvedParams = await Promise.resolve(resolvedContext.params);

        // Get ID from either value.id or direct id property
        const quizId = resolvedParams?.value?.id || resolvedParams?.id;

        if (!quizId) {
            console.error('Quiz ID is undefined in params');
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        const authError = await validateAdminRoute(request);
        if (authError) return authError;

        await connectDB();
        const quiz = await Quiz.findByIdAndDelete(quizId);

        if (!quiz) {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('DELETE Quiz Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete quiz' },
            { status: 500 }
        );
    }
}