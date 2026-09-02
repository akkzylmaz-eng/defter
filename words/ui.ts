import type { Text } from "@/kit/i18n";

/** Interface labels, grouped by the screen they appear on. */
const t = (tr: string, en: string): Text => ({ tr, en });

export const nav = {
  ledger: t("Defter", "Ledger"),
  invoices: t("Makbuzlar", "Receipts"),
  clients: t("Müşteriler", "Clients"),
  tax: t("Vergi", "Tax"),
  cashflow: t("Nakit akışı", "Cash flow"),
} as const;

export const chrome = {
  signIn: t("Giriş", "Sign in"),
  signUp: t("Kayıt", "Create account"),
  signOut: t("Çıkış", "Sign out"),
  openBook: t("Defteri aç", "Open the book"),
  home: t("Ana sayfa", "Home"),
  period: t("Dönem", "Period"),
  asOf: t("Kayıt tarihi", "Books as of"),
  taxYear: t("Vergi yılı", "Tax year"),
} as const;

export const landing = {
  eyebrow: t("Serbest meslek defteri", "Freelance books"),
  lead: t(
    "Makbuzun dört satırı, gelir vergisinin beş dilimi, geçici verginin üç çeyreği ve her müşterinin kendi ödeme gecikmesi. Hepsi saf fonksiyon, hepsi testli.",
    "The four lines of a receipt, the five bands of income tax, the three quarters of advance tax, and every client's own payment lag. All pure functions, all tested.",
  ),
  ctaPrimary: t("Örnek defteri aç", "Open the demo book"),
  ctaSecondary: t("Nasıl hesaplıyor", "How it calculates"),
  argumentsTitle: t("Dört karar", "Four decisions"),
  receiptTitle: t("Serbest meslek makbuzu", "The freelance receipt"),
  receiptLead: t(
    "Aşağıdaki makbuz gerçek fonksiyondan üretiliyor. Brüt ücreti değiştir, dört satır da değişsin.",
    "The receipt below is produced by the real function. Change the gross fee and all four lines follow.",
  ),
  grossLabel: t("Brüt ücret", "Gross fee"),
  sourceCode: t("Kaynak kodu", "Source code"),
} as const;

export const receipt = {
  brut: t("Brüt ücret", "Gross fee"),
  stopaj: t("Stopaj", "Withholding"),
  kdv: t("KDV", "VAT"),
  net: t("Net ücret", "Net fee"),
  tahsil: t("Tahsil edilecek", "Amount collected"),
  note: t(
    "Stopaj ve KDV %20 iken tahsil edilen tutar brüt ücrete eşittir. Stopaj yine de ödenmiştir ve mahsup edilecektir.",
    "With both rates at 20% the collected amount equals the gross fee. The withholding has still been paid, and will still be credited.",
  ),
  noWithholding: t("Bu müşteri stopaj kesmiyor", "This client does not withhold"),
  exported: t("Yurt dışı hizmet: stopaj ve KDV yok", "Exported service: no withholding, no VAT"),
} as const;

