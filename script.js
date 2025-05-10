const imageInput = document.getElementById('imageInput');
const gallery = document.getElementById('gallery');
const clearGallery = document.getElementById('clearGallery');

window.addEventListener('DOMContentLoaded', () => {
  const saved = JSON.parse(localStorage.getItem('inspirations')) || [];
  saved.forEach(data => addImageToGallery(data.src, data.desc, data.category));
});

imageInput.addEventListener('change', function () {
  const files = imageInput.files;
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const src = e.target.result;
      showMetaForm(src);
    };
    reader.readAsDataURL(files[i]);
  }
});

function showMetaForm(src) {
  const form = document.createElement('div');
  form.innerHTML = ` 
    <div style="margin-top: 15px;">
      <label>Opis: <input type="text" id="desc" placeholder="np. Kolorystyka retro"></label>
      <label>Kategoria:
        <select id="category">
          <option>Moda</option>
          <option>Kolor</option>
          <option>Forma</option>
        </select>
      </label>
      <button id="saveBtn">Zapisz inspirację</button>
    </div>
    `; 
  document.querySelector('.content-box').appendChild(form);

  form.querySelector('#saveBtn').addEventListener('click', () => {
    const desc = form.querySelector('#desc').value;
    const category = form.querySelector('#category').value;
    addImageToGallery(src, desc, category);
    saveToLocalStorage({ src, desc, category });
    form.remove();
  });
}

function addImageToGallery(src, desc, category) {
  const item = document.createElement('div');
  item.className = 'gallery-item';

  const width = Math.floor(Math.random() * 80) + 120;
  const rotate = Math.floor(Math.random() * 12) - 6;
  item.style.width = `${width}px`; 
  item.style.transform = `rotate(${rotate}deg)`;

  const tapeColors = ['#fdf5c2', '#cce5d1', '#f9caca', '#e0d4f3', '#ffd8b1'];
  const randomColor = tapeColors[Math.floor(Math.random() * tapeColors.length)];
  item.style.setProperty('--tape-color', randomColor);

  item.setAttribute('draggable', true);
  item.addEventListener('dragstart', handleDragStart);
  item.addEventListener('dragover', handleDragOver);
  item.addEventListener('drop', handleDrop);

  item.innerHTML = `
    <img src="${src}" alt="inspiracja" />
    <div class="description">
      <strong>${category}</strong><br />
      ${desc}
    </div>
    <button class="editBtn">Edytuj</button>
    <button class="deleteBtn">Usuń</button>
    `; 

  item.querySelector('.deleteBtn').addEventListener('click', () => {
    item.remove();
    removeFromLocalStorage(src);
  });

  item.querySelector('.editBtn').addEventListener('click', () => {
    const newDesc = prompt("Nowy opis:", desc);
    const newCategory = prompt("Nowa kategoria (Moda, Kolor, Forma):", category);
    if (newDesc && newCategory) {
      item.querySelector('.description').innerHTML = ` 
        <strong>${newCategory}</strong><br />
        ${newDesc}
        `; 
      updateLocalStorage(src, newDesc, newCategory);
    }
  });

  gallery.appendChild(item);
}

function saveToLocalStorage(data) {
  const saved = JSON.parse(localStorage.getItem('inspirations')) || [];
  saved.push(data);
  localStorage.setItem('inspirations', JSON.stringify(saved));
}

function removeFromLocalStorage(srcToRemove) {
  const saved = JSON.parse(localStorage.getItem('inspirations')) || [];
  const updated = saved.filter(item => item.src !== srcToRemove);
  localStorage.setItem('inspirations', JSON.stringify(updated));
}

function updateLocalStorage(srcToUpdate, newDesc, newCategory) {
  const saved = JSON.parse(localStorage.getItem('inspirations')) || [];
  const updated = saved.map(item =>
    item.src === srcToUpdate ? { ...item, desc: newDesc, category: newCategory } : item
  );
  localStorage.setItem('inspirations', JSON.stringify(updated));
}

clearGallery.addEventListener('click', () => {
  gallery.innerHTML = '';
  localStorage.removeItem('inspirations');
});

const filters = document.querySelectorAll('#filters button');
filters.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.getAttribute('data-category');
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
      const itemCategory = item.querySelector('strong').textContent;
      item.style.display = (category === 'Wszystko' || itemCategory === category) ? '' : 'none';
    });
  });
});

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  setTimeout(() => this.style.opacity = '0.3', 0);
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const allItems = Array.from(gallery.children);
    const draggedIndex = allItems.indexOf(draggedItem);
    const targetIndex = allItems.indexOf(this);

    if (draggedIndex < targetIndex) {
      gallery.insertBefore(draggedItem, this.nextSibling);
    } else {
      gallery.insertBefore(draggedItem, this);
    }

    updateLocalStorageOrder();
  }
  this.style.opacity = '1';
  draggedItem.style.opacity = '1';
  draggedItem = null;
}

function updateLocalStorageOrder() {
  const items = document.querySelectorAll('.gallery-item');
  const updated = [];

  items.forEach(item => {
    const img = item.querySelector('img').src;
    const desc = item.querySelector('.description').innerText.split('\n');
    const category = desc[0];
    const description = desc[1];
    updated.push({ src: img, desc: description, category: category });
  });

  localStorage.setItem('inspirations', JSON.stringify(updated));
}