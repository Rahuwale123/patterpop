type Step = { title: string; body: string };

export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <ol className="mt-5 space-y-4">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-madder font-serif font-bold text-madder"
          >
            {i + 1}
          </span>
          <div>
            <h3 className="font-serif text-xl font-bold">{s.title}</h3>
            <p className="mt-1">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
