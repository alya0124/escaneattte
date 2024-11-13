let datos_ip = {};

async function consultarIP() {
    const ip = document.getElementById('ip').value;
    const ports = document.getElementById('ports').value;
    const responseDataDiv = document.getElementById('responseData');
    const saveButton = document.getElementById('saveToDatabase');
    responseDataDiv.innerHTML = '';
    saveButton.style.display = 'none'; 

    try {
        const response = await fetch('/consulta-ip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ip, ports })
        });

        const result = await response.json();

        if (response.ok) {
            displayResponseData(result);
            document.getElementById('responseMessage').innerText = 'Consulta completada con éxito';
            saveButton.style.display = 'block'; 
        } else {
            document.getElementById('responseMessage').innerText = result.message || 'Error en la consulta';
        }
    } catch (error) {
        document.getElementById('responseMessage').innerText = 'Error en la consulta';
    }
}

function displayResponseData(data) {
    const responseDataDiv = document.getElementById('responseData');
    const ip = document.getElementById('ip').value;
    responseDataDiv.innerHTML = '';

    for (const ip in data) {
        if (data.hasOwnProperty(ip)) {
            const ipData = data[ip];
            const hostname = ipData.hostname || 'Desconocido';
            const state = ipData.state || 'Desconocido';
            responseDataDiv.innerHTML += `<strong>IP:</strong> ${ip}<br>`;
            responseDataDiv.innerHTML += `<strong>Hostname:</strong> ${hostname}<br>`;
            responseDataDiv.innerHTML += `<strong>State:</strong> ${state}<br>`;

            const ports = ipData.ports.map(portInfo => `${portInfo.port}:${portInfo.state}`).join(', ');
            responseDataDiv.innerHTML += `<strong>Ports:</strong> ${ports}<br><hr>`;

            datos_ip = {
                "ip": ip,
                "hostname": hostname,
                "state": state,
                "ports": ports
            };
        }
    }
}

async function guardarEnBaseDeDatos() {
    try {
        const response = await fetch('/guardar-datos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos_ip)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Datos ingresados en la base de datos con éxito');
            loadTableData();
        } else {
            alert(result.message || 'Error al guardar los datos');
        }
    } catch (error) {
        alert('Error al guardar los datos en la base de datos');
    }
}

async function loadTableData() {
    const tableData = document.getElementById('tableData');
    tableData.innerHTML = '';

    try {
        const response = await fetch('/obtener-escaneos');
        const result = await response.json();

        if (response.ok) {
            result.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.ip}</td>
                    <td>${item.hostname}</td>
                    <td>${item.state}</td>
                    <td>${item.ports}</td>
                    <td><button onclick="eliminarEscaneo('${item.id}')">Eliminar</button></td>
                    <td><button onclick="editarEscaneo('${item.id}')">Editar</button></td>
                `;
                tableData.appendChild(row);
            });
        } else {
            alert(result.message || 'Error al cargar los datos');
        }
    } catch (error) {
        alert('Error al cargar los datos');
    }
}

async function eliminarEscaneo(id) {
    try {
        const response = await fetch('/eliminar-escaneo', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id })  
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadTableData();
        } else {
            alert(result.message || 'Error al eliminar el escaneo');
        }
    } catch (error) {
        alert('Error al eliminar el escaneo');
    }
}


async function editarEscaneo(id) {
    const newState = prompt('Ingrese el nuevo estado:');
    const newHostname = prompt('Ingrese el nuevo hostname:');
    const newIp = prompt('Ingrese la nueva IP:');
    const newPorts = prompt('Ingrese los nuevos puertos:');

    if (newState && newHostname && newIp && newPorts) {
        const data = { state: newState, hostname: newHostname, ip: newIp, ports: newPorts };

        try {
            const response = await fetch(`/editar-escaneo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                loadTableData();
            } else {
                alert(result.message || 'Error al editar el escaneo');
            }
        } catch (error) {
            alert('Error al editar el escaneo');
        }
    }
}


document.addEventListener('DOMContentLoaded', loadTableData);
