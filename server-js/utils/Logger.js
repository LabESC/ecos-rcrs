function printLog(method, url) {
  console.log(`${method} ${url} - ${new Date().toLocaleString()}`);
}

module.exports = printLog;
