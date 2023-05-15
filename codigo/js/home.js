// Functions to generate pub items

function GenerateHTMLCodeStarsItem(n_stars) {
    const StartFull = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
            <path
                d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
        </svg>
    `;

    const StarEmpty = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
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

function GenerateHTMLCodeItem(item) {
    const divStar = `
        <div>
            ${GenerateHTMLCodeStarsItem(item.n_stars)}&nbsp;(${item.n_reviews})
        </div>
    `;

    return `
   
        <div class="div-item">
            <a href="front.html" class="div-item-img">
            
                <img src="../assets/Belli_Belli_vista.jpg" alt="Image Bar">
             
            </a>
            
            <div class="div-item-text">
                <p class="p-item-title">${item.name}</p>
                <div class="div-item-mobile-star">
                    ${divStar}
                </div>
                <p class="p-item-address">${item.address.fully}</p>
                <div class="div-item-coment">
                    <p class="p-item-coment-title">Comentário Selecionado:</p>
                    <p class="p-item-coment-text">${item.select_comment}</p>
                </div>
            </div>
            <div class="div-item-star">
                ${divStar}
            </div>
        </div>`;
        
}

function GenerateItems(filters) {
    let listItems = document.getElementById("div-items");
    listItems.innerHTML = "";

    // Aguardando a finalização da estória do João Vitor Pena para poder pegar o JSON do JSON Server
    let exampleItemJSON = [
        
        {
          
            name: "Jundú Restaurante Lounger Bar",
            address: {
                fully: "Avenida Leovigildo Dias Vieira, 810, Itaguá – Ubatuba, SP",
                zone: "Itaguá"
            },
            select_comment: "Bar execelente, bonito e possui ótimos drinks.",
            n_stars: 3,
            n_reviews: 129,
            media_value: 70,
            type_food: "Mexicano",
            type_local: "Pub",
            differential: [
                "music",
                "karaoke"
            ]
          
        },
        
        {
            name: "Belli Belli Gastrobar",
            address: {
                fully: "Avenida José Bento Ribeiro Dantas, Porto da Barra",
                zone: "Porto da Barra"
            },
            select_comment: "Bar com exelente vista.",
            n_stars: 2,
            n_reviews: 297,
            media_value: 20,
            type_food: "Espetos",
            type_local: "Restaurante",
            differential: [
                "chop",
                "sinuca"
            ]
        },
        {
            name: "Teste do marcos",
            address: {
                fully: "Rua Araguari 999, Coração Eucarístico",
                zone: "Coração Eucarístico"
            },
            select_comment: "O restaurante é bem bonito e interessante.",
            n_stars: 5,
            n_reviews: 151,
            media_value: 200,
            type_food: "Italiano",
            type_local: "Bar",
            differential: [
                "thematic",
                "happyhour",
                "music"
            ]
        }
    ];

    let exampleItemJSONFilter = exampleItemJSON;

    if (filters?.type == "name") {
        exampleItemJSONFilter = exampleItemJSONFilter.filter(item => item.name.toLowerCase().startsWith(filters.name.toLowerCase()));
    } else if (filters?.type == "form") {
        if (filters.form[0].value != "--") {
            exampleItemJSONFilter = exampleItemJSONFilter.filter(item => item.address.zone == filters.form[0].value);
        }
        if (filters.form[1].value != "--") {
            if (filters.form[1].value == "Por número de avaliações") {
                exampleItemJSONFilter = exampleItemJSONFilter.sort((firstItem, secondItem) => {
                    return secondItem.n_reviews - firstItem.n_reviews;
                });
            } else if (filters.form[1].value == "Melhores avaliações") {
                exampleItemJSONFilter = exampleItemJSONFilter.sort((firstItem, secondItem) => {
                    return secondItem.n_stars - firstItem.n_stars;
                })
            }
        }
        if (filters.form[2].value != "--") {
            let values = filters.form[2].value.split(' ')[1].split('-');
            exampleItemJSONFilter = exampleItemJSONFilter.filter(item => {
                return item.media_value >= values[0] || values[1] <= item.media_value;
            });
        }
        if (filters.form[3].value != "--") {
            exampleItemJSONFilter = exampleItemJSONFilter.filter(item => {
                return item.type_food == filters.form[3].value;
            });
        }
        if (filters.form[4].value != "--") {
            exampleItemJSONFilter = exampleItemJSONFilter.filter(item => {
                return item.type_local == filters.form[4].value;
            });
        }

        for (let i = 5; i <= 10; i++) {
            if (filters.form[i].checked) {
                exampleItemJSONFilter = exampleItemJSONFilter.filter(item => {
                    return item.differential.includes(filters.form[i].value);
                });
            }
        }
    }

    if (exampleItemJSONFilter.length != 0) {
        exampleItemJSONFilter.forEach(item => {
            listItems.innerHTML += GenerateHTMLCodeItem(item);
        });
    } else {
        listItems.innerHTML = "<div id=\"div-item-none\"><p>Nenhum resultado foi encontrado</p></div>";
    }


}

// Functions modal filter
function modalFilterAparrence() {
    let modalFilterStyle = document.getElementById("div-modal-filter").style;
    if (modalFilterStyle.display == "" || modalFilterStyle.display == "none") {
        modalFilterStyle.display = "flex";

        // Use mock until database was not set
        let zoneOptions = ["--", "Coração Eucarístico", "Padre Eustáquio", "Savassi"];
        let orderOptions = ["--", "Por número de avaliações", "Melhores avaliações"];
        let mediaValueOptions = ["--", "R$ 0-30", "R$ 31-50", "R$ 51-80", "R$ 81-100", "R$ 101-150", "R$ 151-..."];
        let typeFoodOptions = ["--", "Mexicano", "Espetos", "Italiano"];
        let typeLocals = ["--", "Restaurante", "Bar", "Pub"];

        modalFilterOptions("select-modal-zone", zoneOptions);
        modalFilterOptions("select-modal-order", orderOptions);
        modalFilterOptions("select-modal-mediavalue", mediaValueOptions);
        modalFilterOptions("select-modal-typefood", typeFoodOptions);
        modalFilterOptions("select-modal-typelocal", typeLocals);
    } else {
        modalFilterStyle.display = "none";
    }
}

function modalFilterOptions(elementId, options) {
    let zoneSelect = document.getElementById(elementId);

    let htmlOptions = "";

    options.forEach(option => {
        htmlOptions += "<option value='" + option + "'>" + option + "</option>";
    });

    zoneSelect.innerHTML = htmlOptions;
}

function filterByName() {
    let textFilter = document.getElementById("input-filter-name-bar").value;
    GenerateItems({
        type: "name",
        name: textFilter
    });
}

function filterSubmit() {
    document.getElementById("div-modal-filter").style.display = "none";
    GenerateItems({
        type: "form",
        form: document.forms[0].elements
    });
}