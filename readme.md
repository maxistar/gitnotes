# Рабочий архив, бортовой журнал

Тут я веду свой дневник и заметки.

- [Daily](./diary) - Бортовой Журнал и Дневник
- [Notes](./notes) - Заметки или внешний мозг

Моя система ведения заметок создана под влиянием системы Zettelkasten Никласа Лумана и GTD Девида Аллена.

Для моей системы не нужны сторонние сервисы или редакторы. Заметки организованы в виде папки с текстовыми файлами, добавленных в git репозиторий.

Бортовой журнал разбит по годам и месяцам. Недельный файл это не столько блог с описанием событий, а скорее чеклист того, что нужно не забыть.

Заметки по годам не разбиты, но можно разбивать произвольно, так как список становится достаточно длинным и его приходится долго прогручивать в файловом менеджере.

Заметки сгруппированы по тегам, для каждого тега автоматически строится список принадлежащих ему заметок.

Каждая заметка автоматически линкуется с десятью соседними заметками, поэтому по заметкам можно путешествать просто прокликивая их.

Заметки можно линковать друг с другом.
Предусмотрена автоматическая проверка ссылочной целостности для ссылок в заметках.

## Tags Parsing

Для того чтобы заметки ссылались друг на друга используется система тегов. Добавляем в заметку
строчку вида tags: '#заметки, #tag1, #tag2' и в конце заметки после индексирования появится раздел "see also"
который будет содержать ссылки на статьи с этими же тегами.

```
cd bin
note notesinexing.js
```

## Android

Заметки синхронизируются при помощи git установленного в Termux.
Синхронизация запускается при помощи Termux виджета вынесенного на главный экран телефона.
Заметки можно редактировать при помощи любого Текстового редактора. Я использую Simple Text Editor.

### Termux

### Разрешение доступа к файлам

```
npm install --no-bin-links
```

### Termux:Widgets

Termux:Widgets это расширение Termux которое умеет создавать виджеты на экране вашего смартфона и вызывать команды из окружения Termux.

## Работа на Десктоп

На десктоп заметки редактируются как любой проект. Просто редактируйте файлы как вам нравится и посылайте в git.


## TODO 

Файлы для года можно создавать автоматически
Для проекта можно создать генератор.
