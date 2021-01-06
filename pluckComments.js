const extractComments = require('extract-comments');

function pluckComments (code) {
  const commentHolder = [];

  const comments = extractComments(code);

  comments.forEach((comment) => {
    commentHolder.push(comment.raw);
    code = code.replace(comment.raw, `__#__[[__JSBUN__[${commentHolder.length - 1}]]]`);
  });

  function restoreComments (newCode) {
    commentHolder.forEach((comment, commentIndex) => {
      newCode = newCode.replace(`__#__[[__JSBUN__[${commentIndex}]]]`, commentHolder[commentIndex]);
    });

    return newCode;
  }

  return {
    commentFreeCode: code,
    restoreComments
  };
}

module.exports = pluckComments;
