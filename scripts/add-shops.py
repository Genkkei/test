"""Добавляет секцию «Магазин» (shop) сайтам, где есть что продавать онлайн, на трёх языках.

Каждой нише — свой набор товаров; сайт берёт из набора восемь позиций со сдвигом по своему
имени и чуть другие цены, поэтому два кофейных сайта не показывают одну и ту же витрину.
Цены — ориентиры рынка Ташкента осени 2026, владелец меняет их в админке.
Повторный запуск переписывает секцию shop, остальное не трогает.

    python3 scripts/add-shops.py
"""
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'content' / 'sites'

# товар: ('ru|uz|en' название, 'ru|uz|en' описание, категория, цена, единица, метка)
CAT = {
    'beans': 'Зерно|Don|Beans', 'drip': 'Дрип и капсулы|Drip va kapsulalar|Drip & capsules', 'gear': 'Для заваривания|Damlash uchun|Brewing gear',
    'merch': 'Мерч|Merch|Merch', 'cake': 'Торты|Tortlar|Cakes', 'pastry': 'Пирожные|Pirojniylar|Pastries', 'box': 'Наборы|To‘plamlar|Boxes',
    'sofa': 'Диваны|Divanlar|Sofas', 'chair': 'Кресла и стулья|Kreslo va stullar|Chairs', 'table': 'Столы|Stollar|Tables',
    'storage': 'Хранение|Saqlash|Storage', 'bed': 'Кровати|Karavotlar|Beds', 'light': 'Свет|Yoritish|Lighting', 'decor': 'Декор|Dekor|Decor',
    'kids': 'Детская|Bolalar xonasi|Kids', 'garden': 'Для сада|Bog‘ uchun|Garden', 'grill': 'Мангалы|Manqallar|Grills',
    'fire': 'Камины и печи|Kaminlar va pechlar|Fireplaces', 'pipe': 'Труба|Quvur|Tube', 'sheet': 'Лист|List|Sheet', 'bar': 'Арматура и уголок|Armatura va burchak|Rebar & angle',
    'tea': 'Чай|Choy|Tea', 'teaware': 'Посуда|Idishlar|Teaware', 'fresh': 'Фермерское|Fermer mahsulotlari|Farm', 'pantry': 'Бакалея|Baqqollik|Pantry',
    'phone': 'Смартфоны|Smartfonlar|Phones', 'audio': 'Звук|Ovoz|Audio', 'acc': 'Аксессуары|Aksessuarlar|Accessories',
    'face': 'Лицо|Yuz|Face', 'spf': 'Защита от солнца|Quyoshdan himoya|Sun care', 'body': 'Тело|Tana|Body',
    'novel': 'Проза|Nasr|Fiction', 'nonfic': 'Нон-фикшн|Nofantastika|Non-fiction', 'child': 'Детям|Bolalarga|Kids',
    'top': 'Верх|Ustki kiyim|Tops', 'bottom': 'Низ|Pastki kiyim|Bottoms', 'outer': 'Верхняя одежда|Ustki kiyim (sovuq)|Outerwear',
    'run': 'Бег|Yugurish|Running', 'street': 'Повседневные|Kundalik|Lifestyle', 'care': 'Уход|Parvarish|Care',
    'ring': 'Кольца|Uzuklar|Rings', 'ear': 'Серьги|Sirg‘alar|Earrings', 'neck': 'Колье и цепи|Marjon va zanjirlar|Necklaces',
    'energy': 'Энергетики|Energetiklar|Energy', 'lemon': 'Лимонады|Limonadlar|Lemonades', 'frame': 'Оправы|Gardishlar|Frames', 'sun': 'Солнцезащитные|Quyoshdan ko‘zoynak|Sunglasses', 'lens': 'Линзы|Linzalar|Lenses',
    'cold': 'Колд-брю|Kold-bryu|Cold brew', 'matcha': 'Матча|Matcha|Matcha', 'gift': 'Подарки|Sovg‘alar|Gifts',
}
UNIT = {'': '||', 'pc': 'шт|dona|pc', 'kg': 'кг|kg|kg', 'g250': '250 г|250 g|250 g', 'g1000': '1 кг|1 kg|1 kg', 'm': 'м|m|m', 'sheet': 'лист|list|sheet',
        'box10': '10 шт|10 dona|10 pcs', 'set': 'набор|to‘plam|set', 'g100': '100 г|100 g|100 g', 'l': 'л|l|l', 'bottle': 'бутылка|shisha|bottle', 'pack6': '6 бутылок|6 shisha|6 bottles'}
BADGE = {'': '||', 'hit': 'Хит|Xit|Bestseller', 'new': 'Новинка|Yangi|New', 'sale': 'Скидка|Chegirma|Sale', 'eco': 'Эко|Eko|Eco'}

