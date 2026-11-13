export const COUNTRIES = [
  { id: 'BY', name: 'Беларусь', flag: '🇧🇾' },
  { id: 'RU', name: 'Россия', flag: '🇷🇺' }
];

export const CITIES = [
  // Беларусь
  { id: 1, countryId: 'BY', name: 'Минск', region: 'Минская область', isMajor: 1 },
  { id: 2, countryId: 'BY', name: 'Брест', region: 'Брестская область', isMajor: 1 },
  { id: 3, countryId: 'BY', name: 'Гродно', region: 'Гродненская область', isMajor: 1 },
  { id: 4, countryId: 'BY', name: 'Гомель', region: 'Гомельская область', isMajor: 1 },
  { id: 5, countryId: 'BY', name: 'Могилёв', region: 'Могилёвская область', isMajor: 1 },
  { id: 6, countryId: 'BY', name: 'Витебск', region: 'Витебская область', isMajor: 1 },
  { id: 7, countryId: 'BY', name: 'Барановичи', region: 'Брестская область', isMajor: 0 },
  { id: 8, countryId: 'BY', name: 'Пинск', region: 'Брестская область', isMajor: 0 },
  { id: 9, countryId: 'BY', name: 'Бобруйск', region: 'Могилёвская область', isMajor: 0 },
  { id: 10, countryId: 'BY', name: 'Борисов', region: 'Минская область', isMajor: 0 },
  { id: 11, countryId: 'BY', name: 'Солигорск', region: 'Минская область', isMajor: 0 },
  { id: 12, countryId: 'BY', name: 'Лида', region: 'Гродненская область', isMajor: 0 },

  // Россия
  { id: 101, countryId: 'RU', name: 'Москва', region: 'Московская область', isMajor: 1 },
  { id: 102, countryId: 'RU', name: 'Санкт-Петербург', region: 'Ленинградская область', isMajor: 1 },
  { id: 103, countryId: 'RU', name: 'Казань', region: 'Татарстан', isMajor: 1 },
  { id: 104, countryId: 'RU', name: 'Екатеринбург', region: 'Свердловская область', isMajor: 1 },
  { id: 105, countryId: 'RU', name: 'Новосибирск', region: 'Новосибирская область', isMajor: 1 },
  { id: 106, countryId: 'RU', name: 'Нижний Новгород', region: 'Нижегородская область', isMajor: 1 },
  { id: 107, countryId: 'RU', name: 'Краснодар', region: 'Краснодарский край', isMajor: 1 },
  { id: 108, countryId: 'RU', name: 'Самара', region: 'Самарская область', isMajor: 1 },
  { id: 109, countryId: 'RU', name: 'Ростов-на-Дону', region: 'Ростовская область', isMajor: 1 },
  { id: 110, countryId: 'RU', name: 'Сочи', region: 'Краснодарский край', isMajor: 1 }
];

export const CATEGORIES = [
  { id: 'horeca', name: 'HoReCa и Общепит', emoji: '☕', sortOrder: 1 },
  { id: 'beauty', name: 'Бьюти и Уход', emoji: '💅', sortOrder: 2 },
  { id: 'auto', name: 'Автобизнес и СТО', emoji: '🚗', sortOrder: 3 },
  { id: 'furniture_renovation', name: 'Мебель и Ремонт', emoji: '🪑', sortOrder: 4 },
  { id: 'tourism', name: 'Туризм и Отдых', emoji: '🌲', sortOrder: 5 },
  { id: 'medicine', name: 'Медицина и Здоровье', emoji: '🦷', sortOrder: 6 },
  { id: 'services', name: 'Услуги и Кейтеринг', emoji: '🍱', sortOrder: 7 },
  { id: 'education_sport', name: 'Спорт и Обучение', emoji: '🧘‍♀️', sortOrder: 8 },
  { id: 'retail', name: 'Шоурумы и Магазины', emoji: '🛍️', sortOrder: 9 }
];

