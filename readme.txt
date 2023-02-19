#ИНФОРМАЦИЯ ДЛЯ РАБОТЫ СЕРВВЕРА СОДЕРАЩАЯСЯ В .env

#для подключения к БД
PORT=
DB_NAME=
DB_USER=
DB_PASS=
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=

#для отправки в телеграм
TELEGRAM_BOT_TOKEN=
CHAT_ID=5632458244

#для отправки на почту
EMAIL_HOST=
EMAIL_HOST_PASSWORD=
EMAIL_HOST_USER=  
EMAIL_PORT=
EMAIL_SEND=


#API на получение данных

Получение товаров GET запрос
http://localhost:3000/api/products
Получение одного товара. Как параметр :id указывается вендор код товара
http://localhost:3000/api/products/:id - id = vendor_code(89472650-39)

Создание статьи
POST http://localhost:3001/api/articles 

Показать все статьи
GET http://localhost:3001/api/articles 

Создание отзыва
POST http://localhost:3001/api/reviews