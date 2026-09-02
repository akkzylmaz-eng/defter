import { describe, expect, it } from "vitest";
import { lira } from "@/kit/money";
import { DEFAULT_RATES } from "@/engine/makbuz/receipt";
import type { Invoice } from "@/engine/invoices/types";
import { concentration, standings, type Client } from "@/engine/clients/book";
import { clients } from "@/records/clients";
import { invoices } from "@/records/invoices";

const client = (id: string): Client => ({
  id, name: id, kind: "company", since: "2026-01-01", note: { tr: "", en: "" },
});

function invoice(clientId: string, over: Partial<Invoice> = {}): Invoice {
  return {
    id: Math.random().toString(36), serial: "x", clientId,
    description: { tr: "", en: "" },
    brut: lira(10_000), rates: DEFAULT_RATES,
    issuedOn: "2026-01-01", dueOn: "2026-01-31", paidOn: null,
    ...over,
  };
}

describe("standings", () => {
  it("learns each client's median lag past the due date", () => {
    const book = standings(
      [client("a")],
      [
        invoice("a", { dueOn: "2026-01-31", paidOn: "2026-02-10" }),
        invoice("a", { dueOn: "2026-02-28", paidOn: "2026-03-12" }),
        invoice("a", { dueOn: "2026-03-31", paidOn: "2026-04-12" }),
      ],
    );
    expect(book[0].lagDays).toBe(12);
  });

  it("reports a negative lag for a client that pays early", () => {
    const book = standings(
      [client("a")],
      [invoice("a", { dueOn: "2026-01-31", paidOn: "2026-01-25" })],
    );
    expect(book[0].lagDays).toBe(-6);
  });

  it("has no opinion about a client with no settled invoices", () => {
    const book = standings([client("a")], [invoice("a")]);
    expect(book[0].lagDays).toBe(0);
    expect(book[0].onTimeRate).toBe(0);
    expect(book[0].outstanding).toBeGreaterThan(0);
  });

  it("excludes drafts from every figure", () => {
    const book = standings([client("a")], [invoice("a", { draft: true })]);
    expect(book[0].invoices).toBe(0);
    expect(book[0].invoiced).toBe(0);
  });

  it("sorts the book by how much each client is worth", () => {
    const book = standings(clients, invoices);
    for (let i = 1; i < book.length; i += 1) {
      expect(book[i - 1].invoiced).toBeGreaterThanOrEqual(book[i].invoiced);
    }
    expect(book[0].client.id).toBe("torna");
  });

  it("picks up the agency's long lag from the demo book", () => {
    const kavun = standings(clients, invoices).find((s) => s.client.id === "kavun")!;
    expect(kavun.lagDays).toBeGreaterThan(30);
    expect(kavun.onTimeRate).toBe(0);
  });
});

describe("concentration", () => {
  it("reads the whole distribution, not only the largest name", () => {
    // Three clients at a third each: no single share looks alarming.
    const even = concentration(
      standings(
        [client("a"), client("b"), client("c")],
        [
          invoice("a", { paidOn: "2026-02-01" }),
          invoice("b", { paidOn: "2026-02-01" }),
          invoice("c", { paidOn: "2026-02-01" }),
        ],
      ),
    );
    expect(even.topShare).toBe(33.3);
    expect(even.hhi).toBeCloseTo(0.333, 2);
    expect(even.risk).toBe("watch");
  });

  it("calls a single-client book maximum risk", () => {
    const single = concentration(
      standings([client("a")], [invoice("a", { paidOn: "2026-02-01" })]),
    );
    expect(single.hhi).toBe(1);
    expect(single.topShare).toBe(100);
    expect(single.risk).toBe("high");
  });

  it("calls a wide book low risk", () => {
    const many = "abcdefghij".split("").map(client);
    const wide = concentration(
      standings(many, many.map((c) => invoice(c.id, { paidOn: "2026-02-01" }))),
    );
    expect(wide.hhi).toBeCloseTo(0.1, 2);
    expect(wide.risk).toBe("low");
  });

  it("is empty rather than NaN with no income at all", () => {
    const empty = concentration(standings([client("a")], []));
    expect(empty.hhi).toBe(0);
    expect(empty.topClient).toBeNull();
    expect(empty.risk).toBe("low");
  });

  it("flags the demo workspace, which leans on one client", () => {
    const result = concentration(standings(clients, invoices));
    expect(result.topClient!.id).toBe("torna");
    expect(result.risk).not.toBe("low");
  });
});
