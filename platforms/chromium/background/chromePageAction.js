chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'lms.fu-berlin.de', schemes: ['https'] },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});