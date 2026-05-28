const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

module.exports = escapeRegex;
