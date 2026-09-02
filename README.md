<div align="center">

# Defter

**Serbest meslek defteri: makbuz, vergi ve gerçekçi nakit akışı**
*Freelance books: receipts, tax, and a cash-flow plan that is honest*

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Vitest

[**Canlı demo / Live demo →**](https://defter-eta.vercel.app)

[![live](https://img.shields.io/badge/demo-defter-1f2328?style=flat-square)](https://defter-eta.vercel.app)
[![ci](https://img.shields.io/github/actions/workflow/status/akkzylmaz-eng/defter/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/akkzylmaz-eng/defter/actions)

</div>

---

## 🇹🇷 Türkçe

Defter, Türkiye'de serbest çalışan birinin defterini tutar: serbest meslek
makbuzu, gelir vergisi dilimleri, geçici vergi taksitleri, alacak yaşlandırma
ve her müşterinin kendi ödeme gecikmesinden öğrenen bir nakit akışı projeksiyonu.

Bu bir arayüz taslağı değil. Bütün hesap saf TypeScript fonksiyonlarında yazıldı,
React'ten ve sabit veriden tamamen bağımsız, ve **105 testle** korunuyor.
Ekrandaki her rakam bu fonksiyonlardan üretilir; hiçbiri kayıtlı değil, hiçbiri
elle yazılmadı.

### Ürünü ayıran dört karar

**1 · Para kuruştur, ondalık sayı değildir.**
Bütün tutarlar tam sayı kuruş olarak tutulur. Bu titizlik değil zorunluluk:
1.234,56 TL'nin %20 KDV'si kayan noktalı sayıda `246.91200000000003` çıkar ve
bir kuruş tutmayan fatura mali müşavirin geri gönderdiği faturadır. Tam sayı
aritmetiği hesabı kesinleştirir, yuvarlamayı da kazara olan bir şey olmaktan
çıkarıp açıkça test edilen bir karara dönüştürür. `split()` bir tutarı paylara
böler ve payların toplamı her zaman tutarın kendisidir; `Math.round(toplam/n)`
ise 100 kuruşu üçe bölerken 99 ya da 102 üretir.

**2 · Vergi dilimi bir çarpma işlemi değildir.**
Gelirin girdiği dilimi bulup toplamı o oranla çarpmak, bu modülün var olma
sebebi olan hatadır: vergiyi on binlerce lira fazla gösterir ve daha kötüsü,
bir lira fazla kazanmanın zarara dönüştüğü bir uçurum yaratır. Defter her
dilimi yalnızca kendi içine düşen gelir dilimine uygular. Test, dilim
sınırlarında bir lira fazla kazanmanın hiçbir zaman bir liradan fazlaya mal
olmadığını doğrular.

**3 · Geçici vergi kümülatiftir.**
İkinci çeyrek nisan-haziran üzerinden değil, ocak-haziran üzerinden hesaplanır
ve önceden ödenen her şey düşülür. Çeyrekleri bağımsız hesaplamak yalnızca
gelir düz olduğunda doğru sonuç verir; serbest çalışanın geliri hiçbir zaman
düz değildir. Mart'ta gelen tek bir büyük fatura, bağımsız hesaplayan bir
sistemde yılın kalan her çeyreğini eksik ödetir.

Ürünün asıl gözlemi de burada çıkıyor: stopaj %20, geçici vergi oranı %15
olduğu için kurumsal müşteriyle çalışan birinde çeyreklik taksit çoğu zaman
sıfır çıkar. Bu rahatlatıcı görünür ve yanıltıcıdır; marjinal oran yukarı
çıktıkça yıllık beyannamede kapatılacak bir fark birikir.

**4 · Nakit akışı vadeye değil, müşteriye bakar.**
Faturaların vadesinde ödendiğini varsayan projeksiyon her zaman aynı yönde
yanılır ve tam da önemli olduğu ayda yanılır. Defter her müşterinin ödeme
gecikmesini kendi kapanmış faturalarından (ortancasıyla, ortalamasıyla değil)
öğrenir ve tahsilatı oraya yazar. Nakit akışı ekranında iki çizgi birden
çizilir: öğrenen projeksiyon ve vadeye inanan projeksiyon. Aradaki fark ekranın
bütün mevzusudur.

### Ekranlar

| Ekran | İçerik |
|---|---|
| **Defter** | Kesilen brüt, tahsil edilen, alacak, peşin ödenen stopaj; yıl bugün kapansaydı beyanname ne derdi; alacak yaşlandırma; işleyen gecikme faizi; müşteri yoğunlaşması |
| **Makbuzlar** | Bütün makbuzlar; bir satıra basınca makbuzun dört satırı (brüt, stopaj, KDV, tahsil) ve gecikmişse işleyen faiz açılır |
| **Müşteriler** | Her müşterinin öğrenilmiş ödeme gecikmesi, gününde ödeme oranı, açık bakiyesi; Herfindahl endeksiyle yoğunlaşma riski |
| **Vergi** | Dilim dökümü (matrahı kaydırıp dilimlerin nasıl çalıştığını gör), tek oranla çarpsaydık ne çıkardı karşılaştırması, geçici vergi takvimi, ayırma oranı |
| **Nakit akışı** | Altı aylık projeksiyon: öğrenilen gecikmeye göre tahsilatlar, sabit giderler, vergi çıkışları, açığa düşülen ay |

### Mimari

```
engine/          alan mantığı: saf fonksiyonlar, React'i de records/'ı da bilmez
  makbuz/        serbest meslek makbuzu, net üzerinden brütleştirme
  tax/           dilimler, yıllık beyanname, kümülatif geçici vergi
  invoices/      durum türetme, yaşlandırma, gecikme faizi
  clients/       ödeme gecikmesi öğrenme, yoğunlaşma (HHI)
  cashflow/      projeksiyon, açığa düşen ay, dayanma süresi
kit/             kuruş aritmetiği, takvim günü aritmetiği, biçimlendirme, i18n
records/         sabit defter: müşteriler, makbuzlar, çalışma alanı
  book.ts        engine ile records'un birleştiği tek yer
paper/           parts/ (belge primitifleri) + frame/ (kabuk)
words/           iki dilli metinler: site.ts + ui.ts
checks/          105 test
app/             sayfalar
```

`engine/` hiçbir sabit veriyi, `records/` hiçbir React'i import etmez.
İkisinin buluştuğu tek dosya `records/book.ts`. Defter sayfasındaki bir rakamla
vergi sayfasındaki aynı rakamın ayrışamamasının sebebi bu: o rakamdan bir tane var.

### Çalıştırma

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + test
npm run build
```

Anahtar gerekmez. `.env.local` boşken uygulama `records/` altındaki sabit
defterle çalışır; testlerin çalıştığı veri de aynı veridir.

### Uyarı

Vergi oranları ve dilimler 2026 için `engine/tax/brackets.ts` içinde **veri
olarak** durur, formülün içine gömülü değil; yeni yıl bir yeniden yazım değil,
yeni bir kayıttır. Yine de bu bir portfolyo projesidir ve mali müşavir yerine
geçmez.

---

## 🇬🇧 English

Defter keeps the books for a Turkish sole trader: the freelance receipt, the
progressive income tax bands, the quarterly advance instalments, receivables
ageing, and a cash-flow projection that learns how late each client actually pays.

This is not an interface mock. All of the arithmetic lives in pure TypeScript
functions that know nothing about React or about the fixture data, covered by
**105 tests**. Every figure on screen is derived from those functions: none of
it is stored, and none of it is typed in by hand.

### The four decisions that define it

**1 · Money is kuruş, not a decimal.**
Every amount is an integer number of kuruş. This is not fussiness: 20% VAT on
1.234,56 TL computed in floats lands on `246.91200000000003`, and an invoice
that is one kuruş out is an invoice the accountant sends back. Integers make
the arithmetic exact and turn rounding from an accident into an explicit,
tested decision. `split()` divides an amount into shares that always add back
up to the amount, where `Math.round(total/n)` splitting 100 kuruş three ways
produces 99 or 102.

**2 · A tax band is not a multiplication.**
Finding the band an income falls into and multiplying the whole amount by its
rate is the bug this module exists to prevent: it overstates the bill by tens
of thousands, and worse, creates a cliff where earning one more lira costs you
money. Defter taxes only the slice of income inside each band, and a test
asserts that at every boundary, one more lira never costs more than one lira.

**3 · Advance tax is cumulative.**
The second quarter is calculated on January to June, not April to June, and
then reduced by everything already paid. Treating the quarters as independent
is only correct when income is flat, and a freelancer's income is never flat:
one large invoice in March makes the standalone version underpay every
remaining quarter.

That rule produces the product's real observation. Withholding is 20% and the
advance rate is 15%, so for anyone working with corporate clients the quarterly
instalment is usually zero. That looks reassuring and is not: as the marginal
rate climbs, a gap builds that only the annual return settles.

**4 · Cash flow follows the client, not the terms.**
A projection that assumes invoices are paid on their due date is always wrong
in the same direction, and it is wrong in the month that matters. Defter learns
each client's lag from their own settled invoices, by median rather than mean,
and books the collection there. The cash-flow screen draws both lines, the one
that learns and the one that believes the due date. The gap between them is the
entire point of the screen.

### Screens

| Screen | What it shows |
|---|---|
| **Ledger** | Gross invoiced, collected, receivable, withheld at source; what the return would say if the year closed today; receivables ageing; accrued late interest; client concentration |
| **Receipts** | The whole receipt book; opening a row shows the four lines of the receipt (gross, withholding, VAT, collected) and the interest running on it if it is late |
| **Clients** | Each client's learned payment lag, on-time rate and open balance, plus concentration risk by Herfindahl index |
| **Tax** | The band-by-band breakdown, with the base on a slider so the bands can be watched working, a comparison against the flat-rate answer, the advance calendar, and the set-aside rate |
| **Cash flow** | Six months out: collections placed by learned lag, fixed outgoings, tax outflows, and the month the balance runs out |

### Architecture

```
engine/          domain logic: pure functions, aware of neither React nor records/
  makbuz/        the freelance receipt, and grossing up from a target net
  tax/           bands, the annual return, cumulative advance instalments
  invoices/      derived state, ageing, late interest
  clients/       payment-lag learning, concentration (HHI)
  cashflow/      projection, shortfall month, runway
kit/             kuruş arithmetic, calendar-day arithmetic, formatting, i18n
records/         the frozen book: clients, receipts, workspace
  book.ts        the single seam where engine and records meet
paper/           parts/ (document primitives) + frame/ (chrome)
words/           bilingual copy: site.ts + ui.ts
checks/          105 tests
app/             pages
```

`engine/` imports no fixture and `records/` imports no React. The one file
where they meet is `records/book.ts`, which is why a figure on the ledger page
and the same figure on the tax page cannot drift apart: there is only one of it.

### Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # typecheck + lint + test
npm run build
```

No keys are needed. With an empty `.env.local` the app runs on the frozen book
in `records/`, which is the same data the tests run against.

### A caveat

The 2026 rates and bands live in `engine/tax/brackets.ts` as **data** rather
than embedded in a formula, so a new year is a new entry and not a rewrite.
It is still a portfolio project, and it is not a substitute for an accountant.

---

## Lisans / License

Tüm hakları saklıdır. Bu depo, kaynak kodu okunup incelenebilsin diye
yayımlanmıştır; açık kaynak değildir. Ayrıntılar için `LICENSE` dosyasına bakın.

All rights reserved. This repository is published so its source can be read and
evaluated; it is not open-source software. See `LICENSE` for the details.