export const ledger = {
  title: t("Defter", "Ledger"),
  lead: t(
    "Yılın özeti. Buradaki her rakam makbuzlardan ve vergi motorundan türetilir; hiçbiri kayıtlı değildir.",
    "The year so far. Every figure here is derived from the receipts and the tax engine; none of it is stored.",
  ),
  invoiced: t("Kesilen brüt", "Gross invoiced"),
  collected: t("Tahsil edilen", "Collected"),
  receivable: t("Alacak", "Receivable"),
  withheld: t("Peşin ödenen stopaj", "Withheld at source"),
  balanceTitle: t("Yıl sonu tahmini", "Where the year lands"),
  balanceLead: t(
    "Bugüne kadarki gelir ve giderle, yıl bugün kapansaydı beyanname ne söylerdi.",
    "What the return would say if the year closed today, on the income and expenses booked so far.",
  ),
  base: t("Vergi matrahı", "Taxable base"),
  computed: t("Hesaplanan vergi", "Tax computed"),
  credits: t("Mahsup edilecek", "Credits to offset"),
  owed: t("Ödenecek", "Still owed"),
  refund: t("İade alınacak", "Refundable"),
  effective: t("Efektif oran", "Effective rate"),
  marginal: t("Marjinal oran", "Marginal rate"),
  ageingTitle: t("Alacak yaşlandırma", "Receivables ageing"),
  ageingLead: t(
    "Toplam alacak tek başına bir şey söylemez. Asıl soru bu paranın ne kadar süredir beklediğidir.",
    "A total receivable says nothing on its own. The question is how long that money has been waiting.",
  ),
  clientsTitle: t("Müşteri yoğunlaşması", "Client concentration"),
  interestTitle: t("İşleyen gecikme faizi", "Accrued late interest"),
  interestLead: t(
    "Vadesi geçmiş alacaklar üzerinde işleyen basit faiz. Talep etmek zorunda değilsin ama maliyeti bu.",
    "Simple interest running on overdue receivables. You do not have to claim it, but this is what patience costs.",
  ),
  recent: t("Son makbuzlar", "Recent receipts"),
} as const;

export const bucket = {
  current: t("Vadesi gelmemiş", "Within terms"),
  d1_30: t("1-30 gün", "1-30 days"),
  d31_60: t("31-60 gün", "31-60 days"),
  d61_90: t("61-90 gün", "61-90 days"),
  d90_plus: t("90+ gün", "90+ days"),
} as const;

export const invoices = {
  title: t("Makbuzlar", "Receipts"),
  lead: t(
    "Bir satıra bas, makbuzun dört satırını ve varsa işleyen faizi gör.",
    "Open a row to see the four lines of the receipt, and the interest running on it if it is late.",
  ),
  searchPlaceholder: t("Müşteri, seri no veya iş ara", "Search a client, serial or job"),
  all: t("Hepsi", "All"),
  serial: t("Seri", "Serial"),
  client: t("Müşteri", "Client"),
  work: t("İş", "Work"),
  issued: t("Düzenlendi", "Issued"),
  due: t("Vade", "Due"),
  gross: t("Brüt", "Gross"),
  collect: t("Tahsil", "Collect"),
  state: t("Durum", "State"),
  empty: t("Bu filtreye uyan makbuz yok.", "No receipt matches this filter."),
  lateBy: t("gecikme", "late by"),
  interest: t("işleyen faiz", "interest accrued"),
  totals: t("Toplam", "Totals"),
} as const;

export const clients = {
  title: t("Müşteriler", "Clients"),
  lead: t(
    "Her müşteri hakkında bilmen gereken iki şey: gerçekte ne kadar geç ödüyor ve yılın ne kadarı ona bağlı.",
    "Two things worth knowing about a client: how late they really pay, and how much of the year depends on them.",
  ),
  kindCompany: t("Kurumsal", "Company"),
  kindIndividual: t("Şahıs", "Individual"),
  kindAbroad: t("Yurt dışı", "Abroad"),
  invoiced: t("Kesilen", "Invoiced"),
  collected: t("Tahsil edilen", "Collected"),
  outstanding: t("Açık", "Outstanding"),
  lag: t("Ödeme gecikmesi", "Payment lag"),
  onTime: t("Gününde ödeme", "Paid on time"),
  noHistory: t("henüz geçmiş yok", "no history yet"),
  early: t("erken", "early"),
  concentrationTitle: t("Yoğunlaşma", "Concentration"),
  topShare: t("En büyük müşterinin payı", "Largest client's share"),
  hhi: t("Herfindahl endeksi", "Herfindahl index"),
  hhiNote: t(
    "Tek müşteri 1, on eşit müşteri 0,1 verir. Yalnızca en büyük isme değil, dağılımın tamamına bakar: üç müşterinin her biri %33 ise hiçbir pay tek başına alarm vermez ama defter yine yoğunlaşmıştır.",
    "One client scores 1, ten equal clients score 0.1. It reads the whole distribution rather than the largest name: at three clients of 33% each, no single share looks alarming, yet the book is concentrated.",
  ),
  riskLow: t("Dağılmış", "Spread"),
  riskWatch: t("İzlenmeli", "Watch"),
  riskHigh: t("Yoğun", "Concentrated"),
} as const;

