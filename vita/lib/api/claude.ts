const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const MODEL = 'claude-sonnet-4-20250514';
const BASE_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(params: {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string | object[] }[];
  maxTokens: number;
}): Promise<string> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens,
      system: params.system,
      messages: params.messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export interface ProgramResult {
  tdee: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  workoutsPerWeek: number;
  sleepTarget: number;
  vitaScore: number;
  objectifKcal: number;
}

export async function generateProgram(profile: {
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
  dietQuality: string;
  sleepDuration: string;
  dietRestrictions: string[];
}): Promise<ProgramResult> {
  const prompt = `Génère un programme personnalisé pour :
Prénom: ${profile.name}, Âge: ${profile.age}, Poids: ${profile.weight}kg, Taille: ${profile.height}cm
Objectif: ${profile.goal}, Activité: ${profile.activityLevel}, Alimentation: ${profile.dietQuality}
Sommeil: ${profile.sleepDuration}, Restrictions: ${profile.dietRestrictions.join(', ')}`;

  try {
    const text = await callClaude({
      system: 'Tu es un expert en nutrition et coaching sportif. Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 500,
    });

    const json = JSON.parse(text.trim());
    return json as ProgramResult;
  } catch {
    // Fallback : calcul TDEE de base
    const bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
    const activityMultipliers: Record<string, number> = {
      jamais: 1.2, '1-2x': 1.375, '3-4x': 1.55, 'tous-les-jours': 1.725,
    };
    const multiplier = activityMultipliers[profile.activityLevel] ?? 1.375;
    const tdee = Math.round(bmr * multiplier);
    return {
      tdee,
      proteinesG: Math.round((tdee * 0.3) / 4),
      glucidesG: Math.round((tdee * 0.45) / 4),
      lipidesG: Math.round((tdee * 0.25) / 9),
      workoutsPerWeek: 3,
      sleepTarget: 8,
      vitaScore: 62,
      objectifKcal: tdee - 300,
    };
  }
}

export interface MealAnalysis {
  foods: { name: string; portion: string }[];
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  coach_message: string;
}

export async function analyzeMealPhoto(base64Image: string, mimeType: string): Promise<MealAnalysis> {
  try {
    const text = await callClaude({
      system: 'Tu es un nutritionniste expert. Réponds UNIQUEMENT en JSON valide, sans markdown.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Image } },
            { type: 'text', text: 'Analyse ce repas. Réponds en JSON : {foods: [{name, portion}], calories, proteines, glucides, lipides, coach_message}' },
          ],
        },
      ],
      maxTokens: 600,
    });

    return JSON.parse(text.trim()) as MealAnalysis;
  } catch {
    return {
      foods: [{ name: 'Repas analysé', portion: '1 portion' }],
      calories: 450,
      proteines: 25,
      glucides: 45,
      lipides: 15,
      coach_message: '📸 Belle photo ! Continue à logger tes repas pour un suivi précis.',
    };
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithCoach(
  messages: ChatMessage[],
  userContext: {
    name: string;
    streak: number;
    goal: string;
    vitaScore: number;
  }
): Promise<string> {
  const system = `Tu es Coach VITA, expert santé motivant et bienveillant.
Utilisateur : ${userContext.name}, streak ${userContext.streak}j, objectif ${userContext.goal}, score VITA ${userContext.vitaScore}/100.
Réponds en 3-4 phrases max, en français, avec emojis. Sois précis et actionnable.`;

  const history = messages.slice(-10);

  try {
    return await callClaude({
      system,
      messages: history,
      maxTokens: 400,
    });
  } catch {
    return "💪 Je suis là pour t'aider ! Dis-moi comment tu te sens aujourd'hui et on va travailler ensemble vers ton objectif.";
  }
}

export interface QuizQuestion {
  question: string;
  choices: [string, string, string, string];
  correct_index: number;
  explanation: string;
}

export async function generateQuizQuestion(context: {
  goal: string;
  level: number;
  recentFoods: string[];
}): Promise<QuizQuestion> {
  try {
    const text = await callClaude({
      system: 'Tu es un expert en nutrition. Génère une question de quiz éducative. Réponds UNIQUEMENT en JSON valide.',
      messages: [
        {
          role: 'user',
          content: `Génère une question sur la nutrition pour quelqu'un dont l'objectif est "${context.goal}" (niveau ${context.level}).
Format: {question, choices: [4 strings], correct_index: number, explanation}`,
        },
      ],
      maxTokens: 400,
    });
    return JSON.parse(text.trim()) as QuizQuestion;
  } catch {
    return {
      question: 'Quelle quantité d\'eau est recommandée par jour ?',
      choices: ['1 litre', '1,5 litre', '2 litres', '3 litres'],
      correct_index: 2,
      explanation: 'L\'OMS recommande environ 2 litres d\'eau par jour pour un adulte en bonne santé.',
    };
  }
}
