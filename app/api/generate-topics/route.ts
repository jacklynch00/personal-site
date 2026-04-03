import { NextResponse } from 'next/server';

interface Topic {
  prompt: string;
  category: string;
  links: { title: string; url: string }[];
}

const TOPICS: { category: string; prompts: string[] }[] = [
  {
    category: 'Philosophy',
    prompts: [
      'Is free will an illusion?',
      'Can something be morally right but legally wrong?',
      'Do we have an obligation to future generations?',
      'Is ignorance ever bliss, or always dangerous?',
      'Should we fear death, or is it irrational to do so?',
      'Is it possible to be truly selfless?',
      'Does suffering have inherent value?',
      'Are humans fundamentally good or fundamentally selfish?',
      'Is there a meaningful difference between inaction and action?',
      'Can you have meaning without struggle?',
    ],
  },
  {
    category: 'Society & Culture',
    prompts: [
      'Should cities ban cars from downtown areas?',
      'Is remote work making us more isolated or more free?',
      'Should voting be mandatory?',
      'Are we too nostalgic about the past?',
      'Is social media a net positive or negative for democracy?',
      'Should there be a maximum wage?',
      'Is the concept of a "career" outdated?',
      'Are suburbs good for people?',
      'Should we abolish tipping culture?',
      'Is college still worth it for most people?',
    ],
  },
  {
    category: 'Science & Nature',
    prompts: [
      'Should we bring back extinct species if we can?',
      'Should zoos exist?',
      'Is space exploration worth the cost while Earth has unsolved problems?',
      'Should we genetically modify humans to prevent disease?',
      'Are we too dependent on technology to survive without it?',
      'Should we try to contact extraterrestrial civilizations?',
      'Is nuclear energy the answer to climate change?',
      'Should we geo-engineer the climate to fight global warming?',
      'Do animals have consciousness in the way we do?',
      'Should there be limits on artificial intelligence research?',
    ],
  },
  {
    category: 'Art & Creativity',
    prompts: [
      'Is AI-generated art real art?',
      'Does music need lyrics to tell a story?',
      'Should art be comfortable, or should it challenge you?',
      'Is architecture the most underrated art form?',
      'Are remakes and reboots killing creative originality?',
      'Should graffiti be considered a legitimate art form?',
      'Does the artist\'s personal life affect how we should view their work?',
      'Is minimalism a philosophy or an aesthetic?',
      'Should museums be free?',
      'Has photography replaced painting as the dominant visual art?',
    ],
  },
  {
    category: 'Technology',
    prompts: [
      'Should we have a right to be forgotten on the internet?',
      'Is the smartphone the most important invention of our lifetime?',
      'Should algorithms be regulated like public utilities?',
      'Is open source software a moral imperative?',
      'Are self-driving cars worth the ethical tradeoffs?',
      'Should children have access to social media?',
      'Is the metaverse a future we actually want?',
      'Should we slow down technological progress to let society catch up?',
      'Is privacy dead in the digital age?',
      'Will AI replace more jobs than it creates?',
    ],
  },
  {
    category: 'Human Experience',
    prompts: [
      'What does it mean to live a "good" life?',
      'Is loneliness an epidemic or a natural state?',
      'Should we optimize for happiness or for meaning?',
      'Is boredom underrated?',
      'Are first impressions reliable or mostly wrong?',
      'Is it better to be a specialist or a generalist?',
      'Does travel actually broaden your perspective?',
      'Is routine the enemy of creativity or its foundation?',
      'Should we be more comfortable with silence?',
      'Is comparison really the thief of joy?',
    ],
  },
  {
    category: 'History & Politics',
    prompts: [
      'Should we judge historical figures by modern standards?',
      'Is democracy the best form of government, or just the least bad?',
      'Should countries pay reparations for historical wrongs?',
      'Are borders an outdated concept?',
      'Is nationalism inherently dangerous?',
      'Do revolutions actually improve things, or just rearrange power?',
      'Should we preserve old buildings or make way for new ones?',
      'Is the concept of a nation-state declining?',
      'Should political leaders be required to have specific qualifications?',
      'Are we living through a historically significant era, or does every generation think that?',
    ],
  },
  {
    category: 'Economics & Work',
    prompts: [
      'Should we have a four-day work week?',
      'Is universal basic income inevitable?',
      'Should billionaires exist?',
      'Is hustle culture toxic or motivating?',
      'Should companies be required to share profits with employees?',
      'Is the gig economy freedom or exploitation?',
      'Should we measure economic success differently than GDP?',
      'Is advertising a net negative for society?',
      'Should essential workers always be the highest paid?',
      'Is capitalism compatible with solving climate change?',
    ],
  },
  {
    category: 'Food & Health',
    prompts: [
      'Should we all be eating less meat?',
      'Is the wellness industry helping or hurting people?',
      'Should junk food be regulated like tobacco?',
      'Is cooking a dying skill?',
      'Should healthcare be completely free?',
      'Is our obsession with productivity making us unhealthy?',
      'Should we normalize napping during the workday?',
      'Is organic food worth the premium?',
      'Should we be more open about mental health at work?',
      'Is the "8 glasses of water a day" advice actually useful?',
    ],
  },
  {
    category: 'Education',
    prompts: [
      'Should schools teach financial literacy as a core subject?',
      'Is homework actually beneficial?',
      'Should we let kids specialize earlier instead of forcing a broad education?',
      'Is the lecture format dead?',
      'Should philosophy be taught in elementary school?',
      'Are letter grades helping or hurting students?',
      'Should we rethink how we teach history?',
      'Is self-education more valuable than formal education?',
      'Should coding be as fundamental as reading and writing?',
      'Is the education system designed for a world that no longer exists?',
    ],
  },
  {
    category: 'Weird & Wonderful',
    prompts: [
      'Why does the smell of rain make us feel nostalgic?',
      'If you could add one amendment to the laws of physics, what should it be?',
      'Should we take dreams more seriously?',
      'Would the world be better if everyone could read minds?',
      'Is there something fundamentally different about nighttime thinking?',
      'Should we design cities for walking instead of driving?',
      'If you had to eat one cuisine for the rest of your life, what does your choice say about you?',
      'Are conspiracy theories a healthy part of skepticism or purely harmful?',
      'Should we build monuments differently than we do now?',
      'Is there value in doing things you are bad at?',
    ],
  },
];

