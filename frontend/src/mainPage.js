require('./css/reset.css');
require('./css/shortener-wrapper.css');
require('./css/shortener.css');

var xhr;
var shortenerTag = document.getElementById('shortener');
var fullUrlTag = shortenerTag.getElementsByClassName('shortener__full-url')[0];
var resultUrlTag = shortenerTag.getElementsByClassName('shortener__result')[0];
var errorTag = shortenerTag.getElementsByClassName('shortener__error')[0];
var resultContainerTag = shortenerTag.getElementsByClassName('shortener__result-container')[0];
var shortenBtnTag = shortenerTag.getElementsByClassName('shortener__shorten-btn')[0];
var clearBtnTag = shortenerTag.getElementsByClassName('shortener__clear-btn')[0];
var copyBtnTag = shortenerTag.getElementsByClassName('shortener__copy-btn')[0];

shortenBtnTag.addEventListener('click', shortenUrl);
fullUrlTag.addEventListener('keyup', fullUrlKeyUpHandler);
clearBtnTag.addEventListener('click', clearResult);
copyBtnTag.addEventListener('click', copyToClipboard);
resultUrlTag.addEventListener('dblclick', selectResultUrl);

/**
 * @param {KeyboardEvent} e
 */
function fullUrlKeyUpHandler(e) {
    if (e.code == 'Return' || e.keyCode == 13) {
        shortenUrl(e);
    }
}

function shortenUrl(e) {
    hideError();
    var fullUrl = fullUrlTag.value;

    if (!fullUrl) {
        showError('URL can not be empty!');
        return false;
    }

    sendRequest({ fullUrl: fullUrl });
}

/**
 * @param {Object} dataObject
 */
function sendRequest(dataObject) {
    xhr = new XMLHttpRequest();

    if (!xhr) {
        showError('XMLHttpRequest object can not be created.');
        return false;
    }

    xhr.onreadystatechange = responseHandler;
    xhr.open('post', 'shortenUrl');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(dataObject));
}

function responseHandler() {
    if (xhr.readyState != XMLHttpRequest.DONE) {
        return;
    }

    if (xhr.status == 200) {
        processServerData(xhr.responseText);
    } else {
        showError('There was a problem with the request. See details in the browser console.');
        console.dir(xhr);
    }
}

/**
 * @param {string} responseText
 */
function processServerData(responseText) {
    try {
        var data = JSON.parse(responseText);

        if (data.error) {
            showError(data.error);
        } else if (data.shortPath) {
            resultUrlTag.textContent = location.href + data.shortPath;
            resultContainerTag.classList.remove('shortener__result-container_hidden');
            selectResultUrl();
        } else {
            showError('The server returned empty data.');
            console.dir(data);
        }
    } catch (error) {
        console.error(error);
        showError(error.message);
    }
}

function clearResult(e) {
    hideError();
    hideResultContainer();
    resultUrlTag.textContent = '';
    fullUrlTag.value = '';
    fullUrlTag.focus();
}

function copyToClipboard(e) {
    selectResultUrl();
    document.execCommand('copy');
}

function selectResultUrl(e) {
    getSelection().selectAllChildren(resultUrlTag);
    resultUrlTag.focus();
}

/**
 * @param {string} errorMessage
 */
function showError(errorMessage) {
    errorTag.textContent = errorMessage;
    shortenerTag.classList.add('shortener_has-error');
    hideResultContainer();
}

function hideError() {
    shortenerTag.classList.remove('shortener_has-error');
}

function hideResultContainer() {
    resultContainerTag.classList.add('shortener__result-container_hidden');
}
