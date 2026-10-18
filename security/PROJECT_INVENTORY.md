# Реестр проектов

Дата: 18.10.2026. Источник: `content/sites/*.json`, `src/templates/*`, `workers/router`, `wrangler.jsonc`.

## Как устроены сайты (важно для аудита)

122 сайта — **не 122 независимые кодовые базы**. Это:

| Часть | Где | Сколько | Технологии |
|---|---|---|---|
| Конструктор Atlas (страницы всех сайтов, админка, API) | репозиторий `test`, `src/` | 1 | Next.js 16, React 19, OpenNext, Cloudflare Workers |
| Шаблоны оформления | `src/templates/<id>/` | 83 папки | React-компоненты + CSS, без своего серверного кода |
| Данные сайта | `content/sites/<slug>.json` + `content/sites/i18n/<slug>.{uz,en}.json` | 122 | JSON, проверяется схемой zod (`src/lib/schema.ts`) |
| Правки из админки | D1 `atlas`, таблица `docs` (ключи `site:`, `tr:`, `pass:`, `bot:`, `rl:`, `fail:`) | 1 база | Cloudflare D1 (SQLite), доступ только у воркера `atlas` |
| Загруженные фото | R2 `atlas-media` | 1 бакет | отдаются только через `/media/<хэш>.<ext>` |
| Адрес сайта | воркер `<slug>` (`workers/router/index.js`) | 122 | один и тот же код, переменная `SITE`, service binding к `atlas` |

Общее для всех сайтов: авторизация (`src/lib/auth.ts`: общий пароль ADMIN_PASSWORD на все сайты + пароль сайта PBKDF2 на свой сайт, подписанная HttpOnly-кука), админка `/admin` (одна на всех, область доступа по куке и адресу), API `/api/lead`, `/api/order`, `/api/admin/upload`, `/api/tg/<slug>`, внешние интеграции — Telegram Bot API (бот владельца сайта) и Cloudflare API (публикация, домены; только владелец конструктора). Регистрации и восстановления пароля по почте нет: пароли выдаёт владелец конструктора.

Отдельный проект вне этих 122: каталог point.cero.uz (репозиторий `environment`) — в этот аудит не входит.

Поэтому аудит проведён так: общий код проверен один раз и покрыт тестами; каждый сайт проверен отдельно — его данные и переводы, его шаблон и его живой адрес (25 проверок на сайт, `scripts/security-audit.mts`).

## Сайты

