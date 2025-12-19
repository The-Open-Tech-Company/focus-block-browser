// Internationalization support
const translations = {
  ru: {
    popup: {
      title: "Focus Blocker",
      statusLabel: "Статус расширения",
      statusOn: "Активно",
      statusOff: "Выкл",
      statusDisabledOnDomain: "Отключено на домене",
      enableExtension: "Включить расширение",
      currentDomain: "Текущий домен:",
      settings: "Настройки",
      info: "Расширение блокирует события фокуса и видимости везде, кроме доменов из blacklist (где расширение отключено)"
    },
    options: {
      title: "Focus Blocker",
      blacklistTitle: "Blacklist Domains",
      blacklistSubtitle: "Домены, где расширение НЕ работает",
      blacklistPlaceholder: "Введите домены по одному на строку\nexample.com\n*.subdomain.com",
      blacklistHint1: "• Введите домены по одному на строку",
      blacklistHint2: "• Используйте * для поддоменов (например: *.example.com)",
      blacklistHint3: "• Расширение не будет работать на указанных доменах",
      eventsTitle: "Focus Blocker Events",
      eventsSubtitle: "События блокировки фокуса",
      copyHelperTitle: "Copy Helper Settings",
      copyHelperSubtitle: "Настройки помощника копирования",
      enableHighlighting: "Enable Highlighting",
      enableHighlightingSub: "Включить подсветку",
      borderColor: "Border Color",
      borderColorSub: "Цвет рамки",
      borderOpacity: "Border Opacity",
      borderOpacitySub: "Прозрачность рамки",
      saved: "Настройки сохранены!",
      reloadNotice: "После изменения настроек необходимо перезагрузить страницу, где используется расширение",
      reloadNoticeEn: "After changing settings, you need to reload the page where the extension is used",
      footer: "Created by",
      footerPowered: "Powered by Open Source. 2025"
    },
    events: {
      visibilitychange: "Изменение видимости",
      webkitvisibilitychange: "Изменение видимости (webkit)",
      mozvisibilitychange: "Изменение видимости (moz)",
      msvisibilitychange: "Изменение видимости (ms)",
      blur: "Потеря фокуса",
      focus: "Получение фокуса",
      focusin: "Вход фокуса",
      focusout: "Выход фокуса"
    },
    sidebar: {
      general: "Общие",
      domains: "Настройки доменов",
      focus: "Настройка блокировки фокуса",
      copy: "Настройка для помощи при копировании",
      accessibility: "Адаптация",
      about: "О расширении"
    },
    general: {
      title: "Общие",
      subtitle: "Основные настройки расширения",
      language: "Язык интерфейса",
      languageSub: "Выберите язык интерфейса",
      theme: "Тема оформления",
      themeSub: "Выберите светлую или темную тему",
      light: "Светлая",
      dark: "Тёмная"
    },
    domains: {
      title: "Настройки доменов",
      subtitle: "Управление доменами в blacklist",
      add: "Добавить домен",
      empty: "Нет доменов в blacklist",
      remove: "Удалить"
    },
    focus: {
      title: "Настройка блокировки фокуса",
      subtitle: "Выберите события для блокировки"
    },
    copy: {
      title: "Настройка для помощи при копировании",
      subtitle: "Настройки помощника копирования",
      enableHighlighting: "Enable Highlighting",
      enableHighlightingSub: "Включить подсветку",
      borderColor: "Border Color",
      borderColorSub: "Цвет рамки",
      borderOpacity: "Border Opacity",
      borderOpacitySub: "Прозрачность рамки"
    },
    about: {
      title: "О расширении",
      subtitle: "Информация о расширении Focus Blocker",
      version: "Версия",
      repository: "Репозиторий",
      reset: "Сброс настроек",
      resetBtn: "Сбросить настройки",
      resetConfirm: "Вы уверены, что хотите сбросить все настройки?",
      resetSuccess: "Настройки успешно сброшены!"
    },
    modal: {
      title: "Добавить домен",
      subtitle: "Введите домен для добавления в blacklist",
      cancel: "Отмена",
      confirm: "Готово",
      placeholder: "example.com"
    },
    accessibility: {
      title: "Адаптация",
      subtitle: "Настройки доступности интерфейса",
      epilepsy: "Для больных эпилепсией",
      epilepsySub: "Отключает все анимации и упрощает интерфейс"
    }
  },
  en: {
    popup: {
      title: "Focus Blocker",
      statusLabel: "Extension Status",
      statusOn: "Active",
      statusOff: "Off",
      statusDisabledOnDomain: "Disabled on domain",
      enableExtension: "Enable extension",
      currentDomain: "Current domain:",
      settings: "Settings",
      info: "Extension blocks focus and visibility events everywhere except domains in blacklist (where extension is disabled)"
    },
    options: {
      title: "Focus Blocker",
      blacklistTitle: "Blacklist Domains",
      blacklistSubtitle: "Domains where extension does NOT work",
      blacklistPlaceholder: "Enter domains one per line\nexample.com\n*.subdomain.com",
      blacklistHint1: "• Enter domains one per line",
      blacklistHint2: "• Use * for subdomains (e.g.: *.example.com)",
      blacklistHint3: "• Extension will not work on specified domains",
      eventsTitle: "Focus Blocker Events",
      eventsSubtitle: "Focus blocking events",
      copyHelperTitle: "Copy Helper Settings",
      copyHelperSubtitle: "Copy helper settings",
      enableHighlighting: "Enable Highlighting",
      enableHighlightingSub: "Enable highlighting",
      borderColor: "Border Color",
      borderColorSub: "Border color",
      borderOpacity: "Border Opacity",
      borderOpacitySub: "Border opacity",
      saved: "Settings saved!",
      reloadNotice: "After changing settings, you need to reload the page where the extension is used",
      reloadNoticeEn: "After changing settings, you need to reload the page where the extension is used",
      footer: "Created by",
      footerPowered: "Powered by Open Source. 2025"
    },
    events: {
      visibilitychange: "Visibility change",
      webkitvisibilitychange: "Visibility change (webkit)",
      mozvisibilitychange: "Visibility change (moz)",
      msvisibilitychange: "Visibility change (ms)",
      blur: "Focus loss",
      focus: "Focus gain",
      focusin: "Focus in",
      focusout: "Focus out"
    },
    sidebar: {
      general: "General",
      domains: "Domain Settings",
      focus: "Focus Blocking Settings",
      copy: "Copy Helper Settings",
      accessibility: "Accessibility",
      about: "About"
    },
    general: {
      title: "General",
      subtitle: "Basic extension settings",
      language: "Interface Language",
      languageSub: "Select interface language",
      theme: "Theme",
      themeSub: "Choose light or dark theme",
      light: "Light",
      dark: "Dark"
    },
    domains: {
      title: "Domain Settings",
      subtitle: "Manage domains in blacklist",
      add: "Add Domain",
      empty: "No domains in blacklist",
      remove: "Remove"
    },
    focus: {
      title: "Focus Blocking Settings",
      subtitle: "Select events to block"
    },
    copy: {
      title: "Copy Helper Settings",
      subtitle: "Copy helper settings",
      enableHighlighting: "Enable Highlighting",
      enableHighlightingSub: "Enable highlighting",
      borderColor: "Border Color",
      borderColorSub: "Border color",
      borderOpacity: "Border Opacity",
      borderOpacitySub: "Border opacity"
    },
    about: {
      title: "About",
      subtitle: "Information about Focus Blocker extension",
      version: "Version",
      repository: "Repository",
      reset: "Reset Settings",
      resetBtn: "Reset Settings",
      resetConfirm: "Are you sure you want to reset all settings?",
      resetSuccess: "Settings successfully reset!"
    },
    modal: {
      title: "Add Domain",
      subtitle: "Enter domain to add to blacklist",
      cancel: "Cancel",
      confirm: "Done",
      placeholder: "example.com"
    },
    accessibility: {
      title: "Accessibility",
      subtitle: "Interface accessibility settings",
      epilepsy: "For people with epilepsy",
      epilepsySub: "Disables all animations and simplifies interface"
    }
  }
};

function getLanguage() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['language'], (result) => {
      resolve(result.language || 'ru');
    });
  });
}

// Set language
function setLanguage(lang) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ language: lang }, resolve);
  });
}

function t(key, lang = null) {
  return new Promise(async (resolve) => {
    const currentLang = lang || await getLanguage();
    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    resolve(value || key);
  });
}

async function translatePage() {
  const lang = await getLanguage();
  
  // Translate text content
  const textElements = document.querySelectorAll('[data-i18n]');
  for (const el of textElements) {
    const key = el.getAttribute('data-i18n');
    const translation = await t(key, lang);
    el.textContent = translation;
  }
  
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  for (const el of placeholderElements) {
    const key = el.getAttribute('data-i18n-placeholder');
    const translation = await t(key, lang);
    el.placeholder = translation;
  }
  
  const titleElements = document.querySelectorAll('[data-i18n-title]');
  for (const el of titleElements) {
    const key = el.getAttribute('data-i18n-title');
    const translation = await t(key, lang);
    el.title = translation;
  }
}

