const steps = [
  {
    title: "Оберіть шаблон",
    text: "Виберіть фото картонки чи плаката з готової галереї.",
  },
  {
    title: "Додайте напис",
    text: "Введіть свій текст — напис на картонці накладеться з урахуванням перспективи.",
  },
  {
    title: "Завантажте зображення",
    text: "Збережіть готовий плакат з текстом і поділіться ним або роздрукуйте.",
  },
];

const faq = [
  {
    question: "Як створити картонку онлайн безкоштовно?",
    answer:
      "Оберіть шаблон, додайте свій напис і завантажте готове зображення. Онлайн генератор картонок працює безкоштовно і без реєстрації.",
  },
  {
    question: "Як зробити протестний плакат з текстом?",
    answer:
      "Виберіть шаблон плаката, введіть власне гасло, і генератор протестних плакатів створить картонку з текстом для мітингу чи акції.",
  },
  {
    question: "Чи потрібно встановлювати програму?",
    answer:
      "Ні, щоб зробити картонку, нічого встановлювати не треба — усе працює прямо у браузері на комп'ютері чи телефоні.",
  },
];

export function AboutContent() {
  return (
    <section className="mt-16 border-t border-zinc-200 pt-10 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
      <p>
        Онлайн генератор протестних картонок і плакатів. Тут можна безкоштовно
        створити картонку з текстом для протесту, мітингу чи акції: оберіть
        шаблон, додайте власний напис і завантажте готовий плакат.
      </p>

      <h2 className="mt-10 text-base font-medium text-zinc-900 dark:text-zinc-100">
        Як створити протестну картонку
      </h2>
      <ol className="mt-4 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {index + 1}. {step.title}
            </span>
            <p className="mt-1">{step.text}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 text-base font-medium text-zinc-900 dark:text-zinc-100">
        Часті запитання
      </h2>
      <div className="mt-4 space-y-2">
        {faq.map((item) => (
          <details
            key={item.question}
            className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
          >
            <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
              {item.question}
            </summary>
            <p className="mt-2">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
