//Adicionar imagem
//Ainda não funcionando conectado ao JSON server, apenas no html

  var ProfilePic = document.getElementById("picture"); 
  var inputF = document.getElementById("file");
inputF.onchange = function(){
  let inputPNG = document.getElementById("file");
  ProfilePic.src = URL.createObjectURL(inputPNG.files[0]);
} 
function getImage() {
  return new Promise((resolve, reject) => {
    let inputFile = document.getElementById('file');
    let reader = new FileReader();
    reader.onload = function () {
      let base64Data = reader.result;
      console.log(base64Data);
      resolve(base64Data); 
    };
    reader.onerror = function (error) {
      reject(error); 
    };
    reader.readAsDataURL(inputFile.files[0]);
  });
}







//CRUD e JSON server
//FUNCIONANDO


async function lerDados(){
  let item = {};  
  await fetch('http://177.136.202.132:9598/pubs/')
    .then(response => response.json())
    .then(response => item = response)
    .catch(error => console.log(error));
    
  return (item)
}

function getCheckedValues() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]');
  var checkedValues = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      checkedValues.push(checkboxes[i].value);
    }
  }
return (checkedValues)
}
async function adicionarBar() {
  // Obter dados
  let strName = document.getElementById('name').value;
  let strFully = document.getElementById('adress-fully').value;
  let strZone = document.getElementById('adress-zone').value;
  let strValor = document.getElementById('mediaValue').value;
  let strCEP = document.getElementById('cep').value;
  let strWebsite = document.getElementById('website').value;
  let strFood = document.getElementById('typeFood').value;
  let strLocal = document.getElementById('typeLocals').value;
  let strDiff = getCheckedValues();

  // Verificar se todos os campos estão preenchidos
  if (
    strName.trim() === '' ||
    strFully.trim() === '' ||
    strZone.trim() === '' ||
    strValor.trim() === '' ||
    strCEP.trim() === '' ||
    strWebsite.trim() === '' ||
    strFood.trim() === '' ||
    strLocal.trim() === ''
  ) {
    alert('Por favor preencha todos os campos');
    return;
  }

  try {
    let strImage = await getImage();

    let newBarData = {
      name: strName,
      address: {
        fully: strFully,
        zone: strZone
      },
      select_comment: 'Bar excelente, bonito e possui ótimos drinks.',
      n_stars: 3,
      n_reviews: 129,
      media_value: strValor,
      CEP: strCEP,
      type_food: strFood,
      type_local: strLocal,
      differential: strDiff,
      image: strImage // Assign strImage to the image property
    };

    let response = await fetch('http://177.136.202.132:9598/pubs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBarData)
    });

    if (response.ok) {
      alert('O bar foi adicionado com sucesso!');
      loadItemDetails();
    } else {
      alert('Erro ao adicionar o bar. Por favor, tente novamente.');
    }
  } catch (error) {
    console.error(error);
    alert('Erro ao obter a imagem. Por favor, tente novamente.');
  }
}

  async function deleteBar() {
    let id = prompt("Digite o Id do bar que deseja deletar");
    
    if (!id) {
      alert("ID inválido, tente um valor válido [O botão mostrar dados fornece o ID dos Bares]");
      return;
    }
    
    try {
      let response = await fetch(`http://177.136.202.132:9598/pubs/${id}`); 
      console.log(response)
      if (!response.ok) {
        alert(`O bar de ID ${id} não existe.`);
        return;
      }
      
      response = await fetch(`http://177.136.202.132:9598/pubs/${id}`, {
      method: 'DELETE'
    });
  
      if (response.ok) {
        alert(`O bar com ID ${id} Foi deletado.`);
        loadItemDetails();
      } else {
        alert('Falha ao deletar o bar, tente novamente');
      }
    } catch (error) {
      console.error(error);
      alert('Um erro aconteceu ao tentar deletar o bar, cheque sua conexão com a internet.');
    }
  }


function iniciarEdit(){
    editBarById(prompt("Qual o ID dos dados que deseja editar? [Clique no botão de mostrar dados para veríficar o ID de cada bar]"))
}

async function editBarById(id) {
  try {
    let response = await fetch(`http://177.136.202.132:9598/pubs/${id}`);
    
    if (!response.ok) {
      alert(`O bar com ID ${id} não existe.`);
      return;
    }

    let barData = await response.json();
    
    
    let newName = prompt("Insira o nome atualizado:", barData.name);
    let newFully = prompt("Insira o endereço atualizado:", barData.address.fully);
    let newZone = prompt("Insira o bairro atualizado:", barData.address.zone);
    let newCEP = prompt("Insira o CEP atualizado:", barData.CEP);
    
    barData.name = newName;
    barData.address.fully = newFully;
    barData.address.zone = newZone;
    barData.CEP = newCEP

    response = await fetch(`http://177.136.202.132:9598/pubs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(barData)
    });

    if (response.ok) {
      alert(`O bar com o ID ${id} foi atualizado com sucesso.`);
      loadItemDetails();
    } else {
      alert('Falha na atualização dos dados. Tente novamente');
    }
  } catch (error) {
    console.error(error);
    alert('Um erro ocorreu. Confira sua conexão com a internet');
  }
}

async function loadItemDetails() {
  let item = await lerDados();
  let registros = document.getElementById('tela');
  let strHtml = '';
      for (let i = 0; i < item.length; i= i+1) {
      
      strHtml = strHtml + `<p><span>ID</span>: ${item[i].id} - Nome: ${item[i].name} - Endereço: ${item[i].address.fully} - Bairro: ${item[i].address.zone} - Valor Médio: ${item[i].media_value} - CEP:${item[i].CEP} - Tipo de Comida:${item[i].type_food} - Tipo de Local:${item[i].type_local} - Diferencial:${item[i].differential} </p>`
    }
    registros.innerHTML = strHtml;
  }     
  
//botões

document.getElementById('submit').addEventListener('click', adicionarBar);

document.getElementById('delete').addEventListener('click', deleteBar);

document.getElementById('mostrar').addEventListener('click', loadItemDetails);

document.getElementById('edit').addEventListener('click', iniciarEdit);
