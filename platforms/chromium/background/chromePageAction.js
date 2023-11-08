chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: 'fu-berlin.blackboard.com', schemes: ['https'] },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});