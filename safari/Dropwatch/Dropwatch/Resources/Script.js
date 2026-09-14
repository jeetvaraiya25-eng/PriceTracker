function show(enabled, useSettingsInsteadOfPreferences) {
    if (useSettingsInsteadOfPreferences) {
        document.getElementsByClassName('state-on')[0].innerText = "Dropwatch is on. Click the toolbar icon, paste your Settings token, allow Amazon, then Track on the product photo.";
        document.getElementsByClassName('state-off')[0].innerText = "Dropwatch is off. Enable it in Safari Settings → Extensions and set permissions to Allow.";
        document.getElementsByClassName('state-unknown')[0].innerText = "Turn on Dropwatch in Safari Settings → Extensions.";
        document.getElementsByClassName('open-preferences')[0].innerText = "Open Safari Settings…";
    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage("open-preferences");
}

document.querySelector("button.open-preferences").addEventListener("click", openPreferences);
