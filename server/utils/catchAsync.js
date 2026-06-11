/**
 * utils/catchAsync.js – Wrapper pour éviter les try/catch répétitifs
 * Encapsule les fonctions async des contrôleurs et transmet les erreurs à Express
 */

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;