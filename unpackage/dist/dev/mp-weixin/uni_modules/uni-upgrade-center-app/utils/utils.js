"use strict";
const platform_iOS = "iOS";
const platform_Android = "Android";
const platform_Harmony = "Harmony";
function compare(v_1 = "0", v_2 = "0") {
  const v1 = String(v_1).split(".");
  const v2 = String(v_2).split(".");
  const minVersionLens = Math.min(v1.length, v2.length);
  let result = 0;
  for (let i = 0; i < minVersionLens; i++) {
    const curV1 = Number(v1[i]);
    const curV2 = Number(v2[i]);
    if (curV1 > curV2) {
      result = 1;
      break;
    } else if (curV1 < curV2) {
      result = -1;
      break;
    }
  }
  if (result === 0 && v1.length !== v2.length) {
    const v1BiggerThenv2 = v1.length > v2.length;
    const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
    for (let i = minVersionLens; i < maxLensVersion.length; i++) {
      const curVersion = Number(maxLensVersion[i]);
      if (curVersion > 0) {
        v1BiggerThenv2 ? result = 1 : result = -1;
        break;
      }
    }
  }
  return result;
}
exports.compare = compare;
exports.platform_Android = platform_Android;
exports.platform_Harmony = platform_Harmony;
exports.platform_iOS = platform_iOS;
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/uni_modules/uni-upgrade-center-app/utils/utils.js.map
