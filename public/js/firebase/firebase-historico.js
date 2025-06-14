import { initFirebaseCompat } from './init/firebase-init.js';

await initFirebaseCompat();


var db = firebase.database();

const listaHistoricoContainer = document.getElementById('lista-historico-container');
const itemTemplate = document.getElementById('historico-item-template');


function parseValorHistorico(valorString) {
    const partes = valorString.split(' ');

    //Formato exato de 5 partes (Status Data Hora Umidade Temperatura)
    if (partes.length === 5) {
        const status = partes[0];
        const dataString = partes[1];
        const horarioString = partes[2];
        const umidade = partes[3];
        const temperatura = partes[4];

        // Validação básica do formato da data e hora
        const isValidDate = dataString && dataString.includes('/') && dataString.length === 10;
        const isValidTime = horarioString && horarioString.includes(':') && horarioString.length === 8;

        return {
            data: isValidDate ? dataString : 'Data Inválida',
            hora: isValidTime ? horarioString : 'Hora Inválida',
            status: status || 'N/A',
            umidade: umidade || '--',
            temperatura: temperatura || '--'
        };
    } 
    else if (partes.length > 5) {
        
        const temperatura = partes[partes.length - 1];
        const umidade = partes[partes.length - 2];
        const horarioString = partes[partes.length - 3];
        const dataString = partes[partes.length - 4];
        
        const status = partes.slice(0, partes.length - 4).join(' ');

        const isValidDate = dataString && dataString.includes('/') && dataString.length === 10;
        const isValidTime = horarioString && horarioString.includes(':') && horarioString.length === 8;

        return {
            data: isValidDate ? dataString : 'Data Inválida',
            hora: isValidTime ? horarioString : 'Hora Inválida',
            status: status || 'N/A',
            umidade: umidade || '--',
            temperatura: temperatura || '--'
        };
    } 
    else {
        console.warn("String de histórico com formato inesperado (partes insuficientes):", valorString);
        return {
            data: 'N/A',
            hora: 'N/A',
            status: `Formato Inválido (${valorString})`,
            umidade: '--',
            temperatura: '--'
        };
    }
}


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // --- O USUÁRIO ESTÁ LOGADO ---
        console.log("Usuário logado encontrado. UID:", user.uid);

        // 3. Pega o UID do usuário e cria a referência DINÂMICA
        const uid = user.uid;
        const refHistorico = db.ref('users/' + uid + '/historico');

        refHistorico.orderByKey().limitToLast(20).on("value", (snapshot) => {
            listaHistoricoContainer.innerHTML = ''; 

            if (!snapshot.exists()) {
                listaHistoricoContainer.textContent = 'Nenhum histórico encontrado.';
                console.log("Nenhum dado no snapshot.");
                return;
            }

            const itemsParaExibir = [];
            snapshot.forEach((childSnapshot) => {
                // childSnapshot.val() é a string "Mensagem! DD/MM/YYYY HH:MM:SS"
                itemsParaExibir.push(childSnapshot.val());
            });

        
            itemsParaExibir.reverse();

            itemsParaExibir.forEach(valorString => {
                const dadosFormatados = parseValorHistorico(valorString);

                const templateClone = itemTemplate.content.cloneNode(true);

                templateClone.querySelector(".historicoOrderData").textContent = dadosFormatados.data;
                templateClone.querySelector(".historicoOrderHora").textContent = dadosFormatados.hora;
                templateClone.querySelector(".historicoOrderStatus").textContent = dadosFormatados.status;
                templateClone.querySelector(".saidaUmidade").textContent = dadosFormatados.umidade;
                templateClone.querySelector(".saidaTemperatura").textContent = dadosFormatados.temperatura;
                
                templateClone.querySelector(".saidaUmidade").textContent = dadosFormatados.umidade+" %" || 'Umidade: --';
                templateClone.querySelector(".saidaTemperatura").textContent = dadosFormatados.temperatura+" °C" || 'Temp.: --';

                listaHistoricoContainer.appendChild(templateClone);
            });

            console.log("Dados recuperados e exibidos.");

        }, (error) => {
            console.error("Erro ao buscar dados do Firebase: ", error);
            listaHistoricoContainer.textContent = 'Erro ao carregar histórico.';
        });
    }
});