function getSearchUrl(query: string): string {
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`;
}

function extractKeywords(prompt: string): string[] {
  // Pull out the core subject matter for link generation
  const stopWords = new Set([
    'is', 'are', 'should', 'we', 'the', 'a', 'an', 'it', 'do', 'does', 'can',
    'have', 'has', 'be', 'to', 'of', 'in', 'for', 'or', 'and', 'if', 'you',
    'your', 'our', 'their', 'its', 'that', 'this', 'with', 'than', 'but',
    'not', 'all', 'most', 'more', 'really', 'there', 'ever', 'actually',
    'always', 'just', 'about', 'too', 'still', 'how', 'what', 'why', 'would',
    'could', 'being', 'been', 'had', 'by', 'on', 'at', 'from', 'as', 'was',
    'were', 'every', 'something', 'inherently', 'fundamentally', 'completely',
    'purely', 'mostly', 'instead', 'making', 'think', 'things', 'better',
    'way', 'let', 'one', 'they', 'who', 'us', 'so', 'no', 'yes', 'also',
  ]);

  return prompt
    .replace(/[?'".,!]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .map((w) => w.toLowerCase());
}

function generateLinks(prompt: string): { title: string; url: string }[] {
  const keywords = extractKeywords(prompt);
  const links: { title: string; url: string }[] = [];

  // Full topic search
  const fullQuery = keywords.slice(0, 4).join(' ');
  links.push({
    title: `Wikipedia: ${fullQuery}`,
    url: getSearchUrl(fullQuery),
  });

  // Pick a focused sub-topic if possible
  if (keywords.length >= 2) {
    const subQuery = keywords.slice(0, 2).join(' ');
    links.push({
      title: `Wikipedia: ${subQuery}`,
      url: getSearchUrl(subQuery),
    });
  }

  // Google search for broader context
  const googleQuery = keywords.slice(0, 5).join('+');
  links.push({
    title: 'Google this topic',
    url: `https://www.google.com/search?q=${googleQuery}`,
  });

  return links;
}

export async function GET() {
  const count = 5;
  const allPrompts: { prompt: string; category: string }[] = [];

  for (const cat of TOPICS) {
    for (const prompt of cat.prompts) {
      allPrompts.push({ prompt, category: cat.category });
    }
  }

  // Shuffle and pick
  const shuffled = allPrompts.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const topics: Topic[] = selected.map((t) => ({
    prompt: t.prompt,
    category: t.category,
    links: generateLinks(t.prompt),
  }));

  return NextResponse.json({ topics });
}
