const imageInput = document.getElementById('imageInput');
const gallery = document.getElementById('gallery');
const clearGallery = document.getElementById('clearGallery');

window.addEventListener('DOMContentLoaded', () => {
const saved = JSON.parse(localStorage.getItem('inspirations')) || [];
saved.forEach(data => addImageToGallery(data.src, data.desc, data.category));
// podświetl pierwszy filtr jako aktywny
document.querySelectorAll('#filters .chip').forEach(btn=>{
btn.addEventListener('click', ()=> {
document.querySelectorAll('#filters .chip').forEach(b=>b.classList.remove('is-active'));
btn.classList.add('is-active');
});
});
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
<!-- \` backtick marker -->
<div style="margin-top:15px; display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
<label>Opis:
<input type="text" id="desc" placeholder="np. Kolorystyka retro" />
</label>
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
const desc = form.querySelector('#desc').value || '';
const category = form.querySelector('#category').value;
addImageToGallery(src, desc, category);
saveToLocalStorage({ src, desc, category });
form.remove();
});
}

function addImageToGallery(src, desc, category) {
const item = document.createElement('div');
item.className = 'gallery-item';

const width = Math.floor(Math.random() * 80) + 160;
const rotate = Math.floor(Math.random() * 10) - 5;
item.style.width = `${width}px`;
item.style.transform = `rotate(${rotate}deg)`;

// taśmy w kolorach palety
const tapeColors = ['#F0E5DC', '#EAC8C2', '#D47A72', '#E5C439', '#563F4018'];
// '#563F4018' = ciemny z przezroczystością (18 hex ≈ 9% opacity)
const randomColor = tapeColors[Math.floor(Math.random() * tapeColors.length)];
item.style.setProperty('--tape-color', randomColor);

item.setAttribute('draggable', true);
item.addEventListener('dragstart', handleDragStart);
item.addEventListener('dragover', handleDragOver);
item.addEventListener('drop', handleDrop);

item.innerHTML = `
<!-- \` backtick marker -->
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
if (newDesc !== null && newCategory) {
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
const draggedHTML = draggedItem.innerHTML;
const thisHTML = this.innerHTML;
draggedItem.innerHTML = thisHTML;
this.innerHTML = draggedHTML;
}
draggedItem.style.opacity = '1';
}