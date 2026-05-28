const CINEMA_API = 'http://localhost:3000/api';

async function cargarFondoCinema() {
    try {
        const res = await fetch(`${CINEMA_API}/peliculas/posters-fondo`);
        const data = await res.json();

        if (!data.ok || !data.data.posters.length) return;

        const posters = data.data.posters;
        const tiras = document.querySelectorAll('.film-strip');

        tiras.forEach((tira, i) => {
            const imgs = tira.querySelectorAll('img');
            const total = imgs.length;

            imgs.forEach((img, j) => {
                // Usar módulo para repetir posters y que no haya blancos
                const idx = (i * 6 + j) % posters.length;
                img.src = posters[idx];
                img.onerror = () => {
                    // Si falla, poner el siguiente poster disponible
                    img.src = posters[(idx + 1) % posters.length];
                };
            });
        });

    } catch (err) {
        console.warn('No se pudo cargar el fondo dinámico:', err.message);
    }
}

document.addEventListener('DOMContentLoaded', cargarFondoCinema);