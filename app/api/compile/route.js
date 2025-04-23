import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { code, language, input } = await req.json();

        // For now, we'll use Judge0 API for compilation
        const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                source_code: code,
                language_id: language === 'cpp' ? 54 : 51, // 54 for C++, 51 for C#
                stdin: input,
            })
        });

        const data = await response.json();

        // Wait for compilation and execution
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get submission result
        const result = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${data.token}?base64_encoded=false`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        });

        let resultData = await result.json();

        // If the submission is still processing, wait and try again
        if (resultData.status?.description === 'Processing') {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const finalResult = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${data.token}?base64_encoded=false`, {
                headers: {
                    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });
            resultData = await finalResult.json();
        }

        return NextResponse.json({
            success: true,
            output: resultData.stdout || resultData.stderr || 'No output',
            error: resultData.compile_output || ''
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}