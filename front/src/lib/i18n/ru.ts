/**
 * Централизованные строки интерфейса (RU).
 * Коды прав и сообщения с бэкенда не переводим — показываем как пришли.
 */
export const ru = {
  theme: {
    toggle: "Тема"
  },
  common: {
    retry: "Повторить",
    cancel: "Отмена",
    close: "Закрыть",
    save: "Сохранить",
    refresh: "Обновить",
    search: "Поиск",
    sortBy: "Сортировка",
    actions: "Действия",
    loading: "Загрузка…",
    asc: "По возрастанию",
    desc: "По убыванию",
    noPermission: "Недостаточно прав",
    none: "—",
    noneShort: "Нет"
  },
  layout: {
    brand: "Diplom Admin",
    subtitle: "Панель управления",
    tagline: "Учётные записи и доступ",
    signInHint: "Войдите, чтобы управлять доступом",
    navPrimary: "Основная навигация",
    navMobile: "Основная навигация (мобильная)",
    navUsers: "Пользователи",
    navGroups: "Группы",
    logout: "Выйти",
    userMenuAria: "Меню пользователя"
  },
  auth: {
    sessionChecking: "Проверка сессии…",
    loginSuccess: "Вход выполнен",
    sessionExpired: "Сессия истекла. Войдите снова.",
    loginFailed: "Не удалось войти. Попробуйте ещё раз."
  },
  api: {
    requestFailed: "Ошибка запроса",
    forbiddenDescription: "Возможно, у вас нет прав на это действие."
  },
  validation: {
    required: "Обязательное поле",
    email: "Введите корректный email",
    passwordMinCreate: "Пароль не короче 6 символов",
    passwordMinEdit: "Пароль не короче 6 символов или оставьте поле пустым"
  },
  login: {
    title: "Вход",
    loginPlaceholder: "Логин или email",
    passwordPlaceholder: "Пароль",
    submit: "Войти",
    submitting: "Вход…",
    demoHintTitle: "Демо-доступ для экспертной комиссии",
    demoHintDescription: "Нажмите на значение или кнопку, чтобы скопировать и вставить в поля формы.",
    demoLoginLabel: "Логин",
    demoPasswordLabel: "Пароль",
    demoFillForm: "Заполнить форму",
    demoCopied: "Скопировано",
    demoFilled: "Данные подставлены в форму"
  },
  users: {
    pageTitle: "Пользователи",
    pageDescription:
      "Учётные записи каталога: поиск, просмотр доступа и управление активностью учётных записей.",
    create: "Создать пользователя",
    createNoPerm: "Нет права создавать пользователей",
    stats: {
      total: "Всего пользователей",
      totalHint: "Учётные записи в каталоге",
      active: "Активные",
      activeHint: "Могут входить в систему",
      admins: "Администраторы",
      adminsHint: "Участники группы администраторов",
      loadFailed: "Не удалось загрузить статистику пользователей"
    },
    toolbar: {
      searchPlaceholder: "Логин, email или имя…",
      statusLabel: "Статус",
      statusAll: "Все статусы",
      statusActive: "Только активные",
      statusInactive: "Только неактивные",
      sortUser: "Пользователь",
      sortEmail: "Email",
      sortUpdated: "Обновлён"
    },
    table: {
      user: "Пользователь",
      email: "Email",
      groups: "Группы",
      status: "Статус",
      updated: "Обновлён",
      actions: "Действия",
      actionsMenu: "Действия со строкой",
      edit: "Изменить",
      delete: "Удалить",
      noEditPerm: "Нет права редактировать пользователей",
      noDeletePerm: "Нет права удалять пользователей",
      statusActive: "Активен",
      statusInactive: "Неактивен"
    },
    empty: {
      none: "Пока нет пользователей",
      noneDesc: "Создайте первого пользователя кнопкой выше или загрузите демо-данные в базу.",
      noMatch: "Ничего не найдено",
      noMatchDesc: "Измените поиск или фильтры."
    },
    listError: {
      fallback: "Не удалось загрузить список пользователей"
    },
    sheet: {
      title: "Профиль пользователя",
      description: "Данные каталога и контекст доступа (только чтение).",
      account: "Учётная запись",
      access: "Доступ",
      audit: "Аудит",
      email: "Email",
      firstName: "Имя",
      lastName: "Фамилия",
      created: "Создан",
      updated: "Обновлён",
      groupsHint:
        "Пользователь не состоит ни в одной группе.",
      edit: "Изменить пользователя"
    },
    dialog: {
      createTitle: "Создание пользователя",
      createDesc: "Новая учётная запись: данные профиля и начальный пароль.",
      editTitle: "Редактирование пользователя",
      editDesc: "Обновление профиля и пароля без выхода из панели.",
      deleteTitle: "Удалить пользователя?",
      deleteDesc: "Учётная запись будет удалена без возможности восстановления.",
      deleteConfirm: "Удалить",
      deleting: "Удаление…",
      createSubmit: "Создать пользователя",
      creating: "Создание…",
      saveChanges: "Сохранить изменения",
      saving: "Сохранение…"
    },
    form: {
      basic: "Основное",
      basicHint: "Идентификаторы для входа.",
      profile: "Профиль",
      profileHint: "Отображаемое имя из имени и фамилии.",
      security: "Безопасность",
      securityCreate: "Задайте начальный пароль.",
      securityEdit: "Оставьте пустым, чтобы не менять пароль.",
      groups: "Группы",
      groupsHint: "Назначьте пользователю одну или несколько групп доступа.",
      access: "Доступ",
      accessHint: "Неактивные пользователи не могут входить.",
      username: "Логин",
      email: "Email",
      firstName: "Имя",
      lastName: "Фамилия",
      password: "Пароль",
      passwordEdit: "Новый пароль (необязательно)",
      passwordPlaceholderEdit: "Пусто — не менять пароль",
      active: "Активная учётная запись"
    },
    groupsPicker: {
      placeholder: "Выберите группы…",
      searchPlaceholder: "Поиск по названию или коду…",
      loading: "Загрузка списка групп…",
      empty: "Список групп пуст.",
      emptySearch: "Ничего не найдено.",
      loadMore: "Загрузить еще",
      selected: "Выбрано",
      notSelected: "Ничего не выбрано",
      removeGroup: "Удалить группу",
      more: "еще",
      loadFailed: "Не удалось загрузить список групп"
    },
    toast: {
      created: "Пользователь создан",
      updated: "Пользователь обновлён",
      deleted: "Пользователь удалён",
      createFailed: "Не удалось создать пользователя",
      updateFailed: "Не удалось обновить пользователя",
      deleteFailed: "Не удалось удалить пользователя",
      detailsFailed: "Не удалось загрузить данные пользователя"
    }
  },
  groups: {
    pageTitle: "Группы",
    pageDescription:
      "Ролевые группы объединяют права доступа, чтобы назначать одинаковые политики без дублирования настроек.",
    create: "Создать группу",
    createNoPerm: "Нет права создавать группы",
    stats: {
      total: "Групп ролей",
      totalHint: "Наборы в каталоге",
      empty: "Пустые матрицы",
      emptyHint: "Группы без прав",
      grants: "Назначений прав",
      grantsHint: "Сумма прав по всем группам"
    },
    toolbar: {
      searchPlaceholder: "Название или код…",
      sortTitle: "Название",
      sortCode: "Код",
      sortPerms: "Количество прав",
      sortUpdated: "Обновлена"
    },
    table: {
      group: "Группа",
      code: "Код",
      permissions: "Права",
      updated: "Обновлена",
      actions: "Действия",
      more: "ещё",
      nonePerms: "Нет",
      actionsMenu: "Действия со строкой"
    },
    empty: {
      none: "Пока нет групп",
      noneDesc: "Создайте группу кнопкой выше или используйте сид базы данных.",
      noMatch: "Ничего не найдено",
      noMatchDesc: "Измените поиск."
    },
    listError: {
      fallback: "Не удалось загрузить список групп"
    },
    sheet: {
      title: "Группа ролей",
      description: "Набор прав и метаданные группы.",
      overview: "Обзор",
      noDescription: "Описание для этой группы не задано.",
      permissions: "Права",
      noPermissions: "Права ещё не назначены.",
      audit: "Аудит",
      created: "Создана",
      updated: "Обновлена",
      edit: "Изменить группу"
    },
    dialog: {
      createTitle: "Создание группы",
      createDesc: "Новый набор прав для организации.",
      editTitle: "Редактирование группы",
      editDesc: "Изменение метаданных и матрицы прав.",
      deleteTitle: "Удалить группу?",
      deleteLead: "Удалить группу",
      deleteHint:
        "Пользователи с этой группой могут потерять связанный доступ, пока не назначена замена.",
      deleteConfirm: "Удалить группу",
      deleting: "Удаление…",
      createSubmit: "Создать группу",
      creating: "Создание…",
      saveChanges: "Сохранить изменения",
      saving: "Сохранение…"
    },
    form: {
      identity: "Идентификация",
      identityHint: "Стабильный код и отображаемое название.",
      description: "Описание",
      descriptionHint: "Дополнительный контекст для операторов.",
      notes: "Заметки",
      notesPlaceholder: "За что отвечает эта группа?",
      permissions: "Права",
      permissionsHint: "Выберите возможности для всех участников группы.",
      code: "Код",
      codePlaceholder: "Например, ADMINS",
      title: "Название",
      titlePlaceholder: "Отображаемое имя"
    },
    permissionsPicker: {
      empty: "Список прав не загружен"
    },
    toast: {
      created: "Группа создана",
      updated: "Группа обновлена",
      deleted: "Группа удалена",
      createFailed: "Не удалось создать группу",
      updateFailed: "Не удалось обновить группу",
      deleteFailed: "Не удалось удалить группу",
      detailsFailed: "Не удалось загрузить данные группы",
      permListFailed: "Не удалось загрузить список прав"
    }
  }
} as const;
