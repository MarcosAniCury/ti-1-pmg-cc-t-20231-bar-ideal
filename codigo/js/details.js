async function loadItemDetails() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    const itemId = urlParams.get('id');

    let item = {};

    await fetch('http://177.136.202.132:9598/pubs/'+itemId)
        .then(response => response.json())
        .then(response => item = response)
        .catch(error => console.log(error));

    console.log(item);
}