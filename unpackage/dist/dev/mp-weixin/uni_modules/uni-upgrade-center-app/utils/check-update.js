"use strict";
const common_vendor = require("../../../common/vendor.js");
const uni_modules_uniUpgradeCenterApp_utils_callCheckVersion = require("./call-check-version.js");
function checkUpdate() {
  return new Promise((resolve, reject) => {
    uni_modules_uniUpgradeCenterApp_utils_callCheckVersion.callCheckVersion().then(async (uniUpgradeCenterResult) => {
      const code = uniUpgradeCenterResult.code;
      const message = uniUpgradeCenterResult.message;
      const url = uniUpgradeCenterResult.url;
      if (code > 0) {
        if (/^cloud:\/\//.test(url)) {
          const tcbRes = await common_vendor.nr.getTempFileURL({ fileList: [url] });
          if (typeof tcbRes.fileList[0].tempFileURL !== "undefined")
            uniUpgradeCenterResult.url = tcbRes.fileList[0].tempFileURL;
        }
        if (uniUpgradeCenterResult.is_silently) {
          common_vendor.index.downloadFile({
            url,
            success: (res) => {
              if (res.statusCode == 200) {
                plus.runtime.install(res.tempFilePath, {
                  force: false
                });
              }
            }
          });
          return;
        }
        return resolve(uniUpgradeCenterResult);
      } else if (code < 0) {
        common_vendor.index.__f__("error", "at uni_modules/uni-upgrade-center-app/utils/check-update.ts:93", message);
        return reject(uniUpgradeCenterResult);
      }
      return resolve(uniUpgradeCenterResult);
    }).catch((err) => {
      reject(err);
    });
  });
}
exports.checkUpdate = checkUpdate;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center-app/utils/check-update.js.map
