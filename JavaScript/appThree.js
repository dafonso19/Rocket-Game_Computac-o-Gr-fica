import * as THREE from 'three';
import { FBXLoader } from 'FBXLoader';

//Event Listeners
document.addEventListener("DOMContentLoaded", Start);
//key Listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
let score = 0;

//#region  DIV SCORE
let div = document.createElement('div');
div.id = 'Score';
div.style.position = 'absolute';
div.style.whiteSpace = 'pre-wrap';
div.style.top = '5px';
div.style.fontFamily = "Lucida Console, Courier New, monospace";
div.style.fontWeight = 'bold';
div.style.left = '5px';
div.style.width = '150px';
div.style.color = 'white';
div.style.textShadow = '-1px 1px 0 #000, 1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000';
div.style.padding = '5px';
div.style.textAlign = 'start';
div.style.zIndex = '100';
div.style.display = 'block';
document.body.appendChild(div);
//#endregion

//#region  Classes
class Sphere extends THREE.Mesh {
    constructor({ radius, colorP = "#0000ff" }) {
        super(new THREE.SphereGeometry(radius), new THREE.MeshStandardMaterial({ color: colorP }))
    }
}
class Cone extends THREE.Mesh {
    constructor({ radius, height, colorP = '#ff0000' }) {
        super(new THREE.ConeGeometry(radius, height, 16, 16), new THREE.MeshStandardMaterial({ color: colorP }));
        this.radius = radius;
        this.height = height;
    }
}
class Sun extends THREE.DirectionalLight {
    constructor({ color = "#ffffff", intensity = 1, x, y, z }) {
        super({ colo: color, intensity: intensity })
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

}
class Box extends THREE.Mesh {
    constructor({ width, height, depht, colorP, x = 0, y = 0, z = 0 }) {
        super(new THREE.BoxGeometry(width, height, depht), new THREE.MeshStandardMaterial({ color: colorP }));
        this.height = height;
        this.width = width;
        this.depht = depht;
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

    }

    checkTouching(d) {
        let b1 = this.position.y - this.geometry.parameters.height / 2;
        let t1 = this.position.y + this.geometry.parameters.height / 2;
        let r1 = this.position.x + this.geometry.parameters.width / 2;
        let l1 = this.position.x - this.geometry.parameters.width / 2;
        let f1 = this.position.z - this.geometry.parameters.depth / 2;
        let B1 = this.position.z + this.geometry.parameters.depth / 2;
        let b2 = d.position.y - d.geometry.parameters.height / 2;
        let t2 = d.position.y + d.geometry.parameters.height / 2;
        let r2 = d.position.x + d.geometry.parameters.width / 2;
        let l2 = d.position.x - d.geometry.parameters.width / 2;
        let f2 = d.position.z - d.geometry.parameters.depth / 2;
        let B2 = d.position.z + d.geometry.parameters.depth / 2;
        if (t1 < b2 || r1 < l2 || b1 > t2 || l1 > r2 || f1 > B2 || B1 < f2) {
            return false;
        }
        return true;
    }

}
class Shield extends Box {
    constructor() {
        super({ width: 1, height: 1, depht: 1, colorP: "#00d0ff" });
        this.material.transparent = true;
        this.material.opacity = 0;

        this.collided = false;
        this.speed = 0.2;
        this.shieldMesh = new Sphere({ radius: 0.8, colorP: "#00d0ff", side: THREE.DoubleSide });
        this.shieldMesh.position.x = this.position.x;
        this.shieldMesh.position.y = this.position.y;
        this.shieldMesh.position.z = this.position.z;
        this.sizeHelper = 1;
        this.boolCrescer = true;
    }

