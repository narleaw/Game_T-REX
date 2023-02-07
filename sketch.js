var PLAY = 1;// estados de Jogo - play
var END = 0;// estados de Jogo - end
var gameState = PLAY;// estados de Jogo - inicio

var trex, trex_running, trex_collided;// declaração da variavel TREX
var ground, invisibleGround, groundImage;// declaração da variavel solo (chão)
var cloudsGroup, cloudImage;// declaração da variavel Nuvens

// declaração da variavel obstaculos
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;
var score = 0;//  declaração da variavel placar
var gameOver, restart;// declaração da variavel Gamer Over e Restart
var jumpSound, checkPointSound, dieSound; // declaração da variavel dos sons de jogo

function preload() {
  trex_running = loadAnimation("trex1.png", "trex3.png", "trex4.png");// carregando a Animação do TREX correndo
  trex_collided = loadAnimation("trex_collided.png");// carregando a Animação do TREX collide
  groundImage = loadImage("ground2.png");  // carregando a Imagem do chão
  cloudImage = loadImage("cloud.png");// carregando a Imagem da Nuvem

  // carregando as Imagens dos Obstaculos
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");

  gameOverImg = loadImage("gameOver.png");// carregando a Animação Gamer Over
  restartImg = loadImage("restart.png");// carregando a Animação   Restart

  jumpSound = loadSound("jump.mp3"); // carregando os sons de jogo - Pular
  dieSound = loadSound("die.mp3"); // carregando os sons de jogo - Colide 
  checkPointSound = loadSound("checkPoint.mp3");// carregando os sons de jogo - a cada 100pts

}

function setup() {
  createCanvas(600, 200); // criando o canvas
  trex = createSprite(50, 180, 20, 50);// criando o sprite trex


  trex.addAnimation("running", trex_running);// Chamando a animação o sprite trex correndo
  trex.addAnimation("collided", trex_collided);// Chamando a animação o sprite trex colidindo 
  trex.scale = 0.5;

  ground = createSprite(200, 180, 400, 20); // criando o sprite (chão)
  ground.addImage("ground", groundImage);  // Chamando a animação o sprite chão
  ground.x = ground.width / 2;// repetição para o chão não terminar
  ground.velocityX = -(6 + 3 * score / 100); // velocidade do chão


  gameOver = createSprite(300, 100);// criando o sprite (gamerOver)
  gameOver.addImage(gameOverImg);// Chamando a imagem o sprite GameOver
  gameOver.scale = 0.5;// definindo o tamanho imagem o sprite GameOver
  gameOver.visible = false; //Tornando o GameOver invisivel

  restart = createSprite(300, 140);// criando o sprite (restart)
  restart.addImage(restartImg);// Chamando a imagem o sprite restart
  restart.scale = 0.5;// definindo o tamanho imagem o sprite restart
  restart.visible = false;//Tornando o restart invisivel

  invisibleGround = createSprite(200, 190, 400, 10);// criando o sprite chão invisible
  invisibleGround.visible = false;//Tornando o chão invisivel

  cloudsGroup = new Group(); //criando grupo de Nuvens
  obstaclesGroup = new Group();//criando grupo de obstaculos

  score = 0;//atualizando os pontos para 0

  // area de colisão
  trex.setCollider("circle", 0, 0, 40);
  trex.debug = false;
}

function draw() {
  // cor do fundo
  background(255);

  // pontos exibidos na tela
  text("Score: " + score, 500, 50);

  if (gameState === PLAY) {
    gameOver.visible = false;
    restart.visible = false;


    /*
    Digamos que aumentaremos em 1 toda vez que a pontuação do Trex aumentar em +100.
    Isso significa que a velocidade continuará aumentando conforme a pontuação aumenta, tornando-se mais
    desafiador para o jogador.

    Por exemplo, se o valor da pontuação for 205, dividiremos a pontuação por 100 e o resultado será 2,05.
    Isso será adicionado à velocidade do obstáculo. 
    
    O sinal negativo é atribuído à velocidade porque queremos que os obstáculos se movam 
    da direita para a esquerda na tela.

    Em JavaScript, podemos simplesmente dividir a pontuação por 100 e adicioná-la à velocidade.
    
  */

  // Mover o solo - mais rápido a cada 100 pontos
    ground.velocityX = -(6 + 3 * score / 100);

    // a cada 100 pontos executada o som de check point
    if (score > 0 && score % 100 === 0) {
      checkPointSound.play();
    }

    score = score + Math.round(getFrameRate() / 60);

    //mudar a animação do trex
    trex.changeAnimation("running", trex_running);

    // pular quando a tecla espaço for selecionada
    if (keyDown("space") && trex.y >= 159) {
      trex.velocityY = -12;
      jumpSound.play();
    }

    // adiciona a gravidade ao trex
    trex.velocityY = trex.velocityY + 0.8

    // duplicar a animação do solo pra sempre aparecer na tela
    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }

    // trex colide no solo invisivel 
    trex.collide(invisibleGround);

    // chamando a função grupo de nuvens
    spawnClouds();

    // chamando a função grupo de Obstaculos
    spawnObstacles();

    // Se o Trex tocar nos obstaculos muda o estado de jogo
    if (obstaclesGroup.isTouching(trex)) {
      gameState = END;
      dieSound.play();
    }
    }
    else if (gameState === END) {
      gameOver.visible = true;
      restart.visible = true;

    //definir a velocidade de cada objeto do jogo para 0
    ground.velocityX = 0;
    trex.velocityY = 0;
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    //mudar a animação do trex
    trex.changeAnimation("collided", trex_collided);

    //definir tempo de vida aos objetos do jogo para que nunca sejam destruídos
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    if (mousePressedOver(restart)) {
      reset();
    }
  }


  drawSprites();
}

function spawnClouds() {
  //escreva o código aqui para gerar as nuvens
  if (frameCount % 60 === 0) {
    var cloud = createSprite(600, 120, 40, 10);
    cloud.y = Math.round(random(80, 120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;

    //atribua tempo de vida à variável
    cloud.lifetime = 200;

    //ajustar a profundidade
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;

    //adicione cada nuvem ao grupo
    cloudsGroup.add(cloud);
  }

}

function reset() {
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;

  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();
  score = 0;
}

function spawnObstacles() {
  if (frameCount % 60 === 0) {
    var obstacle = createSprite(600, 165, 10, 40);
    //obstacle.debug = true;
    obstacle.velocityX = -(6 + 3 * score / 100);

    //gerar obstáculos aleatórios
    var rand = Math.round(random(1, 6));
    switch (rand) {
      case 1: obstacle.addImage(obstacle1);
        break;
      case 2: obstacle.addImage(obstacle2);
        break;
      case 3: obstacle.addImage(obstacle3);
        break;
      case 4: obstacle.addImage(obstacle4);
        break;
      case 5: obstacle.addImage(obstacle5);
        break;
      case 6: obstacle.addImage(obstacle6);
        break;
      default: break;
    }

    //atribua dimensão e tempo de vida aos obstáculos           
    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
    //adicione cada obstáculo ao grupo
    obstaclesGroup.add(obstacle);
  }
}

