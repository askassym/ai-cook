import Link from "next/link";

const benefits = [
  {
    icon: "🥕",
    title: "Из того, что есть",
    text: "Отметь продукты в холодильнике — повар подстроится под них.",
  },
  {
    icon: "⏱️",
    title: "Под твоё время",
    text: "15 минут или целый час — рецепты уложатся в нужное время.",
  },
  {
    icon: "🌍",
    title: "Любая кухня",
    text: "Казахская, кавказская, итальянская, азиатская и другие.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center px-4 py-12 text-center sm:py-20">
      <div className="text-6xl">👩‍🍳</div>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
        Что приготовить из того,{" "}
        <span className="text-tomato">что есть дома?</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-cocoa-soft">
        Отметь продукты, выбери кухню и время — AI-повар предложит 3 рецепта с
        пошаговыми инструкциями.
      </p>

      <Link
        href="/app"
        className="mt-8 rounded-2xl bg-tomato px-10 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-tomato-dark"
      >
        Попробовать
      </Link>

      <div className="mt-14 grid w-full gap-4 sm:grid-cols-3">
        {benefits.map((b) => (
          <div key={b.title} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="text-4xl">{b.icon}</div>
            <h2 className="mt-3 text-lg font-bold">{b.title}</h2>
            <p className="mt-1 text-cocoa-soft">{b.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
