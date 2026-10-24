import type React from "react";
import type { Site } from "@/lib/schema";
import { Logo } from "@/components/brand/Logo";
import { MobileMenu } from "@/motion/widgets";
import { Media } from "@/motion/art";
import { humanHours, pick, ui } from "@/lib/i18n";
import {
  navLinks,
  palette,
  type SectionProps,
  type TemplateDef,
} from "../types";
import { meta } from "./meta";
import { WaffleMotion } from "./client";

/*
 * ВАФЕЛЬНИЦА — семейное кафе с вафлями. Ведущий приём один — «прожим» (waffle-press): тесто в ячейках
 * вафельницы оседает от центра к краям, и в каждой ячейке открывается живая вафля (видео). Так же устроено
 * меню: позиции лежат в ячейках одной большой вафли, при наведении в ячейку стекает сироп.
 * Порядок входа: буквы заголовка подпрыгивают → появляется вафельница → ячейки прожимаются от центра →
 * пар поднимается → наклейки с цифрами прилипают → рукописная пометка со стрелкой.
 * Шрифты: Shantell Sans (заголовки, «рука взрослого на доске меню»), Nunito (текст), Pangolin (пометки).
 */

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const COLS = 6;
const ROWS = 5;

/** Задержка ячейки — расстояние от центра решётки: прожим идёт кольцами. */
function cellDelay(i: number, cols: number, rows: number) {
  const x = (i % cols) - (cols - 1) / 2;
  const y = Math.floor(i / cols) - (rows - 1) / 2;
  return Math.hypot(x, y);
}

