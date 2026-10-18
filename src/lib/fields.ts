import type { SectionType } from './schema'

/*
 * Описание полей секций для конструктора в админке. Форма строится из этого списка,
 * поэтому новая секция = схема в schema.ts + строка здесь + базовый рендер.
 */

export type Field =
  | { key: string; label: string; kind: 'text' | 'textarea' | 'image' | 'bool' | 'strings' | 'number'; hint?: string }
  | { key: string; label: string; kind: 'link' }
  | { key: string; label: string; kind: 'list'; item: Field[]; itemLabel: string; empty: Record<string, unknown> }

const common: Field[] = [
  { key: 'label', label: 'Подпись / пункт меню', kind: 'text' },
  { key: 'title', label: 'Заголовок', kind: 'textarea' },
  { key: 'anchor', label: 'Якорь (латиница)', kind: 'text', hint: 'Если задан вместе с подписью — секция появится в меню' },
]

export const SECTION_META: Record<SectionType, { name: string; description: string; fields: Field[] }> = {
  hero: {
    name: 'Первый экран',
    description: 'H1, подзаголовок и кнопки. Заголовок становится единственным H1 страницы.',
    fields: [
      { key: 'eyebrow', label: 'Надзаголовок', kind: 'text' },
      { key: 'title', label: 'Заголовок (H1)', kind: 'textarea' },
      { key: 'subtitle', label: 'Подзаголовок', kind: 'textarea' },
      { key: 'words', label: 'Сменяющиеся слова (по строке)', kind: 'strings' },
      { key: 'cta', label: 'Главная кнопка', kind: 'link' },
      { key: 'ctaSecondary', label: 'Вторая кнопка', kind: 'link' },
      { key: 'image', label: 'Фото (адрес)', kind: 'image' },
      { key: 'anchor', label: 'Якорь', kind: 'text' },
    ],
  },
  marquee: { name: 'Бегущая строка', description: 'Ключевые слова лентой.', fields: [{ key: 'items', label: 'Слова (по строке)', kind: 'strings' }] },
  about: {
    name: 'О компании',
    description: 'Манифест или рассказ.',
    fields: [...common, { key: 'text', label: 'Текст', kind: 'textarea' }, { key: 'image', label: 'Фото (адрес)', kind: 'image' }],
  },
  services: {
    name: 'Услуги',
    description: 'Попадают в OfferCatalog разметки и в llms.txt.',
    fields: [
      ...common,
      { key: 'intro', label: 'Вступление', kind: 'textarea' },
      {
        key: 'items',
        label: 'Услуги',
        kind: 'list',
        itemLabel: 'Услуга',
        empty: { title: 'Новая услуга', text: '', price: '', tag: '' },
        item: [
          { key: 'title', label: 'Название', kind: 'text' },
          { key: 'text', label: 'Описание', kind: 'textarea' },
          { key: 'price', label: 'Цена', kind: 'text', hint: '«от 450 000 сум» — число уйдёт в разметку' },
          { key: 'tag', label: 'Метка', kind: 'text' },
        ],
      },
    ],
  },
  works: {
    name: 'Работы / проекты',
    description: 'Кейсы, объекты, коллекции.',
    fields: [
      ...common,
      {
        key: 'items',
        label: 'Проекты',
        kind: 'list',
        itemLabel: 'Проект',
        empty: { title: 'Новый проект', category: '', year: '', text: '', image: '', href: '' },
        item: [
          { key: 'title', label: 'Название', kind: 'text' },
          { key: 'category', label: 'Категория', kind: 'text' },
          { key: 'year', label: 'Год', kind: 'text' },
          { key: 'text', label: 'Описание', kind: 'textarea' },
          { key: 'image', label: 'Фото (адрес)', kind: 'image' },
          { key: 'href', label: 'Ссылка', kind: 'text' },
        ],
      },
    ],
  },
  stats: {
    name: 'Цифры',
    description: 'Число набегает при прокрутке.',
    fields: [
      ...common,
      {
        key: 'items',
        label: 'Показатели',
        kind: 'list',
        itemLabel: 'Показатель',
        empty: { value: '0', suffix: '', label: '' },
        item: [
          { key: 'value', label: 'Число', kind: 'text' },
          { key: 'suffix', label: 'Суффикс', kind: 'text' },
          { key: 'label', label: 'Подпись', kind: 'text' },
        ],
      },
    ],
  },
  process: {
    name: 'Этапы',
    description: 'Идут в разметку HowTo.',
    fields: [
      ...common,
      { key: 'items', label: 'Шаги', kind: 'list', itemLabel: 'Шаг', empty: { title: 'Шаг', text: '' }, item: [{ key: 'title', label: 'Название', kind: 'text' }, { key: 'text', label: 'Текст', kind: 'textarea' }] },
    ],
  },
  testimonials: {
    name: 'Отзывы',
    description: 'Только настоящие: идут в разметку Review.',
    fields: [
      ...common,
      {
        key: 'items',
        label: 'Отзывы',
        kind: 'list',
        itemLabel: 'Отзыв',
        empty: { quote: '', author: '', role: '' },
        item: [{ key: 'quote', label: 'Текст', kind: 'textarea' }, { key: 'author', label: 'Автор', kind: 'text' }, { key: 'role', label: 'Кто он', kind: 'text' }],
      },
    ],
  },
  team: {
    name: 'Команда',
    description: '',
    fields: [
      ...common,
      {
        key: 'items',
        label: 'Люди',
        kind: 'list',
        itemLabel: 'Человек',
        empty: { name: '', role: '', image: '' },
        item: [{ key: 'name', label: 'Имя', kind: 'text' }, { key: 'role', label: 'Роль', kind: 'text' }, { key: 'image', label: 'Фото (адрес)', kind: 'image' }],
      },
    ],
  },
  pricing: {
    name: 'Тарифы',
    description: 'Идут в OfferCatalog.',
    fields: [
      ...common,
      {
        key: 'items',
        label: 'Тарифы',
        kind: 'list',
        itemLabel: 'Тариф',
        empty: { name: 'Тариф', price: '', period: '', features: [], featured: false },
        item: [
          { key: 'name', label: 'Название', kind: 'text' },
          { key: 'price', label: 'Цена', kind: 'text' },
          { key: 'period', label: 'Период', kind: 'text' },
          { key: 'features', label: 'Что входит (по строке)', kind: 'strings' },
          { key: 'featured', label: 'Выделить', kind: 'bool' },
        ],
      },
    ],
  },
  menu: {
    name: 'Меню / прайс',
    description: 'Для ресторанов и кондитерских — разметка Menu.',
    fields: [
      ...common,
      {
        key: 'groups',
        label: 'Разделы',
        kind: 'list',
        itemLabel: 'Раздел',
        empty: { name: 'Раздел', items: [] },
        item: [
          { key: 'name', label: 'Название раздела', kind: 'text' },
          {
            key: 'items',
            label: 'Позиции',
            kind: 'list',
            itemLabel: 'Позиция',
            empty: { name: '', text: '', price: '' },
            item: [{ key: 'name', label: 'Название', kind: 'text' }, { key: 'text', label: 'Описание', kind: 'text' }, { key: 'price', label: 'Цена', kind: 'text' }],
          },
        ],
      },
    ],
  },
  gallery: {
    name: 'Галерея',
    description: '',
    fields: [
      ...common,
      { key: 'items', label: 'Кадры', kind: 'list', itemLabel: 'Кадр', empty: { caption: '', image: '' }, item: [{ key: 'caption', label: 'Подпись', kind: 'text' }, { key: 'image', label: 'Фото (адрес)', kind: 'image' }] },
    ],
  },
  faq: {
    name: 'Вопросы и ответы',
    description: 'AEO: FAQPage в разметке, ответы всегда в HTML.',
    fields: [
      ...common,
      { key: 'items', label: 'Вопросы', kind: 'list', itemLabel: 'Вопрос', empty: { q: '', a: '' }, item: [{ key: 'q', label: 'Вопрос', kind: 'text' }, { key: 'a', label: 'Ответ', kind: 'textarea' }] },
    ],
  },
  contact: {
    name: 'Контакты',
    description: 'Телефон, адрес и часы берутся из «Бизнеса».',
    fields: [...common, { key: 'text', label: 'Текст', kind: 'textarea' }, { key: 'cta', label: 'Кнопка', kind: 'link' }],
  },
  shop: {
    name: 'Интернет-магазин',
    description: 'Товары с ценами: покупатель кладёт их в корзину и оформляет заказ — он приходит в Telegram (вкладка «Заявки в Telegram»).',
    fields: [
      ...common,
      { key: 'text', label: 'Текст над товарами', kind: 'textarea' },
      {
        key: 'items',
        label: 'Товары',
        kind: 'list',
        itemLabel: 'Товар',
        empty: { name: '', text: '', price: 0, oldPrice: 0, image: '', category: '', badge: '', unit: '' },
        item: [
          { key: 'name', label: 'Название', kind: 'text' },
          { key: 'price', label: 'Цена, сум (только цифры)', kind: 'number', hint: '0 — «цена по запросу», в корзину не кладётся' },
          { key: 'oldPrice', label: 'Старая цена, сум (для скидки)', kind: 'number' },
          { key: 'unit', label: 'За что цена', kind: 'text', hint: 'шт, кг, м², 250 г — можно пусто' },
          { key: 'category', label: 'Категория', kind: 'text', hint: 'по ней фильтр над товарами' },
          { key: 'badge', label: 'Метка', kind: 'text', hint: 'Новинка, Хит, −20%' },
          { key: 'text', label: 'Описание', kind: 'textarea' },
          { key: 'image', label: 'Фото', kind: 'image' },
        ],
      },
    ],
  },
}
