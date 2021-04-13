const loadingManager = new THREE.LoadingManager();
var renderer, scene, camera, myCanvas = document.getElementById('myCanvas');

var enemies = [];
var num_enemies = 7

var bullets = [];
var num_bullets = 2

var step_size = 0.5
var score = 0;
var health = 0;
var time = 4000;

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
    var light = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(light);
    var light2 = new THREE.PointLight(0xccffff, 0.5);
    scene.add(light2);

    scene.background = new THREE.Color( 0x000 );
    scene.fog = new THREE.Fog( 0xFFFFFF, 0, 300 );

    loader.load('../assets/plane.glb', handle_plane_load);
    for(var i = 0; i< num_enemies; i++)
    {
        loader.load('../assets/enemy.glb', handle_enemy_load);
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

var plane;

function handle_plane_load(gltf) {
    // console.log(gltf);
    plane = gltf.scene;
    // console.log(plane.children[0]);
    plane.children[0].material = new THREE.MeshLambertMaterial();
    scene.add( plane );
    plane.position.z = -30;
    plane.position.y = -20;
    plane.position.x = 0;
    plane.rotation.x = 7.5;
}

var enemy;

function handle_enemy_load(gltf) {
    // console.log(gltf);
    enemy = gltf.scene;
    // console.log(enemy.children[0]);
    enemy.children[0].material = new THREE.MeshLambertMaterial();
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
    if(moveForward && plane.position.y <= 20)
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
            if(enemies[i].position.y <= -50)
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
    // console.log(gltf);
    bullet = gltf.scene;
    // console.log(bullet.children[0]);
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
        loader.load('../assets/bullet.glb', handle_bullet_load);
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
    // console.log(bullets.length);
}

function handle_bullet_enemy_collision()
{
    for(var i = 0; i < num_enemies; i++)
    {
        for(var j = 0; j < num_bullets; j++)
        {
            if(bullets[j] != undefined && enemies[i] != undefined)
            {
                if(Math.abs(bullets[j].position.x - enemies[i].position.x) <= 2
                && Math.abs(bullets[j].position.y - enemies[i].position.y) <= 2
                && Math.abs(bullets[j].position.z - enemies[i].position.z) <= 2)
                {
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

function update_time()
{
    if(time == 0)
    {
        window.open("../game_over.html", "_self");
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
    handle_bullet_enemy_collision();
    if(shoot)
    {
        shoot_bullets();
        shoot = false;
    }
    
    renderer.render(scene, camera);
    

    requestAnimationFrame(render);
}


// function spawnEnemy(){
// 	const gltfLoader = new THREE.GLTFLoader();
// 	gltfLoader.load('../enemy.glb', (gltf) => 
//     {
// 		let random_side = Math.random()*4;
	
//         var min_x = -30; 
//         var max_x = 30;
//         var max_y = 60;
//         var min_y = 40;
		
// 		var random_x = Math.random() * (+max_x - +min_x) + +min_x;
// 		var random_y = Math.random() * (+max_y - +min_y) + +min_y;
		
// 		let initial_rotation = 5;

// 		const root = gltf.scene;

// 		root.position.set(random_x,random_y, 0);
// 		root.rotation.set(initial_rotation,0, 0);

// 		scene.add(root);
// 	});
		
// }