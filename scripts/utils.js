var fs = require("fs");
var glob = require("glob").globSync;
var path = require("path");

function getTranslationPath(context) {
	var packageJson = require("../../fetch.json");
	return packageJson[context.opts.plugin.id]?.variables?.TRANSLATION_PATH;
}

function getDefaultPath(context) {
	var configNodes = context.opts.plugin.pluginInfo._et._root._children;
	for (var node in configNodes) {
		if (configNodes[node].attrib.name === "TRANSLATION_PATH") {
			return configNodes[node].attrib.default;
		}
	}
	return "";
}

module.exports = {
	getTargetLang(context) {
		var targetLangArr = [];

		var providedTranslationPathPattern;
		var providedTranslationPathRegex;
		var config = fs.readFileSync("config.xml").toString();
		var PATH = getTranslationPath(context);

		if (PATH == null) {
			PATH = getDefaultPath(context);
			providedTranslationPathPattern = PATH + "*.json";
			providedTranslationPathRegex = new RegExp(PATH + "(.*).json");
		} else {
			if (/^\s*$/.test(PATH)) {
				providedTranslationPathPattern = getDefaultPath(context);
				providedTranslationPathPattern = PATH + "*.json";
				providedTranslationPathRegex = new RegExp(PATH + "(.*).json");
			} else {
				providedTranslationPathPattern = PATH + "*.json";
				providedTranslationPathRegex = new RegExp(PATH + "(.*).json");
			}
		}
		return new Promise(function (resolve, reject) {
			// TODO: reject promise ?
			glob(providedTranslationPathPattern, {posix: true}).forEach(function (langFile) {
				var matches = langFile.match(providedTranslationPathRegex);
				if (matches) {
					targetLangArr.push({
						lang: matches[1],
						path: path.join(context.opts.projectRoot, langFile),
					});
				}
			});
			resolve(targetLangArr);
		});
	},
};