export const tax = {
  title: t("Vergi", "Tax"),
  lead: t(
    "Gelir vergisi dilimleri, geçici vergi takvimi ve her gelen liradan ne kadar ayırman gerektiği.",
    "The income tax bands, the advance instalment calendar, and how much of each incoming lira to put aside.",
  ),
  bandsTitle: t("Dilim dökümü", "Band by band"),
  bandsLead: t(
    "Vergi yalnızca her dilimin içine düşen kısma uygulanır. Toplamı tek bir oranla çarpmak bambaşka bir sayı verir.",
    "Each band applies only to the slice of income inside it. Multiplying the total by one rate gives a completely different number.",
  ),
  band: t("Dilim", "Band"),
  bandRate: t("Oran", "Rate"),
  inBand: t("Bu dilimdeki gelir", "Income in band"),
  bandTax: t("Vergi", "Tax"),
  flatWarning: t(
    "Aynı gelir tek oranla çarpılsaydı:",
    "The same income at a single flat rate would be:",
  ),
  advanceTitle: t("Geçici vergi", "Advance tax"),
  advanceLead: t(
    "Her çeyrek yılbaşından o çeyreğin sonuna kadar kümülatif hesaplanır ve önceden ödenen her şey düşülür.",
    "Each quarter is calculated cumulatively from the start of the year, then reduced by everything already paid.",
  ),
  quarter: t("Çeyrek", "Quarter"),
  cumulativeBase: t("Kümülatif matrah", "Cumulative base"),
  cumulativeTax: t("Kümülatif vergi", "Cumulative tax"),
  offset: t("Mahsup", "Credits"),
  payable: t("Ödenecek", "Payable"),
  carried: t("devreden", "carried"),
  dueOn: t("Son ödeme", "Due"),
  covered: t(
    "Stopaj %20, geçici vergi oranı %15. Kurumsal müşterilerle çalışan bir serbest meslek erbabında kaynakta kesilen vergi çeyreklik taksiti çoğu zaman zaten karşılar, o yüzden ödenecek sıfır çıkar. Bu rahatlatıcı görünür ama yanıltıcıdır: marjinal oran yukarı çıktıkça yıllık beyannamede kapatılacak bir fark birikir.",
    "Withholding is 20% and the advance rate is 15%. For a freelancer working with corporate clients, tax already deducted at source usually covers the quarterly instalment, so nothing is payable. That looks reassuring and is not: as the marginal rate climbs, a gap builds up that the annual return has to settle.",
  ),
  stillOwed: t("Yıllık beyannamede kalan", "Left for the annual return"),
  q4Note: t(
    "Dördüncü çeyrek için geçici vergi yoktur; yıllık beyannamede kapanır.",
    "There is no fourth instalment; the year is settled in the annual return.",
  ),
  setAsideTitle: t("Ne kadar ayırmalı", "How much to put aside"),
  setAsideLead: t(
    "Marjinal oranla kaynakta kesilen stopaj arasındaki fark. Stopaj marjinal oranı zaten karşılıyorsa sıfırdır.",
    "The gap between the marginal rate and what is already withheld at source. Zero when withholding already covers it.",
  ),
  perLira: t("her 1.000 ₺ brüt için", "per 1,000 ₺ of gross"),
  kdvTitle: t("KDV beyannamesi", "VAT return"),
  kdvLead: t(
    "Müşteriye kesilen KDV ile giderlerdeki indirilecek KDV her ay karşılaştırılır. Fark ödenir; ters çıkarsa iade edilmez, devreden KDV olarak sonraki aya taşınır.",
    "Each month sets the VAT charged to clients against the reclaimable VAT on expenses. The difference is paid; when it goes the other way nothing is refunded, and the excess carries into the next month.",
  ),
  kdvMonth: t("Dönem", "Period"),
  kdvCollected: t("Hesaplanan", "Charged"),
  kdvDeductible: t("İndirilecek", "Reclaimable"),
  kdvCarriedIn: t("Devreden", "Brought in"),
  kdvPaid: t("Yıl içinde ödenen KDV", "VAT paid this year"),
  kdvOnAccount: t("Hesapta duran devreden", "Credit still on the account"),
  kdvNote: t(
    "Ocak'ta ekipman alındığı için indirilecek KDV hesaplanandan büyük çıkıyor. Devlet bu farkı geri ödemez; alacak olarak yazmak nakit tablosunu tam o kadar şişirir. Fark şubata devreder ve orada mahsup edilir.",
    "January bought equipment, so its reclaimable VAT is larger than the VAT charged. The state does not pay that difference back, and booking it as a receivable overstates cash by exactly that amount. It carries into February and is offset there.",
  ),
  kdvDueNote: t(
    "Beyanname takip eden ayın 28'inde verilir ve ödenir; yani KDV, iş faturalandıktan yaklaşık iki ay sonra hesaptan çıkar.",
    "The return is filed and paid by the 28th of the following month, so the VAT leaves the account roughly two months after the work was invoiced.",
  ),
} as const;

