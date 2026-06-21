# Деплой на VPS (role-control.ru)

## Сервер

| Параметр | Значение |
|----------|----------|
| Хост | `df4678b5a99.vps.myjino.ru` |
| SSH-порт | `49207` |
| IP | `195.161.68.183` |
| Домен | `role-control.ru` |
| Путь приложения | `/opt/role-control` |

## Что развёрнуто

- **PostgreSQL** — БД `rolecontrol`, пользователь `rolecontrol`
- **Backend** — PM2 `role-control-api`, порт `4000` (только localhost)
- **Frontend** — статика в `/opt/role-control/front/dist`
- **Nginx** — `/etc/nginx/conf.d/role-control.conf`, прокси `/api/` → backend

## Доступ к приложению

После настройки DNS (A-запись `@` и `www` → `195.161.68.183`):

- Сайт: http://role-control.ru  
- API: http://role-control.ru/api/health  

Пока DNS не указывает на сервер, проверка по IP:

```bash
curl http://195.161.68.183/api/health -H "Host: role-control.ru"
```

**Вход в админку (после seed):** `admin` / `admin123`

## HTTPS (рекомендуется)

На сервере, когда DNS уже указывает на VPS:

```bash
certbot --nginx -d role-control.ru -d www.role-control.ru
```

Затем обновите `VITE_API_URL` на `https://role-control.ru/api`, пересоберите frontend и обновите `CORS_ORIGIN` в `/opt/role-control/.env`.

## Повторный деплой с локальной машины

```powershell
$env:SSH_PASSWORD='<ваш пароль>'
py deploy/upload-and-deploy.py
py deploy/fix-nginx.py   # при необходимости поправить nginx
```

Пароль **не храните** в репозитории. После деплоя смените root-пароль и настройте SSH-ключи.

## Полезные команды на сервере

```bash
pm2 logs role-control-api
pm2 restart role-control-api
systemctl status nginx
sudo -u postgres psql -d rolecontrol
```

## Переменные окружения

Файл `/opt/role-control/.env` (backend) и `/opt/role-control/front/.env` (сборка UI) создаются автоматически при деплое.