export const SUBCATEGORIES = [
  // HoReCa
  { id: 'coffee', categoryId: 'horeca', name: 'Кофейни и спешелти-кофе', searchQueries: ['кофейня', 'кофе с собой', 'спешелти кофе'] },
  { id: 'bistro', categoryId: 'horeca', name: 'Кафе и городские бистро', searchQueries: ['кафе', 'бистро', 'завтраки'] },
  { id: 'restaurants', categoryId: 'horeca', name: 'Рестораны и банкетные залы', searchQueries: ['ресторан', 'банкетный зал'] },
  { id: 'food_delivery', categoryId: 'horeca', name: 'Доставка пиццы и суши', searchQueries: ['доставка суши', 'доставка пиццы', 'доставка еды'] },
  { id: 'bakery', categoryId: 'horeca', name: 'Пекарни и кондитерские', searchQueries: ['кондитерская', 'пекарня', 'торты на заказ'] },
  { id: 'bars', categoryId: 'horeca', name: 'Бары и пабы', searchQueries: ['бар', 'паб', 'коктейль-бар'] },

  // Бьюти
  { id: 'barbershop', categoryId: 'beauty', name: 'Барбершопы', searchQueries: ['барбершоп', 'мужские стрижки'] },
  { id: 'beauty_salon', categoryId: 'beauty', name: 'Салоны красоты полного цикла', searchQueries: ['салон красоты', 'парикмахерская'] },
  { id: 'nails', categoryId: 'beauty', name: 'Студии маникюра и педикюра', searchQueries: ['маникюр', 'студия маникюра', 'педикюр'] },
  { id: 'brows_lashes', categoryId: 'beauty', name: 'Бровисты и лешмейкеры', searchQueries: ['наращивание ресниц', 'брови', 'ламинирование ресниц'] },
  { id: 'massage_spa', categoryId: 'beauty', name: 'СПА и массажные студии', searchQueries: ['массаж', 'спа салон', 'тайский массаж'] },
  { id: 'tattoo_pm', categoryId: 'beauty', name: 'Тату и перманентный макияж', searchQueries: ['тату салон', 'перманентный макияж'] },

  // Автобизнес
  { id: 'detailing', categoryId: 'auto', name: 'Детейлинг и оклейка плёнкой', searchQueries: ['детейлинг', 'оклейка пленкой', 'полировка кузова', 'керамика авто'] },
  { id: 'carwash', categoryId: 'auto', name: 'Автомойки и химчистка салона', searchQueries: ['автомойка', 'химчистка авто'] },
  { id: 'tire_service', categoryId: 'auto', name: 'Шиномонтаж и правка дисков', searchQueries: ['шиномонтаж', 'правка дисков', 'покраска дисков'] },
  { id: 'autoservice', categoryId: 'auto', name: 'СТО и автосервисы', searchQueries: ['автосервис', 'СТО', 'ремонт авто'] },
  { id: 'body_repair', categoryId: 'auto', name: 'Кузовной ремонт и покраска', searchQueries: ['кузовной ремонт', 'покраска авто'] },

  // Мебель и ремонт
  { id: 'kitchens', categoryId: 'furniture_renovation', name: 'Кухни и мебель на заказ', searchQueries: ['кухни на заказ', 'мебель под заказ', 'шкафы купе'] },
  { id: 'apartment_renovation', categoryId: 'furniture_renovation', name: 'Ремонт квартир под ключ', searchQueries: ['ремонт квартир', 'отделка квартир'] },
  { id: 'stretch_ceilings', categoryId: 'furniture_renovation', name: 'Натяжные потолки', searchQueries: ['натяжные потолки'] },
  { id: 'interior_design', categoryId: 'furniture_renovation', name: 'Дизайн интерьера', searchQueries: ['дизайн интерьера', 'дизайн студия'] },
  { id: 'pvc_windows', categoryId: 'furniture_renovation', name: 'Окна ПВХ и остекление', searchQueries: ['окна пвх', 'остекление балконов'] },
  { id: 'bathhouse_build', categoryId: 'furniture_renovation', name: 'Строительство бань и домов', searchQueries: ['строительство бань', 'каркасные дома'] },

  // Туризм и отдых
  { id: 'agrotourism', categoryId: 'tourism', name: 'Агроусадьбы и дома отдыха', searchQueries: ['агроусадьба', 'усадьба на сутки', 'дом отдыха'] },
  { id: 'saunas_baths', categoryId: 'tourism', name: 'Бани на дровах и чаны', searchQueries: ['баня на дровах', 'сауна', 'чан на дровах'] },
  { id: 'glamping', categoryId: 'tourism', name: 'Глэмпинги и купольные сферы', searchQueries: ['глэмпинг', 'купольные дома', 'кемпинг'] },
  { id: 'cottages_rent', categoryId: 'tourism', name: 'Коттеджи для мероприятий', searchQueries: ['коттедж на сутки', 'аренда коттеджа'] },
  { id: 'recreation_centers', categoryId: 'tourism', name: 'Базы отдыха и загородные клубы', searchQueries: ['база отдыха', 'загородный клуб'] },

  // Медицина
  { id: 'stomatology', categoryId: 'medicine', name: 'Стоматологические клиники', searchQueries: ['стоматология', 'стоматологическая клиника'] },
  { id: 'cosmetology', categoryId: 'medicine', name: 'Косметология и anti-age', searchQueries: ['косметология', 'косметолог'] },
  { id: 'med_centers', categoryId: 'medicine', name: 'Медицинские центры', searchQueries: ['медицинский центр', 'клиника'] },
  { id: 'vet_clinics', categoryId: 'medicine', name: 'Ветеринарные клиники', searchQueries: ['ветеринарная клиника', 'ветклиника'] },

  // Услуги
  { id: 'catering', categoryId: 'services', name: 'Кейтеринг и гастробоксы', searchQueries: ['кейтеринг', 'гастробоксы', 'фуршет'] },
  { id: 'cleaning', categoryId: 'services', name: 'Клининговые компании', searchQueries: ['клининг', 'уборка квартир'] },
  { id: 'photo_studios', categoryId: 'services', name: 'Фотостудии и лофты', searchQueries: ['фотостудия', 'фотограф'] },
  { id: 'events', categoryId: 'services', name: 'Организация праздников', searchQueries: ['организация мероприятий', 'ведущий на свадьбу'] },

  // Спорт и развитие
  { id: 'fitness_yoga', categoryId: 'education_sport', name: 'Фитнес, растяжка и йога', searchQueries: ['фитнес клуб', 'студия растяжки', 'йога'] },
  { id: 'dance_schools', categoryId: 'education_sport', name: 'Школы танцев', searchQueries: ['школа танцев', 'танцевальная студия'] },
  { id: 'language_schools', categoryId: 'education_sport', name: 'Языковые школы', searchQueries: ['курсы английского', 'языковая школа'] },

  // Шоурумы
  { id: 'clothing_showrooms', categoryId: 'retail', name: 'Шоурумы одежды', searchQueries: ['шоурум одежды', 'магазин одежды'] },
  { id: 'flowers_delivery', categoryId: 'retail', name: 'Цветочные студии и доставка', searchQueries: ['доставка цветов', 'цветочный магазин'] }
];