P = {
    'coffee': [
        ('Эфиопия Иргачефф|Efiopiya Irgacheffe|Ethiopia Yirgacheffe', 'Жасмин, бергамот, лимонная цедра. Светлая обжарка.|Yasmin, bergamot, limon po‘stlog‘i. Och qovurilgan.|Jasmine, bergamot, lemon zest. Light roast.', 'beans', 189000, 'g250', 'hit'),
        ('Колумбия Уила|Kolumbiya Uila|Colombia Huila', 'Карамель, красное яблоко, мягкая кислотность.|Karamel, qizil olma, yumshoq nordonlik.|Caramel, red apple, gentle acidity.', 'beans', 165000, 'g250', ''),
        ('Бразилия Серрадо|Braziliya Serrado|Brazil Cerrado', 'Шоколад и орех — для эспрессо и молока.|Shokolad va yong‘oq — espresso va sut uchun.|Chocolate and nuts — for espresso and milk.', 'beans', 139000, 'g250', ''),
        ('Эспрессо-смесь «Дом»|«Uy» espresso aralashmasi|House espresso blend', 'Плотная, сладкая, без горечи. Для кофемашины.|Quyuq, shirin, achchiqsiz. Kofemashina uchun.|Dense and sweet, no bitterness. For machines.', 'beans', 420000, 'g1000', 'hit'),
        ('Кения АА|Keniya AA|Kenya AA', 'Чёрная смородина, грейпфрут, сочное тело.|Qora smorodina, greypfrut, to‘q ta’m.|Blackcurrant, grapefruit, juicy body.', 'beans', 215000, 'g250', 'new'),
        ('Гватемала Антигуа|Gvatemala Antigua|Guatemala Antigua', 'Какао, специи, долгое послевкусие.|Kakao, ziravorlar, uzoq ta’m.|Cocoa, spice, long finish.', 'beans', 175000, 'g250', ''),
        ('Декаф Колумбия|Dekaf Kolumbiya|Decaf Colombia', 'Без кофеина, но со вкусом: карамель и миндаль.|Kofeinsiz, lekin mazali: karamel va bodom.|Caffeine-free, still tasty: caramel and almond.', 'beans', 159000, 'g250', ''),
        ('Дрип-пакеты, ассорти|Drip-paketlar, assorti|Drip bags, assorted', 'Десять чашек фильтра без воронки: залил и ждёшь три минуты.|Varonkasiz o‘nta filtr: suv quyib uch daqiqa kutasiz.|Ten filter cups, no gear: pour and wait three minutes.', 'drip', 95000, 'box10', 'hit'),
        ('Капсулы Nespresso «Эспрессо»|Nespresso kapsulalari «Espresso»|Nespresso pods “Espresso”', 'Наш кофе в алюминиевых капсулах.|Bizning qahva alyumin kapsulalarda.|Our coffee in aluminium pods.', 'drip', 79000, 'box10', ''),
        ('Воронка V60 керамическая|V60 keramik varonka|Ceramic V60 dripper', 'Для чистой чашки фильтра дома.|Uyda toza filtr qahva uchun.|For a clean cup of filter at home.', 'gear', 240000, 'pc', ''),
        ('Френч-пресс 600 мл|Frensh-press 600 ml|French press 600 ml', 'Стекло и сталь, на три чашки.|Shisha va po‘lat, uch piyola uchun.|Glass and steel, three cups.', 'gear', 210000, 'pc', ''),
        ('Ручная кофемолка|Qo‘l kofe tegirmoni|Hand grinder', 'Стальные жернова, помол от эспрессо до френча.|Po‘lat jernovlar, espressodan frenshgacha.|Steel burrs, espresso to French press.', 'gear', 690000, 'pc', 'new'),
        ('Термокружка с логотипом|Logotipli termokrujka|Logo travel mug', '350 мл, держит тепло три часа.|350 ml, issiqlikni uch soat saqlaydi.|350 ml, keeps it hot for three hours.', 'merch', 185000, 'pc', ''),
        ('Подарочный набор «Три страны»|«Uch mamlakat» sovg‘a to‘plami|“Three origins” gift box', 'Три пачки по 100 г и открытка с описанием вкуса.|Uch qadoq 100 g dan va ta’m tavsifi bilan otkritka.|Three 100 g bags and a tasting card.', 'merch', 260000, 'set', 'hit'),
    ],
    'cold': [
        ('Колд-брю классический|Klassik kold-bryu|Classic cold brew', '18 часов холодной экстракции, без сахара.|18 soat sovuq ekstraksiya, shakarsiz.|18 hours cold steep, no sugar.', 'cold', 32000, 'bottle', 'hit'),
        ('Колд-брю с ванилью|Vanilli kold-bryu|Vanilla cold brew', 'Натуральная ваниль, чуть сладости.|Tabiiy vanil, ozgina shirinlik.|Real vanilla, a touch of sweetness.', 'cold', 35000, 'bottle', ''),
        ('Колд-брю с молоком|Sutli kold-bryu|Cold brew latte', 'Готовый латте в бутылке.|Shishada tayyor latte.|Ready latte in a bottle.', 'cold', 36000, 'bottle', ''),
        ('Нитро колд-брю|Nitro kold-bryu|Nitro cold brew', 'С азотом: пена как у пива, вкус сливочный.|Azot bilan: ko‘pik, qaymoqli ta’m.|Nitrogen-charged, creamy head.', 'cold', 39000, 'bottle', 'new'),
        ('Колд-брю тоник|Kold-bryu tonik|Cold brew tonic', 'Кофе, тоник и апельсин.|Qahva, tonik va apelsin.|Coffee, tonic and orange.', 'cold', 34000, 'bottle', ''),
        ('Ящик «Неделя»|«Hafta» qutisi|“Week” crate', 'Шесть бутылок ассорти со скидкой.|Olti shisha assorti chegirma bilan.|Six assorted bottles, discounted.', 'box', 179000, 'pack6', 'sale'),
        ('Концентрат 1 л|Konsentrat 1 l|Concentrate 1 l', 'Разбавьте водой или молоком один к одному.|Suv yoki sut bilan birga-bir suyultiring.|Mix one to one with water or milk.', 'cold', 89000, 'l', ''),
        ('Бутылка многоразовая|Ko‘p martalik shisha|Reusable bottle', 'Стекло, силиконовый чехол, 500 мл.|Shisha, silikon g‘ilof, 500 ml.|Glass with silicone sleeve, 500 ml.', 'merch', 120000, 'pc', ''),
    ],
    'matcha': [
        ('Матча церемониальная|Marosim matchasi|Ceremonial matcha', 'Удзи, первый сбор. Яркая, сладкая, без горечи.|Udzi, birinchi terim. Yorqin, shirin.|Uji, first flush. Vivid and sweet.', 'matcha', 290000, 'g100', 'hit'),
        ('Матча для латте|Latte uchun matcha|Latte matcha', 'Плотный вкус, хорошо дружит с молоком.|Quyuq ta’m, sut bilan yaxshi.|Bold taste that loves milk.', 'matcha', 190000, 'g100', ''),
        ('Ходзича|Xodzicha|Hojicha', 'Обжаренный зелёный чай: орех, карамель, мало кофеина.|Qovurilgan ko‘k choy: yong‘oq, karamel.|Roasted green tea: nutty, low caffeine.', 'matcha', 150000, 'g100', 'new'),
        ('Венчик часэн|Chasen ko‘pirtirgich|Chasen whisk', 'Бамбуковый, 100 зубцов.|Bambuk, 100 tishli.|Bamboo, 100 prongs.', 'gear', 140000, 'pc', ''),
        ('Чаша тяван|Tyavan kosasi|Chawan bowl', 'Керамика ручной работы.|Qo‘lda yasalgan keramika.|Handmade ceramic bowl.', 'gear', 260000, 'pc', ''),
        ('Набор «Первая матча»|«Birinchi matcha» to‘plami|“First matcha” kit', 'Матча 30 г, венчик, ложка тясяку и инструкция.|30 g matcha, ko‘pirtirgich, qoshiq, yo‘riqnoma.|30 g matcha, whisk, scoop and a guide.', 'box', 320000, 'set', 'hit'),
        ('Сэнтя|Sencha|Sencha', 'Классический японский зелёный чай.|Klassik yapon ko‘k choyi.|Classic Japanese green tea.', 'tea', 120000, 'g100', ''),
        ('Банка для хранения|Saqlash bankasi|Storage tin', 'Не пропускает свет и влагу.|Yorug‘lik va namlikni o‘tkazmaydi.|Keeps out light and moisture.', 'gear', 75000, 'pc', ''),
    ],
    'bakery': [
        ('Медовик|Medovik|Honey cake', 'Восемь коржей, сметанный крем. 1,2 кг.|Sakkiz qatlam, smetanali krem. 1,2 kg.|Eight layers, sour-cream frosting. 1.2 kg.', 'cake', 260000, 'pc', 'hit'),
        ('Наполеон|Napoleon|Napoleon', 'Слоёное тесто и заварной крем. 1 кг.|Qatlamli xamir va qaynatilgan krem. 1 kg.|Puff pastry and custard. 1 kg.', 'cake', 240000, 'pc', ''),
        ('Чизкейк Нью-Йорк|Nyu-York chizkeyki|New York cheesecake', 'Сливочный сыр, песочная основа. 1 кг.|Qaymoqli pishloq, qumloq asos. 1 kg.|Cream cheese on a shortbread base. 1 kg.', 'cake', 290000, 'pc', ''),
        ('Торт «Красный бархат»|«Qizil baxmal» torti|Red velvet cake', 'С крем-чизом. 1,5 кг.|Krem-chiz bilan. 1,5 kg.|With cream cheese frosting. 1.5 kg.', 'cake', 340000, 'pc', 'new'),
        ('Макарон, 12 штук|Makaron, 12 dona|Macarons, 12 pcs', 'Фисташка, малина, солёная карамель, лимон.|Pista, malina, sho‘r karamel, limon.|Pistachio, raspberry, salted caramel, lemon.', 'box', 180000, 'box10', 'hit'),
        ('Эклеры, 6 штук|Eklerlar, 6 dona|Éclairs, 6 pcs', 'Ваниль, шоколад, кофе.|Vanil, shokolad, qahva.|Vanilla, chocolate, coffee.', 'pastry', 120000, 'set', ''),
        ('Круассан с миндалём|Bodomli kruassan|Almond croissant', 'Французское масло, миндальный крем.|Fransuz yog‘i, bodom kremi.|French butter, almond cream.', 'pastry', 32000, 'pc', ''),
        ('Тарт с ягодами|Rezavorli tart|Berry tart', 'Песочное тесто, крем, свежие ягоды.|Qumloq xamir, krem, yangi rezavorlar.|Shortcrust, cream, fresh berries.', 'pastry', 45000, 'pc', ''),
        ('Бенто-торт|Bento-tort|Bento cake', 'Маленький торт на двоих с вашей надписью.|Yozuvingiz bilan ikki kishilik kichik tort.|Small cake for two with your message.', 'cake', 150000, 'pc', 'hit'),
        ('Пирожное «Картошка»|«Kartoshka» pirojniysi|“Kartoshka” truffle cake', 'Как в детстве, с какао и ромом.|Bolalikdagidek, kakao bilan.|Like in childhood, cocoa and rum.', 'pastry', 22000, 'pc', ''),
        ('Набор к чаю|Choy uchun to‘plam|Tea-time box', 'Шесть пирожных на выбор кондитера.|Qandolatchi tanlagan olti pirojniy.|Six pastries, baker’s choice.', 'box', 135000, 'set', ''),
    ],
    'soft': [
        ('Диван «Сканди» трёхместный|«Skandi» uch o‘rinli divan|“Scandi” 3-seater sofa', 'Рогожка, съёмные чехлы, 220 см.|Rogojka, olinadigan g‘iloflar, 220 sm.|Woven fabric, removable covers, 220 cm.', 'sofa', 6900000, 'pc', 'hit'),
        ('Угловой диван «Модуль»|«Modul» burchakli divan|“Module” corner sofa', 'Угол меняется на месте, спальное место.|Burchak joyida almashadi, uxlash joyi bor.|Reversible corner, sleeps two.', 'sofa', 11400000, 'pc', ''),
        ('Диван-кровать «Лофт»|«Loft» divan-karavot|“Loft” sofa bed', 'Еврокнижка, ящик для белья.|Yevrokitob, choyshab qutisi.|Click-clack with linen drawer.', 'sofa', 7800000, 'pc', ''),
        ('Кресло «Кокон»|«Pilla» kreslo|“Cocoon” armchair', 'Букле, деревянные ножки.|Bukle, yog‘och oyoqlar.|Bouclé on wooden legs.', 'chair', 3200000, 'pc', 'new'),
        ('Кресло-реклайнер|Kreslo-reklayner|Recliner chair', 'Механизм с подставкой для ног.|Oyoq tirgagi bilan mexanizm.|Footrest mechanism.', 'chair', 4600000, 'pc', ''),
        ('Пуф круглый|Dumaloq puf|Round pouf', 'Велюр, 50 см.|Velyur, 50 sm.|Velvet, 50 cm.', 'decor', 890000, 'pc', ''),
        ('Кровать с мягким изголовьем|Yumshoq boshli karavot|Upholstered bed', '160×200, подъёмный механизм.|160×200, ko‘tarish mexanizmi.|160×200 with lift storage.', 'bed', 6200000, 'pc', 'hit'),
        ('Банкетка в прихожую|Dahlizga banketka|Hallway bench', 'Мягкое сиденье, полка для обуви.|Yumshoq o‘rindiq, poyabzal tokchasi.|Soft seat, shoe shelf.', 'storage', 1350000, 'pc', ''),
        ('Подушка декоративная|Bezak yostig‘i|Throw cushion', 'Лён, 45×45, наполнитель холлофайбер.|Zig‘ir, 45×45.|Linen, 45×45.', 'decor', 180000, 'pc', ''),
        ('Диван двухместный «Мини»|«Mini» ikki o‘rinli divan|“Mini” loveseat', 'Для маленькой гостиной, 160 см.|Kichik mehmonxona uchun, 160 sm.|For a small living room, 160 cm.', 'sofa', 4900000, 'pc', 'sale'),
    ],
    'home': [
        ('Обеденный стол «Дуб» 160|«Eman» ovqat stoli 160|“Oak” dining table 160', 'Массив дуба, масло-воск.|Eman massivi, moy-mum.|Solid oak, oil-wax finish.', 'table', 5400000, 'pc', 'hit'),
        ('Стул «Венский»|«Vena» stuli|“Bentwood” chair', 'Бук, мягкое сиденье.|Buk, yumshoq o‘rindiq.|Beech with soft seat.', 'chair', 690000, 'pc', ''),
        ('Журнальный стол круглый|Dumaloq jurnal stoli|Round coffee table', 'Шпон ореха, 80 см.|Yong‘oq shponi, 80 sm.|Walnut veneer, 80 cm.', 'table', 1900000, 'pc', ''),
        ('Комод на четыре ящика|To‘rt tortmali komod|Four-drawer chest', 'Доводчики, ЛДСП + дуб.|Yopgichlar, LDSP + eman.|Soft-close, board and oak.', 'storage', 2700000, 'pc', ''),
        ('Стеллаж открытый|Ochiq javon|Open shelving unit', 'Пять полок, металл и дерево.|Besh tokcha, metall va yog‘och.|Five shelves, metal and wood.', 'storage', 1600000, 'pc', 'new'),
        ('Кровать «Нордик» 160×200|«Nordik» karavot 160×200|“Nordic” bed 160×200', 'Массив сосны, ортопедическое основание.|Qarag‘ay massivi, ortoped asos.|Solid pine, slatted base.', 'bed', 4800000, 'pc', 'hit'),
        ('Тумба прикроватная|Karavot yoni tumbasi|Bedside table', 'Ящик и ниша.|Tortma va tokcha.|Drawer and niche.', 'storage', 790000, 'pc', ''),
        ('ТВ-тумба 180|TV-tumba 180|TV stand 180', 'Фасады с рифлением, скрытый кабель-канал.|Rifli fasadlar, yashirin kabel kanali.|Fluted fronts, hidden cable channel.', 'storage', 3100000, 'pc', ''),
        ('Письменный стол|Yozuv stoli|Writing desk', '120×60, ящик для мелочей.|120×60, mayda narsalar tortmasi.|120×60 with a small drawer.', 'table', 1700000, 'pc', ''),
        ('Зеркало напольное|Polga qo‘yiladigan oyna|Floor mirror', 'Рама из дуба, 170 см.|Eman rama, 170 sm.|Oak frame, 170 cm.', 'decor', 1250000, 'pc', 'sale'),
        ('Шкаф двухдверный|Ikki eshikli shkaf|Two-door wardrobe', 'Штанга и полки, 100 см.|Shtanga va tokchalar, 100 sm.|Rail and shelves, 100 cm.', 'storage', 3900000, 'pc', ''),
    ],
    'kids': [
        ('Кровать-домик|Uycha-karavot|House bed', 'Массив берёзы, 80×160, бортики.|Qayin massivi, 80×160, to‘siqlar.|Solid birch, 80×160, rails.', 'kids', 3400000, 'pc', 'hit'),
        ('Растущий стол и стул|O‘suvchi stol va stul|Growing desk and chair', 'Регулируется от 3 до 14 лет.|3 yoshdan 14 yoshgacha sozlanadi.|Adjusts from 3 to 14 years.', 'kids', 2900000, 'pc', 'new'),
        ('Двухъярусная кровать|Ikki qavatli karavot|Bunk bed', 'Лестница-комод, два спальных места.|Komod-narvon, ikki o‘rin.|Drawer stairs, sleeps two.', 'kids', 6800000, 'pc', ''),
        ('Стеллаж для игрушек|O‘yinchoq javoni|Toy shelf', 'Шесть ящиков, низкий — ребёнок достаёт сам.|Olti quti, past — bola o‘zi oladi.|Six bins, low enough to reach.', 'storage', 1100000, 'pc', ''),
        ('Пеленальный комод|Yo‘rgaklash komodi|Changing chest', 'Съёмный столик, четыре ящика.|Olinadigan stolcha, to‘rt tortma.|Removable top, four drawers.', 'storage', 2400000, 'pc', ''),
        ('Детский диванчик|Bolalar divanchasi|Kids’ sofa', 'Раскладывается в мат для игр.|O‘yin matiga yoyiladi.|Folds out into a play mat.', 'sofa', 950000, 'pc', 'hit'),
        ('Мягкий пуф-гриб|Yumshoq qo‘ziqorin puf|Mushroom pouf', 'Велюр, моется.|Velyur, yuviladi.|Washable velvet.', 'decor', 390000, 'pc', ''),
        ('Ночник «Луна»|«Oy» tungi chirog‘i|“Moon” night light', 'Тёплый свет, таймер на 30 минут.|Iliq yorug‘lik, 30 daqiqa taymer.|Warm light, 30-minute timer.', 'light', 260000, 'pc', ''),
    ],
    'garden': [
        ('Комплект «Терраса» 4+1|«Terrasa» to‘plami 4+1|“Terrace” set 4+1', 'Стол и четыре кресла, искусственный ротанг.|Stol va to‘rt kreslo, sun’iy rotang.|Table and four chairs, synthetic rattan.', 'garden', 7900000, 'set', 'hit'),
        ('Шезлонг на колёсах|G‘ildirakli shezlong|Wheeled sun lounger', 'Алюминий, спинка в пяти положениях.|Alyuminiy, besh holatli suyanchiq.|Aluminium, five back positions.', 'garden', 2300000, 'pc', ''),
        ('Подвесное кресло-кокон|Osma pilla-kreslo|Hanging egg chair', 'С подушкой и стойкой.|Yostiq va tirgak bilan.|With cushion and stand.', 'garden', 3600000, 'pc', 'new'),
        ('Скамья из тика|Tik skameykasi|Teak bench', '150 см, не боится дождя.|150 sm, yomg‘irdan qo‘rqmaydi.|150 cm, rain-proof.', 'garden', 2800000, 'pc', ''),
        ('Диван уличный модульный|Ko‘cha modul divani|Outdoor modular sofa', 'Подушки со съёмными чехлами.|Olinadigan g‘ilofli yostiqlar.|Cushions with removable covers.', 'garden', 9400000, 'set', ''),
        ('Зонт с боковой опорой|Yon tayanchli soyabon|Cantilever parasol', '3 м, поворот на 360°.|3 m, 360° buriladi.|3 m, 360° rotation.', 'garden', 2100000, 'pc', ''),
        ('Садовые качели|Bog‘ arg‘imchog‘i|Garden swing', 'Трёхместные, с навесом.|Uch o‘rinli, soyabonli.|Three-seat with canopy.', 'garden', 4300000, 'pc', 'hit'),
        ('Кашпо напольное|Pol gultuvagi|Floor planter', 'Фиброцемент, 60 см.|Fibrotsement, 60 sm.|Fibre cement, 60 cm.', 'decor', 650000, 'pc', ''),
    ],
    'lighting': [
        ('Подвесной светильник «Купол»|«Gumbaz» osma chiroq|“Dome” pendant', 'Матовый металл, Ø 40 см.|Mat metall, Ø 40 sm.|Matte metal, Ø 40 cm.', 'light', 890000, 'pc', 'hit'),
        ('Торшер с тканевым абажуром|Matoli abajurli torsher|Linen floor lamp', 'Дуб и лён, 160 см.|Eman va zig‘ir, 160 sm.|Oak and linen, 160 cm.', 'light', 1250000, 'pc', ''),
        ('Настольная лампа «Гриб»|«Qo‘ziqorin» stol chirog‘i|“Mushroom” table lamp', 'Опал, тёплый свет.|Opal, iliq yorug‘lik.|Opal glass, warm light.', 'light', 560000, 'pc', 'new'),
        ('Бра с поворотом|Buriluvchi bra|Swing-arm sconce', 'Для чтения у кровати.|Karavot yonida o‘qish uchun.|For reading in bed.', 'light', 470000, 'pc', ''),
        ('Люстра «Шары»|«Sharlar» qandili|“Bubbles” chandelier', 'Шесть стеклянных плафонов.|Oltita shisha plafon.|Six glass globes.', 'light', 2900000, 'pc', ''),
        ('Светлый стеллаж|Och rangli javon|Light shelf unit', 'Белый дуб, 180 см.|Oq eman, 180 sm.|White oak, 180 cm.', 'storage', 1900000, 'pc', ''),
        ('Журнальный стол белый|Oq jurnal stoli|White coffee table', 'Шпон ясеня, 90 см.|Shumtol shponi, 90 sm.|Ash veneer, 90 cm.', 'table', 1600000, 'pc', ''),
        ('Лампочка филамент|Filament lampochka|Filament bulb', 'E27, 2700 K, диммируемая.|E27, 2700 K, xiralashtiriladi.|E27, 2700 K, dimmable.', 'light', 45000, 'pc', ''),
    ],
    'classic': [
        ('Гостиный гарнитур «Версаль»|«Versal» mehmonxona to‘plami|“Versailles” living set', 'Диван и два кресла, резьба, патина.|Divan va ikki kreslo, o‘ymakor, patina.|Sofa and two armchairs, carving, patina.', 'sofa', 28000000, 'set', 'hit'),
        ('Обеденная группа на 8 персон|8 kishilik ovqat guruhi|Dining set for 8', 'Стол-трансформер и восемь стульев.|Transformer stol va sakkiz stul.|Extending table and eight chairs.', 'table', 19500000, 'set', ''),
        ('Спальня «Империя»|«Imperiya» yotoqxonasi|“Empire” bedroom', 'Кровать, две тумбы и комод.|Karavot, ikki tumba va komod.|Bed, two nightstands and a dresser.', 'bed', 32000000, 'set', ''),
        ('Кресло каминное «Честер»|«Chester» kamin kreslosi|“Chester” wingback', 'Натуральная кожа, каретная стяжка.|Tabiiy charm, karetali tikuv.|Leather with button tufting.', 'chair', 7400000, 'pc', 'new'),
        ('Витрина для посуды|Idish vitrinasi|China cabinet', 'Стекло, подсветка, ручная роспись.|Shisha, yoritish, qo‘lda bezak.|Glass, lighting, hand-painted.', 'storage', 9800000, 'pc', ''),
        ('Консоль с зеркалом|Oynali konsol|Console with mirror', 'Золочение сусальным золотом.|Varaqli oltin bilan zarhal.|Gilded with gold leaf.', 'decor', 6200000, 'set', ''),
        ('Журнальный столик с мрамором|Marmar jurnal stoli|Marble coffee table', 'Каррара и литая бронза.|Karrara va quyma bronza.|Carrara and cast bronze.', 'table', 5600000, 'pc', ''),
        ('Люстра хрустальная|Billur qandil|Crystal chandelier', 'Восемь рожков, чешский хрусталь.|Sakkiz shoxli, chex billuri.|Eight arms, Czech crystal.', 'light', 8900000, 'pc', 'hit'),
    ],
    'grill': [
        ('Мангал «Классик» 6 мм|«Klassik» manqal 6 mm|“Classic” grill 6 mm', 'На 10 шампуров, сталь 6 мм, крыша.|10 six uchun, 6 mm po‘lat, tom.|10 skewers, 6 mm steel, roof.', 'grill', 3900000, 'pc', 'hit'),
        ('Печь под казан|Qozon pechi|Kazan stove', 'Для казана 12–22 л, дверца с колосником.|12–22 l qozon uchun, kolosnikli eshik.|For 12–22 l kazan, grate door.', 'fire', 2400000, 'pc', 'hit'),
        ('Мангальный комплекс|Manqal majmuasi|BBQ station', 'Мангал, печь, столешница и дровница.|Manqal, pech, stol usti va o‘tin joyi.|Grill, stove, worktop and log store.', 'grill', 14500000, 'set', 'new'),
        ('Шампуры кованые, 10 штук|Bolg‘alangan sixlar, 10 dona|Forged skewers, 10 pcs', 'Нержавейка, ручка с завитком.|Zanglamas, jingalak dasta.|Stainless, scrolled handle.', 'grill', 420000, 'set', ''),
        ('Казан чугунный 12 л|Cho‘yan qozon 12 l|Cast-iron kazan 12 l', 'Узбекский, с крышкой.|O‘zbek, qopqoqli.|Uzbek, with lid.', 'grill', 690000, 'pc', ''),
        ('Каминный набор|Kamin to‘plami|Fireplace tool set', 'Кочерга, совок, щётка и щипцы на стойке.|Kocherga, kurak, cho‘tka, qisqich.|Poker, shovel, brush and tongs on a stand.', 'fire', 980000, 'set', ''),
        ('Дровница кованая|Bolg‘alangan o‘tinxona|Forged log holder', 'Для дома и террасы.|Uy va terrasa uchun.|For home or terrace.', 'fire', 760000, 'pc', ''),
        ('Решётка-гриль|Gril panjarasi|Grill grate', 'Нержавейка, ручки, 40×30 см.|Zanglamas, dastali, 40×30 sm.|Stainless with handles, 40×30 cm.', 'grill', 210000, 'pc', ''),
        ('Чехол для мангала|Manqal g‘ilofi|Grill cover', 'Влагостойкая ткань.|Namga chidamli mato.|Water-resistant fabric.', 'grill', 260000, 'pc', ''),
    ],
    'metaldecor': [
        ('Подсвечник кованый|Bolg‘alangan shamdon|Forged candlestick', 'На три свечи, ручная ковка.|Uchta sham uchun, qo‘lda bolg‘alangan.|Three candles, hand forged.', 'decor', 390000, 'pc', 'hit'),
        ('Ключница-подкова|Taqa kalitdon|Horseshoe key rack', 'Пять крючков, на счастье.|Besh ilmoq, omad uchun.|Five hooks, for luck.', 'decor', 180000, 'pc', ''),
        ('Полка на кронштейнах|Kronshteynli tokcha|Bracket shelf', 'Дуб и чёрный металл, 80 см.|Eman va qora metall, 80 sm.|Oak and black steel, 80 cm.', 'decor', 520000, 'pc', ''),
        ('Вешалка настенная лофт|Loft devor ilgichi|Loft wall hanger', 'Шесть крюков, порошковая краска.|Olti ilmoq, kukun bo‘yoq.|Six hooks, powder coat.', 'decor', 340000, 'pc', ''),
        ('Подставка для вина|Vino tokchasi|Wine rack', 'На шесть бутылок.|Olti shisha uchun.|Holds six bottles.', 'decor', 450000, 'pc', 'new'),
        ('Кашпо подвесное|Osma gultuvak|Hanging planter', 'Кованое кольцо и цепь.|Bolg‘alangan halqa va zanjir.|Forged ring and chain.', 'garden', 290000, 'pc', ''),
        ('Табличка с номером дома|Uy raqami lavhasi|House number plate', 'Лазерная резка, ваш номер.|Lazer kesish, sizning raqamingiz.|Laser cut, your number.', 'decor', 350000, 'pc', 'hit'),
        ('Панно настенное «Горы»|«Tog‘lar» devor panosi|“Mountains” wall art', 'Кортен, 90×45 см.|Korten, 90×45 sm.|Corten, 90×45 cm.', 'decor', 1200000, 'pc', ''),
        ('Роза кованая|Bolg‘alangan atirgul|Forged rose', 'Подарок, который не вянет.|So‘lmaydigan sovg‘a.|A gift that never wilts.', 'gift', 160000, 'pc', 'hit'),
        ('Скамья садовая кованая|Bolg‘alangan bog‘ skameykasi|Forged garden bench', 'Металл и сосна, 150 см.|Metall va qarag‘ay, 150 sm.|Steel and pine, 150 cm.', 'garden', 2600000, 'pc', ''),
        ('Секция перил, погонный метр|Panjara bo‘lagi, metr|Railing section, per metre', 'Узор «Классика», монтаж отдельно.|«Klassika» naqshi, o‘rnatish alohida.|“Classic” pattern, fitting extra.', 'decor', 1100000, 'm', ''),
    ],
    'rolled': [
        ('Профильная труба 40×20×2|Profil quvur 40×20×2|Box section 40×20×2', 'Чёрная сталь, хлыст 6 м.|Qora po‘lat, 6 m.|Black steel, 6 m length.', 'pipe', 23000, 'm', 'hit'),
        ('Профильная труба 60×40×2|Profil quvur 60×40×2|Box section 60×40×2', 'Для навесов и ворот.|Ayvon va darvozalar uchun.|For canopies and gates.', 'pipe', 38000, 'm', ''),
        ('Профильная труба 80×80×3|Profil quvur 80×80×3|Box section 80×80×3', 'Столбы и несущие конструкции.|Ustunlar va yuk ko‘taruvchi qismlar.|Posts and load-bearing frames.', 'pipe', 79000, 'm', ''),
        ('Лист горячекатаный 2 мм|Issiq prokat list 2 mm|Hot-rolled sheet 2 mm', '1250×2500 мм.|1250×2500 mm.|1250×2500 mm.', 'sheet', 690000, 'sheet', ''),
        ('Лист оцинкованный 0,5 мм|Ruxlangan list 0,5 mm|Galvanised sheet 0.5 mm', '1250×2500 мм, для кровли.|1250×2500 mm, tom uchun.|1250×2500 mm, for roofing.', 'sheet', 310000, 'sheet', ''),
        ('Арматура А500С Ø12|A500S armatura Ø12|Rebar A500C Ø12', 'Рифлёная, хлыст 11,7 м.|Rifli, 11,7 m.|Ribbed, 11.7 m length.', 'bar', 9800, 'm', 'hit'),
        ('Уголок 50×50×5|Burchak 50×50×5|Angle 50×50×5', 'Равнополочный, 6 м.|Teng tokchali, 6 m.|Equal angle, 6 m.', 'bar', 34000, 'm', ''),
        ('Швеллер 10П|Shveller 10P|Channel 10P', 'Для каркасов и балок.|Karkas va to‘sinlar uchun.|For frames and beams.', 'bar', 68000, 'm', ''),
        ('Электроды МР-3 Ø3|MR-3 elektrodlari Ø3|Electrodes MR-3 Ø3', 'Пачка 5 кг.|5 kg qadoq.|5 kg pack.', 'bar', 190000, 'pc', ''),
    ],
    'tea': [
        ('Зелёный чай «Ташкент 95»|«Toshkent 95» ko‘k choyi|“Tashkent 95” green tea', 'Тот самый, с мягкой терпкостью.|O‘sha, yumshoq bujmaygan ta’m.|The classic one, gently brisk.', 'tea', 45000, 'g250', 'hit'),
        ('Пуэр шу 2015|Puer shu 2015|Shou puerh 2015', 'Земля, сухофрукты, тёплое тело.|Tuproq, quruq meva, iliq ta’m.|Earthy, dried fruit, warming.', 'tea', 220000, 'g100', ''),
        ('Улун «Те Гуань Инь»|«Te Guan In» uluni|Tieguanyin oolong', 'Цветочный, сливочный.|Gulli, qaymoqli.|Floral and creamy.', 'tea', 180000, 'g100', ''),
        ('Чёрный чай Ассам|Assam qora choyi|Assam black tea', 'Крепкий, к молоку.|Kuchli, sut bilan.|Strong, good with milk.', 'tea', 95000, 'g250', ''),
        ('Травяной сбор «Сон»|«Uyqu» o‘t yig‘masi|“Sleep” herbal blend', 'Мята, ромашка, мелисса.|Yalpiz, moychechak, melissa.|Mint, chamomile, lemon balm.', 'tea', 70000, 'g100', 'new'),
        ('Пиала с узором|Naqshli piyola|Patterned piala', 'Риштанская керамика, ручная роспись.|Rishton keramikasi, qo‘lda bezak.|Rishtan ceramics, hand painted.', 'teaware', 65000, 'pc', ''),
        ('Чайник «Пахта»|«Paxta» choynagi|“Cotton” teapot', 'Фарфор с хлопковым узором, 1 л.|Paxta naqshli chinni, 1 l.|Cotton-pattern porcelain, 1 l.', 'teaware', 240000, 'pc', 'hit'),
        ('Набор «Чайхана»|«Choyxona» to‘plami|“Chaikhana” set', 'Чайник, шесть пиал и чай 250 г.|Choynak, olti piyola va 250 g choy.|Teapot, six pialas and 250 g tea.', 'box', 590000, 'set', ''),
    ],
    'grocery': [
        ('Мёд горный|Tog‘ asali|Mountain honey', 'Бостанлык, нефильтрованный, 1 кг.|Bo‘stonliq, filtrlanmagan, 1 kg.|Bostanlyk, raw, 1 kg.', 'fresh', 160000, 'pc', 'hit'),
        ('Сыр сулугуни|Suluguni pishlog‘i|Suluguni cheese', 'Из фермерского молока.|Fermer sutidan.|From farm milk.', 'fresh', 120000, 'kg', ''),
        ('Яйца деревенские, 10 штук|Qishloq tuxumi, 10 dona|Free-range eggs, 10 pcs', 'Куры на свободном выгуле.|Erkin yuradigan tovuqlar.|Free-range hens.', 'fresh', 28000, 'box10', ''),
        ('Курага сабза|Sabza o‘rik qoqi|Sabza dried apricots', 'Без сахара и сернистой обработки.|Shakarsiz va oltingugurtsiz.|No sugar, no sulphur.', 'pantry', 85000, 'kg', ''),
        ('Миндаль ферганский|Farg‘ona bodomi|Fergana almonds', 'Очищенный, урожай 2026.|Tozalangan, 2026 hosili.|Shelled, 2026 harvest.', 'pantry', 150000, 'kg', 'new'),
        ('Рис девзира|Devzira guruch|Devzira rice', 'Для плова, выдержанный.|Palov uchun, saqlangan.|Aged, for plov.', 'pantry', 38000, 'kg', 'hit'),
        ('Масло хлопковое|Paxta yog‘i|Cottonseed oil', 'Нерафинированное, 1 л.|Rafinatsiyalanmagan, 1 l.|Unrefined, 1 l.', 'pantry', 29000, 'l', ''),
        ('Корзина «Неделя»|«Hafta» savati|“Week” basket', 'Овощи, зелень, яйца и сыр на семью.|Oila uchun sabzavot, ko‘kat, tuxum, pishloq.|Vegetables, herbs, eggs and cheese for a family.', 'box', 390000, 'set', 'sale'),
        ('Помидоры тепличные|Issiqxona pomidori|Greenhouse tomatoes', 'Сорт «Бычье сердце».|«Ho‘kiz yuragi» navi.|Ox-heart variety.', 'fresh', 18000, 'kg', ''),
    ],
    'gadget': [
        ('Смартфон Galaxy A-серии 256 ГБ|Galaxy A-seriya smartfoni 256 GB|Galaxy A-series phone 256 GB', 'Официальная гарантия 12 месяцев.|12 oylik rasmiy kafolat.|12-month official warranty.', 'phone', 4290000, 'pc', 'hit'),
        ('iPhone 17 128 ГБ|iPhone 17 128 GB|iPhone 17 128 GB', 'Новый, запечатанный.|Yangi, muhrlangan.|New, sealed.', 'phone', 12900000, 'pc', 'new'),
        ('Беспроводные наушники с шумоподавлением|Shovqin so‘ndiruvchi simsiz quloqchinlar|Noise-cancelling earbuds', 'До 30 часов с кейсом.|G‘ilof bilan 30 soatgacha.|Up to 30 hours with case.', 'audio', 990000, 'pc', 'hit'),
        ('Колонка Bluetooth|Bluetooth karnay|Bluetooth speaker', 'Влагозащита IP67, 12 часов.|IP67 namdan himoya, 12 soat.|IP67, 12 hours.', 'audio', 690000, 'pc', ''),
        ('Пауэрбанк 20 000 мА·ч|20 000 mA·s powerbank|20,000 mAh power bank', 'Быстрая зарядка 22,5 Вт.|22,5 Vt tez quvvat.|22.5 W fast charging.', 'acc', 320000, 'pc', ''),
        ('Смарт-часы|Aqlli soat|Smartwatch', 'Пульс, сон, уведомления.|Puls, uyqu, bildirishnomalar.|Heart rate, sleep, notifications.', 'acc', 1490000, 'pc', 'sale'),
        ('Зарядка 65 Вт GaN|65 Vt GaN quvvatlagich|65 W GaN charger', 'Три порта, для ноутбука.|Uch port, noutbuk uchun.|Three ports, laptop-ready.', 'acc', 390000, 'pc', ''),
        ('Чехол противоударный|Zarbga chidamli g‘ilof|Rugged case', 'На популярные модели.|Mashhur modellar uchun.|For popular models.', 'acc', 120000, 'pc', ''),
    ],
    'cosmetics': [
        ('Сыворотка с ниацинамидом 10%|Niatsinamidli zardob 10%|Niacinamide 10% serum', 'Ровный тон и меньше пор. 30 мл.|Tekis rang va kamroq g‘ovak. 30 ml.|Even tone, fewer visible pores. 30 ml.', 'face', 189000, 'pc', 'hit'),
        ('Крем увлажняющий с церамидами|Seramidli namlovchi krem|Ceramide moisturiser', 'Для сухой и чувствительной кожи. 50 мл.|Quruq va sezgir teri uchun. 50 ml.|For dry, sensitive skin. 50 ml.', 'face', 210000, 'pc', ''),
        ('SPF 50 флюид|SPF 50 flyuid|SPF 50 fluid', 'Невесомый, без белых следов.|Yengil, oq iz qoldirmaydi.|Weightless, no white cast.', 'spf', 175000, 'pc', 'hit'),
        ('Пенка для умывания|Yuvinish ko‘pigi|Gentle cleanser', 'pH 5,5, без сульфатов.|pH 5,5, sulfatsiz.|pH 5.5, sulfate-free.', 'face', 115000, 'pc', ''),
        ('Ретинол 0,3%|Retinol 0,3%|Retinol 0.3%', 'Для начинающих, вечером.|Boshlovchilar uchun, kechqurun.|For beginners, at night.', 'face', 240000, 'pc', 'new'),
        ('Лосьон для тела|Tana losoni|Body lotion', 'С мочевиной 5%. 250 мл.|5% mochevina bilan. 250 ml.|With 5% urea. 250 ml.', 'body', 139000, 'pc', ''),
        ('Набор «Базовый уход»|«Asosiy parvarish» to‘plami|“Basic routine” set', 'Пенка, сыворотка, крем и SPF.|Ko‘pik, zardob, krem va SPF.|Cleanser, serum, cream and SPF.', 'box', 590000, 'set', 'sale'),
        ('Бальзам для губ|Lab balzami|Lip balm', 'С маслом ши.|Shi yog‘i bilan.|With shea butter.', 'body', 49000, 'pc', ''),
    ],
    'books': [
        ('«Минувшие дни», Абдулла Кадыри|«O‘tkan kunlar», Abdulla Qodiriy|“Bygone Days”, Abdulla Qodiriy', 'Твёрдая обложка.|Qattiq muqova.|Hardcover.', 'novel', 89000, 'pc', 'hit'),
        ('«Мастер и Маргарита»|«Master va Margarita»|“The Master and Margarita”', 'Иллюстрированное издание.|Rasmli nashr.|Illustrated edition.', 'novel', 129000, 'pc', ''),
        ('«Атомные привычки»|«Atom odatlar»|“Atomic Habits”', 'Как маленькие шаги меняют жизнь.|Kichik qadamlar hayotni qanday o‘zgartiradi.|Small steps, big changes.', 'nonfic', 115000, 'pc', 'hit'),
        ('«Sapiens»|«Sapiens»|“Sapiens”', 'Краткая история человечества.|Insoniyatning qisqa tarixi.|A brief history of humankind.', 'nonfic', 135000, 'pc', ''),
        ('«Маленький принц»|«Kichkina shahzoda»|“The Little Prince”', 'Подарочное издание.|Sovg‘a nashri.|Gift edition.', 'child', 69000, 'pc', ''),
        ('Набор раскрасок|Rang berish kitoblari to‘plami|Colouring book set', 'Три книги, 4–7 лет.|Uch kitob, 4–7 yosh.|Three books, ages 4–7.', 'child', 75000, 'set', 'new'),
        ('Блокнот в льняной обложке|Zig‘ir muqovali bloknot|Linen notebook', 'A5, точка, 160 страниц.|A5, nuqta, 160 bet.|A5 dotted, 160 pages.', 'gift', 95000, 'pc', ''),
        ('Сертификат на 200 000 сум|200 000 so‘mlik sertifikat|Gift card 200,000 UZS', 'Действует год.|Bir yil amal qiladi.|Valid for a year.', 'gift', 200000, 'pc', ''),
    ],
    'clothes': [
        ('Футболка оверсайз|Oversayz futbolka|Oversized tee', 'Хлопок 240 г, узбекский трикотаж.|240 g paxta, o‘zbek trikotaji.|240 g Uzbek cotton.', 'top', 179000, 'pc', 'hit'),
        ('Худи на флисе|Flisli xudi|Fleece hoodie', 'Тёплое, с капюшоном и карманом.|Issiq, kapyushonli.|Warm, hooded, kangaroo pocket.', 'top', 390000, 'pc', ''),
        ('Рубашка из льна|Zig‘ir ko‘ylak|Linen shirt', 'Свободный крой.|Erkin bichim.|Relaxed fit.', 'top', 320000, 'pc', 'new'),
        ('Джинсы прямые|To‘g‘ri jinsi|Straight jeans', 'Плотный деним.|Zich denim.|Heavy denim.', 'bottom', 450000, 'pc', ''),
        ('Брюки-карго|Kargo shim|Cargo pants', 'Шесть карманов, хлопок.|Olti cho‘ntak, paxta.|Six pockets, cotton.', 'bottom', 360000, 'pc', ''),
        ('Пальто шерстяное|Jun palto|Wool coat', 'Шерсть 70%, на осень.|70% jun, kuz uchun.|70% wool, for autumn.', 'outer', 1490000, 'pc', 'sale'),
        ('Куртка-бомбер|Bomber kurtka|Bomber jacket', 'Нейлон, утеплитель.|Neylon, isitgich.|Nylon, insulated.', 'outer', 890000, 'pc', ''),
        ('Шопер с принтом|Printli shoper|Printed tote', 'Плотная ткань.|Zich mato.|Heavy canvas.', 'acc', 89000, 'pc', ''),
    ],
    'shoes': [
        ('Кроссовки беговые|Yugurish krossovkalari|Running shoes', 'Амортизация, сетка, 260 г.|Amortizatsiya, to‘r, 260 g.|Cushioned mesh, 260 g.', 'run', 1290000, 'pc', 'hit'),
        ('Кеды классические|Klassik kedlar|Classic canvas shoes', 'Белые, резиновый носок.|Oq, rezina tumshuq.|White with rubber toe.', 'street', 590000, 'pc', ''),
        ('Ретро-кроссовки|Retro krossovkalar|Retro sneakers', 'Замша и сетка.|Zamsha va to‘r.|Suede and mesh.', 'street', 1090000, 'pc', 'new'),
        ('Трейловые кроссовки|Treyl krossovkalari|Trail shoes', 'Протектор для гор.|Tog‘ uchun protektor.|Lugged sole for the mountains.', 'run', 1490000, 'pc', ''),
        ('Слайды|Slaydlar|Slides', 'Мягкая пена.|Yumshoq ko‘pik.|Soft foam.', 'street', 290000, 'pc', 'sale'),
        ('Набор для чистки|Tozalash to‘plami|Cleaning kit', 'Пена, щётка, салфетка.|Ko‘pik, cho‘tka, salfetka.|Foam, brush, cloth.', 'care', 120000, 'set', ''),
        ('Носки спортивные, 3 пары|Sport paypoqlari, 3 juft|Sport socks, 3 pairs', 'Хлопок с компрессией.|Kompressiyali paxta.|Cotton with compression.', 'care', 75000, 'set', ''),
        ('Стельки ортопедические|Ortopedik ichki taglik|Orthotic insoles', 'Поддержка свода.|Oyoq gumbazini qo‘llab-quvvatlaydi.|Arch support.', 'care', 160000, 'pc', ''),
    ],
    'jewelry': [
        ('Помолвочное кольцо, бриллиант 0,3 кт|Unashuv uzugi, olmos 0,3 kt|Engagement ring, 0.3 ct diamond', 'Белое золото 585, сертификат.|585 oq oltin, sertifikat.|14k white gold, certified.', 'ring', 14900000, 'pc', 'hit'),
        ('Обручальные кольца, пара|Nikoh uzuklari, juft|Wedding bands, pair', 'Жёлтое золото 585, комфорт-посадка.|585 sariq oltin, qulay o‘tirish.|14k yellow gold, comfort fit.', 'ring', 9800000, 'set', ''),
        ('Серьги-пусеты|Pusetlar|Stud earrings', 'Золото 585, фианиты.|585 oltin, fianitlar.|14k gold, cubic zirconia.', 'ear', 2400000, 'set', ''),
        ('Серьги-кольца|Halqa sirg‘alar|Hoop earrings', 'Золото 585, 20 мм.|585 oltin, 20 mm.|14k gold, 20 mm.', 'ear', 3100000, 'set', 'new'),
        ('Цепь «Бисмарк»|«Bismark» zanjiri|Bismarck chain', 'Золото 585, 50 см.|585 oltin, 50 sm.|14k gold, 50 cm.', 'neck', 7600000, 'pc', ''),
        ('Подвеска с инициалом|Bosh harfli marjon|Initial pendant', 'Гравировка бесплатно.|Gravyura bepul.|Free engraving.', 'neck', 1900000, 'pc', 'hit'),
        ('Браслет-цепочка|Zanjir bilaguzuk|Chain bracelet', 'Золото 585, 18 см.|585 oltin, 18 sm.|14k gold, 18 cm.', 'neck', 2700000, 'pc', ''),
        ('Шкатулка для украшений|Zargarlik qutisi|Jewellery box', 'Бархат, зеркало.|Baxmal, oyna.|Velvet with mirror.', 'gift', 450000, 'pc', ''),
    ],
    'drinks': [
        ('Энергетик «Оригинал»|«Original» energetigi|“Original” energy', 'Таурин, кофеин, без лишнего сахара. 0,45 л.|Taurin, kofein, ortiqcha shakarsiz.|Taurine, caffeine, low sugar. 0.45 l.', 'energy', 14000, 'pc', 'hit'),
        ('Энергетик «Ноль»|«Nol» energetigi|“Zero” energy', 'Без сахара, вкус грейпфрута.|Shakarsiz, greypfrut ta’mi.|Sugar-free, grapefruit.', 'energy', 14000, 'pc', ''),
        ('Лимонад «Тархун»|«Tarxun» limonadi|Tarragon lemonade', 'Настоящий эстрагон.|Haqiqiy estragon.|Real tarragon.', 'lemon', 12000, 'pc', ''),
        ('Лимонад «Гранат и базилик»|«Anor va rayhon» limonadi|Pomegranate & basil lemonade', 'Узбекский гранат.|O‘zbek anori.|Uzbek pomegranate.', 'lemon', 13000, 'pc', 'new'),
        ('Ящик ассорти 12 банок|12 banka assorti qutisi|Mixed crate, 12 cans', 'Все вкусы, скидка 15%.|Barcha ta’mlar, 15% chegirma.|All flavours, 15% off.', 'box', 139000, 'set', 'sale'),
        ('Худи с логотипом|Logotipli xudi|Logo hoodie', 'Для фанатов бренда.|Brend muxlislari uchun.|For fans of the brand.', 'merch', 320000, 'pc', ''),
        ('Холодильник-витрина в аренду|Ijaraga vitrina-muzlatgich|Display fridge rental', 'Для магазина или офиса, в месяц.|Do‘kon yoki ofis uchun, oyiga.|For a shop or office, per month.', 'merch', 250000, 'pc', ''),
    ],
    'optics': [
        ('Оправа ацетатная «Классика»|«Klassika» atsetat gardishi|“Classic” acetate frame', 'Италия, пять цветов.|Italiya, besh rang.|Italian acetate, five colours.', 'frame', 1450000, 'pc', 'hit'),
        ('Оправа титановая|Titan gardish|Titanium frame', 'Весит 9 граммов.|9 gramm keladi.|Weighs 9 grams.', 'frame', 2100000, 'pc', ''),
        ('Солнцезащитные очки поляризационные|Qutblangan quyosh ko‘zoynagi|Polarised sunglasses', 'UV400, чехол в комплекте.|UV400, g‘ilofi bilan.|UV400, case included.', 'sun', 890000, 'pc', 'new'),
        ('Детская оправа|Bolalar gardishi|Kids’ frame', 'Гибкая, не ломается.|Egiluvchan, sinmaydi.|Flexible, hard to break.', 'frame', 690000, 'pc', ''),
        ('Линзы однодневные, 30 штук|Bir kunlik linzalar, 30 dona|Daily lenses, 30 pcs', 'Любая диоптрия.|Istalgan dioptriya.|Any prescription.', 'lens', 320000, 'set', 'hit'),
        ('Линзы месячные, 6 штук|Oylik linzalar, 6 dona|Monthly lenses, 6 pcs', 'Силикон-гидрогель.|Silikon-gidrogel.|Silicone hydrogel.', 'lens', 390000, 'set', ''),
        ('Раствор для линз 360 мл|Linza eritmasi 360 ml|Lens solution 360 ml', 'С контейнером.|Konteyner bilan.|With case.', 'lens', 95000, 'pc', ''),
        ('Очки для компьютера|Kompyuter ko‘zoynagi|Computer glasses', 'Фильтр синего света.|Ko‘k nur filtri.|Blue-light filter.', 'frame', 790000, 'pc', 'sale'),
    ],
}

