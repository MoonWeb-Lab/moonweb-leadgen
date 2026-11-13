export const STATIC_COUNTRIES = [
  { id: 'BY', name: 'Беларусь', flag: '🇧🇾' },
  { id: 'RU', name: 'Россия', flag: '🇷🇺' }
];

export const STATIC_CITIES = [
  // Беларусь
  { id: 1, country_id: 'BY', name: 'Минск', region: 'Минская область', is_major: 1 },
  { id: 2, country_id: 'BY', name: 'Брест', region: 'Брестская область', is_major: 1 },
  { id: 3, country_id: 'BY', name: 'Гродно', region: 'Гродненская область', is_major: 1 },
  { id: 4, country_id: 'BY', name: 'Гомель', region: 'Гомельская область', is_major: 1 },
  { id: 5, country_id: 'BY', name: 'Могилёв', region: 'Могилёвская область', is_major: 1 },
  { id: 6, country_id: 'BY', name: 'Витебск', region: 'Витебская область', is_major: 1 },
  { id: 7, country_id: 'BY', name: 'Барановичи', region: 'Брестская область', is_major: 0 },
  { id: 8, country_id: 'BY', name: 'Бобруйск', region: 'Могилёвская область', is_major: 0 },
  { id: 9, country_id: 'BY', name: 'Борисов', region: 'Минская область', is_major: 0 },
  { id: 10, country_id: 'BY', name: 'Пинск', region: 'Брестская область', is_major: 0 },
  { id: 11, country_id: 'BY', name: 'Лида', region: 'Гродненская область', is_major: 0 },
  { id: 12, country_id: 'BY', name: 'Мозырь', region: 'Гомельская область', is_major: 0 },

  // Россия
  { id: 13, country_id: 'RU', name: 'Москва', region: 'Московская область', is_major: 1 },
  { id: 14, country_id: 'RU', name: 'Санкт-Петербург', region: 'Ленинградская область', is_major: 1 },
  { id: 15, country_id: 'RU', name: 'Смоленск', region: 'Смоленская область', is_major: 1 },
  { id: 16, country_id: 'RU', name: 'Брянск', region: 'Брянская область', is_major: 1 },
  { id: 17, country_id: 'RU', name: 'Псков', region: 'Псковская область', is_major: 1 },
  { id: 18, country_id: 'RU', name: 'Казань', region: 'Татарстан', is_major: 1 },
  { id: 19, country_id: 'RU', name: 'Нижний Новгород', region: 'Нижегородская область', is_major: 1 },
  { id: 20, country_id: 'RU', name: 'Екатеринбург', region: 'Свердловская область', is_major: 1 },
  { id: 21, country_id: 'RU', name: 'Краснодар', region: 'Краснодарский край', is_major: 1 },
  { id: 22, country_id: 'RU', name: 'Сочи', region: 'Краснодарский край', is_major: 1 }
];

export const STATIC_CATEGORIES = [
  {
    id: 'horeca',
    name: 'HoReCa и Общепит',
    emoji: '☕',
    subcategories: [
      { id: 'coffee', name: 'Кофейни и спешелти-кофе' },
      { id: 'restaurants', name: 'Рестораны и гастропабы' },
      { id: 'bistro', name: 'Городские бистро и бары' },
      { id: 'food_delivery', name: 'Доставка еды, суши и пиццы' },
      { id: 'bakery', name: 'Пекарни и кондитерские' },
      { id: 'catering', name: 'Кейтеринг и гастробоксы' }
    ]
  },
  {
    id: 'beauty',
    name: 'Бьюти и Уход',
    emoji: '💅',
    subcategories: [
      { id: 'barbershop', name: 'Барбершопы' },
      { id: 'beauty_salon', name: 'Салоны красоты' },
      { id: 'nails', name: 'Студии маникюра и педикюра' },
      { id: 'brows_lashes', name: 'Наращивание ресниц и брови' },
      { id: 'massage_spa', name: 'Массажные салоны и SPA' }
    ]
  },
  {
    id: 'auto',
    name: 'Автобизнес',
    emoji: '🚗',
    subcategories: [
      { id: 'detailing', name: 'Детейлинг и полировка' },
      { id: 'carwash', name: 'Автомойки и химчистка' },
      { id: 'tire_service', name: 'Шиномонтаж' },
      { id: 'autoservice', name: 'СТО и ремонт двигателей/подвески' },
      { id: 'body_repair', name: 'Кузовной ремонт и покраска' }
    ]
  },
  {
    id: 'construction',
    name: 'Ремонт и Мебель',
    emoji: '🔨',
    subcategories: [
      { id: 'kitchens', name: 'Кухни и корпусная мебель на заказ' },
      { id: 'apartment_renovation', name: 'Ремонт квартир под ключ' },
      { id: 'stretch_ceilings', name: 'Натяжные потолки' },
      { id: 'interior_design', name: 'Дизайн интерьера' },
      { id: 'bathhouse_build', name: 'Строительство бань и террас' }
    ]
  },
  {
    id: 'tourism',
    name: 'Отдых и Туризм',
    emoji: '🌲',
    subcategories: [
      { id: 'agrotourism', name: 'Агроусадьбы и загородные дома' },
      { id: 'saunas_baths', name: 'Бани, сауны и чаны' },
      { id: 'glamping', name: 'Глэмпинги и кемпинги' },
      { id: 'cottages_rent', name: 'Аренда коттеджей посуточно' }
    ]
  },
  {
    id: 'services',
    name: 'Локальные услуги',
    emoji: '✨',
    subcategories: [
      { id: 'cleaning', name: 'Клининг квартир и офисов' },
      { id: 'furniture_drycleaning', name: 'Химчистка мебели и ковров' },
      { id: 'photo_studios', name: 'Фотостудии и фотографы' },
      { id: 'events_host', name: 'Организация праздников и ведущие' }
    ]
  },
  {
    id: 'medicine',
    name: 'Медицина и Здоровье',
    emoji: '🦷',
    subcategories: [
      { id: 'stomatology', name: 'Стоматологические клиники' },
      { id: 'cosmetology', name: 'Косметология' }
    ]
  },
  {
    id: 'education_sport',
    name: 'Обучение и Спорт',
    emoji: '💪',
    subcategories: [
      { id: 'fitness_yoga', name: 'Фитнес-клубы, йога и растяжка' },
      { id: 'dance_studios', name: 'Студии танцев' }
    ]
  },
  {
    id: 'retail',
    name: 'Ритейл и Торговля',
    emoji: '🛍️',
    subcategories: [
      { id: 'fashion_showroom', name: 'Шоурумы одежды и обуви' },
      { id: 'flowers', name: 'Цветочные студии и букеты' }
    ]
  }
];
