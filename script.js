const baseUrl = 'http://127.0.0.1:5000/api'

const genders = [
    {
        "id": -1,
        "text": "Selecionar"
    },
    {
        "id": 0,
        "text": "Masculino"
    },
    {
        "id": 1,
        "text": "Feminino"
    }
];

const parentalSupportLevels = [
    {
        "id": -1,
        "text": "Selecionar"
    },
    {
        "id": 0,
        "text": "Nenhum"
    },
    {
        "id": 1,
        "text": "Baixo"
    },
    {
        "id": 2,
        "text": "Médio"
    },
    {
        "id": 3,
        "text": "Alto"
    },
    {
        "id": 4,
        "text": "Muito alto"
    }
]

const educationalLevels = [
    {
        "id": -1,
        "text": "Selecionar"
    },
    {
        "id": 0,
        "text": "Nenhuma"
    },
    {
        "id": 1,
        "text": "Ensino médio"
    },
    {
        "id": 2,
        "text": "Ensino fundamental"
    },
    {
        "id": 3,
        "text": "Ensino Superior"
    },
    {
        "id": 4,
        "text": "Acima de superior"
    }
]

const ethnicities = [
    {
        "id": -1,
        "text": "Selecionar"
    },
    {
        "id": 0,
        "text": "Caucasiano"
    },
    {
        "id": 1,
        "text": "Afrodescendente"
    },
    {
        "id": 2,
        "text": "Asiático"
    },
    {
        "id": 3,
        "text": "Outros"
    }
]

/**
 * Carrega itens para elemento do tipo select.
 * 
 * @param {Array} items Itens a serem inseridos no elemento.
 * @param {String} elementId ID do elemento.
 */
const loadOptionsToElement = (items, elementId) => {
    let element = document.getElementById(elementId)
    element.innerHTML = ''
    const firstIndex = 0
    items.forEach((item, index) => {
        let option = newOption(item)
        option.selected = index == firstIndex
        element.appendChild(option)
    });
}

/**
 * Adiciona uma opção no seletor de serviços.
 * 
 */
const newOption = (option) => {
    let element = document.createElement('option')
    element.text = option.text
    element.value = option.id
    element.id = option.id
    return element
}

const loadModalFields = () => {
    loadOptionsToElement(genders, 'gender');
    loadOptionsToElement(ethnicities, 'ethnicity');
    loadOptionsToElement(educationalLevels, 'parentalEducationLevel');
    loadOptionsToElement(parentalSupportLevels, 'parentalSupportLevel');
}

const onNewStudentButtonClicked = () => {
    document.getElementById('gender').value = '-1';
    document.getElementById('ethnicity').value = '-1';
    document.getElementById('parentalEducationLevel').value = '-1';
    document.getElementById('parentalSupportLevel').value = '-1';
    document.getElementById('extracurricular').checked = false;
    document.getElementById('tutoring').checked = false;
    document.getElementById('music').checked = false;
    document.getElementById('sports').checked = false;
    document.getElementById('volunteering').checked = false;
    document.getElementById('age').value = 15;
    document.getElementById('absences').value = 0;
    document.getElementById('weeklyStudyTime').value = 0;
}

