import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function validateAuth() {
    const cookieStore = await cookies();
    const adminToken = cookieStore.has('admin_token')
        ? cookieStore.get('admin_token')
        : null;

    if (!adminToken?.value) {
        redirect('/login');
    }
    return adminToken.value;
} export default async function AdminLayout({ children }) {
    await validateAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/admin/quizzes" className="text-xl font-bold text-gray-800">
                                    Quiz Admin
                                </Link>
                            </div>
                            <div className="ml-6 flex space-x-8">
                                <Link
                                    href="/admin/quizzes"
                                    className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}