const loadingManager = new THREE.LoadingManager();
var renderer, scene, camera, myCanvas = document.getElementById('myCanvas');

var plane;

var enemies = [];
var num_enemies = 7

var bullets = [];
var num_bullets = 2

var stars = []

var step_size = 0.5
var score = 0;
var health = 0;
var time = 1000;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var shoot = false;

var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();

// scene
scene = new THREE.Scene();

// loading phase
loadingManager.onStart = function ( url, itemsLoaded, itemsTotal ) {};
loadingManager.onLoad = function ( ) {};
loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {};
loadingManager.onError = function ( url ) {};

var loader = new THREE.GLTFLoader();

init();

function init()
{
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    // lights
    var light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);
    var light2 = new THREE.PointLight(0xccffff, 1.5);
    scene.add(light2);

    scene.background = new THREE.Color( 0x000 );
    scene.fog = new THREE.Fog( 0xFFFFFF, 0, 300 );

    loader.load('../assets/models/plane.glb', handle_plane_load);
    for(var i = 0; i< num_enemies; i++)
    {
        loader.load('../assets/models/enemy.glb', handle_enemy_load);
    }    
}

// renderer
renderer = new THREE.WebGLRenderer({
    canvas: myCanvas, 
    antialias: true
});
renderer.setClearColor(0xF0FFFF);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// camera
camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000 );

function createPlaneMaterial() {
    // create a texture loader.
    const textureLoader = new THREE.TextureLoader();
  
    // load a texture
    const texture = textureLoader.load(
      '/assets/textures/plane-texture.png',
    );
  
    // create a "standard" material using
    // the texture we just loaded as a color map
    const material = new THREE.MeshStandardMaterial({
      map: texture,
    });
  
    return material;
}

function handle_plane_load(gltf) {
    // console.log(gltf);
    plane = gltf.scene;
    // console.log(plane.children[0]);
    // plane.children[0].material = new THREE.MeshLambertMaterial();
    plane.children[0].material = createPlaneMaterial();
    scene.add( plane );
    plane.position.z = -30;
    plane.position.y = -20;
    plane.position.x = 0;
    plane.rotation.x = 7.5;
}

var enemy;

function createEnemyMaterial() {
    // create a texture loader.
    const textureLoader = new THREE.TextureLoader();
  
    // load a texture
    const texture = textureLoader.load(
      '/assets/textures/enemy-texture.png',
    );
  
    // create a "standard" material using
    // the texture we just loaded as a color map
    const material = new THREE.MeshStandardMaterial({
      map: texture,
    });
  
    return material;
}

// Collision detection between any 2 objects
function collision_occured(obj1, obj2) {

    if(!obj1 || !obj2)
        return false

    // Object 1 cuboidal edges
    let box1 = new THREE.Box3().setFromObject(obj1);

    let y11 = box1.min.y;
    let y12 = box1.max.y;

    let x11 = box1.min.x;
    let x12 = box1.max.x;

    let z11 = box1.min.z;
    let z12 = box1.max.z;


    // Object 2 cuboidal edges
    let box2 = new THREE.Box3().setFromObject(obj2);

    let y21 = box2.min.y;
    let y22 = box2.max.y;

    let x21 = box2.min.x;
    let x22 = box2.max.x;

    let z21 = box2.min.z;
    let z22 = box2.max.z;

    return (y12 >= y21 && x12 >= x21 && y11 <= y22 && x11 <= x22 && z11 <= z22 && z12 >= z21);
}

function handle_enemy_load(gltf) {
    // console.log(gltf);
    enemy = gltf.scene;
    // console.log(enemy.children[0]);
    enemy.children[0].material = createEnemyMaterial()
    // enemy.children[0].material = new THREE.MeshLambertMaterial();
    scene.add( enemy );
    enemy.position.x = -40 + Math.floor(Math.random() * 81);
    enemy.position.y = -10 + Math.floor(Math.random() * 31);
    enemy.position.z = -35;
    enemy.rotation.x = 7;
    enemies.push(enemy);
}

