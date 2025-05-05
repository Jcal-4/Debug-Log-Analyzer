function extractTime(fileContent) {
    console.log('fileContent: ', fileContent.length);
    let firstStr = fileContent[1];
    let lastStr = fileContent[fileContent.length - 2];
    console.log("firstStr: ", firstStr);
    console.log("lastStr: ", lastStr);
    // Convert both times to milliseconds
    let firstTimeMs = timeToMilliseconds(firstStr);
    let lastTimeMs = timeToMilliseconds(lastStr);

    // Subtract the times
    let differenceMs = lastTimeMs - firstTimeMs;

    // Convert the difference back to a readable format
    let diffHours = Math.floor(differenceMs / 3600000);
    differenceMs %= 3600000;
    let diffMinutes = Math.floor(differenceMs / 60000);
    differenceMs %= 60000;
    let diffSeconds = Math.floor(differenceMs / 1000);
    let diffMilliseconds = differenceMs % 1000;

    return `Elapsed Time: ${diffHours}h ${diffMinutes}m ${diffSeconds}s ${diffMilliseconds}ms`
}

// Function to convert time string to milliseconds
function timeToMilliseconds(timeStr) {
    let [hours, minutes, seconds] = timeStr.split(":");
    let [secs, ms] = seconds.split(".");
    return (
        parseInt(hours) * 3600000 + // Convert hours to milliseconds
        parseInt(minutes) * 60000 + // Convert minutes to milliseconds
        parseInt(secs) * 1000 + // Convert seconds to milliseconds
        parseInt(ms) // Add milliseconds
    );
}

module.exports = extractTime;
