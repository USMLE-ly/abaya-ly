/** The brand's personal authenticity letter, addressed to the customer. */
export function CertificateMessage({ name }: { name: string }) {
  const paragraphs = [
    "شكرًا لاختيارك نادين.",
    "الأناقة الحقيقية لا تُقاس بعدد القطع، بل بجودة ما تختاره.",
    "نفخر بثقتك بنا، ونسأل الله أن نكون دائمًا عند حسن ظنك.",
    "هذه الشهادة توثق أصالة قطعتك وانضمامها إلى مجموعة مختارة من تصاميم نادين، المصنوعة بعناية لتعكس الحرفية، والتميز، والذوق الرفيع.",
    "وفي نادين، لا نطمح إلى صناعة الأزياء فحسب، بل إلى تقديم تصاميم تترك أثرًا، وتُلهم الثقة، وترتقي بمعايير الأناقة لتُمثل اسم نادين بين أبرز دور الأزياء في العالم.",
    "نتمنى أن ترافقك هذه القطعة في أجمل لحظاتك، وأن تبقى رمزًا للجودة والفخامة التي نلتزم بتقديمها، وأن تكون بداية رحلة طويلة تجمعنا بك.",
  ];

  return (
    <div className="mx-auto max-w-md text-center" style={{ color: "#4a3a2a" }}>
      <p
        className="text-sm font-bold"
        style={{ color: "#9c7138", letterSpacing: "-0.01em" }}
      >
        إلى {name || "عميلتنا"}،
      </p>
      <div className="mt-3 space-y-3 text-[13px] leading-7">
        {paragraphs.map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </div>
  );
}
