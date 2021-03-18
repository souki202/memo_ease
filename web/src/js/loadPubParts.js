import { loadCommonParts } from './loadCommonParts';
import pubApp from './pub.js';



window.addEventListener('load', async function () {
    const header = document.getElementById('pubHeader');
    await loadCommonParts('/header.html', header);
    const footer = document.getElementById('pubFooter');
    await loadCommonParts('/footer.html', footer);

    pubApp.mount('#pubHeader');
});