    setPosition(new_x, new_y, new_z) {
        this.position.x = new_x;
        this.position.y = new_y;
        this.position.z = new_z;
        this.shieldMesh.position.x = new_x;
        this.shieldMesh.position.y = new_y;
        this.shieldMesh.position.z = new_z;
    }
    complexObject() {
        this.shieldMesh.position.x = this.position.x;
        this.shieldMesh.position.y = this.position.y;
        this.shieldMesh.position.z = this.position.z;

        if (tick % 2 == 0) {
            if (tick % 3 == 0) {
                if (this.boolCrescer) {
                    if (this.sizeHelper >= 1) {
                        this.boolCrescer = false;
                    }
                    if (this.boolCrescer) {
                        this.shieldMesh.scale.set(this.sizeHelper, this.sizeHelper, this.sizeHelper);
                        this.sizeHelper += 0.1;
                    }

                }

                if (!this.boolCrescer) {
                    if (this.sizeHelper <= 0.4) {
                        this.boolCrescer = true;
                    }
                    if (!this.boolCrescer) {
                        this.shieldMesh.scale.set(this.sizeHelper, this.sizeHelper, this.sizeHelper);
                        this.sizeHelper -= 0.1;
                    }
                }
            }
        }

    }
    removeFromScene(scene) {
        scene.remove(this.shieldMesh);
    }
    addToScene(scene) {
        scene.add(this.shieldMesh);
    }
}
class Player extends Box {
    constructor({ vida, escudo, colorP = '#00ff00' }) {
        super(1, 1, 1, colorP);
        this.vida = vida;
        this.escudo = escudo;

        this.material.transparent = true;
        this.material.opacity = 0;
        this.death = false;
    }

    complexObject(objet) {
        objet.position.x = this.position.x;
        objet.position.y = this.position.y;
        objet.position.z = this.position.z;
        if (this.death) {
            objet.scale.multiplyScalar(1.1);

        }


    }

    addShield() {
        this.escudo++;
    }
    takeDamage(damage) {
        if (this.vida <= 0) {
            this.death = true;
        }
        if (this.escudo > 0) {
            this.escudo -= damage;
        }
        else {
            this.vida -= damage;
            if (this.vida <= 0) {
                this.death = true;
            }
        }

    }
    MovimentController() {
        //nao vamos ter movimento vertical
        var directionWithoutNorm = new THREE.Vector3(HorizontalValue(), 0, 0);

        if (jumpPressed && canJump) {
            console.log("JUMP");
            applyGravity = false;
            canJump = false;
            jumping = true;
        }

        var direction = VectorWithNorm(speed, directionWithoutNorm);
        this.MovePlayer(direction);
    }