function handle_move_player() 
{
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
                moveForward = true;
                break;

            case 37: // left
                moveLeft = true;
                break;

            case 40: // down
                moveBackward = true;
                break;

            case 39: // right
                moveRight = true;
                break;
            case 32: // space
                shoot = true
                break;
        }

    };

    var onKeyUp = function ( event ) {

        switch ( event.keyCode ) {
            case 38: // up
                moveForward = false;
                break;

            case 37: // left
                moveLeft = false;
                break;

            case 40: // down
                moveBackward = false;
                break;

            case 39: // right
                moveRight = false;
                break;
            
            case 32: // space
                shoot = false
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
}

function move_player()
{
    if(moveForward && plane.position.y <= 30)
    {
        plane.position.y += step_size;
    }
    if(moveBackward && plane.position.y >= -20)
    {
        plane.position.y -= step_size;
    }
    if(moveRight && plane.position.x <= 30)
    {
        plane.position.x += step_size;
    }
    if(moveLeft && plane.position.x >= -30)
    {
        plane.position.x -= step_size;
    }
}

function move_enemies()
{
    if(enemies.length > 0)
    {
        var num = enemies.length;
        for(var i = 0; i < num; i++)
        {
            if(enemies[i].position.y <= -35)
            {
                enemies[i].position.y = 35 + Math.floor(Math.random() * 31);
            }
            else
            {
                enemies[i].position.y -= 0.2;
            }
        }
    }
}

var bullet_offset = -9;

function handle_bullet_load(gltf)
{
    bullet = gltf.scene;
    bullet.children[0].material = new THREE.MeshLambertMaterial();
    scene.add( bullet );
    
    bullet.position.x = plane.position.x + bullet_offset;
    bullet_offset = -bullet_offset;
    
    bullet.position.y = plane.position.y - 4;
    bullet.position.z = -35;

    bullets.push(bullet);
}

function shoot_bullets()
{
    for(var i = 0; i < num_bullets; i++)
    {
        loader.load('../assets/models/bullet.glb', handle_bullet_load);
    }
}

function move_bullets()
{
    if(bullets.length > 0)
    {
        var remove_index = [];
        var num = bullets.length;
        for(var i = 0; i < num; i++)
        {
            if(bullets[i].position.y >= 45)
            {
                remove_index.push(i);
            }
            else
            {
                bullets[i].position.y += 0.4;
            }
        }
        for(var i = 0; i < remove_index.length; i++)
        {
            bullets.splice(remove_index[i], 1);
        }
    }
}

function create_star(x, y)
{
    loader.load('../assets/models/star.glb', (gltf) => {
        star = gltf.scene;
        star.children[0].material = new THREE.MeshLambertMaterial();
        scene.add( star );
        star.scale.set(0.5, 0.5, 0.5)
        star.position.x = x;
        star.position.y = y;
        star.position.z = plane.position.z;
        stars.push(star); 
    })
}

// update stars
function update_stars()
{
    if(stars.length > 0)
    {
        var remove_index = [];
        var num = stars.length;
        for(var i = 0; i < num; i++)
        {
            if(collision_occured(plane, stars[i]))
            {
                remove_index.push(i);
            }
        }
        for(var i = 0; i < remove_index.length; i++)
        {
            score = score + 50;
            document.getElementById('score').innerHTML = score;
            scene.remove(stars[remove_index[i]])
            stars.splice(remove_index[i], 1);
        }
    }
}


function handle_bullet_enemy_collision()
{
    for(var i = 0; i < num_enemies; i++)
    {
        for(var j = 0; j < num_bullets; j++)
        {
            if(bullets[j] != undefined && enemies[i] != undefined)
            {
                if(collision_occured(bullets[j], enemies[i]))
                {
                    create_star(enemies[i].position.x, enemies[i].position.y)

                    enemies[i].position.y = -60;
                    bullets[j].position.y = 100;
                    
                    health += 1;
                    score += (10 + health + Math.round(time/1000));
                    document.getElementById('score').innerHTML = score;
                    document.getElementById('health').innerHTML = health;
                    
                    console.log(score);
                }
            } 
        }
    }
}

// render loop
render();

var delta = 0;
var prevTime = Date.now();
var dir = 1;
var over;

function get_score()
{
    document.getElementById('score').innerHTML = score;
}

function get_end_score()
{
    var query = window.location.href;
    var score_val= query.split('=')[1];
    document.getElementById("score_val").innerHTML = score_val;
}

function update_time()
{
    if(time == 0)
    {
        window.open("../game_over.html?score=" + score, "_self");
    }
    time -= 1;
    document.getElementById('time').innerHTML = Math.round(time/100);
}

function render() {
    update_time()
    delta += 0.1;

    if (plane) {
        if(plane.rotation.z >= 0.3)
        {
            dir = -1
        }
        else if(plane.rotation.z <= -0.3)
        {
            dir = 1
        }
        plane.rotation.z += (dir * 0.005);
    }

    handle_move_player();
    move_player();
    move_enemies();
    move_bullets();
    update_stars();
    handle_bullet_enemy_collision();
    if(shoot)
    {
        shoot_bullets();
        shoot = false;
    }
    handle_bullet_enemy_collision();
    
    renderer.render(scene, camera);
    

    requestAnimationFrame(render);
}
