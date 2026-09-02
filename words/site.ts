import type { Text } from "@/kit/i18n";

/**
 * What a visitor reads before signing in. Product copy only: the interface
 * labels live in `words/ui.ts` and the navigation lives in the frame, so
 * there is no single configuration object holding the whole app hostage.
 */

export const product = {
  name: "Defter",
  tagline: {
    tr: "Serbest meslek defteri: makbuz, vergi ve gerçekçi nakit akışı",
    en: "Freelance books: receipts, tax, and a cash-flow plan that is honest",
  } satisfies Text,
  description: {
    tr: "Defter; serbest meslek makbuzunu, gelir vergisi dilimlerini, geçici vergiyi ve tahsilat gecikmesini tek bir yerde tutar. Her rakam kuruş cinsinden tam sayı aritmetiğiyle hesaplanır.",
    en: "Defter keeps the freelance receipt, the progressive tax bands, the advance instalments and the collection lag in one place. Every figure is computed in integer kuruş.",
  } satisfies Text,
} as const;

export interface Argument {
  mark: "01" | "02" | "03" | "04";
  title: Text;
  body: Text;
}

export const arguments_: Argument[] = [
  {
    mark: "01",
    title: { tr: "Stopaj kaybolmuş para değildir", en: "Withholding is not money that vanished" },
    body: {
      tr: "Stopaj ve KDV oranlarının ikisi de %20 olduğu için makbuzda tahsil edilen tutar brüt ücrete eşit çıkar. Bu tesadüf, çoğu kişiye stopajın gerçek olmadığını düşündürür. Gerçektir: henüz hesaplanmamış bir vergi borcuna karşılık peşin ödenmiştir ve yıl sonunda mahsup edilir.",
      en: "Withholding and VAT are both 20%, so the amount collected on a receipt equals the gross fee exactly. That coincidence convinces people withholding is not real. It is: it has been paid in advance against a tax bill nobody has calculated yet, and it comes back as a credit.",
    },
  },
  {
    mark: "02",
    title: { tr: "Vergi dilimi çarpma işlemi değildir", en: "A tax band is not a multiplication" },
    body: {
      tr: "Gelirin girdiği dilimi bulup toplamı o oranla çarpmak, vergiyi on binlerce lira fazla gösterir ve daha kötüsü, bir lira fazla kazanmanın zarara dönüştüğü bir uçurum yaratır. Defter her dilimi yalnızca kendi içine düşen dilim için uygular ve bu davranış testle sabitlenmiştir.",
      en: "Finding the band an income falls into and multiplying the whole amount by its rate overstates the bill by tens of thousands, and worse, creates a cliff where earning one lira more costs money. Defter taxes only the slice inside each band, and a test pins that down.",
    },
  },
  {
    mark: "03",
    title: { tr: "Geçici vergi kümülatiftir", en: "Advance tax is cumulative" },
    body: {
      tr: "İkinci çeyrek nisan-haziran üzerinden değil, ocak-haziran üzerinden hesaplanır ve daha önce ödenen her şey düşülür. Çeyrekleri bağımsız hesaplamak yalnızca gelir düz olduğunda doğru sonuç verir; serbest çalışanın geliri hiçbir zaman düz değildir.",
      en: "The second quarter is calculated on January to June, not April to June, and reduced by everything already paid. Treating quarters as independent is only right when income is flat, and a freelancer's income is never flat.",
    },
  },
  {
    mark: "04",
    title: { tr: "Nakit akışı vadeye değil, müşteriye bakar", en: "Cash flow follows the client, not the terms" },
    body: {
      tr: "Faturaların vadesinde ödendiğini varsayan projeksiyon her zaman aynı yönde yanılır. Defter her müşterinin kendi ödeme gecikmesini geçmiş faturalarından öğrenir ve tahsilatı oraya yazar. İki yıldır her faturayı 45 günde ödeyen müşteri, bu sefer de 45 günde öder.",
      en: "A projection that assumes invoices are paid on their due date is always wrong in the same direction. Defter learns each client's own lag from their settled invoices and books the collection there. A client who has taken 45 days on every invoice for two years will take 45 days again.",
    },
  },
];

export interface Figure {
  label: Text;
  note: Text;
}

/** The three numbers the landing page leads with, all computed at render time. */
export const figures = {
  collected: {
    label: { tr: "Bu yıl tahsil edilen", en: "Collected this year" },
    note: { tr: "makbuz toplamı, KDV dahil", en: "receipt totals, VAT included" },
  } satisfies Figure,
  withheld: {
    label: { tr: "Peşin ödenen stopaj", en: "Withheld at source" },
    note: { tr: "yıl sonunda mahsup edilecek", en: "credited against the annual bill" },
  } satisfies Figure,
  lag: {
    label: { tr: "Ortanca tahsilat gecikmesi", en: "Median collection lag" },
    note: { tr: "vadeden sonra geçen gün", en: "days past the due date" },
  } satisfies Figure,
};

export const closing = {
  tr: "Portfolyo amaçlı bir demo. Veriler örnektir, dış servise bağlanmaz ve mali müşavir yerine geçmez.",
  en: "A portfolio demo. The data is fixture data, nothing calls an external service, and none of it is professional tax advice.",
} satisfies Text;