    MovePlayer(vector) {

        //vamos obrigar o player a estar entre valores no eixo do X
        if (this.position.x < xMaxFloor || this.position.x > -xMaxFloor) {
            this.translateX(vector.x);
        }

        if (jumping) {
            if (this.position.y >= jumpHeight) {
                jumping = false;
                applyGravity = true;
            } else {
                this.translateY(jumpforce);
            }
        }
        //clamping x position
        this.position.x = clamp(this.position.x, -xMaxFloor, xMaxFloor);

    }

}
class Enemie extends Box {
    constructor({ width, height, depht, colorP = '#520707', x = 0, y = 0, z = 0 }) {
        super({ width: width, height: height, depht: depht, colorP: colorP, x: x, y: y, z: z });

        //Objeto Complexo

        //cima
        this.spikeUp = new Cone({ radius: 0.5, height: height, colorP: colorP });
        this.spikeUp.position.x = this.position.x;
        this.spikeUp.position.y = this.position.y + this.height / 2;
        this.spikeUp.position.z = this.position.z;

        //frente
        this.spikeFront = new Cone({ radius: 0.5, height: height, colorP: colorP });
        this.spikeFront.position.x = this.position.x;
        this.spikeFront.position.y = this.position.y;
        this.spikeFront.position.z = this.position.z + this.depht / 2;
        this.spikeFront.rotateX(90);

        //esquerda
        this.spikeLeft = new Cone({ radius: 0.5, height: height, colorP: colorP });
        this.spikeLeft.position.x = this.position.x - this.width / 2;
        this.spikeLeft.position.y = this.position.y;
        this.spikeLeft.position.z = this.position.z;
        this.spikeLeft.rotateZ(45);

        //direita
        this.spikeRight = new Cone({ radius: 0.5, height: height, colorP: colorP });
        this.spikeRight.position.x = this.position.x + this.width / 2;
        this.spikeRight.position.y = this.position.y;
        this.spikeRight.position.z = this.position.z;
        this.spikeRight.rotateZ(-45);



        this.damage = 1;
        this.speed = 0.2;


        this.collided = false;





    }
    complexObject() {
        //spike up
        this.spikeUp.position.x = this.position.x;
        this.spikeUp.position.y = this.position.y + this.height / 2;
        this.spikeUp.position.z = this.position.z;
        //spike front
        this.spikeFront.position.x = this.position.x;
        this.spikeFront.position.y = this.position.y;
        this.spikeFront.position.z = this.position.z + this.depht / 2;
        //Spike Left
        this.spikeLeft.position.x = this.position.x - this.width / 2;
        this.spikeLeft.position.y = this.position.y;
        this.spikeLeft.position.z = this.position.z;
        //Spike Right
        this.spikeRight.position.x = this.position.x + this.width / 2;
        this.spikeRight.position.y = this.position.y;
        this.spikeRight.position.z = this.position.z;


    }
    addToScene(scene) {
        scene.add(this.spikeUp);
        scene.add(this.spikeFront);
        scene.add(this.spikeLeft);
        scene.add(this.spikeRight);

    }
    removeFromScene(scene) {
        scene.remove(this.spikeUp);
        scene.remove(this.spikeFront);
        scene.remove(this.spikeLeft);
        scene.remove(this.spikeRight);

    }
    setPosition(new_x, new_y, new_z) {
        this.position.x = new_x;
        this.position.y = new_y;
        this.position.z = new_z;
    }
}

class NaveEspacial {
    constructor(cena) {
        var geometry = new THREE.CylinderGeometry(0.6, 0.6, 3.2, 32);  // Geometria básica da nave (usamos um cubo para este exemplo)
        var material = new THREE.MeshBasicMaterial({ color: "#3d494a" }); // Material básico com uma cor verde
        this.spaceshipBase = new THREE.Mesh(geometry, material); // Criação do objeto mesh
        this.spaceshipBase.position.x = 10;
        this.spaceshipBase.position.y = 4;
        this.spaceshipBase.position.z = 0;
        this.spaceshipBase.rotateZ(Math.PI / 2);
        this.pontaDaNave = new Cone({ radius: 0.8, height: 1, colorP: "#3d494a" });
        this.pontaDaNave.position.x = this.spaceshipBase.position.x - 2;
        this.pontaDaNave.position.y = this.spaceshipBase.position.y;
        this.pontaDaNave.position.z = this.spaceshipBase.position.z;
        this.pontaDaNave.rotateX(Math.PI / 2);
        this.pontaDaNave.rotateZ(Math.PI / 2);



        var geometryWindow = new THREE.BoxGeometry(1, 1.6, 1);
        var materialWindow = new THREE.MeshBasicMaterial({ color: "#91a2a3" });
        this.spaceshipWindow = new THREE.Mesh(geometryWindow, materialWindow);

        this.spaceshipWindow.position.x = this.spaceshipBase.position.x - 0.2;
        this.spaceshipWindow.position.y = this.spaceshipBase.position.y + 0.7;
        this.spaceshipWindow.position.z = this.spaceshipBase.position.z;
        this.spaceshipWindow.rotateZ(Math.PI / 2);

        var geometryAsa = new THREE.BoxGeometry(3, 0.2, 1);
        var materialAsa = new THREE.MeshBasicMaterial({ color: "#597375" });
        this.AsaDireita = new THREE.Mesh(geometryAsa, materialAsa);

        this.AsaDireita.position.x = this.spaceshipBase.position.x;
        this.AsaDireita.position.y = this.spaceshipBase.position.y + 0.3;
        this.AsaDireita.position.z = this.spaceshipBase.position.z + 1;

        this.AsaEsquerda = new THREE.Mesh(geometryAsa, materialAsa);

        this.AsaEsquerda.position.x = this.spaceshipBase.position.x;
        this.AsaEsquerda.position.y = this.spaceshipBase.position.y + 0.3;
        this.AsaEsquerda.position.z = this.spaceshipBase.position.z - 1;

        cena.add(this.spaceshipBase);
        cena.add(this.pontaDaNave);
        cena.add(this.spaceshipWindow);
        cena.add(this.AsaDireita);
        cena.add(this.AsaEsquerda);

    }


}
//#endregion

//#region SkyBox Code
var texture_dir = new THREE.TextureLoader().load('./SkyBox/right.png');
var texture_lef = new THREE.TextureLoader().load('./SkyBox/left.png');
var texture_up = new THREE.TextureLoader().load('./SkyBox/top.png');
var texture_dwn = new THREE.TextureLoader().load('./SkyBox/bottom.png');
var texture_back = new THREE.TextureLoader().load('./SkyBox/front.png');
var texture_front = new THREE.TextureLoader().load('./SkyBox/back.png');

//aray que vai guardar as texturas
var materialArray = [];

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dir }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lef }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dwn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_back }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_front }));

