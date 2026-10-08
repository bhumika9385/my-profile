/** Eyebrow pill + heading (with optional gradient phrase) + subtitle. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  highlight,
  subtitle,
  align = "left",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const center = align === "center";
  return (
    <div className={`mb-12 md:mb-16 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <p data-reveal className={`chip !border-signal/30 !bg-signal/10 !text-signal ${center ? "mx-auto" : ""}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden />
        {eyebrow}
      </p>
      <h2 id={id} data-reveal className="mt-5 text-[clamp(2.1rem,4.6vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight text-balance text-paper">
        {title} {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {subtitle && <p data-reveal className="mt-4 text-lg leading-relaxed text-mute">{subtitle}</p>}
    </div>
  );
}