TITLE = {
    'coffee': 'Кофе домой|Uyga qahva|Coffee for home', 'cold': 'Закажите ящик|Qutini buyurtma qiling|Order a crate',
    'matcha': 'Матча домой|Uyga matcha|Matcha for home', 'bakery': 'Торты и десерты с доставкой|Yetkazib berish bilan tort va desertlar|Cakes and desserts delivered',
    'soft': 'Каталог мебели|Mebel katalogi|Furniture catalogue', 'home': 'Каталог мебели|Mebel katalogi|Furniture catalogue', 'kids': 'Каталог детской|Bolalar mebeli katalogi|Kids’ catalogue',
    'garden': 'Мебель для сада|Bog‘ mebeli|Garden furniture', 'lighting': 'Свет и мебель|Yoritish va mebel|Light and furniture', 'classic': 'Коллекции|Kolleksiyalar|Collections',
    'grill': 'Готовые изделия|Tayyor buyumlar|Ready-made pieces', 'metaldecor': 'Изделия в наличии|Mavjud buyumlar|In stock', 'rolled': 'Металлопрокат с доставкой|Yetkazib berish bilan metall prokat|Steel, delivered',
    'tea': 'Чай и посуда|Choy va idishlar|Tea and teaware', 'grocery': 'Фермерская лавка|Fermer do‘koni|Farm shop', 'gadget': 'Магазин|Do‘kon|Shop',
    'cosmetics': 'Уход за кожей|Teri parvarishi|Skin care', 'books': 'Книги|Kitoblar|Books', 'clothes': 'Новая коллекция|Yangi kolleksiya|New collection',
    'shoes': 'Магазин|Do‘kon|Shop', 'jewelry': 'Украшения|Zargarlik buyumlari|Jewellery', 'drinks': 'Заказать напитки|Ichimliklarni buyurtma qilish|Order drinks', 'optics': 'Оправы и линзы|Gardish va linzalar|Frames and lenses',
}
TEXT = 'Добавьте в корзину и оформите заказ — мы перезвоним, подтвердим и привезём.|Savatga qo‘shing va buyurtma bering — qo‘ng‘iroq qilib, tasdiqlab, yetkazib beramiz.|Add to cart and check out — we will call to confirm and deliver.'
LABEL = 'Магазин|Do‘kon|Shop'

