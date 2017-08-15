'use strict'

exports.removeClass = function(el, className) {
  if (el) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  } else {
    console.log('Element not found.')
  }
}

exports.addClass = function(el, className) {
  if (el) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  } else {
    console.log('Element not found.')
  }
}

exports.closest = function(el, selector) {
    var matchesFn;

    // find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] == 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    })

    var parent;

    // traverse parents
    while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
            return parent;
        }
        el = parent;
    }

    return null;
}

exports.once = function(target, type, listener) {
  target.addEventListener(type, function fn(event) {
    target.removeEventListener(type, fn)
    listener(event)
  })
}

// https://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie
exports.getCookie = function(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=')
    return parts[0] === name ? decodeURIComponent(parts[1]) : r
  }, '')
}
