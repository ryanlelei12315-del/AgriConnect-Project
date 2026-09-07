/* eslint-env node */
const sanitizeHtml = require('sanitize-html');

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'];
const ALLOWED_ATTR = {
  a: ['href', 'title', 'target'],
};

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return sanitizeHtml(text, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {},
    allowedClasses: false,
    transformTags: {
      a: function (tagName, attribs) {
        return Object.assign({}, attribs, { target: '_blank', rel: 'noopener noreferrer' });
      },
    },
  });
}

module.exports = { sanitize };