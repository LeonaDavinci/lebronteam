"use client";

import { useEffect } from "react";

type ChartData = Record<string, Record<string, number[]>>;

export default function Interactions({ chartData }: { chartData: ChartData }) {
  useEffect(() => {
    /* eslint-disable */
    const svgns = "http://www.w3.org/2000/svg";
    const W = 600,
      H = 210,
      pad = 8,
      max = 80,
      min = 0;
    const x = (i: number, n: number) => (i / (n - 1)) * (W - 2 * pad) + pad;
    const y = (v: number) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);

    // ---------- Chart range toggle ----------
    function draw(range: keyof typeof chartData) {
      const n = chartData[range][Object.keys(chartData[range])[0]].length;
      const g = document.getElementById("lines") as SVGGElement | null;
      if (!g) return;
      g.innerHTML = "";
      [
        { key: "MIA", color: "#f5a623" },
        { key: "CLE", color: "#b3243b" },
        { key: "GSW", color: "#1d6fd0" },
        { key: "LAL", color: "#7a3fb0" },
      ].forEach((t) => {
        const a = chartData[range][t.key];
        let d = `M ${x(0, n).toFixed(2)} ${y(a[0]).toFixed(2)}`;
        a.forEach((v: number, i: number) => {
          if (i) d += ` L ${x(i, n).toFixed(2)} ${y(v).toFixed(2)}`;
        });
        const p = document.createElementNS(svgns, "path");
        p.setAttribute("d", d);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", t.color);
        p.setAttribute("stroke-width", "2.6");
        p.setAttribute("stroke-linejoin", "round");
        p.setAttribute("stroke-linecap", "round");
        g.appendChild(p);
      });
    }
    document.getElementById("ranges")?.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest("button");
      if (!b) return;
      document.querySelectorAll("#ranges button").forEach((x2) => x2.classList.remove("active"));
      b.classList.add("active");
      draw((b as HTMLElement).dataset.r as keyof typeof chartData);
    });

    // ---------- Toast ----------
    let tt: any;
    function toast(msg: string) {
      const el = document.getElementById("toast") as HTMLElement | null;
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(tt);
      tt = setTimeout(() => el.classList.remove("show"), 1900);
    }

    // ---------- Yes/No selection + vote ----------
    const fmt = (n: number) => (n || 0).toLocaleString();
    function setTally(ab: string, votes: Record<string, { yes: number; no: number }>) {
      const el = document.querySelector(`[data-tally="${ab}"]`);
      if (el && votes[ab]) el.textContent = `${fmt(votes[ab].yes)} Yes · ${fmt(votes[ab].no)} No`;
    }
    document.querySelectorAll(".yn button").forEach((b) => {
      b.addEventListener("click", () => {
        const grp = (b as HTMLElement).parentElement;
        if (grp) {
          grp.querySelectorAll("button").forEach((x2) => x2.classList.remove("sel-yes", "sel-no"));
          b.classList.add(b.classList.contains("yes") ? "sel-yes" : "sel-no");
        }
        const nm = (b as HTMLElement).dataset.t || "";
        const val = b.querySelector(".val")?.textContent || "";
        toast(`Selected ${b.classList.contains("yes") ? "Yes" : "No"} · ${nm} @ ${val}¢`);

        const row = (b as HTMLElement).closest(".mrow") as HTMLElement | null;
        const ab = row && row.dataset.abbr;
        if (!ab) return;
        const choice = (b as HTMLElement).classList.contains("yes") ? "yes" : "no";
        fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ team: ab, choice }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((votes) => {
            if (votes) setTally(ab, votes);
          })
          .catch(() => {});
      });
    });

    async function loadVotes() {
      try {
        const r = await fetch("/api/votes");
        if (!r.ok) return;
        const votes = (await r.json()) as Record<string, { yes: number; no: number }>;
        Object.keys(votes).forEach((ab) => setTally(ab, votes));
      } catch (e) {
        /* offline */
      }
    }

    // ---------- Comments ----------
    const cform = document.getElementById("cform") as HTMLFormElement | null;
    const clist = document.getElementById("clist") as HTMLElement | null;
    const cwarn = document.getElementById("cwarn") as HTMLElement | null;
    const esc = (s: string) =>
      s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
    function renderComments(arr: any[]) {
      if (!clist) return;
      if (!Array.isArray(arr) || !arr.length) {
        clist.innerHTML = '<div class="cload">No comments yet — be the first.</div>';
        return;
      }
      clist.innerHTML = arr
        .slice()
        .reverse()
        .map(
          (c) => `
        <div class="citem">
          <div class="cmeta"><b>${esc(c.name || "Anonymous")}</b><span>${new Date(c.ts).toLocaleString()}</span></div>
          <div class="cbody">${esc(c.message)}</div>
        </div>`
        )
        .join("");
    }
    async function loadComments() {
      try {
        const r = await fetch("/api/comments");
        if (!r.ok) {
          if (clist) clist.innerHTML = '<div class="cload">Comments unavailable.</div>';
          return;
        }
        renderComments(await r.json());
      } catch (e) {
        if (clist)
          clist.innerHTML =
            '<div class="cload">Deploy to Vercel + set BLOB_READ_WRITE_TOKEN to enable comments.</div>';
      }
    }
    cform?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = (document.getElementById("cname") as HTMLInputElement)?.value.trim() || "";
      const msg = (document.getElementById("cmsg") as HTMLTextAreaElement)?.value.trim() || "";
      if (!msg) {
        if (cwarn) cwarn.textContent = "Write something first.";
        return;
      }
      if (cwarn) cwarn.textContent = "";
      const btn = cform.querySelector("button") as HTMLButtonElement | null;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Posting…";
      }
      try {
        const r = await fetch("/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message: msg }),
        });
        if (r.ok) {
          renderComments(await r.json());
          cform.reset();
        } else if (cwarn) cwarn.textContent = "Could not post (server error).";
      } catch (e) {
        if (cwarn) cwarn.textContent = "Needs a Vercel deployment to save.";
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Post comment";
      }
    });

    loadVotes();
    loadComments();
    /* eslint-enable */
  }, [chartData]);

  return null;
}
