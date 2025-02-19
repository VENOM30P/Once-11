// Counter functionality
let count = 0;
const countDisplay = document.getElementById('count');
const decrementBtn = document.getElementById('decrementBtn');
const incrementBtn = document.getElementById('incrementBtn');

decrementBtn.addEventListener('click', () => {
    count--;
    countDisplay.textContent = count;
});

incrementBtn.addEventListener('click', () => {
    count++;
    countDisplay.textContent = count;
});

// Form handling
const testForm = document.getElementById('testForm');
const nameInput = document.getElementById('nameInput');
const colorSelect = document.getElementById('colorSelect');
const output = document.getElementById('output');
const colorBox = document.querySelector('.color-box');

testForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const color = colorSelect.value;

    colorBox.style.background = color;
    output.textContent = `Hello, ${name}! You selected ${color}.`;
});

// Add smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        section.scrollIntoView({ behavior: 'smooth' });
    });
});