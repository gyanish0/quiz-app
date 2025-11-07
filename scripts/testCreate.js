import dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
        const res = await fetch('http://localhost:3000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'admin123' }) });
        const d = await res.json();
        console.log('login', res.status, d);
        if (!res.ok) return;
        const token = d.token;
        const quiz = { title: 'Test Quiz', description: 'dev', questions: [{ type: 'TEXT', question: 'What?', correctAnswer: 'ans', points: 1 }] };
        const r2 = await fetch('http://localhost:3000/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(quiz) });
        const d2 = await r2.json();
        console.log('create', r2.status, d2);
    } catch (e) { console.error(e) }
})();