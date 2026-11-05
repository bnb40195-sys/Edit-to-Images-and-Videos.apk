export interface StickerItem {
  id: string;
  name: { ar: string; en: string };
  category: StickerCategory;
  symbol: string;
  svgPath?: string;
  defaultColor?: string;
}

export type StickerCategory =
  | 'word_balloon'
  | 'title'
  | 'hats'
  | 'eyewear'
  | 'hair'
  | 'romance'
  | 'celebrations'
  | 'shapes'
  | 'signs';

export interface StickerCategoryMeta {
  id: StickerCategory;
  title: { ar: string; en: string };
  icon: string;
  description: { ar: string; en: string };
}

export const STICKER_CATEGORIES: StickerCategoryMeta[] = [
  {
    id: 'word_balloon',
    title: { ar: 'فقاعة كلام', en: 'Word Balloon' },
    icon: '💬',
    description: { ar: 'أضف فقاعات حوار كوميدية ونصوص مع ذيل توجيه', en: 'Speech and thought bubbles with pointers' },
  },
  {
    id: 'title',
    title: { ar: 'عنوان فني (Title)', en: 'Title' },
    icon: '🔤',
    description: { ar: 'عناوين ثلاثية الأبعاد ونيون وكوميكس جذابة', en: 'Stylized 3D, neon, and comic titles' },
  },
  {
    id: 'hats',
    title: { ar: 'قبعات وخوذ', en: 'Hats & Helmets' },
    icon: '🧢',
    description: { ar: 'قبعات رعاة البقر، كاب، خوذ، وتيجان ملكية', en: 'Caps, crowns, cowboy hats, helmets' },
  },
  {
    id: 'eyewear',
    title: { ar: 'عيون ونظارات', en: 'Eyes & Eyewear' },
    icon: '👓',
    description: { ar: 'نظارات شمسية، عيون كرتونية مضحكة، وعيون أنمي', en: 'Sunglasses, funny eyes, nerd glasses' },
  },
  {
    id: 'hair',
    title: { ar: 'شعر ولحى وشوارب', en: 'Hair' },
    icon: '🧔',
    description: { ar: 'شوارب كلاسيكية، لحى كثيفة، وتصفيفات شعر', en: 'Beards, mustaches, and cool hairstyles' },
  },
  {
    id: 'romance',
    title: { ar: 'رومانسية وحب', en: 'Romance' },
    icon: '❤️',
    description: { ar: 'قلوب لامعة، أسهم كيوبيد، قبلات وورود', en: 'Hearts, roses, cupid arrows, kisses' },
  },
  {
    id: 'celebrations',
    title: { ar: 'احتفالات ومناسبات', en: 'Celebrations' },
    icon: '🎉',
    description: { ar: 'قصاصات زينة، كعكات أعياد الميلاد، وبالونات', en: 'Party poppers, birthday cakes, balloons' },
  },
  {
    id: 'shapes',
    title: { ar: 'أشكال أساسية', en: 'Basic Shapes' },
    icon: '🔺',
    description: { ar: 'نجوم، مثلثات، أسهم، دوائر، وانفجارات حوارية', en: 'Stars, triangles, arrows, speech bursts' },
  },
  {
    id: 'signs',
    title: { ar: 'إشارات ورموز', en: 'Signs & Symbols' },
    icon: '🛡️',
    description: { ar: 'شعار الطريق السريع، شارات تحذير، وتوثيق', en: 'Highway badges, warnings, shields, medals' },
  },
];

