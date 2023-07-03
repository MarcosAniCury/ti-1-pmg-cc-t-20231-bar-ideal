const diferrentialsTranslate = {
    music: "Música ao vivo",
    karaoke: "Karaoke",
    chop: "Chop Artesanal",
    snooker: "Sinuca",
    happyhour: "Happy Hour",
    thematic: "Temático"
};

function GenerateHTMLCodeStarsItem(n_stars) {
    const StartFull = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
            <path
                d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
        </svg>
    `;
    const StarEmpty = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
            <path
                d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
        </svg>
    `;
    let AllStars = "";
    for (let i = 0; i < 5; i++) {
        if (i <= n_stars) {
            AllStars += StartFull;
        } else {
            AllStars += StarEmpty;
        }
    }

    return AllStars;
}

function generateHTMLDifferential(differential) {
    let htmlCode = `<div class="div-pub-diferrence-row">`;

    differential.forEach((element, index) => {
        if (index % 3 == 0) {
            htmlCode += `
                </div>
                <div class="div-pub-diferrence-row"> 
            `
        }
        htmlCode += `<p class="p-pub-difference">${diferrentialsTranslate[element]}</p>`;
    });

    htmlCode += `</div>`;
    return htmlCode;
}

async function loadItemDetails() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const itemId = urlParams.get('id');

    let item = {};

    await fetch('http://177.136.202.132:9598/pubs/' + itemId)
        .then(response => response.json())
        .then(response => item = response)
        .catch(error => console.log(error));

    document.getElementById("div-pub-details").innerHTML = `
        <div id="div-pub-img">
            <img src="${item.image}" alt="Image pub">
        </div>
        <div id="div-pub-details-infos">
            <div id="div-pub-name-share">
                <p id="p-pub-name">${item.name}</p>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-share-fill" viewBox="0 0 16 16">
                    <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
                </svg>
            </div>
            <div class="div-item-star">
                ${GenerateHTMLCodeStarsItem(item.n_stars)}
                <p id="p-pub-details-star-text">(${item.n_reviews})</p>
            </div>
            <p id="p-pub-value">R$ ~${item.media_value} (P/1)</p>
            <p id="p-pub-address">${item.address.fully}</p>
            <p id="p-pub-type-food">Tipo de comida: ${item.type_food}</p>
            <p id="p-pub-difference-title">Diferênciais:</p>
            <div id="div-pub-difference">
                ${generateHTMLDifferential(item.differential)}
            </div>
        </div>     
    `;
}

