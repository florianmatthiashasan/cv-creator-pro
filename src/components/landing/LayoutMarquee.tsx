import { templateOptions } from '@/components/cv/templates/registry';

/** Endless band of the real layout names, in place of a customer-logo strip. */
const LayoutMarquee = () => {
  const items = templateOptions.map((option) => option.label);

  return (
    <section className="py-12 lg:py-16" aria-label="Available CV layouts">
      <p className="text-center text-sm text-[var(--organic-neutral-500)]" data-reveal>
        One CV, every layout. Switch without rewriting a word.
      </p>
      <div className="marquee mt-7">
        <div className="marquee-track" aria-hidden="true">
          {[...items, ...items].map((label, index) => (
            <span key={`${label}-${index}`} className="flex items-center gap-10 pr-10 font-display text-[2rem] text-foreground/80 sm:text-[2.5rem]">
              <span className={index % 2 === 1 ? 'italic' : ''}>{label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--organic-accent-200)]" />
            </span>
          ))}
        </div>
        <p className="sr-only">{items.join(', ')}</p>
      </div>
    </section>
  );
};

export default LayoutMarquee;