/** Буквы заголовка по словам (слово не рвётся при переносе), у каждой свой номер для задержки. */
function Bounce({ text }: { text: string }) {
  let n = 0;
  return (
    <>
      {text.split(/\s+/).map((w, wi) => (
        <span key={wi} className="waffle-word">
          {[...w].map((ch, ci) => (
            <span
              key={ci}
              className="waffle-ch"
              style={{ ["--c" as string]: n++ }}
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}{" "}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </>
  );
}

function Shell({ site, children }: { site: Site; children: React.ReactNode }) {
  const links = navLinks(site);
  const b = site.business;
  const address = [b.street, b.city].filter(Boolean).join(", ");
  return (
    <>
      <WaffleMotion />
      <header className="waffle-bar">
        <a
          href="#top"
          className="waffle-bar__logo"
          aria-label={`${site.name} — ${ui(site.lang, "toTop").toLowerCase()}`}
        >
          {site.brand?.logo ? <Logo site={site} /> : site.name}
        </a>
        <nav className="waffle-bar__nav" aria-label={ui(site.lang, "sections")}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="waffle-bar__side">
          {site.nav.cta.label ? (
            <a className="waffle-btn waffle-btn--sm" href={site.nav.cta.href}>
              {site.nav.cta.label}
            </a>
          ) : null}
          <MobileMenu links={links} cta={site.nav.cta} lang={site.lang} />
        </div>
      </header>
      <main id="top">{children}</main>
      <footer className="waffle-foot">
        <div className="waffle-foot__plate">
          <div className="waffle-foot__logo">
            {site.brand?.logo ? (
              <Logo site={site} variant="footer" />
            ) : (
              site.name
            )}
          </div>
          <p className="waffle-foot__tag">{site.tagline}</p>
          <div className="waffle-foot__cols">
            {address ? (
              <p>
                <small>{ui(site.lang, "address")}</small>
                {address}
              </p>
            ) : null}
            {b.hours.length ? (
              <p>
                <small>{ui(site.lang, "hours")}</small>
                {b.hours.map((h) => humanHours(h, site.lang)).join(" · ")}
              </p>
            ) : null}
            {b.phone ? (
              <p>
                <small>{ui(site.lang, "phone")}</small>
                <a href={tel(b.phone)}>{b.phone}</a>
              </p>
            ) : null}
            <p className="waffle-foot__social">
              {b.socials.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener me">
                  {s.name}
                </a>
              ))}
            </p>
          </div>
          <p className="waffle-foot__legal">
            <span>
              © {new Date().getFullYear()} {b.legalName || site.name}
            </span>
            <a href="#top">↑ {ui(site.lang, "toTop")}</a>
          </p>
        </div>
      </footer>
    </>
  );
}

function Hero({ section: s, site }: SectionProps<"hero">) {
  const stats = site.sections.find((x) => x.type === "stats" && x.enabled);
  const stickers =
    stats && stats.type === "stats" ? stats.items.slice(0, 3) : [];
  const cells = Array.from({ length: COLS * ROWS }, (_, i) =>
    cellDelay(i, COLS, ROWS),
  );
  return (
    <section
      id={s.anchor || undefined}
      className="s s-hero waffle-hero"
      data-waffle-hero
    >
      <div className="waffle-hero__text">
        {s.eyebrow ? <p className="waffle-eyebrow">{s.eyebrow}</p> : null}
        <h1 className="waffle-title">
          <Bounce text={s.title || site.name} />
        </h1>
        {s.subtitle ? <p className="waffle-hero__sub">{s.subtitle}</p> : null}
        <div className="waffle-hero__ctas">
          {s.cta.label ? (
            <a className="waffle-btn" href={s.cta.href || "#"}>
              {s.cta.label}
            </a>
          ) : null}
          {s.ctaSecondary.label ? (
            <a
              className="waffle-btn waffle-btn--ghost"
              href={s.ctaSecondary.href || "#"}
            >
              {s.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      </div>
      <div className="waffle-iron">
        <svg className="waffle-steam" viewBox="0 0 120 60" aria-hidden="true">
          <path d="M20 58 C10 44 30 36 20 22 C12 10 24 6 22 2" pathLength="1" />
          <path d="M60 58 C50 42 72 34 60 20 C52 10 64 4 62 0" pathLength="1" />
          <path
            d="M100 58 C90 46 110 36 100 24 C92 14 104 8 102 4"
            pathLength="1"
          />
        </svg>
        <div className="waffle-plate">
          <div className="waffle-plate__food">
            {s.video ? (
              <video
                src={s.video}
                poster={s.image || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
            ) : (
              <Media
                src={s.image}
                alt=""
                seed={`${site.slug}-hero`}
                colors={palette(site)}
                kind="grid"
                className="media"
              />
            )}
          </div>
          <div
            className="waffle-plate__cells"
            style={{ ["--cols" as string]: COLS }}
            aria-hidden="true"
          >
            {cells.map((d, i) => (
              <span key={i} style={{ ["--d" as string]: d.toFixed(2) }} />
            ))}
          </div>
        </div>
        {stickers.map((g, i) => (
          <p
            key={i}
            className={`waffle-sticker waffle-sticker--${i}`}
            style={{ ["--i" as string]: i }}
          >
            <b>
              {g.value}
              {g.suffix ? <small>{g.suffix.trim()}</small> : null}
            </b>
            <span>{g.label}</span>
          </p>
        ))}
        <p className="waffle-note" aria-hidden="true">
          {pick(site.lang, {
            ru: "печём после заказа",
            uz: "buyurtmadan keyin pishiramiz",
            en: "baked after you order",
          })}
          <svg viewBox="0 0 80 50">
            <path
              d="M4 6 C30 4 58 14 66 40 M56 32 L66 42 L72 28"
              pathLength="1"
            />
          </svg>
        </p>
      </div>
    </section>
  );
}

function About({ section: s, site }: SectionProps<"about">) {
  return (
    <section id={s.anchor || undefined} className="s s-about waffle-about">
      <div className="waffle-about__text" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-h2">{s.title}</h2> : null}
        {s.text ? <p className="waffle-about__body">{s.text}</p> : null}
      </div>
      <figure className="waffle-drawing" data-w="draw">
        <div className="waffle-drawing__photo">
          <Media
            src={s.image}
            alt={s.title || site.name}
            seed={`${site.slug}-about`}
            colors={palette(site)}
            kind="grid"
            className="media"
          />
        </div>
        <svg
          className="waffle-drawing__frame"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M3 4 C30 1 70 6 97 3 C99 30 95 70 98 97 C70 99 30 94 2 98 C4 70 0 30 3 4 Z"
            pathLength="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </figure>
    </section>
  );
}

function Menu({ section: s, site }: SectionProps<"menu">) {
  return (
    <section id={s.anchor || undefined} className="s s-menu waffle-menu">
      <div className="waffle-head" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-h2">{s.title}</h2> : null}
      </div>
      <div className="waffle-menu__boards">
        {s.groups.map((g, gi) => (
          <div
            key={gi}
            className="waffle-board"
            style={{ ["--n" as string]: Math.min(4, g.items.length) }}
          >
            <h3 className="waffle-board__name" data-w="rise">
              {g.name}
            </h3>
            <ul className="waffle-board__grid">
              {g.items.map((it, i) => (
                <li
                  key={i}
                  className="waffle-pocket"
                  data-w="pocket"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="waffle-pocket__syrup" aria-hidden="true" />
                  <span className="waffle-pocket__img">
                    <Media
                      src={it.image}
                      alt={it.name}
                      seed={`${site.slug}-m${gi}-${i}`}
                      colors={palette(site)}
                      kind="grid"
                      className="media"
                    />
                  </span>
                  <b className="waffle-pocket__name">{it.name}</b>
                  {it.text ? (
                    <span className="waffle-pocket__text">{it.text}</span>
                  ) : null}
                  {it.price ? (
                    <span className="waffle-pocket__price">{it.price}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Доставка — шкала прожарки: по мере чтения шагов полоса темнеет от теста до золотой корочки. */
function Process({ section: s, site }: SectionProps<"process">) {
  const marks = pick(site.lang, {
    ru: ["тесто", "румянится", "золотая", "у вас"],
    uz: ["xamir", "qizaryapti", "oltin", "sizda"],
    en: ["batter", "browning", "golden", "at yours"],
  });
  return (
    <section
      id={s.anchor || undefined}
      className="s s-process waffle-process"
      data-waffle-process
    >
      <div className="waffle-head" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-h2">{s.title}</h2> : null}
      </div>
      <div className="waffle-doneness" aria-hidden="true">
        <span className="waffle-doneness__bar" />
        {marks.map((m, i) => (
          <i key={i} style={{ ["--x" as string]: i / (marks.length - 1) }}>
            {m}
          </i>
        ))}
      </div>
      <ol className="waffle-steps">
        {s.items.map((it, i) => (
          <li
            key={i}
            className="waffle-step"
            data-w="rise"
            style={{ ["--i" as string]: i }}
          >
            <span className="waffle-step__n">{i + 1}</span>
            <h3>{it.title}</h3>
            <p>{it.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Цифры уже прилеплены наклейками к вафельнице на первом экране. */
const Stats = () => null;

/** Отзывы — записки на дверце холодильника под магнитами. */
function Testimonials({ section: s }: SectionProps<"testimonials">) {
  const tilt = [-3, 2.2, -1.4, 3, -2.4, 1.6];
  return (
    <section
      id={s.anchor || undefined}
      className="s s-testimonials waffle-fridge"
    >
      <div className="waffle-head" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-h2">{s.title}</h2> : null}
      </div>
      <div className="waffle-fridge__door">
        {s.items.map((it, i) => (
          <figure
            key={i}
            className="waffle-memo"
            data-w="stick"
            style={{
              ["--r" as string]: `${tilt[i % tilt.length]}deg`,
              ["--i" as string]: i,
            }}
          >
            <span className="waffle-memo__magnet" aria-hidden="true" />
            <blockquote>{it.quote}</blockquote>
            <figcaption>
              {it.author}
              {it.role ? <small>{it.role}</small> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Faq({ section: s }: SectionProps<"faq">) {
  return (
    <section id={s.anchor || undefined} className="s s-faq waffle-faq">
      <div className="waffle-head" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-h2">{s.title}</h2> : null}
      </div>
      <div className="waffle-faq__list">
        {s.items.map((it, i) => (
          <details
            key={i}
            className="s-faq__item waffle-faq__item"
            open={i === 0}
          >
            <summary>
              <span>{it.q}</span>
              <i aria-hidden="true" />
            </summary>
            <p>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact({ section: s, site }: SectionProps<"contact">) {
  const b = site.business;
  return (
    <section id={s.anchor || undefined} className="s s-contact waffle-contact">
      <div className="waffle-contact__card" data-w="rise">
        {s.label ? <p className="waffle-label">{s.label}</p> : null}
        {s.title ? <h2 className="waffle-contact__title">{s.title}</h2> : null}
        {s.text ? <p className="waffle-contact__text">{s.text}</p> : null}
        <div className="waffle-contact__ctas">
          {s.cta.label ? (
            <a
              className="waffle-btn"
              href={s.cta.href || (b.phone ? tel(b.phone) : "#")}
            >
              {s.cta.label}
            </a>
          ) : null}
          {b.phone ? (
            <a className="waffle-btn waffle-btn--ghost" href={tel(b.phone)}>
              {b.phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export const template: TemplateDef = {
  ...meta,
  Shell,
  sections: {
    hero: Hero,
    marquee: () => null,
    about: About,
    menu: Menu,
    process: Process,
    stats: Stats,
    testimonials: Testimonials,
    faq: Faq,
    contact: Contact,
  },
};
