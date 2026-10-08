type PlaceholderPageProps = {
  title: string;
  description: string;
};

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/20">
      <p className="mb-3 text-sm uppercase tracking-[0.2em] text-amber-300">Phase 1</p>
      <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">{title}</h1>
      <p className="max-w-2xl text-slate-300">{description}</p>
    </section>
  );
}
