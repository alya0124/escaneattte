from flask import Flask, render_template, url_for, request, redirect, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def x():
    return redirect(url_for('index')) 

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/consulta-ip', methods=['POST'])
def consulta_ip():
    data = request.get_json()
    ip = data.get('ip')
    ports = data.get('ports')

    params = {
        'ip': ip,
        'ports': ports
    }

    # Usar el nombre de dominio para la solicitud a la API
    response = requests.post('https://scan-apis.onrender.com/scan', json=params, headers={'x-api-key': '058117aym024MR?'})
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({'error': 'Error al realizar el escaneo'}), 500

@app.route('/guardar-datos', methods=['POST'])
def ingresar_bd():
    data = request.get_json()
    params = {
        'ip': data.get('ip'),
        'hostname': data.get('hostname'),
        'state': data.get('state'),
        'ports': data.get('ports', '')
    }

    # Usar el nombre de dominio para la solicitud a la API
    response = requests.post('https://scan-apis.onrender.com/insert-scan', json=params, headers={'x-api-key': '058117aym024MR?'})
    if response.status_code == 200:
        return jsonify({"message": "Datos guardados con éxito en la base de datos"}), 200
    else:
        return jsonify({"message": "Error al guardar los datos en la base de datos"}), 500

# Nueva ruta para obtener todos los escaneos
@app.route('/obtener-escaneos', methods=['GET'])
def obtener_escaneos():
    response = requests.get('https://scan-apis.onrender.com/get-scans', headers={'x-api-key': '058117aym024MR?'})
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({'error': 'Error al obtener los escaneos'}), 500

@app.route('/eliminar-escaneo', methods=['DELETE'])
def eliminar_escaneo():
    data = request.get_json()
    scan_id = data.get('id')
    
    response = requests.delete('https://scan-apis.onrender.com/delete-scan', json={'id': scan_id}, headers={'x-api-key': '058117aym024MR?'})
    if response.status_code == 200:
        return jsonify({"message": "Escaneo eliminado con éxito"}), 200
    else:
        return jsonify({"message": "Error al eliminar el escaneo"}), 500

@app.route('/editar-escaneo/<string:id>', methods=['PUT'])
def editar_escaneo(id):
    data = request.get_json()  
    new_state = data.get('state')
    new_hostname = data.get('hostname')
    new_ip = data.get('ip')
    new_ports = data.get('ports')

    update_data = {
        'id': id,  
        'ip': new_ip,
        'hostname': new_hostname,
        'state': new_state,
        'ports': new_ports
    }

    # Usar el nombre de dominio para la solicitud de actualización
    response = requests.put('https://scan-apis.onrender.com/update-scan', json=update_data, headers={'x-api-key': '058117aym024MR?'})
    if response.status_code == 200:
        return jsonify({"message": "Escaneo actualizado con éxito"}), 200
    else:
        return jsonify({"message": "Error al actualizar el escaneo"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