export const cashflow = {
  title: t("Nakit akışı", "Cash flow"),
  lead: t(
    "Tahsilatlar vadeye değil, o müşterinin geçmiş faturalarından öğrenilen gecikmesine göre yerleştirilir.",
    "Collections are placed by the lag learned from each client's settled invoices, not by the terms on the invoice.",
  ),
  opening: t("Açılış bakiyesi", "Opening balance"),
  monthlyOut: t("Aylık sabit gider", "Fixed monthly outgoings"),
  runway: t("Yeni iş gelmezse", "With no new work"),
  months: t("ay", "months"),
  month: t("Ay", "Month"),
  collections: t("Tahsilat", "Collections"),
  expenses: t("Gider", "Expenses"),
  taxOut: t("Vergi", "Tax"),
  net: t("Net", "Net"),
  balance: t("Bakiye", "Balance"),
  shortfallTitle: t("Açığa düşen ay", "The month it runs out"),
  shortfallNone: t(
    "Projeksiyon boyunca bakiye artıda kalıyor.",
    "The balance stays positive across the projection.",
  ),
  scheduleTitle: t("Beklenen tahsilatlar", "Expected collections"),
  scheduleLead: t(
    "Vade ile beklenen tarih arasındaki fark, o müşterinin öğrenilen gecikmesidir.",
    "The gap between the due date and the expected date is that client's learned lag.",
  ),
  expected: t("Beklenen", "Expected"),
  naiveNote: t(
    "Vadesinde ödeneceğini varsayan projeksiyon şunu gösterirdi:",
    "A projection that assumed payment on the due date would show:",
  ),
  naiveLegend: t("Vadesinde ödenseydi", "If paid on the due date"),
  projectionTitle: t("Altı aylık projeksiyon", "The next six months"),
} as const;

export const auth = {
  loginTitle: t("Deftere dön", "Back to the book"),
  signupTitle: t("Defter aç", "Open a book"),
  lead: t("Örnek çalışma alanı hazır.", "A demo workspace is ready."),
  email: t("E-posta", "Email"),
  password: t("Parola", "Password"),
  business: t("Ünvan", "Trading name"),
  demoNote: t(
    "Bu demo kimlik doğrulaması yapmaz; herhangi bir şey yazıp devam edebilirsin.",
    "This demo does not authenticate; type anything and continue.",
  ),
  toSignup: t("Hesabın yok mu?", "No account yet?"),
  toLogin: t("Zaten hesabın var mı?", "Already have an account?"),
} as const;
