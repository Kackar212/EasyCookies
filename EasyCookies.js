class EasyCookies {
  constructor(defaultOptions = {}) {
    this.cookies = this.parseCookies(document.cookie);    
    this.defaultOptions = { 
      path: location.pathname,
      ...defaultOptions,
    };
    this.storage = localStorage;
    this.onChangeCallback = () => {};
    this.onRemoveCallback = () => {};
    this.onSetCallback = () => {};
  }

  addDefaultOptions(options) {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options
    }
  }

  parseCookies = (cookiesAsStr) => {
    const parsedCookies = {};
    const cookies = cookiesAsStr
    .split('; ')
    .filter(Boolean);
  
    cookies.forEach(cookie => {
      const [name, value] = cookie.split("=");
      parsedCookies[name] = value;
    });
  
    return parsedCookies;
  }

  createCookie(cookieName, cookieValue, options = {}) {
    const isObject = typeof cookieValue === 'object';
    cookieValue = isObject ? JSON.stringify(cookieValue) : cookieValue;

    let cookie = `${cookieName}=${cookieValue}`;
    const cookieWithoutOptions = cookie;

    Object.entries(options).forEach(([option, value]) => {
      option = option.replace(/([A-Z])/g, "-$1").toLowerCase();
      
      if (value) {
        let cookieOption = `; ${option}`;
        if (value !== true) cookieOption += `=${value}`;
        cookie += cookieOption;
      }
    });

    return [cookie, cookieWithoutOptions];
  }

  set(cookieName, cookieValue, options = {}) {
    options = { ...this.defaultOptions, ...options };
    const [cookie, cookieWithoutOptions] = this.createCookie(cookieName, cookieValue, options);

    document.cookie = cookie;

    if (document.cookie.includes(cookieWithoutOptions)) {
      this.cookies[cookieName] = cookieValue;
      this.onSetCallback({ cookieName, cookieValue, cookie, options });
      this.storage.setItem(cookieName, JSON.stringify(options));
    } else {
      delete this.cookies[cookieName];
      this.storage.removeItem(cookieName);
    }

    this.onChangeCallback({ cookieName, cookieValue, cookie, options });
    return cookie;
  }

  get(cookieName, { parse = true, parseMethod = JSON.parse } = {}) {
    const cookie = decodeURIComponent(this.cookies[cookieName]);

    try {
      return parse ? parseMethod(cookie) : cookie;
    } catch (e) {
      return cookie;
    }
  }

  getOptions(cookieName) {
    const options = this.storage.getItem(cookieName);
    if (options) return JSON.parse(options);
  }

  remove(cookieName) {
    const cookieValue = this.get(cookieName);
    if (!cookieValue) return;

    this.set(cookieName, "", { maxAge: -1 });

    this.onRemoveCallback({ cookieName, cookieValue });
  }

  onRemove(callback = () => {}) {
    this.onRemoveCallback = callback;
  }
  
  onSet(callback = () => {}) {
    this.onSetCallback = callback;
  }

  onChange(callback = () => {}) {
    this.onChangeCallback = callback;
  }
}