for (var i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

var skyboxGeo = new THREE.BoxGeometry(100, 100, 100);

var skybox = new THREE.Mesh(skyboxGeo, materialArray);
//#endregion

//#region  Variaveis


//constantes

let isPerpesctive = true;
let ListOfCollindingEnimieMesh = [];
let ListOfShieldMesh = [];

const gravidade = -0.15;


//keyboard Helpers
const KeyboardHelper = { jump: 32, left: 65, right: 68, r: 82, l: 76 };
var jumpPressed = false;
var leftPressed = false;
var rightPressed = false;
var lPressed = false;
var RPressed = false;




//player Variables
let speed = 0.1;
let jumpHeight = 1.4;
let jumpforce = 0.1;
let jumping = false;
let canJump = false;
let applyGravity = true;


let xMaxFloor = 7.5;

let tickSpawnNumber = 100;
let nrObjects = 9;
//#endregion

//Criar uma cena 
var cena = new THREE.Scene();

var nave = new NaveEspacial(cena);
//importer
var importer = new FBXLoader();
let objetoImportado;

importer.load("./Objects/spaceshipByPaulo.fbx", function (objet) {
    objet.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });


    objet.scale.set(0.003, 0.003, 0.003);
    objetoImportado = objet;
    cena.add(objetoImportado);
});

//criação da camara
//parametros: field of view, aspect ratio,plano anterior 0.1,e plano posterior 100
var mainCamara = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
mainCamara.position.z = 7;
mainCamara.position.x = 0;
mainCamara.position.y = 4;

let ortographicCamara = new THREE.OrthographicCamera(-20, 20, 20, -20, -500, 500);

//criar o renderer
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.shadowMap.enabled = true;
resizeRenderer();
renderer.setClearColor(0xaaaaaa);
document.body.appendChild(renderer.domElement);

//adicionar skybox
cena.add(skybox);



//adicionar chão
let floor = new Box({ width: 15, height: 0.5, depht: 15, colorP: 0x000000 });
floor.receiveShadow = true;
floor.material.transparent = true;
floor.material.opacity = 0;
floor.position.y = -2;
cena.add(floor);

var player = new Player({ vida: 3, escudo: 0 });

cena.add(player);


mainCamara.lookAt(new THREE.Vector3(player.position.x, player.position.y, player.position.z));

//REVER CAMARA ORTOGRAFICA
ortographicCamara.position.x = 0;
ortographicCamara.position.y = mainCamara.position.y + 5;
ortographicCamara.position.z = 10;

ortographicCamara.lookAt(new THREE.Vector3(player.position.x, player.position.y, player.position.z));
//ortographicCamara.rotateZ(Math.PI);


player.position.z = 3;

//#region  Luzes

