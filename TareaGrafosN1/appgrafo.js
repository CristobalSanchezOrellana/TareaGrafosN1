// Inicializacion del vis.js
var nodes = null;
var edges = null;
var network = null;

//Inicializacion del grafo
var vertices = [];
var aristas_origen = [];
var aristas_llegada = [];
var peso = [];
var mAdyacencia = [];
var mCaminos = [];

var data = getScaleFreeNetwork(25);
var seed = 2;
var defaultLocal = navigator.language;
var select = document.getElementById('locale');

function destroy(){
    if(network !== null){
        network.destroy();
        network = null;
    }
}
 function draw(){
     destroy();
     nodes = [];
     edges = [];
     var container = document.getElementById('resultado');
     var options = {
         layout: {randomSeed: seed},
         locale: document.getElementById('locale').value,
         manipulation: {
             addNode: function (data, callback){
                 document.getElementById('node-operation').innerHTML = "Agregar Vertice";
                 editNode(data, clearNodePopUp, callback);
             },
             editNode: function(data, callback){
                document.getElementById('node-operation').innerHTML = "Editar Vertice";
                editNode(data, cancelNodeEdit, callback);
             },
             addEdge: function (data, callback){
                 if (data.from == data.to){
                     var r = confirm ("Al conectar un vertice a si mismo creas un bucle, Quieres continuar?");
                     r.className = ("alert alert-info text-center");
                     if(r!= true){
                         callback(null);
                         return;
                     }
                 }
                 var tipoGrafo = document.querySelector("#tipoGrafo").value;
                 console.log("Grafo de tipo ",tipoGrafo);
                 if(tipoGrafo === 'Dirigido'){
                     var options = {
                         egdes: {
                             arrows: 'to',
                         }
                     }
                     network.setOptions(options);
                 }
                 document.getElementById('edge-operation').innerHTML = "Agregar Arista";
                 editEdgeWithoutDrag(data, callback);
             },
             editEdge: {
                 editWithoutDrag: function(data, callback){
                     document.getElementById('edge-operation').innerHTML = "Editar Arista";
                     editEdgeWithoutDrag(data, callback);
                 }
             }
         }
     };
     network = new vis.Network(container, data, options);
 }

function editNode(data, cancelAction, callback)
{
    document.getElementById('node-label').value = data.label;
    document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
    document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
    document.getElementById('node-popUp').style.display = 'block';
}

function clearNodePopUp()
{
    document.getElementById('node-saveButton').onclick = null;
    document.getElementById('node-cancelButton').onclick = null;
    document.getElementById('node-popUp').style.display = 'none';    
}

function cancelNodeEdit(callback)
{
    clearNodePopUp();
    callback(null);
}

function saveNodeData(data, callback)
{
    data.id = document.getElementById('node-id').value;
    data.label = document.getElementById('node-id').value;
    vertices.push(data.id);
    clearNodePopUp();
    callback(data);
}

function editEdgeWithoutDrag(data, callback)
{
    document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
    document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this, callback);
    document.getElementById('edge-popUp').style.display = 'block';
}

function clearEdgePopUp()
{
    document.getElementById('edge-saveButton').onclick = null;
    document.getElementById('edge-cancelButton').onclick = null;
    document.getElementById('edge-popUp').style.display = 'none';    
}

function cancelEdgeEdit(callback)
{
    clearEdgePopUp();
    callback(null);
}

function saveEdgeData(data, callback)
{
    if (typeof data.to === 'object'){
        data.to = data.to.id;
    }
    if (typeof data.from === 'object'){
        data.from = data.from.id;
    }

    data.label = document.getElementById('edge-label').value;
    aristas_origen.push(data.from);
    aristas_llegada.push(data.to);
    peso.push(data.label);
    
    clearEdgePopUp();
    callback(data);
}

function init()
{
    setDefaultLocale();
    draw();
}

function buscar (columna, fila) // Buscar en la matriz
{
    var tipoGrafo = document.querySelector('#tipoGrafo').value;
    for (let i = 0; i < (aristas_origen.length); i++){
        if (tipoGrafo === 'Dirigido') {
            if (columna === aristas_origen[i] && fila === aristas_llegada[i]){
                return 1;
            }
        } else {
            if (columna === aristas_origen[i] && fila === aristas_llegada[i] || columna === aristas_llegada[i] && fila === aristas_origen[i]){
                return 1;
            }
        }
    }
}