SITES = {
    'coffee': 'arabica bodrost brewlab crema dripbar grain kitobkofe kofego kofemania kofeofis noir nurkofe origin plastinka qahvauy reserve tong tunkofe',
    'cold': 'coldbrew', 'matcha': 'matcha', 'bakery': 'karamel lumiere shirin',
    'soft': 'sofa velvet uyut', 'home': 'atelye daraxt dizayn duradgor elit forma loftmebel mebeluy metallform monomebel scandi smartmebel',
    'kids': 'bolalar', 'garden': 'bogmebel', 'lighting': 'yorug', 'classic': 'royalmebel',
    'grill': 'olovtemir sandon', 'metaldecor': 'qora temirchi laser kovkaart ornament zarhal temirsanat', 'rolled': 'prokat',
    'tea': 'choy', 'grocery': 'dala', 'gadget': 'gadget', 'cosmetics': 'gulskin', 'books': 'kitob', 'clothes': 'kiyim',
    'shoes': 'krossovka', 'jewelry': 'oltin', 'drinks': 'zing', 'optics': 'kozgu',
}
LANGS = ['ru', 'uz', 'en']


def tri(s):
    parts = s.split('|')
    assert len(parts) == 3, s
    return parts


def items_for(slug, pool, lang_i):
    h = int(hashlib.md5(slug.encode()).hexdigest(), 16)
    n = min(8, len(pool))
    start = h % len(pool)
    picked = [pool[(start + k) % len(pool)] for k in range(n)]
    mult = 0.9 + (h % 21) / 100  # 0.90…1.10: соседние сайты не совпадают по ценам до сума
    out = []
    for name, text, cat, price, unit, badge in picked:
        p = int(round(price * mult / 1000.0)) * 1000 if price >= 20000 else int(round(price * mult / 100.0)) * 100
        old = int(round(p * 1.2 / 1000.0)) * 1000 if badge == 'sale' else 0
        out.append({
            'name': tri(name)[lang_i], 'text': tri(text)[lang_i], 'price': p, 'oldPrice': old, 'image': '',
            'category': tri(CAT[cat])[lang_i], 'badge': tri(BADGE[badge])[lang_i], 'unit': tri(UNIT[unit])[lang_i],
        })
    return out


