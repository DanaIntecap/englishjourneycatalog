function renderTable() {
    const tableBody = document.querySelector('#catalogTable tbody');
    tableBody.innerHTML = ''; 
    
    const levelFilter = document.getElementById('levelFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;

    const filteredData = catalogData.filter(item => {
        const matchLevel = (levelFilter === 'All' || item.level === levelFilter);
        const matchSkill = (skillFilter === 'All' || item.skill === skillFilter);
        return matchLevel && matchSkill;
    });

    filteredData.forEach(item => {
        const row = `<tr>
            <td>${item.title}</td>
            <td>${item.level}</td>
            <td>${item.skill}</td>
            <td><button onclick='openModal(${item.id})'>Ver Ficha Pedagógica</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function openModal(id) {
    const resource = catalogData.find(item => item.id === id);
    
    document.getElementById('modalTitle').innerText = resource.title;
    document.getElementById('modalObjective').innerText = resource.objective;
    document.getElementById('modalInstructions').innerText = resource.instructions;
    document.getElementById('modalVariations').innerText = resource.variations;
    document.getElementById('modalLink').href = resource.url;
    
    document.getElementById('resourceModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('resourceModal').style.display = 'none';
}

window.onload = renderTable;