function MatrizAdyacencia() // Matriz de Adyacencia
{
    console.log("Creando Matriz de Adyacencia.");
    var MatrizAd = [];
    var aux = [];
    for (let i = 0; i < vertices.length; i++){
        for (let j = 0; j < vertices.length; j++){
            if(buscar(vertices[i], vertices[j]) !== 1){
                aux.push(0);
            } else {
                aux.push(1);
            }
        }
        MatrizAd[i] = aux;
        aux = [];
    }
    return MatrizAd;
}

function SumaM(a, b, c) // Suma de Matrices
{
    var aux = [];
    for (let i = 0; i < vertices.length; i++){
        for (let j = 0; j < vertices.length; j++){
            aux.push(a[i][j] + b[i][j]);
        }
        c[i] = aux;
        aux = [];
    }
}

function MultiplicacionM(a,b,c){ // Multiplicacion de matrices
    var res = 0,
        Maux = [];
    for(let i = 0; i<vertices.length; i++){
        for(let j = 0; j<vertices.length; j++){
            for(let k = 0; k < vertices.length; k++){
                res += a[i][k] * b[j][k];
            }
            Maux.push(res);
            res = 0;
        }
        c[i] = Maux;
        Maux = [];
    }
}


function matrizConexa(Matrix) // Matriz Conexa
{
    let cont = 0;
    for (let i = 0; i < vertices.length; i++){
        for(let j = 0; j < vertices.length; j++){
            if (Matrix[i][j] != 0){
                cont++;
            } else{
                if (i==j){
                    cont++;
                } else {
                    return false;
                }
            }
        }
    }
    if (cont != 0){
        return true;}
}

function MatrizCaminos(Ady) // Matriz de Caminos
{
    console.log("Creando Matriz Caminos.");
    var multiplicada = [],
        Cam = [],
        aux = [],
        sum = [] = Ady,
        aux = Ady;
    for (let i = 0; i < ((vertices.length)-1); i++){
        MultiplicacionM(Ady, aux, multiplicada);
    }
    SumaM(multiplicada, sum, Cam);
    aux = multiplicada;
    return Cam;
}

function drawM(Matrix){ // Dibuja matrices
    var tabla = document.createElement('table');
    var fila = document.createElement('tr');
    var primero = document.createElement('td');
    primero.textContent = "M";
    primero.style.backgroundColor = "#4cb5a4";
    primero.style.textAlign = "center";
    primero.style.width = "30px";
    primero.style.height = "30px";
    primero.style.borderColor = "#1F1F1F";
    fila.appendChild(primero);
    
    for(let i = 0; i <vertices.length; i++){
        var p_fila = document.createElement('td');
        p_fila.style.width = "30px";
        p_fila.style.height = "30px";
        p_fila.style.textAlign = "center";
        p_fila.style.backgroundColor = "#4cb5a4";
        p_fila.style.borderColor = "#1F1F1F";
        p_fila.textContent = vertices[i];
        fila.appendChild(p_fila);
    }
    tabla.appendChild(fila);
    for(let j = 0; j < Matrix.length; j++){
        var o_filas = document.createElement('tr');
        var nombre = document.createElement('td');
        nombre.style.width = "30px";
        nombre.style.height = "30px";
        nombre.style.backgroundColor = "#4cb5a4";
        nombre.style.borderColor = "#1F1F1F";
        nombre.style.textAlign = "center";
        nombre.textContent = vertices[j];
        o_filas.appendChild(nombre);
        for(let k = 0; k < Matrix.length; k++){
            var datos = document.createElement('td');
            datos.style.width = "30px";
            datos.style.height = "30px";
            datos.style.textAlign = "center";
            datos.style.borderColor = "#1F1F1F";
            datos.textContent = Matrix[j][k];
            o_filas.appendChild(datos);
        }
        tabla.appendChild(o_filas);
    }
    return tabla;
}

function imprimirAD() // LLAMO AL DRAW Y LO IMPRIMO MEDIANTE EL CONST
{
    const matrizAdy = document.querySelector("#matrizAdy");
    var matriz = MatrizAdyacencia();
    matrizAdy.appendChild(drawM(matriz));
}

