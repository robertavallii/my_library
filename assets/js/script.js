// Funzione principale per eseguire il codice
async function run() {
    let data;
    let useYear = true; // Flag per indicare se utilizzare la categoria "anno_lettura"
    let useAuthor = false; // Flag per indicare se utilizzare la categoria "autore"
    let useType = false;
    let usePage = false;
    let useRating = false; // Flag per indicare se utilizzare la categoria "gradimento"
    const jsonFilePath = "assets/data/100_libri.json"; // Imposta il percorso del file JSON

    // Carica il file JSON
    await fetch(jsonFilePath)
        .then(response => response.json())
        .then(json => {
            data = json;
        });

    // Funzione per costruire il codice HTML in base ai dati
    const buildHTML = () => {
        let category;
        if (useAuthor) {
            category = "autore";
        } else if (useYear) {
            category = "anno_lettura";
        } else if (useType) {
            category = "tipologia";
        } else if (usePage) {
            category = "pagine";
        } else {
            category = "gradimento";
        }

        let uniqueValues; // Per contare quante volte vede un dato
        if (useAuthor || useType) {
            const categoryCounts = data.reduce((counts, book) => {
                const categoryValue = book[category];
                counts[categoryValue] = (counts[categoryValue] || 0) + 1;
                return counts;
            }, {});

            uniqueValues = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
        } else if (usePage) {
            // Trova il valore massimo delle pagine
            const maxPage = Math.max(...data.map(item => parseInt(item[category])));
            // Crea intervalli di pagine ogni 50 pagine, partendo da 1
            uniqueValues = Array.from({ length: Math.ceil(maxPage / 50) }, (_, index) => `${index * 50 + 1} - ${(index + 1) * 50}`);
        } else if (useYear) {
            uniqueValues = Array.from(new Set(data.map(item => item[category]))).sort((a, b) => a - b); // Ordina gli anni in ordine crescente
        } else if (useRating) {
            uniqueValues = Array.from(new Set(data.map(item => item[category]))).sort((a, b) => a - b); // Ordina i valori di gradimento in ordine crescente
        } else {
            uniqueValues = Array.from(new Set(data.map(item => item[category])));
        }

        let gridHTML = "";
        uniqueValues.forEach(value => {
            let filteredBooks;
            if (usePage) {
                const [start, end] = value.split(" - ").map(num => parseInt(num));
                filteredBooks = data.filter(item => {
                    const pages = parseInt(item[category]);
                    return pages >= start && pages <= end;
                });
            } else {
                filteredBooks = data.filter(item => item[category] === value);
            }
            let booksHTML = "";
            filteredBooks.forEach((book, index) => {
                const imagePath = "assets/image/" + book.nome_file + ".png";
                booksHTML += `<div class="foto"><img src="${imagePath}" alt="${book.titolo}" class="img-fluid"></div>`;
            });
            // Imposta l'altezza minima a 100px per le colonne senza libri
            const columnHeight = filteredBooks.length > 0 ? "" : "min-height: 100px;";
            gridHTML += `<div class="foto-column" style="${columnHeight}"><div class="anno">${value}</div><div class="foto-container">${booksHTML}</div></div>`;
        });

        document.querySelector('.grid-container').innerHTML = gridHTML;
    };

    // Funzione per gestire il clic sull'immagine
    const handleImageClick = (event) => {
        const clickedImage = event.target;
        // Ingrandisci l'immagine a schermo intero
        clickedImage.classList.toggle('fullscreen');
    };

    // Costruisci il codice HTML iniziale
    buildHTML();

    // Aggiungi un event listener per il clic sull'immagine
    document.querySelectorAll('.foto img').forEach(image => {
        image.addEventListener('click', handleImageClick);
    });

    // Gestisci il click sui bottoni di ordinamento
    document.getElementById('yearButton').addEventListener('click', () => {
        useYear = true;
        useAuthor = false;
        useType = false;
        usePage = false;
        useRating = false;
        updateActiveButton('yearButton');
        buildHTML();
    });

    document.getElementById('ratingButton').addEventListener('click', () => {
        useYear = false;
        useAuthor = false;
        useType = false;
        usePage = false;
        useRating = true;
        updateActiveButton('ratingButton');
        buildHTML();
    });

    document.getElementById('authorButton').addEventListener('click', () => {
        useYear = false;
        useAuthor = true;
        useType = false;
        usePage = false;
        useRating = false;
        updateActiveButton('authorButton');
        buildHTML();
    });

    document.getElementById('typeButton').addEventListener('click', () => {
        useYear = false;
        useAuthor = false;
        useType = true;
        usePage = false;
        useRating = false;
        updateActiveButton('typeButton');
        buildHTML();
    });

    document.getElementById('pageButton').addEventListener('click', () => {
        useYear = false;
        useAuthor = false;
        useType = false;
        usePage = true;
        useRating = false;
        updateActiveButton('pageButton');
        buildHTML();
    });

    // Funzione per aggiornare lo stato attivo del bottone
    const updateActiveButton = (activeButtonId) => {
        // Rimuove la classe 'active' da tutti i bottoni
        document.querySelectorAll('.button').forEach(button => {
            button.classList.remove('active');
        });

    };
}

// Esegui la funzione principale quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', run);