<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ResourceFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Smalot\PdfParser\Parser;

class AiAnalyzerController extends Controller
{
    private function callGroq(array $messages, int $maxTokens = 2048): string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('GROQ_API_KEY'),
            'Content-Type'  => 'application/json',
        ])->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => 'llama-3.1-8b-instant',
            'messages'    => $messages,
            'temperature' => 0.3,
            'max_tokens'  => $maxTokens,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Groq API error: ' . $response->body());
        }

        return $response->json()['choices'][0]['message']['content'] ?? '';
    }

    public function index()
    {
        return Inertia::render('Student/AiAnalyzer');
    }

    public function getResources()
    {
        $resources = ResourceFile::where('status', 'approved')
            ->where('file_type', 'pdf')
            ->get(['id', 'title', 'subject']);

        return response()->json($resources);
    }

    private function buildPrompt(string $text): string
    {
        return 'You are a study assistant. Analyze the following study material and respond with ONLY valid JSON no markdown no backticks no explanation.

Return exactly this structure:
{
  "summary": "3-4 sentence summary",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "quiz_questions": [
    {
      "question": "Question?",
      "options": ["A) option", "B) option", "C) option", "D) option"],
      "answer": "A) correct",
      "explanation": "Why this is correct"
    }
  ],
  "flashcards": [
    {"term": "Term", "definition": "Definition"}
  ]
}

Generate 5 quiz questions and 8 flashcards.

Document:
' . $text;
    }

    private function processGroqResponse(string $rawText): ?array
    {
        $rawText = preg_replace('/```json\s*/', '', $rawText);
        $rawText = preg_replace('/```\s*/', '', $rawText);
        $rawText = trim($rawText);
        return json_decode($rawText, true);
    }

    public function analyze(Request $request)
    {
        // FIX: Rate limit check moved BEFORE validate() to fail fast
        $key = 'ai_analyze_' . Auth::id();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json(['error' => 'Too many AI requests. Please wait ' . ceil($seconds / 60) . ' minutes before trying again.'], 429);
        }
        RateLimiter::hit($key, 3600);

        $request->validate([
            'resource_id' => ['required', 'exists:resource_files,id'],
        ]);

        $resource = ResourceFile::findOrFail($request->resource_id);

        if ($resource->file_type !== 'pdf') {
            return response()->json(['error' => 'Only PDF files can be analyzed.'], 422);
        }

        try {
            $filePath = Storage::disk('public')->path($resource->file_path);
            $parser   = new Parser();
            $pdf      = $parser->parseFile($filePath);
            $text     = $pdf->getText();

            if (strlen($text) < 100) {
                return response()->json(['error' => 'Could not extract enough text from this PDF.'], 422);
            }

            $text = substr($text, 0, 6000);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse PDF: ' . $e->getMessage()], 422);
        }

        try {
            $rawText = $this->callGroq([
                ['role' => 'user', 'content' => $this->buildPrompt($text)]
            ], 3000);

            $result = $this->processGroqResponse($rawText);

            if (!$result) {
                return response()->json(['error' => 'Failed to parse AI response. Please try again.'], 500);
            }

            session(['document_text_' . $request->resource_id => $text]);

            return response()->json([
                'resource' => [
                    'title'   => $resource->title,
                    'subject' => $resource->subject,
                ],
                'analysis'      => $result,
                'document_text' => $text,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function analyzeFile(Request $request)
    {
        // FIX: Rate limit check moved BEFORE validate() to fail fast
        $key = 'ai_analyze_' . Auth::id();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json(['error' => 'Too many AI requests. Please wait ' . ceil($seconds / 60) . ' minutes before trying again.'], 429);
        }
        RateLimiter::hit($key, 3600);

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        try {
            $file   = $request->file('file');
            $parser = new Parser();
            $pdf    = $parser->parseFile($file->getPathname());
            $text   = $pdf->getText();

            if (strlen($text) < 100) {
                return response()->json(['error' => 'Could not extract enough text from this PDF.'], 422);
            }

            $text = substr($text, 0, 6000);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to parse PDF: ' . $e->getMessage()], 422);
        }

        try {
            $rawText = $this->callGroq([
                ['role' => 'user', 'content' => $this->buildPrompt($text)]
            ], 3000);

            $result = $this->processGroqResponse($rawText);

            if (!$result) {
                return response()->json(['error' => 'Failed to parse AI response. Please try again.'], 500);
            }

            session(['document_text_uploaded' => $text]);

            return response()->json([
                'resource'      => ['title' => $file->getClientOriginalName()],
                'analysis'      => $result,
                'document_text' => $text,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function chat(Request $request)
    {
        // FIX: Using imported RateLimiter facade instead of full namespace
        $chatKey = 'ai_chat_' . Auth::id();
        if (RateLimiter::tooManyAttempts($chatKey, 30)) {
            $seconds = RateLimiter::availableIn($chatKey);
            return response()->json(['error' => 'Too many requests. Please wait ' . ceil($seconds / 60) . ' minutes.'], 429);
        }
        RateLimiter::hit($chatKey, 3600);

        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array'],
        ]);

        $messages = [
            [
                'role'    => 'system',
                'content' => 'You are StudyBot, a helpful AI study assistant for university students. You help with explaining concepts, summarizing topics, answering academic questions, and providing study tips. Keep responses clear, concise and student-friendly. Use simple language and examples where helpful.'
            ]
        ];

        foreach ($request->history ?? [] as $msg) {
            $messages[] = [
                'role'    => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['content']
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $request->message];

        try {
            $reply = $this->callGroq($messages, 1024);
            return response()->json(['reply' => $reply]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function chatWithDocument(Request $request)
    {
        // FIX: Using imported RateLimiter facade instead of full namespace
        $docKey = 'ai_doc_chat_' . Auth::id();
        if (RateLimiter::tooManyAttempts($docKey, 20)) {
            $seconds = RateLimiter::availableIn($docKey);
            return response()->json(['error' => 'Too many requests. Please wait ' . ceil($seconds / 60) . ' minutes.'], 429);
        }
        RateLimiter::hit($docKey, 3600);

        $request->validate([
            'message'     => ['required', 'string', 'max:1000'],
            'history'     => ['nullable', 'array'],
            'resource_id' => ['nullable', 'string'],
        ]);

        $documentText = '';
        if ($request->resource_id) {
            $documentText = session('document_text_' . $request->resource_id, '');
        } else {
            $documentText = session('document_text_uploaded', '');
        }

        $systemPrompt = 'You are a study assistant helping a student understand a specific document. ';
        if ($documentText) {
            $systemPrompt .= 'Answer questions ONLY based on the following document content. If the question is not related to the document, politely say so.

Document content:
' . $documentText;
        }

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($request->history ?? [] as $msg) {
            $messages[] = [
                'role'    => $msg['role'] === 'user' ? 'user' : 'assistant',
                'content' => $msg['content'],
            ];
        }

        $messages[] = ['role' => 'user', 'content' => $request->message];

        try {
            $reply = $this->callGroq($messages, 1024);
            return response()->json(['reply' => $reply]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}