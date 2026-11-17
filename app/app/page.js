"use client";

import { useState } from "react";
import Link from "next/link";

const PRODUCTS = [
  { name: "курица", icon: "🍗" },
  { name: "рис", icon: "🍚" },
  { name: "яйца", icon: "🥚" },
  { name: "картофель", icon: "🥔" },
  { name: "морковь", icon: "🥕" },
  { name: "лук", icon: "🧅" },
  { name: "помидоры", icon: "🍅" },
  { name: "сыр", icon: "🧀" },
  { name: "макароны", icon: "🍝" },
  { name: "говядина", icon: "🥩" },
  { name: "капуста", icon: "🥬" },
  { name: "грибы", icon: "🍄" },
];
const CUISINES = ["любая", "казахская", "русская", "итальянская", "азиатская", "европейская", "кавказская"];
const TIMES = [15, 30, 60];

export default function CookApp() {
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [cuisine, setCuisine] = useState("любая");
  const [time, setTime] = useState(30);
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipes, setRecipes] = useState([]);

  const allProducts = [...selected, ...custom];
  const canSubmit = allProducts.length >= 2 && !loading;

  function toggle(name) {
    setSelected((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]));
  }

  function addCustom(e) {
    e.preventDefault();
    const value = customInput.trim().toLowerCase();
    if (!value || allProducts.includes(value)) {
      setCustomInput("");
      return;
    }
    setCustom((prev) => [...prev, value]);
    setCustomInput("");
  }

  async function generate() {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setRecipes([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: allProducts, cuisine, time, servings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Что-то пошло не так.");
      setRecipes(data.recipes);
    } catch (err) {
      setError(err.message || "Что-то пошло не так. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-cocoa-soft hover:text-tomato">
        ← На главную
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">👩‍🍳 Что приготовить?</h1>

      {/* Шаг 1: продукты */}
      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">1. Что есть дома?</h2>
        <p className="text-cocoa-soft">Выбери минимум 2 продукта</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRODUCTS.map((p) => {
            const active = selected.includes(p.name);
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => toggle(p.name)}
                aria-pressed={active}
                className={`rounded-2xl border-2 px-3 py-3 text-lg font-semibold transition ${
                  active
                    ? "border-tomato bg-tomato text-white"
                    : "border-peach bg-cream hover:border-tomato"
                }`}
              >
                {p.icon} {p.name}
              </button>
            );
          })}
        </div>

        <form onSubmit={addCustom} className="mt-4 flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            maxLength={40}
            placeholder="Свой продукт, например «тыква»"
            className="min-w-0 flex-1 rounded-2xl border-2 border-peach bg-cream px-4 py-3 text-lg outline-none focus:border-tomato"
          />
          <button type="submit" className="rounded-2xl bg-cocoa px-5 py-3 text-lg font-bold text-white">
            +
          </button>
        </form>
        {custom.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {custom.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCustom((prev) => prev.filter((x) => x !== c))}
                className="rounded-full bg-tomato px-4 py-1.5 font-semibold text-white"
                title="Убрать"
              >
                {c} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Шаг 2: настройки */}
      <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">2. Настройки</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="font-semibold">Кухня</span>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="mt-1 w-full rounded-2xl border-2 border-peach bg-cream px-4 py-3 text-lg outline-none focus:border-tomato"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="font-semibold">Время</span>
            <div className="mt-1 flex gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTime(t)}
                  aria-pressed={time === t}
                  className={`flex-1 rounded-2xl border-2 py-3 text-lg font-semibold ${
                    time === t ? "border-tomato bg-tomato text-white" : "border-peach bg-cream"
                  }`}
                >
                  ≤{t}
                </button>
              ))}
            </div>
            <span className="text-sm text-cocoa-soft">минут</span>
          </div>

          <div>
            <span className="font-semibold">Порции</span>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="h-13 w-13 rounded-2xl border-2 border-peach bg-cream text-2xl font-bold"
                aria-label="Меньше порций"
              >
                −
              </button>
              <span className="w-10 text-center text-2xl font-bold">{servings}</span>
              <button
                type="button"
                onClick={() => setServings((s) => Math.min(6, s + 1))}
                className="h-13 w-13 rounded-2xl border-2 border-peach bg-cream text-2xl font-bold"
                aria-label="Больше порций"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Кнопка */}
      <button
        type="button"
        onClick={generate}
        disabled={!canSubmit}
        className="mt-6 w-full rounded-2xl bg-tomato py-4 text-xl font-bold text-white shadow-lg transition hover:bg-tomato-dark disabled:cursor-not-allowed disabled:bg-peach disabled:text-cocoa-soft disabled:shadow-none"
      >
        {loading ? "Повар думает…" : "Придумай рецепты"}
      </button>
      {allProducts.length < 2 && !loading && (
        <p className="mt-2 text-center text-cocoa-soft">Выбери ещё {2 - allProducts.length} продукт(а)</p>
      )}

      {/* Загрузка */}
      {loading && (
        <div className="mt-6 grid gap-4" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-peach/60" />
          ))}
        </div>
      )}

      {/* Ошибка */}
      {error && (
        <div className="mt-6 rounded-3xl border-2 border-tomato bg-white p-5" role="alert">
          <p className="text-lg font-semibold">😕 {error}</p>
          <button
            type="button"
            onClick={generate}
            disabled={!canSubmit}
            className="mt-3 rounded-2xl bg-cocoa px-5 py-2.5 font-bold text-white disabled:opacity-50"
          >
            Попробовать ещё раз
          </button>
        </div>
      )}

      {/* Рецепты */}
      {recipes.length > 0 && (
        <section className="mt-8 grid gap-4">
          <h2 className="text-2xl font-extrabold">Твои рецепты</h2>
          {recipes.map((r, i) => (
            <RecipeCard key={i} recipe={r} defaultOpen={i === 0} />
          ))}
        </section>
      )}
    </main>
  );
}

function RecipeCard({ recipe, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const steps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const missing = Array.isArray(recipe.missing) ? recipe.missing.filter(Boolean) : [];

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold">{recipe.title}</h3>
          <span className="text-2xl text-tomato">{open ? "−" : "+"}</span>
        </div>
        {recipe.description && <p className="mt-1 text-cocoa-soft">{recipe.description}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
          {recipe.time_minutes ? <Badge>⏱️ {recipe.time_minutes} мин</Badge> : null}
          {recipe.difficulty ? <Badge>📊 {recipe.difficulty}</Badge> : null}
          {recipe.calories_per_serving ? <Badge>🔥 ~{recipe.calories_per_serving} ккал/порция</Badge> : null}
        </div>
      </button>

      {open && (
        <div className="border-t-2 border-cream px-5 pb-5 pt-4">
          <h4 className="font-bold">Ингредиенты</h4>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between gap-2 rounded-xl bg-cream px-3 py-1.5">
                <span>{ing.name}</span>
                <span className="text-cocoa-soft">{ing.amount}</span>
              </li>
            ))}
          </ul>

          {missing.length > 0 && (
            <div className="mt-4 rounded-2xl bg-peach/60 p-3">
              <span className="font-bold">🛒 Докупить:</span> {missing.join(", ")}
            </div>
          )}

          <h4 className="mt-4 font-bold">Шаги</h4>
          <ol className="mt-2 grid gap-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tomato text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>

          {recipe.tip && (
            <p className="mt-4 rounded-2xl bg-cream p-3">
              <span className="font-bold">💡 Совет повара:</span> {recipe.tip}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function Badge({ children }) {
  return <span className="rounded-full bg-cream px-3 py-1">{children}</span>;
}