function imprimirCamino() // Imprimir la matriz de camino con funcion imprimirAD
{
    var matrizAd = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    var Matriz = MatrizCaminos(matrizAd);
    matrizCamino.appendChild(drawM(Matriz));
}

function imprimirConexo() // Imprimir la matriz conexa con funcion imprimirAD
{
    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    var matriz = MatrizCaminos(mAdyacencia);
    const saberCon = document.querySelector("#saberConexo");
    var conexo = matrizConexa(matriz);
    if (conexo){
        saberCon.textContent = "Su matriz es conexa.";
        saberCon.className = "alert alert-info text-center";
    } else {
        saberCon.textContent = "Su matriz NO es conexa.";
        saberCon.className = "alert alert-info text-center";
    }
}


function ObtenerPeso(columnas, filas) //Conseguir peso de Aristas
{
    for (let i = 0; i < aristas_origen.length; i++){
        if (columnas === aristas_origen[i] && filas === aristas_llegada[i]){
            return peso[i];
        }
    }
}

function Matriz_pesos() // Crear matriz pesos
{
    var MatrizPeso = [];
    var aux = [];
    for (let i = 0; i < vertices.length; i++){
        for (let j = 0; j < vertices.length; j++){
            if (buscar(vertices[i], vertices[j]) === 1 ){
                aux.push(ObtenerPeso(vertices[i], vertices[j]));
            } else {
                aux.push(0);
            }
        }
        MatrizPeso[i] = aux;
        aux = [];
    }
    return MatrizPeso;
}