| № | Сайт | Адрес | Шаблон | Тип бизнеса | Магазин | Статус аудита |
|---|---|---|---|---|---|---|
| 1 | adliya | https://adliya.genkai.workers.dev | ledger | LegalService | — | проверен: код, данные, живой адрес — 25/25 |
| 2 | arabica | https://arabica.genkai.workers.dev | atelier | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 3 | arthouse | https://arthouse.genkai.workers.dev | gallery | ArtGallery | — | проверен: код, данные, живой адрес — 25/25 |
| 4 | atelye | https://atelye.genkai.workers.dev | atelier | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 5 | bahor | https://bahor.genkai.workers.dev | bazaar | Restaurant | — | проверен: код, данные, живой адрес — 25/25 |
| 6 | basement | https://basement.genkai.workers.dev | rave | NightClub | — | проверен: код, данные, живой адрес — 25/25 |
| 7 | bloom | https://bloom.genkai.workers.dev | petal | BeautySalon | — | проверен: код, данные, живой адрес — 25/25 |
| 8 | bodrost | https://bodrost.genkai.workers.dev | roast | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 9 | bogmebel | https://bogmebel.genkai.workers.dev | horizon | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 10 | bolajon | https://bolajon.genkai.workers.dev | crayon | ChildCare | — | проверен: код, данные, живой адрес — 25/25 |
| 11 | bolalar | https://bolalar.genkai.workers.dev | petal | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 12 | brewlab | https://brewlab.genkai.workers.dev | brew | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 13 | chimgan | https://chimgan.genkai.workers.dev | horizon | Hotel | — | проверен: код, данные, живой адрес — 25/25 |
| 14 | choy | https://choy.genkai.workers.dev | leaf | Store | да | проверен: код, данные, живой адрес — 25/25 |
| 15 | coldbrew | https://coldbrew.genkai.workers.dev | fizz | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 16 | crema | https://crema.genkai.workers.dev | crema | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 17 | dala | https://dala.genkai.workers.dev | field | GroceryStore | да | проверен: код, данные, живой адрес — 25/25 |
| 18 | daraxt | https://daraxt.genkai.workers.dev | field | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 19 | darvoza | https://darvoza.genkai.workers.dev | nest | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 20 | dizayn | https://dizayn.genkai.workers.dev | gallery | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 21 | dripbar | https://dripbar.genkai.workers.dev | drip | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 22 | duradgor | https://duradgor.genkai.workers.dev | joinery | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 23 | elit | https://elit.genkai.workers.dev | carat | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 24 | forma | https://forma.genkai.workers.dev | plinth | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 25 | forno | https://forno.genkai.workers.dev | crust | Restaurant | — | проверен: код, данные, живой адрес — 25/25 |
| 26 | gadget | https://gadget.genkai.workers.dev | pixel | ElectronicsStore | да | проверен: код, данные, живой адрес — 25/25 |
| 27 | grain | https://grain.genkai.workers.dev | roast | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 28 | gulskin | https://gulskin.genkai.workers.dev | glow | Store | да | проверен: код, данные, живой адрес — 25/25 |
| 29 | heights | https://heights.genkai.workers.dev | monolith | RealEstateAgent | — | проверен: код, данные, живой адрес — 25/25 |
| 30 | hisob | https://hisob.genkai.workers.dev | audit | AccountingService | — | проверен: код, данные, живой адрес — 25/25 |
| 31 | hub | https://hub.genkai.workers.dev | bento | LocalBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 32 | jang | https://jang.genkai.workers.dev | bout | ExerciseGym | — | проверен: код, данные, живой адрес — 25/25 |
| 33 | kadr | https://kadr.genkai.workers.dev | darkroom | ProfessionalService | — | проверен: код, данные, живой адрес — 25/25 |
| 34 | kafolat | https://kafolat.genkai.workers.dev | shield | InsuranceAgency | — | проверен: код, данные, живой адрес — 25/25 |
| 35 | karamel | https://karamel.genkai.workers.dev | sugar | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 36 | karkas | https://karkas.genkai.workers.dev | rivet | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 37 | karvon | https://karvon.genkai.workers.dev | route | MovingCompany | — | проверен: код, данные, живой адрес — 25/25 |
| 38 | kino | https://kino.genkai.workers.dev | cinema | MovieTheater | — | проверен: код, данные, живой адрес — 25/25 |
| 39 | kitob | https://kitob.genkai.workers.dev | inkwell | BookStore | да | проверен: код, данные, живой адрес — 25/25 |
| 40 | kitobkofe | https://kitobkofe.genkai.workers.dev | inkwell | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 41 | kiyim | https://kiyim.genkai.workers.dev | runway | ClothingStore | да | проверен: код, данные, живой адрес — 25/25 |
| 42 | kodakademiya | https://kodakademiya.genkai.workers.dev | orbit | EducationalOrganization | — | проверен: код, данные, живой адрес — 25/25 |
| 43 | kofego | https://kofego.genkai.workers.dev | kiosk | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 44 | kofemania | https://kofemania.genkai.workers.dev | crust | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 45 | kofeofis | https://kofeofis.genkai.workers.dev | bento | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 46 | konstruktsiya | https://konstruktsiya.genkai.workers.dev | plinth | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 47 | kovkaart | https://kovkaart.genkai.workers.dev | darkroom | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 48 | kozgu | https://kozgu.genkai.workers.dev | optic | Optician | да | проверен: код, данные, живой адрес — 25/25 |
| 49 | krossovka | https://krossovka.genkai.workers.dev | sole | ShoeStore | да | проверен: код, данные, живой адрес — 25/25 |
| 50 | kuznitsa | https://kuznitsa.genkai.workers.dev | forge | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 51 | kvant | https://kvant.genkai.workers.dev | prism | SoftwareCompany | — | проверен: код, данные, живой адрес — 25/25 |
| 52 | laser | https://laser.genkai.workers.dev | steel | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 53 | loftmebel | https://loftmebel.genkai.workers.dev | loft | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 54 | lumiere | https://lumiere.genkai.workers.dev | atelier | Bakery | да | проверен: код, данные, живой адрес — 25/25 |
| 55 | matcha | https://matcha.genkai.workers.dev | leaf | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 56 | mebeluy | https://mebeluy.genkai.workers.dev | nest | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 57 | metallform | https://metallform.genkai.workers.dev | monolith | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 58 | modul | https://modul.genkai.workers.dev | module | FurnitureStore | — | проверен: код, данные, живой адрес — 25/25 |
| 59 | monomebel | https://monomebel.genkai.workers.dev | monolith | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 60 | murgav | https://murgav.genkai.workers.dev | paws | VeterinaryCare | — | проверен: код, данные, живой адрес — 25/25 |
| 61 | nafas | https://nafas.genkai.workers.dev | breath | DaySpa | — | проверен: код, данные, живой адрес — 25/25 |
| 62 | naqsh | https://naqsh.genkai.workers.dev | plinth | ProfessionalService | — | проверен: код, данные, живой адрес — 25/25 |
| 63 | noir | https://noir.genkai.workers.dev | silk | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 64 | nord | https://nord.genkai.workers.dev | silk | ProfessionalService | — | проверен: код, данные, живой адрес — 25/25 |
| 65 | nota | https://nota.genkai.workers.dev | vinyl | EducationalOrganization | — | проверен: код, данные, живой адрес — 25/25 |
| 66 | nurkofe | https://nurkofe.genkai.workers.dev | lumen | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 67 | obivka | https://obivka.genkai.workers.dev | stitch | ProfessionalService | — | проверен: код, данные, живой адрес — 25/25 |
| 68 | olov | https://olov.genkai.workers.dev | ember | Restaurant | — | проверен: код, данные, живой адрес — 25/25 |
| 69 | olovtemir | https://olovtemir.genkai.workers.dev | ember | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 70 | oltin | https://oltin.genkai.workers.dev | carat | JewelryStore | да | проверен: код, данные, живой адрес — 25/25 |
| 71 | oqsaroy | https://oqsaroy.genkai.workers.dev | vow | EventVenue | — | проверен: код, данные, живой адрес — 25/25 |
| 72 | origin | https://origin.genkai.workers.dev | bean | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 73 | ornament | https://ornament.genkai.workers.dev | scroll | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 74 | padel | https://padel.genkai.workers.dev | court | SportsActivityLocation | — | проверен: код, данные, живой адрес — 25/25 |
| 75 | panjara | https://panjara.genkai.workers.dev | stage | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 76 | plastinka | https://plastinka.genkai.workers.dev | vinyl | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 77 | polyglot | https://polyglot.genkai.workers.dev | play | EducationalOrganization | — | проверен: код, данные, живой адрес — 25/25 |
| 78 | prokat | https://prokat.genkai.workers.dev | ledger | Store | да | проверен: код, данные, живой адрес — 25/25 |
| 79 | pulse | https://pulse.genkai.workers.dev | velocity | ExerciseGym | — | проверен: код, данные, живой адрес — 25/25 |
| 80 | qahvauy | https://qahvauy.genkai.workers.dev | bazaar | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 81 | qora | https://qora.genkai.workers.dev | ink | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 82 | quyosh | https://quyosh.genkai.workers.dev | spark | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 83 | ramendo | https://ramendo.genkai.workers.dev | neon | Restaurant | — | проверен: код, данные, живой адрес — 25/25 |
| 84 | reserve | https://reserve.genkai.workers.dev | reserve | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 85 | respawn | https://respawn.genkai.workers.dev | arcade | EntertainmentBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 86 | royalmebel | https://royalmebel.genkai.workers.dev | suite | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 87 | sahna | https://sahna.genkai.workers.dev | stage | PerformingArtsTheater | — | проверен: код, данные, живой адрес — 25/25 |
| 88 | sandon | https://sandon.genkai.workers.dev | anvil | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 89 | saroy | https://saroy.genkai.workers.dev | suite | Hotel | — | проверен: код, данные, живой адрес — 25/25 |
| 90 | scandi | https://scandi.genkai.workers.dev | oak | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 91 | shifo | https://shifo.genkai.workers.dev | lab | DiagnosticLab | — | проверен: код, данные, живой адрес — 25/25 |
| 92 | shirin | https://shirin.genkai.workers.dev | sugar | Bakery | да | проверен: код, данные, живой адрес — 25/25 |
| 93 | siyoh | https://siyoh.genkai.workers.dev | ink | TattooParlor | — | проверен: код, данные, живой адрес — 25/25 |
| 94 | smartmebel | https://smartmebel.genkai.workers.dev | pixel | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 95 | smilelab | https://smilelab.genkai.workers.dev | lumen | Dentist | — | проверен: код, данные, живой адрес — 25/25 |
| 96 | sofa | https://sofa.genkai.workers.dev | sofa | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 97 | sompay | https://sompay.genkai.workers.dev | aurora | FinancialService | — | проверен: код, данные, живой адрес — 25/25 |
| 98 | suv | https://suv.genkai.workers.dev | wave | SportsActivityLocation | — | проверен: код, данные, живой адрес — 25/25 |
| 99 | svarka | https://svarka.genkai.workers.dev | pipe | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 100 | tayanch | https://tayanch.genkai.workers.dev | spine | MedicalClinic | — | проверен: код, данные, живой адрес — 25/25 |
| 101 | temirchi | https://temirchi.genkai.workers.dev | bout | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 102 | temirsanat | https://temirsanat.genkai.workers.dev | gallery | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 103 | teri | https://teri.genkai.workers.dev | derma | MedicalClinic | — | проверен: код, данные, живой адрес — 25/25 |
| 104 | tikuv | https://tikuv.genkai.workers.dev | stitch | ProfessionalService | — | проверен: код, данные, живой адрес — 25/25 |
| 105 | togtours | https://togtours.genkai.workers.dev | peak | TravelAgency | — | проверен: код, данные, живой адрес — 25/25 |
| 106 | tong | https://tong.genkai.workers.dev | kinfolk | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 107 | torque | https://torque.genkai.workers.dev | chrome | AutoRepair | — | проверен: код, данные, живой адрес — 25/25 |
| 108 | toza | https://toza.genkai.workers.dev | clean | LocalBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 109 | tunkofe | https://tunkofe.genkai.workers.dev | neon | CafeOrCoffeeShop | да | проверен: код, данные, живой адрес — 25/25 |
| 110 | uchqun | https://uchqun.genkai.workers.dev | spark | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 111 | usta24 | https://usta24.genkai.workers.dev | pipe | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 112 | ustara | https://ustara.genkai.workers.dev | blade | HairSalon | — | проверен: код, данные, живой адрес — 25/25 |
| 113 | uy | https://uy.genkai.workers.dev | kinfolk | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 114 | uyut | https://uyut.genkai.workers.dev | kinfolk | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 115 | velvet | https://velvet.genkai.workers.dev | velvet | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 116 | vorota | https://vorota.genkai.workers.dev | iron | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 117 | xrom | https://xrom.genkai.workers.dev | chrome | HomeAndConstructionBusiness | — | проверен: код, данные, живой адрес — 25/25 |
| 118 | yangishahar | https://yangishahar.genkai.workers.dev | nest | RealEstateAgent | — | проверен: код, данные, живой адрес — 25/25 |
| 119 | yolrent | https://yolrent.genkai.workers.dev | drive | AutoRental | — | проверен: код, данные, живой адрес — 25/25 |
| 120 | yorug | https://yorug.genkai.workers.dev | lumen | FurnitureStore | да | проверен: код, данные, живой адрес — 25/25 |
| 121 | zarhal | https://zarhal.genkai.workers.dev | carat | HomeAndConstructionBusiness | да | проверен: код, данные, живой адрес — 25/25 |
| 122 | zing | https://zing.genkai.workers.dev | fizz | Store | да | проверен: код, данные, живой адрес — 25/25 |

Итог: обнаружено 122, проверено 122, не удалось проверить 0.
