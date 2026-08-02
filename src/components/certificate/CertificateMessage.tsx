/** Personalized brand letter; the customer name is injected dynamically. */
export function CertificateMessage({ customerName }: { customerName: string }) {
  const recipient = customerName.trim() ? customerName.trim() : "عميلتنا الغالية";

  return (
    <div className="text-center" style={{ color: "#22201c" }}>
      <p className="text-base font-bold" style={{ color: "#9c7138" }}>
        إلى {recipient}،
      </p>
      <div className="mt-3 space-y-3 text-[13px] leading-[2]">
        <p>شكرًا لاختيارك نادين.</p>
        <p>الأناقة الحقيقية لا تُقاس بعدد القطع، بل بجودة ما تختاره.</p>
        <p>نفخر بثقتك بنا، ونسأل الله أن نكون دائمًا عند حسن ظنك.</p>
        <p>
          هذه الشهادة توثق أصالة قطعتك وانضمامها إلى مجموعة مختارة من تصاميم نادين، المصنوعة بعناية
          لتعكس الحرفية، والتميز، والذوق الرفيع.
        </p>
        <p>
          وفي نادين، لا نطمح إلى صناعة الأزياء فحسب، بل إلى تقديم تصاميم تترك أثرًا، وتُلهم الثقة،
          وترتقي بمعايير الأناقة لتُمثل اسم نادين بين أبرز دور الأزياء في العالم.
        </p>
        <p>
          نتمنى أن ترافقك هذه القطعة في أجمل لحظاتك، وأن تبقى رمزًا للجودة والفخامة التي نلتزم
          بتقديمها، وأن تكون بداية رحلة طويلة تجمعنا بك.
        </p>
      </div>
    </div>
  );
}
