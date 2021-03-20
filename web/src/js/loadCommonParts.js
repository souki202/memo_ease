import { getTheme } from './colorTheme';
import axios from 'axios';

async function loadCommonParts(url, insertTarget) {
    if (!insertTarget) return;
    let xhr = new XMLHttpRequest();

    await axios.get(url, {}).then(res => {
        insertTarget.innerHTML = res.data;
    }).catch(err => {
        console.log(err);
    }).then(() => {});
}

function addBeforeParts(url, className, idName, insertTarget) {
    if (!insertTarget) return;
    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200) {
            const restxt = xhr.responseText;
            let newElement = document.createElement('div');
            newElement.classList.add(className);
            if (idName) {
                newElement.id = idName;
            }
            newElement.innerHTML = restxt;

            insertTarget.before(newElement);
        }
    };
    xhr.send();
}

function loadCommonDOM() {
    const header = document.getElementById('header')
    loadCommonParts('/header.html', header)
    const footer = document.getElementById('footer')
    loadCommonParts('/footer.html', footer)

    // headerの手前にsidebarを入れる
    // addBeforeParts('/commonParts/sidebar.html', 'sidebar-container', null, header);
}

function appendScript(url, isModule = false) {
	var el = document.createElement('script');
    el.src = url;
    el.async = false;
    if (isModule) el.type = 'module';
	document.body.appendChild(el);
}

function apeendScriptForHead(url, isModule = false) {
	var el = document.createElement('script');
    el.src = url;
    // el.async = false;
    if (isModule) el.type = 'module';
	document.head.appendChild(el);
}

function appendFontAwsome() {
    var el = document.createElement('script');
    el.src = 'https://kit.fontawesome.com/3c64740337.js';
    el.crossOrigin = 'anonymous'
	document.head.appendChild(el); 
}

function appendCss(url) {
	var el = document.createElement('link');
	el.href = url;
	el.rel = 'stylesheet';
	el.type = 'text/css';
	document.head.appendChild(el);
}

function getIsDevelop() {
    const domain = document.domain
    return domain == 'localhost';
}

function getCookieArray(){
    var arr = new Array();
    if(document.cookie != ''){
        var tmp = document.cookie.split('; ');
        for(var i=0;i<tmp.length;i++){
            var data = tmp[i].split('=');
            arr[data[0]] = decodeURIComponent(data[1]);
        }
    }
    return arr;
}

function applyTheme(theme) {
	var el = document.createElement('link');
	el.href = '/css/theme/' + theme + '.css';
	el.rel = 'stylesheet';
	el.type = 'text/css';
	document.getElementsByTagName('head')[0].appendChild(el);
}

(() => {
    // 明転防止のため, ここでテーマを読み込む
    const theme = getTheme();
    if (theme == 'dark') {
        applyTheme('dark');
    }
    else {
        applyTheme('light');
    }
})();

window.addEventListener('DOMContentLoaded', (e) => {
    appendCss('/css/index.css');
    // appendScript('/js/simplebar.min.js');
    appendFontAwsome();

    // loadCommonDOM();
});

export {loadCommonParts, appendCss, appendScript};