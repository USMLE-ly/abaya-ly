import { CHARCOAL, GOLD_MID } from "./tokens";

/** The brand's personal authenticity letter — approved copy, editorial presentation. */
export function CertificateMessage() {
  const paragraphs = [
    "شكرًا لاختيارك نادين.",
    "الأناقة الحقيقية لا تُقاس بعدد القطع، بل بجودة ما تختاره.",
    "نفخر بثقتك بنا، ونسأل الله أن نكون دائمًا عند حسن ظنك.",
    "هذه الشهادة توثق أصالة قطعتك وانضمامها إلى مجموعة مختارة من تصاميم نادين، المصنوعة بعناية لتعكس الحرفية، والتميز، والذوق الرفيع.",
    "وفي نادين، لا نطمح إلى صناعة الأزياء فحسب، بل إلى تقديم تصاميم تترك أثرًا، وتُلهم الثقة، وترتقي بمعايير الأناقة لتُمثل اسم نادين بين أبرز دور الأزياء في العالم.",
    "نتمنى أن ترافقك هذه القطعة في أجمل لحظاتك، وأن تبقى رمزًا للجودة والفخامة التي نلتزم بتقديمها، وأن تكون بداية رحلة طويلة تجمعنا بك.",
  ];

  return (
    <div className="mx-auto max-w-lg text-center">
      <p className="text-sm font-bold" style={{ color: GOLD_MID, letterSpacing: "-0.01em" }}>
        إلى عميلتنا العزيزة،
      </p>
      <div
        className="mx-auto mt-4 h-px w-24"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,94,0.7), transparent)" }}
      />
      <div className="mt-5 space-y-4 text-[13px] leading-8" style={{ color: CHARCOAL }}>
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </div>
  );
}
