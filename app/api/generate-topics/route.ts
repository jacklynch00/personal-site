import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface Topic {
  prompt: string;
  category: string;
  context: string;
}

const SYSTEM_PROMPT = `You generate 5 footnote topic suggestions for a personal blog. These are quick-take conversation starters — the kind of thing you'd want to have a quick opinion about at a dinner party this week.

About the writer: 25-year-old software engineer in NYC. Interests include Formula 1, startups and early-stage tech, fitness, video/content creation, and building things on the web.

Rules:
- Use web search to find things people are ACTUALLY talking about right now — current events, trending topics, cultural moments, new releases, recent developments
- Frame topics as specific, opinionated questions — not generic philosophical debates
- Make them quick-hitting: something you can think about and write 2-3 paragraphs on in 10 minutes
- Mix: ~3 topics related to the writer's interests, ~2 that expand horizons (culture, science, business, politics, etc.) but are still timely
- Each topic needs a one-line "context" explaining why it's relevant right now
- Be specific: "McLaren just signed a $500M deal with a crypto sponsor — is F1 selling its soul?" not "Should sports have sponsors?"
- Avoid classic debate-team questions ("Is free will real?", "Should voting be mandatory?")
- Vary the categories — don't repeat the same one twice

Respond with ONLY a JSON array of 5 objects, no markdown fences, no explanation:
[{"prompt": "...", "category": "...", "context": "..."}]`;

const FALLBACK_TOPICS: Topic[] = [
  {
    prompt: "What's the most underrated app on your phone right now?",
    category: 'Tech',
    context: "Everyone's phone is a window into what they actually care about",
  },
  {
    prompt: "What's a skill you picked up recently that surprised you?",
    category: 'Personal',
    context: 'Learning something new changes how you see everything else',
  },
  {
    prompt: "What's the best meal you've had in the last month and why?",
    category: 'Food & Culture',
    context: 'Food is the most universal conversation starter there is',
  },
  {
    prompt: "What's a piece of advice you used to ignore but now live by?",
    category: 'Life',
    context: 'The best advice only clicks when you have the experience to understand it',
  },
  {
    prompt: "What's something everyone around you is into that you just don't get?",
    category: 'Culture',
    context: 'Dissenting opinions are more interesting than consensus',
  },
];

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ topics: FALLBACK_TOPICS, fallback: true });
  }

  try {
    const client = new Anthropic({ apiKey });

    let messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: `Generate 5 timely footnote topics for today, ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      },
    ];

    let response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    });

    // Handle pause_turn — the server-side web search loop may need continuation
    while (response.stop_reason === 'pause_turn') {
      messages = [
        ...messages,
        { role: 'assistant', content: response.content },
      ];
      response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      });
    }

    // Extract the final text from the response content blocks
    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === 'text',
    );
    const text = textBlock?.text?.trim();
    if (!text) throw new Error('Empty response');

    // Parse JSON — handle potential markdown fences
    const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(jsonStr) as Topic[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid response format');
    }

    const topics = parsed.slice(0, 5).map((t) => ({
      prompt: t.prompt,
      category: t.category,
      context: t.context,
    }));

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Topic generation failed:', error);
    return NextResponse.json({ topics: FALLBACK_TOPICS, fallback: true });
  }
}
