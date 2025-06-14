import { initFirebaseCompat } from './init/firebase-init.js';

await initFirebaseCompat();

var db = firebase.database();
var refTemperatura = db.ref("sensor/temperatura/");
var refUmidade = db.ref("sensor/umidade/");


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // --- O USUÁRIO ESTÁ LOGADO ---
        console.log("Usuário logado encontrado. UID:", user.uid);

        // 3. Pega o UID do usuário e cria a referência DINÂMICA
        const uid = user.uid;
        const refTemperatura = db.ref('users/' + uid + '/sensor/temperatura');
        
        refTemperatura.on("value", (snapshot) => {
            const data = snapshot.val();
            const numeros = Object.keys(data);
            const ultimaChave = numeros[numeros.length -1];
            const ultimoValor = data[ultimaChave];
            console.log("Dados recuperados:", data);
            
            // Exemplo de exibição no HTML
            document.getElementById("saidaTemperatura").textContent = ultimoValor + " °C";

            criarOuAtualizarGraficoTemperatura(ultimoValor);
            
        });
    }
});


firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // --- O USUÁRIO ESTÁ LOGADO ---
        console.log("Usuário logado encontrado. UID:", user.uid);

        // 3. Pega o UID do usuário e cria a referência DINÂMICA
        const uid = user.uid;
        const refUmidade = db.ref('users/' + uid + '/sensor/umidade');

        refUmidade.on("value", (snapshot) => {
            const data = snapshot.val();
            const numeros = Object.keys(data);
            const ultimaChave = numeros[numeros.length -1];
            const ultimoValor = data[ultimaChave];

            console.log("Dados recuperados:", data);
            

            // Exemplo de exibição no HTML
            document.getElementById("saidaUmidade").textContent = ultimoValor + " %";

            criarOuAtualizarGraficoUmidade(ultimoValor);
        });
    }
});