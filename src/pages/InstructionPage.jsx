import './InstructionPage.css'

export function InstructionPage({ t }) {
  const instruction = t.instruction

  return (
    <div className="instruction-page container">
      <section className="instruction-hero" data-reveal>
        <h1 className="section-title">{instruction.title}</h1>
        <p className="section-subtitle">{instruction.subtitle}</p>
      </section>

      <section className="instruction-steps">
        {instruction.steps.map((step, index) => (
          <article key={step.title} className="step-card" data-reveal data-reveal-delay={`${90 * (index + 1)}`}>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>

      <section className="instruction-checklist" data-reveal>
        <h2>{instruction.checklistTitle}</h2>
        <ul>
          {instruction.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="instruction-faq" data-reveal>
        <h2>{instruction.faqTitle}</h2>
        <div className="faq-grid">
          {instruction.faq.map((item, index) => (
            <article key={item.q} className="faq-card" data-reveal data-reveal-delay={`${80 * (index + 1)}`}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
