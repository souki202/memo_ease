import { loadCommonParts } from './loadCommonParts';
import pubApp from './pub.js';



window.addEventListener('load', async function () {
    const footer = document.getElementById('pubFooter');
    await loadCommonParts('/footer.html', footer);

    pubApp.mount('#pubHeader');
});