//adicionar o sol a cena
let sol = new Sun({ color: '#ffffff', intensity: 1.3, x: 0, y: 10, z: 0 });
cena.add(sol);
let sol2 = new Sun({ color: '#ffffff', intensity: 1.3, x: 0, y: -10, z: -2 });
cena.add(sol2);
sol2.lookAt(player.position);
function createPlanet() {
    var planet1 = new Sphere({ radius: 3, colorP: "#f097db" });
    planet1.position.x = -12;
    planet1.position.y = 2;
    planet1.position.z = 0;
    cena.add(planet1);
}



let light4D = new THREE.PointLight({ color: "#ffffff", intensity: 0.1 })




light4D.position.x = 0;
light4D.position.y = 2;
light4D.position.z = 0;

light4D.visible = false;



cena.add(light4D);

//#endregion

let tick;
let spawnTick;
function Start() {
    if (isPerpesctive) {
        renderer.render(cena, mainCamara);
    } else {
        renderer.render(cena, ortographicCamara);
    }
    spawnTick = 0;
    tick = 0;
    createPlanet();
    requestAnimationFrame(Update);
}

var rWasPressed = false;
var lWasPressed = false;
//Game Loop
function Update() {
    Death();
    tick++;
    spawnTick++;
    if (tick % 2 == 0) {
        if (tick % 3 == 0) {
            score++;

        }
    }
    if (RPressed && !rWasPressed) {
        rWasPressed = true;
        isPerpesctive = !isPerpesctive;
    }
    if (lPressed && !lWasPressed) {
        lWasPressed = true;
        sol.visible = !sol.visible;
        sol2.visible = !sol2.visible;

        light4D.visible = !light4D.visible;

    }

    if (tick > 300) {
        rWasPressed = false;
        lWasPressed = false;
    }

    atualizarDiv();

    resizeRenderer();


    //handlers
    GravityHandler();
    CollisionsHandler();
    ComplexObjectsHandler();

    //controladores
    player.MovimentController();

    Spawner();
    if (tick % 2 == 0) {
        pushObjectsZ();
    }

    ObjectRemover();

    if (isPerpesctive) {
        renderer.render(cena, mainCamara);

    } else {
        renderer.render(cena, ortographicCamara);
    }

    requestAnimationFrame(Update);
}




//#region  Funções

function atualizarDiv() {
    let divScore = document.getElementById("Score");
    if (!player.death) {
        divScore.textContent = `Score: ${score}\nVidas: ${player.vida}\nEscudos: ${player.escudo}`; // atualiza a div com os novos valores

    } else {
        divScore.textContent = "GAME OVER"
    }
}

function Death() {
    if (player.death) {
        setTimeout(function () {
            window.location.href = "./index.html";

        }, 500);

    }



}

function ObjectRemover() {
    ListOfCollindingEnimieMesh.forEach(element => {
        if (element.position.z < -15) {
            element.removeFromScene(cena);
            cena.remove(element);
        }
    });
}

function pushObjectsZ() {
    ListOfCollindingEnimieMesh.forEach(element => {
        if (element != null && !element.collided) {
            element.translateZ(element.speed);
        }
    });

    ListOfShieldMesh.forEach(element => {
        if (element != null && !element.collided) {
            element.translateZ(element.speed);
        }
    });
}

function ComplexObjectsHandler() {
    if (objetoImportado != null) {
        player.complexObject(objetoImportado);
    }
    ListOfCollindingEnimieMesh.forEach(element => {
        if (element != null) {
            element.complexObject();
        }
    });

    ListOfShieldMesh.forEach(element => {
        if (element != null) {
            element.complexObject();
        }
    });
}

function GravityHandler() {

    if (applyGravity) {
        player.translateY(gravidade);
    }
}

function CollisionsHandler() {
    if (player.checkTouching(floor)) {
        applyGravity = false;
        canJump = true;
    }

    ListOfCollindingEnimieMesh.forEach(element => {
        if (player.checkTouching(element) && !element.collided) {
            element.removeFromScene(cena);
            cena.remove(element);
            element.collided = true;
            player.takeDamage(element.damage);
        }
    });

    ListOfShieldMesh.forEach(element => {
        if (player.checkTouching(element) && !element.collided) {
            cena.remove(element);
            element.removeFromScene(cena);
            element.collided = true;
            player.addShield();
        }
    });

}

