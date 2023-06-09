'use strict';

// TODO: General code cleanup and some improvements

const API_KEY = '827ec624f4364af79116570eca4eb314'; // Have to change it upon 100 requests or 24 hours
const API_URL = 'https://crudcrud.com/api/' + API_KEY + '/clients'; // REST resource is /clients

// Array to store clients
let clients = [];

// Keeping an eye in case there's an edit request
let selectedClient = null;
let isEditing = false;

// DOM elements
const submitButton = document.querySelector('.submit__button');
const newButton = document.querySelector('.newclient__button');
const backButton = document.querySelector('.back__button');
const form = document.querySelector('.form');
const table = document.querySelector('.table');
const clientsTable = document.querySelector('#clients__table');

// Input fields
const nameInput = document.querySelector('#name');
const lastnameInput = document.querySelector('#lastName');
const rutInput = document.querySelector('#rut');
const typeSelected = document.querySelector('#type');
const phoneInput = document.querySelector('#phone');
const activeCheckbox = document.querySelector('#active');

// I was trying to do it through a class like an object factory but eh

// class Client {
//     constructor(id, name, lastName, rut, type, phone, active) {
//         this._id = id;
//         this.name = name;
//         this.lastName = lastName;
//         this.rut = rut;
//         this.type = type;
//         this.phone = phone;
//         this.active = active;
//     }
// }

// I'm using autogenerated ID from crudcrud's API

// const generateUniqueId = () => {
//    return '_' + Math.random().toString(34).slice(3, 11);
// };

// Fetches the clients from API
const fetchClients = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        clients = data;
        renderClients();
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
};

// Creates a new client and sends a POST request to the API
const createNewClient = async () => {
    // Get input values
    let name = nameInput.value;
    let lastName = lastnameInput.value;
    let rut = rutInput.value;
    let type = typeSelected.options[typeSelected.selectedIndex].value;
    let phone = phoneInput.value;
    let active = activeCheckbox.checked;

    // Creates a new object with input values
    let newClient = {
        name,
        lastName,
        rut,
        type,
        phone,
        active,
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(newClient),
        });

        if (!response.ok) {
            throw new Error('Failed to create client. HTTP status: ' + response.status);
        }

        const data = await response.json();
        newClient._id = data._id; // Uses the autogenerated ID from API response
        clients.push(newClient);
        renderClients();
    } catch (error) {
        console.error('Error creating client:', error);
    }
};

// Sets the form fields with the data of the selected client to edit it
const editClient = (clientId) => {
    selectedClient = clients.find((client) => client._id === clientId);
    submitButton.textContent = 'Actualizar';

    if (selectedClient) {
        nameInput.value = selectedClient.name;
        lastnameInput.value = selectedClient.lastName;
        rutInput.value = selectedClient.rut;
        typeSelected.value = selectedClient.type;
        phoneInput.value = selectedClient.phone;
        activeCheckbox.checked = selectedClient.active;
        isEditing = true;
    }

    toggleForm();
};

// Updates the selected client's data and sends a PUT request to the API to update client's values
const updateClient = async () => {
    if (!selectedClient) return;

    const updatedClient = {
        name: nameInput.value,
        lastName: lastnameInput.value,
        rut: rutInput.value,
        type: typeSelected.value,
        phone: phoneInput.value,
        active: activeCheckbox.checked,
    };

    try {
        const response = await fetch(`${API_URL}/${selectedClient._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(updatedClient),
        });

        if (!response.ok) {
            throw new Error('Failed to update client. HTTP status: ' + response.status);
        }

        // Update the selectedClient object with the updated values - thanks stackoverflow
        Object.assign(selectedClient, updatedClient);

        toggleForm();
        clearForm();
        renderClients();
        isEditing = false;
        selectedClient = null;
    } catch (error) {
        console.error('Error updating client:', error);
    }
};

// Deletes a client through a DELETE request
const deleteClient = async (clientId) => {
    try {
        await fetch(`${API_URL}/${clientId}`, {
            method: 'DELETE',
        });
        clients = clients.filter((client) => client._id !== clientId);
        renderClients();
    } catch (error) {
        console.error('Error deleting client:', error);
    }
};

// Toggles the visibility of the form and table upon click events
const toggleForm = () => {
    form.classList.toggle('hidden');
    table.classList.toggle('hidden');
};

// Clears the form input fields
const clearForm = () => {
    nameInput.value = '';
    lastnameInput.value = '';
    rutInput.value = '';
    typeSelected.selectedIndex = 0;
    phoneInput.value = '';
    activeCheckbox.checked = false;
};

// Validates the form - TODO: It needs improvements
const validateForm = () => {
    if (nameInput.value === '' || lastnameInput.value === '' || phoneInput.value === '')
        return false;
    else return true;
};

// Renders clients into the table
const renderClients = () => {
    clientsTable.innerHTML = '';

    clients.forEach((client) => {
        // For each client, creates a new tr element
        const newRow = document.createElement('tr');

        // Add client values
        newRow.innerHTML = `
            <td>${client.name}</td>
            <td>${client.lastName}</td>
            <td>${client.rut}</td>
            <td>${client.type}</td>
            <td>${client.phone}</td>
            <td>${client.active ? 'Sí' : 'No'}</td>
            <td>
                <div class="action__buttons">
                    <button data-id="${client._id}" class="edit__button">Editar</button>
                    <button data-id="${client._id}" class="delete__button">Eliminar</button>
                </div>
            </td>
         `;

        // Appends tr with client values
        clientsTable.appendChild(newRow);
    });

    // Add event listeners to edit and delete buttons - have do it here because buttons don't exist yet
    const editButtons = document.querySelectorAll('.edit__button');
    const deleteButtons = document.querySelectorAll('.delete__button');

    editButtons.forEach((button) => {
        button.addEventListener('click', () => editClient(button.dataset.id));
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', () => deleteClient(button.dataset.id));
    });
};

// Event listeners for buttons
newButton.addEventListener('click', (evt) => {
    evt.preventDefault();
    isEditing = false;
    toggleForm();
});

submitButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    if (!validateForm()) return;

    if (isEditing) {
        toggleForm();
        updateClient();
    } else {
        createNewClient();
    }

    toggleForm();
    clearForm();
});

backButton.addEventListener('click', () => {
    toggleForm();
    clearForm();
});

// Fetch initial data from API
window.addEventListener('load', fetchClients);