const onSaveModalButtonClicked = () => {
    const gender = document.getElementById('gender').value;
    const ethnicity = document.getElementById('ethnicity').value;
    const parentalEducationLevel = document.getElementById('parentalEducationLevel').value;
    const parentalSupportLevel = document.getElementById('parentalSupportLevel').value;
    const extracurricular = document.getElementById('extracurricular').checked;
    const tutoring = document.getElementById('tutoring').checked;
    const music = document.getElementById('music').checked;
    const sports = document.getElementById('sports').checked;
    const volunteering = document.getElementById('volunteering').checked;
    const age = document.getElementById('age').value;
    const absences = document.getElementById('absences').value;
    const weeklyStudyTime = document.getElementById('weeklyStudyTime').value;

    if (gender == '-1') {
        alert('Campo "Gênero" é obrigatório!');
        return;
    }
    if (ethnicity == '-1') {
        alert('Campo "Etnia" é obrigatório!')
        return;
    }
    if (parentalEducationLevel == '-1') {
        alert('Campo "Nível de suporte dos pais" é obrigatório!')
        return;
    }
    if (parentalSupportLevel == '-1') {
        alert('Campo "Nível de suporte dos pais" é obrigatório!')
        return;
    }
    if (age < 15 && age > 18) {
        alert('A idade do estudante deve ser entre 15 e 18 anos!')
        return;
    }
    const body = {
        absence_count: parseFloat(absences),
        age: parseFloat(age),
        ethnicity_code: parseFloat(ethnicity),
        extracurricular: checkboxStateToFloat(extracurricular),
        gender_code: parseInt(gender),
        music: checkboxStateToFloat(music),
        parental_education_level: parseFloat(parentalEducationLevel),
        parental_support_level: parseFloat(parentalSupportLevel),
        sports: checkboxStateToFloat(sports),
        tutoring_status: checkboxStateToFloat(tutoring),
        volunteering: checkboxStateToFloat(volunteering),
        weekly_study_time: parseFloat(weeklyStudyTime)
    };
    const url = `${baseUrl}/grade/predict`
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
        .then(async (response) => {
            if (!response.ok) {
                let data = await response.json()
                throw data.error_massage
            }
            return response.json();
        })
        .then((data) => {
            loadPredictions();
            alert('Classificação do estudante: ' + data.grade_prediction);
        })
        .catch((erro) => {
            console.debug('Erro na predição:\n' + erro)
            alert('Erro na predição:\n' + erro)
        })
}

const removePrediction = (studentId) => {
    const url = `${baseUrl}/student/performance/${studentId}`;
    fetch(url, { method: 'delete' })
        .then(async (response) => {
            if (!response.ok) {
                let data = await response.json()
                throw data.error_massage
            }
            return response.json()
        })
        .then((data) => {
            loadPredictions();
            alert(data.massage)
        })
        .catch((error) => {
            console.error('Erro ao remover predição:', error);
            alert("Erro ao remover predição!");
        });
}

const loadPredictions = () => {
    const url = `${baseUrl}/student/performances`;
    fetch(url, { method: 'get' })
        .then(async (response) => {
            if (!response.ok) {
                let data = await response.json()
                throw data.error_massage
            }
            return response.json()
        })
        .then((data) => populateTable(data.performances))
        .catch((error) => {
            console.error('Erro ao remover predição:', error);
            alert("Erro ao remover predição!");
        });
}

const createRemoveButton = () => {
    let button = document.createElement("button")
    button.className = 'botao-icone'
    let img = document.createElement("i")
    img.className = 'bi bi-trash'
    button.appendChild(img)
    return button;
}

function populateTable(students) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';

    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.age}</td>
        <td>${student.gender}</td>
        <td>${student.ethnicity}</td>
        <td>${student.parental_support_level}</td>
        <td>${student.parental_education_level}</td>
        <td>${student.extracurricular}</td>
        <td>${student.tutoring_status}</td>
        <td>${student.absence_count}</td>
        <td>${student.weekly_study_time}</td>
        <td>${student.volunteering}</td>
        <td>${student.sports}</td>
        <td>${student.music}</td>
        <td>${student.grade_classification}</td>
        `;
        let actionCell = row.insertCell()
        let removeButton = createRemoveButton()
        removeButton.onclick = function () {
            removePrediction(student.student_id);
        }
        actionCell.appendChild(removeButton)
        tableBody.appendChild(row);
    });
}

const checkboxStateToFloat = (isChecked) => {
    if (isChecked) {
        return 1.0
    } else {
        return 0.0
    }
}

loadModalFields()
loadPredictions()