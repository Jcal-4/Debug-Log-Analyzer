function retrieveDebugLevels(fileContent) {
    console.log("Retrieving debug levels...");
    const debugLevels = fileContent[0];
    const splitDebugLevels = debugLevels.split(";");
    let debugLevelsObj = {};

    for (let i = 0; i < splitDebugLevels.length; i++) {
        let debugLevel = splitDebugLevels[i];
        let levelParts = debugLevel.split(",");
        let levelName = levelParts[0];
        let levelValue = levelParts[1];

        if (levelName.includes("APEX_CODE")) {
            levelName = "APEX_CODE";
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("APEX_PROFILING")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("CALLOUT")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("DATA_ACCESS")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("DB")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("NBA")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("SYSTEM")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("VALIDATION")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("VISUALFORCE")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("WAVE")) {
            debugLevelsObj[levelName] = levelValue;
        } else if (levelName.includes("WORKFLOW")) {
            debugLevelsObj[levelName] = levelValue;
        }
    }
    console.log("debugLevelObject: ", debugLevelsObj);
    return debugLevelsObj;
}

module.exports = retrieveDebugLevels;