// Rich item library for each category
export const CATEGORY_STICKERS: Record<StickerCategory, StickerItem[]> = {
  word_balloon: [], // Handled by interactive balloon maker
  title: [],        // Handled by interactive title maker

  hats: [
    { id: 'hat_crown', name: { ar: 'تاج ملكي', en: 'Royal Crown' }, category: 'hats', symbol: '👑' },
    { id: 'hat_cowboy', name: { ar: 'قبعة كاوبوي', en: 'Cowboy Hat' }, category: 'hats', symbol: '🤠' },
    { id: 'hat_top', name: { ar: 'قبعة أرستقراطية', en: 'Top Hat' }, category: 'hats', symbol: '🎩' },
    { id: 'hat_party', name: { ar: 'قبعة حفلات', en: 'Party Hat' }, category: 'hats', symbol: '🥳' },
    { id: 'hat_cap', name: { ar: 'كاب رياضي', en: 'Baseball Cap' }, category: 'hats', symbol: '🧢' },
    { id: 'hat_grad', name: { ar: 'قبعة تخرج', en: 'Graduation Cap' }, category: 'hats', symbol: '🎓' },
    { id: 'hat_helmet', name: { ar: 'خوذة عسكرية', en: 'Military Helmet' }, category: 'hats', symbol: '🪖' },
    { id: 'hat_chef', name: { ar: 'قبعة شيف', en: 'Chef Hat' }, category: 'hats', symbol: '👨‍🍳' },
    { id: 'hat_beanie', name: { ar: 'قبعة شتوية', en: 'Winter Beanie' }, category: 'hats', symbol: '🧶' },
    { id: 'hat_santa', name: { ar: 'قبعة بابا نويل', en: 'Santa Hat' }, category: 'hats', symbol: '🎅' },
    { id: 'hat_pirate', name: { ar: 'قبعة قراصنة', en: 'Pirate Hat' }, category: 'hats', symbol: '🏴‍☠️' },
    { id: 'hat_detective', name: { ar: 'قبعة محقق', en: 'Detective Hat' }, category: 'hats', symbol: '🕵️' },
  ],

  eyewear: [
    { id: 'eye_sunglasses', name: { ar: 'نظارة شمسية كلاسيك', en: 'Cool Sunglasses' }, category: 'eyewear', symbol: '😎' },
    { id: 'eye_dark', name: { ar: 'نظارة سوداء فخمة', en: 'Dark Shades' }, category: 'eyewear', symbol: '🕶️' },
    { id: 'eye_nerd', name: { ar: 'نظارة ذكي / نيرد', en: 'Nerd Glasses' }, category: 'eyewear', symbol: '🤓' },
    { id: 'eye_googly', name: { ar: 'عيون كرتونية متحركة', en: 'Googly Eyes' }, category: 'eyewear', symbol: '👀' },
    { id: 'eye_monocle', name: { ar: 'عدسة أحادية أرستقراطية', en: 'Monocle' }, category: 'eyewear', symbol: '🧐' },
    { id: 'eye_heart', name: { ar: 'نظارة قلوب الحب', en: 'Heart Glasses' }, category: 'eyewear', symbol: '😍' },
    { id: 'eye_star', name: { ar: 'عيون النجوم المتلألئة', en: 'Star Eyes' }, category: 'eyewear', symbol: '🤩' },
    { id: 'eye_goggles', name: { ar: 'نظارة واقية / سباحة', en: 'Goggles' }, category: 'eyewear', symbol: '🥽' },
    { id: 'eye_winking', name: { ar: 'غمزة عين', en: 'Wink' }, category: 'eyewear', symbol: '😉' },
    { id: 'eye_sleepy', name: { ar: 'قناع نوم مخملي', en: 'Sleep Mask' }, category: 'eyewear', symbol: '😴' },
  ],

  hair: [
    { id: 'hair_beard_full', name: { ar: 'لحية كاملة أنيقة', en: 'Full Hipster Beard' }, category: 'hair', symbol: '🧔' },
    { id: 'hair_mustache_classic', name: { ar: 'شارب كلاسيكي', en: 'Classic Mustache' }, category: 'hair', symbol: '🥸' },
    { id: 'hair_afro', name: { ar: 'شعر كيرلي / أفروا', en: 'Afro Hair' }, category: 'hair', symbol: '🧑‍🦱' },
    { id: 'hair_blonde', name: { ar: 'شعر ذهبي أشقر', en: 'Blonde Hair' }, category: 'hair', symbol: '👱' },
    { id: 'hair_red', name: { ar: 'شعر كستنائي ناري', en: 'Redhead Hair' }, category: 'hair', symbol: '🧑‍🦰' },
    { id: 'hair_bald_combo', name: { ar: 'شارب جنتلمان', en: 'Gentleman Mustache' }, category: 'hair', symbol: '👴' },
    { id: 'hair_rocker', name: { ar: 'قصة شعر روك', en: 'Rocker Hair' }, category: 'hair', symbol: '🎸' },
  ],

  romance: [
    { id: 'rom_red_heart', name: { ar: 'قلب أحمر متوهج', en: 'Red Heart' }, category: 'romance', symbol: '❤️' },
    { id: 'rom_cupid_arrow', name: { ar: 'قلب مع سهم كيوبيد', en: 'Cupid Arrow Heart' }, category: 'romance', symbol: '💘' },
    { id: 'rom_sparkling_heart', name: { ar: 'قلب براق لامع', en: 'Sparkling Heart' }, category: 'romance', symbol: '💖' },
    { id: 'rom_two_hearts', name: { ar: 'قلبان متحركان', en: 'Two Hearts' }, category: 'romance', symbol: '💕' },
    { id: 'rom_kiss', name: { ar: 'طبعة قبلة شفاه', en: 'Kiss Mark' }, category: 'romance', symbol: '💋' },
    { id: 'rom_rose', name: { ar: 'وردة حمراء جورية', en: 'Red Rose' }, category: 'romance', symbol: '🌹' },
    { id: 'rom_bouquet', name: { ar: 'باقة أزهار رومانسية', en: 'Flower Bouquet' }, category: 'romance', symbol: '💐' },
    { id: 'rom_ring', name: { ar: 'خاتم ألماس وخطوبة', en: 'Diamond Ring' }, category: 'romance', symbol: '💍' },
    { id: 'rom_letter', name: { ar: 'رسالة حب بختم قلب', en: 'Love Letter' }, category: 'romance', symbol: '💌' },
    { id: 'rom_teddy', name: { ar: 'دبدوب رومانسي', en: 'Teddy Bear' }, category: 'romance', symbol: '🧸' },
  ],

  celebrations: [
    { id: 'cel_popper', name: { ar: 'مفرقعات احتفال وزينة', en: 'Party Popper' }, category: 'celebrations', symbol: '🎉' },
    { id: 'cel_confetti', name: { ar: 'كرة قصاصات ملونة', en: 'Confetti Ball' }, category: 'celebrations', symbol: '🎊' },
    { id: 'cel_cake', name: { ar: 'كعكة عيد ميلاد بشموع', en: 'Birthday Cake' }, category: 'celebrations', symbol: '🎂' },
    { id: 'cel_balloons', name: { ar: 'بالونات طائرة مبهجة', en: 'Balloons' }, category: 'celebrations', symbol: '🎈' },
    { id: 'cel_gift', name: { ar: 'صندوق هدية وشريط', en: 'Gift Box' }, category: 'celebrations', symbol: '🎁' },
    { id: 'cel_fireworks', name: { ar: 'ألعاب نارية متوهجة', en: 'Fireworks' }, category: 'celebrations', symbol: '🎆' },
    { id: 'cel_sparkler', name: { ar: 'شعلة شرار مضيئة', en: 'Sparkler' }, category: 'celebrations', symbol: '🎇' },
    { id: 'cel_cheers', name: { ar: 'كؤوس نخب الاحتفال', en: 'Celebration Cheers' }, category: 'celebrations', symbol: '🥂' },
    { id: 'cel_ribbon', name: { ar: 'شريط زينة وردي', en: 'Celebration Ribbon' }, category: 'celebrations', symbol: '🎀' },
    { id: 'cel_medal', name: { ar: 'ميدالية فوز أول', en: '1st Place Medal' }, category: 'celebrations', symbol: '🥇' },
    { id: 'cel_trophy', name: { ar: 'كأس البطولة الذهبي', en: 'Golden Trophy' }, category: 'celebrations', symbol: '🏆' },
  ],

  shapes: [
    { id: 'shp_triangle', name: { ar: 'مثلث أبيض حاد', en: 'Triangle' }, category: 'shapes', symbol: '▲', defaultColor: '#ffffff' },
    { id: 'shp_star_5', name: { ar: 'نجمة ذهبية خماسية', en: '5-Point Star' }, category: 'shapes', symbol: '⭐', defaultColor: '#fbbf24' },
    { id: 'shp_star_bright', name: { ar: 'نجمة بريق لامع', en: 'Sparkle Star' }, category: 'shapes', symbol: '✨', defaultColor: '#60a5fa' },
    { id: 'shp_burst', name: { ar: 'انفجار حواري كوميدي', en: 'Comic Burst' }, category: 'shapes', symbol: '💥', defaultColor: '#ef4444' },
    { id: 'shp_circle', name: { ar: 'دائرة ناصعة', en: 'Solid Circle' }, category: 'shapes', symbol: '⚪', defaultColor: '#ffffff' },
    { id: 'shp_diamond', name: { ar: 'معين هندسي', en: 'Diamond' }, category: 'shapes', symbol: '🔷', defaultColor: '#3b82f6' },
    { id: 'shp_arrow_right', name: { ar: 'سهم توجيه عريض', en: 'Bold Arrow' }, category: 'shapes', symbol: '➔', defaultColor: '#22c55e' },
    { id: 'shp_star_black', name: { ar: 'نجمة كلاسيك', en: 'Classic Star' }, category: 'shapes', symbol: '★', defaultColor: '#f59e0b' },
    { id: 'shp_polygon', name: { ar: 'مضلع سداسي', en: 'Hexagon' }, category: 'shapes', symbol: '⬢', defaultColor: '#ec4899' },
    { id: 'shp_cross', name: { ar: 'إشارة زائد', en: 'Plus / Cross' }, category: 'shapes', symbol: '✚', defaultColor: '#ef4444' },
  ],

  signs: [
    { id: 'sgn_shield', name: { ar: 'درع الطريق السريع (Shield)', en: 'Interstate Highway Shield' }, category: 'signs', symbol: '🛡️' },
    { id: 'sgn_warning', name: { ar: 'مثلث تحذير وانتباه', en: 'Warning Sign' }, category: 'signs', symbol: '⚠️' },
    { id: 'sgn_stop', name: { ar: 'علامة قف ثمانية', en: 'Stop Sign' }, category: 'signs', symbol: '🛑' },
    { id: 'sgn_check', name: { ar: 'علامة صح وتوثيق', en: 'Verified Check' }, category: 'signs', symbol: '✅' },
    { id: 'sgn_no_entry', name: { ar: 'ممنوع الدخول', en: 'No Entry' }, category: 'signs', symbol: '⛔' },
    { id: 'sgn_peace', name: { ar: 'رمز السلام العالمي', en: 'Peace Symbol' }, category: 'signs', symbol: '☮️' },
    { id: 'sgn_biohazard', name: { ar: 'خطر بيولوجي وإشعاع', en: 'Hazard Symbol' }, category: 'signs', symbol: '☢️' },
    { id: 'sgn_target', name: { ar: 'علامة تصويب وهدف', en: 'Bullseye Target' }, category: 'signs', symbol: '🎯' },
    { id: 'sgn_fire', name: { ar: 'شعلة نارية فائقة', en: 'Flame Alert' }, category: 'signs', symbol: '🔥' },
    { id: 'sgn_100', name: { ar: 'علامة 100 كاملة', en: '100 Score' }, category: 'signs', symbol: '💯' },
  ],
};
