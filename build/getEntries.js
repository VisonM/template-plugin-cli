const fs = require('fs');
const {
  resolve, dirname, basename, relative,
} = require('path');

const replaceExt = (input, replaceText) => input.replace(/\.[^/.]+$/, replaceText);

const factory = (_dirname_, relativePath, context, ignoreIndependent) => {
  const entries = {};
  const getEntries = (_dirname, relativePath) => {
    const filePath = resolve(_dirname, relativePath);
    const noExtFilePath = replaceExt(filePath, '');
    const key = relative(context, noExtFilePath);
    if (!entries[key]) {
      entries[key] = [];
    }
    ['.js', '.xml', '.json', '.less'].forEach((ext) => {
      const testPath = `${noExtFilePath}${ext}`;
      if (!entries[key].includes(testPath) && fs.existsSync(testPath)) {
        if (entries[key]) {
          entries[key].push(testPath);
        }
        if (ext === '.json') {
          delete require.cache[require.resolve(testPath)];
          let _json;
          try {
            _json = require(testPath);
          } catch (error) {
            const c = '\033';
            console.log(`
              ${c}[40;41m ERROR ${c}[40;37m ${error}
            `);
            process.exit();
          }
          const { pages = [], subPackages = [], usingComponents = {} } = _json;
          Object.keys(usingComponents).forEach((componentPathKey) => {
            const componentPath = resolve(dirname(testPath), usingComponents[componentPathKey]);
            if (!~componentPath.indexOf('plugin:')) {
              getEntries(dirname(componentPath), `./${basename(componentPath)}`);
            }
          });
          pages.forEach((mainPage) => {
            getEntries(dirname(testPath), `./${mainPage}`);
          });
          subPackages.forEach((subPackage) => {
            const { root = '', pages: subPages = [], independent = false } = subPackage;
            if (!root || pages.length === 0) {
              throw new Error('no root or pages in app.json');
            }
            if (ignoreIndependent && independent) {
              // doNothing
            } else {
              subPages.forEach((subPage) => {
                const subPagePath = resolve(dirname(testPath), `./${root}`, `./${subPage}`);
                getEntries(dirname(subPagePath), `./${basename(subPagePath)}`);
              });
            }
          });
        }
      }
    });
  };
  getEntries(_dirname_, relativePath);
  return entries;
};
module.exports = factory;