function Spawner() {

    if (tick > 300 && tickSpawnNumber > 75) {
        tick = 0;
        tickSpawnNumber--;
        ListOfCollindingEnimieMesh.forEach(element => {
            element.speed += 0.02;
        });
        ListOfShieldMesh.forEach(element => {
            element.speed += 0.02;
        });
    } else if (tick > 300) {
        tick = 0;
        tickSpawnNumber = 30;
        ListOfCollindingEnimieMesh.forEach(element => {
            element.speed += 0.02;
        });
        ListOfShieldMesh.forEach(element => {
            element.speed += 0.02;
        });
    }

    if (spawnTick >= tickSpawnNumber) {

        spawnTick = 0;
        var x_pos = -xMaxFloor;
        var canSpawnShield = true;
        var maxEnemies = 6;
        var counter = 0;

        for (var i = 0; i < nrObjects; i++) {

            var rad = THREE.MathUtils.randInt(0, 100);
            if (rad > 20 && rad <= 95) {
                if (counter < maxEnemies) {
                    var enemie = new Enemie({ width: 1, height: 1, depht: 1, colorP: "#851818", x: x_pos, y: -1.5, z: -15 });
                    cena.add(enemie);
                    enemie.addToScene(cena);
                    ListOfCollindingEnimieMesh.push(enemie);
                    counter++;
                }

            }
            else if (rad >= 95) {
                if (canSpawnShield) {
                    var shield = new Shield();
                    shield.setPosition(x_pos, -1.5, -15);
                    cena.add(shield);
                    shield.addToScene(cena);
                    ListOfShieldMesh.push(shield);
                    canSpawnShield = false;
                } else if (counter < maxEnemies) {
                    var enemie = new Enemie({ width: 1, height: 1, depht: 1, colorP: "#ff0000", x: x_pos, y: -1.5, z: -15 });
                    cena.add(enemie);
                    enemie.addToScene(cena);
                    ListOfCollindingEnimieMesh.push(enemie);
                    counter++;
                }

            }
            x_pos += 1.9;
        }



    }
}


function resizeRenderer() {
    renderer.setSize(window.innerWidth - 15, window.innerHeight - 20);
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

function GetNorma(vector) {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2) + Math.pow(vector.z, 2));
}

function VectorWithNorm(norma, vector) {

    var h = GetNorma(vector) / norma;
    var vetor = vector;
    if (h != 0) {
        vetor = new THREE.Vector3(vector.x / h, vector.y / h, vector.z / h);
    }

    return vetor;
}
//#endregion


//#region Funções Lidar Teclado
function keyUpHandler(event) {

    //vertical
    if (event.keyCode === KeyboardHelper.jump) {
        jumpPressed = false;
    }

    //horizontal
    if (event.keyCode === KeyboardHelper.left) {
        leftPressed = false;
    }

    if (event.keyCode === KeyboardHelper.right) {
        rightPressed = false;
    }

    if (event.keyCode == KeyboardHelper.l) {
        lPressed = false;
    }
    if (event.keyCode == KeyboardHelper.r) {
        RPressed = false;
    }
}

function keyDownHandler(event) {

    if (event.keyCode === KeyboardHelper.jump) {
        jumpPressed = true;
    }

    //horizontal
    if (event.keyCode === KeyboardHelper.left) {
        leftPressed = true;
    }

    if (event.keyCode === KeyboardHelper.right) {
        rightPressed = true;
    }

    if (event.keyCode == KeyboardHelper.l) {
        lPressed = true;
    }
    if (event.keyCode == KeyboardHelper.r) {
        RPressed = true;
    }
}

//horizontal moviment
function HorizontalValue() {
    if ((!leftPressed && !rightPressed) || (leftPressed && rightPressed)) {

        return 0;
    }

    if (rightPressed && !leftPressed) {
        return 1;
    }

    if (!rightPressed && leftPressed) {
        return -1;
    }
}


//#endregion