function caminoMasCorto(Peso, Caminos, A, B){ // Funcion para encontrar camino mas corto
    console.log("Encontrando Camino mas corto . . .");
    let recorrido = Infinity;
    let Valor1 = A;
    let Valor2 = B;
    for (let i = 0; i < vertices.length; i++){
        for (let j = 0; j < vertices.length; j++){
            if (Peso[i][j] !=0){
                if(i === Valor1){
                    if (j === Valor2){
                        if (Caminos[i][j] !=0){
                            if(parseInt(Peso[i][j]) < recorrido){
                                recorrido = parseInt(Peso[i][j]);
                            }   else {
                                if (Caminos[j][i]!=0){
                                    if (parseInt(Peso[j][i])< recorrido){
                                        recorrido = parseInt(Peso[j][i]);
                                    }
                                }
                            }
                        }
                    }   else{
                        for (let k = 0; k < vertices.length; k++){
                            if(k === Valor2){
                                if (Caminos[i][j] !=0){
                                    if (Caminos[j][k] != 0){
                                        if ((parseInt(Peso[i][j]) + parseInt(Peso[j][k])) < recorrido) {
                                            recorrido = (parseInt(Peso[i][j]) + parseInt(Peso[j][k]));
                                        }   else{
                                            if (Caminos [k][j] !=0){
                                                if (Caminos [j][i] !=0){
                                                    if ((parseInt(Peso[k][j]) + parseInt(Peso[j][i])) < recorrido){
                                                        recorrido = (parseInt(Peso[k][j]) + parseInt(Peso[j][i]));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }   else{
                                for (let m = 0; m < vertices.length; m++){
                                    if(m === Valor2){
                                        if(Caminos[i][j] != 0){
                                            if (Caminos[j][k] != 0){
                                                if (Caminos [k][m] != 0){
                                                    if ((parseInt(Peso[i][j]) + parseInt(Peso[j][k]) + parseInt(Peso[k][m])) < recorrido){
                                                        recorrido = (parseInt(Peso[i][j]) + parseInt(Peso[j][k]) + parseInt(Peso[k][m]));
                                                    }   else {
                                                        if (Caminos[m][k] != 0){
                                                            if (Caminos[k][j]!=0){
                                                                if (Caminos [j][i] != 0) {
                                                                    if ((parseInt(Peso[m][k]) + parseInt(Peso[k][j]) + parseInt(Peso[j][i]))< recorrido){
                                                                        recorrido = (parseInt(Peso[m][k]) + parseInt(Peso[k][j]) + parseInt(Peso[j][i]));
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }
    return recorrido;
}


function Corto() { // Llama la funcion de camino mas corto
    var matrizPeso, mCaminos, mAdya, en, sa;
    var caminoCorto;
    const entrada = document.querySelector("#entrada_camino").value;
    const salida = document.querySelector("#salida_camino").value;
    mAdya = MatrizAdyacencia();
    matrizPeso = Matriz_pesos();
    mCaminos = MatrizCaminos(mAdya);
    en = vertices.indexOf(entrada);
    sa = vertices.indexOf(salida);
    

    if (en == -1 || sa == -1) {
        alert("Error \n Ingrese un valor valido en el vertice ingresado");
    } else {
        caminoCorto = caminoMasCorto(matrizPeso, mCaminos, en, sa);
        const output = document.querySelector("#caminoCorto");
        output.textContent = (`La suma de los pesos del camino más corto es de: [${caminoCorto}]`);
        output.className = "alert alert-info text-center mt-3 mx-3";
    }
}

function gradoPar(A) { // Saber si tiene grado par
    var aux = 0;
    for (let i = 0; i < A.length; i++){
        if (A[i]%2 === 0){
            aux++;
        }
    }
    if (aux === A.length){
        return true;
    } else {
        return false;
    }
}

function grado(A) { // Saber grado de la matriz Euleriano
    var gradoV = [];
    var aux = 0;
    for (let i = 0; i < A.length; i++){
        for ( let j = 0; j < A.length; j++) {
            aux += A[i][j];
        }
        gradoV.push(aux);
        aux = 0;
    }
    if (gradoPar(gradoV)){ 
        console.log("Es de grado par.");
        const output = document.querySelector("#esEuleriano");
        output.textContent = (`Es Euleriano, pasa por el camino: [${aristas_llegada}]`);
        output.className = ("alert alert-info text-center mx-3");
        return true;
    } else {
        return false;
    }
}

function esEuleriano(){ // Funcion Euleriano
    const matrizC = document.querySelector("#matrizCam");
    var matrizAd = MatrizAdyacencia();
    var matrizCam = MatrizCaminos(matrizAd);
    if (matrizConexa(matrizAd) === false && grado(matrizC) === true){
        return true;
    } else{
        return false;
    }
}

function imprimirEuleriano() { // Imprime en HTML la funcion euleriano
    var matrizAd = MatrizAdyacencia();
    const matrizC = document.querySelector("#matrizCam");
    var matriz_c = MatrizCaminos(matrizAd);
    const esEule = document.querySelector("#esEule");
    var eule = esEuleriano();
    if (eule) {
        console.log('el grafo que entro es euleriano');
        esEule.textContent = "Grafo es Euleriano";
        esEule.className = "alert alert-info text-center";
    } else {
        console.log('El grafo que entro no es euleriano');
        esEule.textContent = "Grafo no Euleriano";
        esEule.className = "alert alert-info text-center";
    }
}

function gradoHamil(matrizAd) { // Saber grado de la matriz Hamiltoniano
    var gradoV = [],
        aux = 0;
    for (let i = 0; i < matrizAd.length; i++){
        for (let j = 0; j < matrizAd.length; j++){
            aux += matrizAd[i][j];
        }
        gradoV.push(aux);
        aux = 0;
    }
    return gradoV;
}

function esHamil(matrizAd) { // Funcion Hamiltoniano
    console.log("Buscando coincidencia de Hamiltoniano.");
    var aux = gradoHamil(matrizAd);
    for (let i = 0; i < aux.length; i++){
        if (aux[i] > 2){
            return false;
        }
    }
    return true;
}

function esHamiltoniano(){
    console.log("Buscando coincidencia de Euleriano.");
    var matrizAd = MatrizAdyacencia();
    if (esHamil(matrizAd) === true){
        const output = document.querySelector("#esHamilton");
        output.textContent = (`Camino: [${aristas_llegada}]`);
        output.className = ("alert alert-info text-center mx-3");
        return true;
    } else {
        return false;
    }
}

function imprimirHamil(){ // Imprime en HTMl la funcion Hamiltoniano
    var matrizAd = MatrizAdyacencia();
    const matrizC = document.querySelector("#matrizCam");
    var matriz_c = MatrizCaminos(matrizAd);
    const esHamilto = document.querySelector("#esHamilto");
    var hamil = esHamiltoniano();
    if (hamil){
        esHamilto.textContent = "Grafo Hamiltoniano";
        esHamilto.className = "alert alert-info text-center";
    } else {
        esHamilto.textContent = "Grafo No Hamiltoniano";
        esHamilto.className = "alert alert-info text-center";
    }
}

function imprimirMasCorto1() { // Imprime el camino mas corto
    const entrada = document.querySelector("#entradacamino".value);
    entrada = vertices.indexOf(entrada);
    if (entrada == -1) {
        alert("Error. \n Ingresa un valor valido en el vertice ingresado ");
    } else {
        var matrizPeso = Matriz_pesos();
        var caminoMasCorto1 = CaminoMasCorto(matrizPeso, entrada);
        const output = document.querySelector("#caminoCorto");
    }
}

function recorrerVertices(matriz, entrada, salida, raiz){ //Recorre vertices de la matriz
    var visitado = [],
        aux = [];
    for (let i = 0; i < vertices.length; i++){
        visitado[i] = false;
    }
    aux.push(entrada);
    visitado[entrada] = true;
    raiz[entrada] = -1;
    while (aux.length != 0) {
        var aux = aux.shift();
        for (let i = 0; i < vertices.length; i++){
            if (visitado[i] == false && matriz[aux][i] > 0){
                aux.push(i);
                raiz[i] = aux;
                visitado[i] = true;
            }
        }
    }
    return (visitado[salida] == true);
}

function calcularFlujo(matriz, entrada, salida){ // Flujo maximo de grafo dirigido
    console.log("Flujo maximo.");
    var matriz_aux = matriz;
    var raiz = new Array(vertices.length);
    var flujoC = 0;
    var aux;

    while(recorrerVertices(matriz_aux, entrada, salida, raiz)){
        var flujoMaximo = Number.MAX_VALUE;
        for (let i = salida; i != entrada; i = raiz[i] ){
            aux = raiz[i];
            flujoMaximo = Math.min(flujoMaximo, matriz_aux[aux][i]);
        }
        for (let i = salida; i != entrada; i = raiz[i]){
            aux = raiz[i];
            matriz_aux[aux][i] -= flujoMaximo;
            matriz_aux[i][aux] += flujoMaximo;
        }
        flujoC += flujoMaximo;
    }
    return flujoC;
}

function ImprimirFlujoMaximo(){
    var en, sa;
    const entrada = document.querySelector("#entrada_flujo").value;
    const salida = document.querySelector("#salida_flujo").value;
    var tipo_grafo = document.querySelector("#tipoGrafo").value;
    if (tipo_grafo === "Dirigido"){
        en = vertices.indexOf(entrada);
        sa = vertices.indexOf(salida);
        if (en == -1 || sa == -1){
            alert("Error \n Ingrese un valor valido en el vertice ingresado.");
        } else {
            var matrizPeso = Matriz_pesos();
            var flujoMaximo = calcularFlujo(matrizPeso, en, sa);
            const output = document.querySelector("#flujoMax");
            console.log("Grafo Dirigido.");
            output.textContent = (`El flujo máximo de la ruta de vertices es de : [${flujoMaximo}]`)
            output.className = "alert alert-info text-center";
        }
    } else {
        const popAlert = document.querySelector("#popAlert");
        console.log("No es un grafo dirigido.");
        popAlert.textContent = "Flujo maximo solo para grafos dirigidos";
        popAlert.className = "alert alert-danger text-center";
    }
}

function Prim(Matriz_Peso){ // Algoritmo de Prim
    var vertice1, vertice2, aux2, aux4, aux5;
    var aux = [];
    var aux3 = [];
    var col = [];
    for(let z = 0; z < vertices.length; z++){
        aux.push(vertices[z]);
    }
    let k = 0;
    let p = 0;
    let aux_mayor = Infinity;
    for (let i = 0; i < vertices.length; i++){
        if (aux3[i] != 0){
            for (let j = 0; j < vertices.length; j++){
                if (k != 0){
                    if (parseInt(Matriz_Peso[k][j]) != 0){
                        if (parseInt(Matriz_Peso[k][j]) < aux_mayor){
                            aux_mayor = parseInt(Matriz_Peso[k][j]);
                            vertice1 = aux[k];
                            vertice2 = aux[j];
                            k = j;
                            p = k;
                            if (j === (vertices.length - 1)){
                                aux_mayor = Infinity;
                                aux2 = aux[k];
                                for (let o = 0; o < vertices.length; o++){
                                    if(aux[o] === aux2){
                                        aux3.push(0);
                                    }   else{
                                        aux3.push(aux[o]);
                                    }
                                }
                            }
                        }   else {
                            if (j === (vertices.length - 1)){
                                aux_mayor = Infinity;
                                aux2 = aux[k];
                                for (let o = 0; o < vertices.length; o++){
                                    if(aux[o] === aux2){
                                        aux3.push(0);
                                    }   else{
                                        aux3.push(aux[o]);
                                    }
                                }
                            }
                        }
                    }   else{
                        if (j === (vertices.length - 1)){
                            aux_mayor = Infinity;
                            aux2 = aux[k];
                            for(let o = 0; o < vertices.length; o++){
                                if(aux[o] === aux2){
                                    aux3.push(0);
                                }   else {
                                    aux3.push(aux[o]);
                                }
                            }
                        }
                    }
                }   else{
                    for (let l = 0; l < vertices.length; l++){
                        if (parseInt(Matriz_Peso[i][l]) != 0){
                            if (parseInt(Matriz_Peso[i][l])<aux_mayor){
                                aux_mayor = parseInt(Matriz_Peso[i][l]);
                                vertice1 = aux[i];
                                vertice2 = aux[l];
                                console.log(vertice1, "----->", vertice2);
                                aux4 = vertice1;
                                aux5 = vertice2;
                                col.push(aux4);
                                col.push("--->");
                                col.push(aux5);
                                col.push("--->");
                                k=l;
                                p=i;
                                if (l === (vertices.length - 1)){
                                    aux_mayor = Infinity;
                                    aux2 = aux[k];
                                    for (let o = 0; o < vertices.length; o++){
                                        if (aux[o] === aux2){
                                            aux3.push(0);
                                        }   else {
                                            aux3.push(aux[o]);
                                        }
                                    }
                                }
                            }   else {
                                if (l === (vertices.length - 1)){
                                    aux_mayor = Infinity;
                                    aux2 = aux[k];
                                    for (let o = 0; o < vertices.length; o++){
                                        if (aux[o] === aux2){
                                            aux3.push(0);
                                        }   else {
                                            aux3.push(aux[o]);
                                        }
                                    }
                                }
                            }
                        }   else {
                            if (l === (vertices.length - 1)){
                                aux_mayor = Infinity;
                                aux2 = aux[k];
                                for (let o = 0; o < vertices.length; o++){
                                    if (aux[o] === aux2){
                                        aux3.push(0);
                                    }   else {
                                        aux3.push(aux[o]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log(vertice1, "---->", vertice2);
            aux4 = vertice1;
            aux5 = vertice2;
            col.push(aux4);
            col.push("--->");
            col.push(aux5);
            col.push("--->");
        }
    }
    return col;
}

function imprimirPrim() {
    var tipo_grafo = document.querySelector("#tipoGrafo").value;
    const matrizAdy = document.querySelector("#matrizAdy");
    var mAdyacencia = MatrizAdyacencia();
    const matrizCamino = document.querySelector("#matrizCam");
    var matriz_c = MatrizCaminos(mAdyacencia);
    const saberCon = document.querySelector("#saberConexo");
    const output = document.querySelector("#algoritmoPrim");
    var conexo = matrizConexa(matriz_c);
    if (tipo_grafo !== "Dirigido" && conexo == true){
        console.log("Es conexo no Dirigido. ");
        var matrizPeso = Matriz_pesos();
        var esPrim = Prim(matrizPeso);
        console.log("Termino Algoritmo de Prim.");
        output.textContent = (`El arbol generado es: [${esPrim}]`);
        output.className = "alert alert-info text- center mt-2";
    }   else {
        console.log("No es conexo o es dirigido");
        const popAlert = document.querySelector("#popAlertprim");
        console.log("Condicion para algoritmo de Prim inválida. ");
        popAlert.textContent = "El arbol generador es solo para grafos no dirigidos y conexos";
        popAlert.className = "alert alert-info text-center";
    }
}







