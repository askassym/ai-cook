// Серверный маршрут: здесь живёт ключ Gemini. Браузер его никогда не видит.

// Основная модель + запасные: если одна перегружена, пробуем следующую.
const MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash-lite",
].filter((m, i, arr) => arr.indexOf(m) === i);
const TIMEOUT_MS = 30000; // ждём ответ одной модели не дольше 30 секунд
const CUISINES = [
  "любая",
  "казахская",
  "русская",
  "итальянская",
  "азиатская",
  "европейская",
  "кавказская",
];
const TIMES = [15, 30, 60];

function buildPrompt({ products, cuisine, time, servings }) {
  return `Ты опытный повар. Придумай 3 разных рецепта на русском языке.
Продукты, которые есть: ${products.join(", ")}.
Кухня: ${cuisine}. Время приготовления: не больше ${time} минут. Порций: ${servings}.
Старайся использовать в основном эти продукты. Базовые вещи (соль, перец,
масло, вода) считаются доступными. Если нужно что-то ещё — укажи в "missing".
Рецепты должны быть реальными и безопасными. Количество ингредиентов — на ${servings} порц.
Ответь строго в JSON по схеме:
{
  "recipes": [{
    "title": "название",
    "description": "1–2 предложения",
    "time_minutes": 0,
    "difficulty": "легко | средне | сложно",
    "calories_per_serving": 0,
    "ingredients": [{"name": "", "amount": ""}],
    "missing": ["что докупить"],
    "steps": ["шаг"],
    "tip": "совет повара"
  }]
}`;
}

// Ключ: локально — из .env.local (process.env), на Cloudflare — из секрета воркера.
async function getApiKey() {
  const fromProcess = typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined;
  if (fromProcess) return fromProcess;
  try {
    const { env } = await import(/* webpackIgnore: true */ "cloudflare:workers");
    return env?.GEMINI_API_KEY;
  } catch {
    return undefined;
  }
}

export async function POST(request) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "Ключ Gemini не найден. Вставь его в .env.local после GEMINI_API_KEY= и перезапусти приложение." },
      { status: 500 }
    );
  }

  // Проверяем, что прислал браузер
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Неправильный запрос." }, { status: 400 });
  }

  const products = Array.isArray(body.products)
    ? body.products
        .map((p) => String(p).trim().slice(0, 40))
        .filter(Boolean)
        .slice(0, 25)
    : [];
  if (products.length < 2) {
    return Response.json({ error: "Выбери хотя бы 2 продукта." }, { status: 400 });
  }
  const cuisine = CUISINES.includes(body.cuisine) ? body.cuisine : "любая";
  const time = TIMES.includes(Number(body.time)) ? Number(body.time) : 30;
  const servings = Math.min(6, Math.max(1, Number(body.servings) || 2));

  // Запрос к Gemini: пробуем модели по очереди
  const requestBody = JSON.stringify({
    contents: [{ parts: [{ text: buildPrompt({ products, cuisine, time, servings }) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  let geminiRes = null;
  let lastProblem = "network";
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: requestBody,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        }
      );
      if (res.ok) {
        geminiRes = res;
        break;
      }
      console.error(`Gemini ${model} error`, res.status, await res.text());
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        lastProblem = "key";
        break; // ключ неверный — другие модели не помогут
      }
      lastProblem = res.status === 429 ? "limit" : "busy";
      // 404 (модель не найдена), 429, 5xx — пробуем следующую модель
    } catch (err) {
      console.error(`Gemini ${model} failed`, err?.name);
      lastProblem = err?.name === "TimeoutError" ? "timeout" : "network";
    }
  }

  if (!geminiRes) {
    const messages = {
      key: "Gemini не принял запрос. Проверь, что ключ в .env.local правильный.",
      limit: "Слишком много запросов. Подожди минуту и попробуй снова.",
      busy: "Повар Gemini сейчас перегружен. Подожди минуту и нажми ещё раз.",
      timeout: "Повар думает слишком долго. Попробуй ещё раз через минуту.",
      network: "Не удалось связаться с Gemini. Проверь интернет и попробуй ещё раз.",
    };
    return Response.json({ error: messages[lastProblem] }, { status: 502 });
  }

  try {
    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text);
    const recipes = Array.isArray(parsed.recipes) ? parsed.recipes.slice(0, 3) : [];
    if (recipes.length === 0) throw new Error("empty");
    return Response.json({ recipes });
  } catch {
    return Response.json(
      { error: "Повар ответил непонятно. Нажми «Придумай рецепты» ещё раз." },
      { status: 502 }
    );
  }
}