def section(slug, niche, lang_i):
    return {'id': 'shop', 'type': 'shop', 'enabled': True, 'anchor': 'shop', 'label': tri(LABEL)[lang_i], 'title': tri(TITLE[niche])[lang_i],
            'text': tri(TEXT)[lang_i], 'items': items_for(slug, P[niche], lang_i)}


done = 0
for niche, slugs in SITES.items():
    for slug in slugs.split():
        base = ROOT / f'{slug}.json'
        d = json.loads(base.read_text())
        lang = d.get('lang', 'ru')
        secs = [s for s in d['sections'] if s['id'] != 'shop']
        # витрина сразу после первого экрана (и бегущей строки, если она идёт за ним)
        at = 1
        while at < len(secs) and secs[at]['type'] in ('marquee',):
            at += 1
        secs.insert(at, section(slug, niche, LANGS.index(lang)))
        d['sections'] = secs
        base.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        for other in LANGS:
            if other == lang:
                continue
            tf = ROOT / 'i18n' / f'{slug}.{other}.json'
            if not tf.exists():
                continue
            t = json.loads(tf.read_text())
            ts = [s for s in t.get('sections', []) if s.get('id') != 'shop']
            full = section(slug, niche, LANGS.index(other))
            ts.append({k: full[k] for k in ('id', 'label', 'title', 'text', 'items')})
            t['sections'] = ts
            tf.write_text(json.dumps(t, ensure_ascii=False, indent=2) + '\n')
        done += 1
print('shops added:', done)
