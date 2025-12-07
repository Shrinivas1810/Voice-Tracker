const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY || 'dummy-key',
    dangerouslyAllowBrowser: false // This is backend
});

const parseTaskWithAI = async (transcript) => {
    // If no real API key is provided, use a simple regex-based heuristic mock
    if (!process.env.AI_API_KEY || process.env.AI_API_KEY === 'dummy-key') {
        console.log("⚠️ No AI_API_KEY found, using Regex Mock Parser.");
        return mockParse(transcript);
    }

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a task extractor. Extract 'title' (string), 'dueDate' (ISO string or null), and 'priority' ('high', 'normal', 'low') from the user's input. Return strictly JSON."
                },
                { role: "user", content: transcript }
            ],
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("AI Parsing failed, falling back to mock:", error);
        return mockParse(transcript);
    }
};

const mockParse = (text) => {
    const lower = text.toLowerCase();

    // Simple priority extraction
    let priority = 'normal';
    if (lower.includes('urgent') || lower.includes('important') || lower.includes('high priority')) priority = 'high';
    else if (lower.includes('low priority')) priority = 'low';

    // Simple due date extraction (very basic for demo)
    let dueDate = null;
    const now = new Date();
    if (lower.includes('today')) dueDate = now.toISOString();
    else if (lower.includes('tomorrow')) {
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        dueDate = tmrw.toISOString();
    }
    // "Next Friday" etc would require a library like 'chrono-node' optimally

    // Clean title
    // Remove common prefixes
    let title = text.replace(/^(remind me to|add a task to|i need to|note that)/i, '').trim();
    // Capitalize
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return { title, dueDate, priority };
};

module.exports = { parseTaskWithAI };
