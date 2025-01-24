let isGameOver = false;
let gameRunning = false;

// Elementos DOM
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const gameCanvas = document.getElementById('game-canvas');
const ctx = gameCanvas.getContext('2d');
const canvas = document.getElementById("gameCanvas");
let backgroundImg = new Image();
backgroundImg.src = 'assets/images/background.png';

let xOffset = 0;

startButton.addEventListener('click', function() {
  if (typeof startGame === 'function') {
    startGame();
  } 
});

let backgroundX = 0;
const backgroundSpeed = 1;

// Carregar a imagem de fundo
const background = new Image();
background.src = './assets/images/background.png'; // Caminho da sua imagem



// Função para desenhar o fundo corretamente
function drawBackground() {
  ctx.drawImage(background, 0, 0, gameCanvas.width, gameCanvas.height);
}


// Adicionando HUD
const hud = document.createElement('div');
hud.id = 'hud';
hud.style.cssText = `
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  font-family: Arial, sans-serif;
  font-size: 20px;
  background: rgba(255, 255, 255, 0.4);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  opacity: 1;
`;
document.getElementById('game-container').appendChild(hud);

// Adicionando tela de Game Over
const gameOverScreen = document.createElement('div');
gameOverScreen.id = 'game-over-screen';
gameOverScreen.style.cssText = `
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 10px;
`;
gameOverScreen.innerHTML = `
  <h1>Game Over</h1>
  <p>Sua pontuação: <span id="final-score">0</span></p>
  <button id="restart-button">Reiniciar</button>
`;

document.getElementById('game-container').appendChild(gameOverScreen);

// Referências ao HUD e Game Over
const scoreDisplay = document.createElement('div');
const highScoreDisplay = document.createElement('div');
hud.appendChild(scoreDisplay);
hud.appendChild(highScoreDisplay);

// Variáveis do jogo
const bird = {
  x: 50,
  y: 200,
  width: 60,
  height: 60,
  gravity: 0.2,
  lift: -5,
  velocity: 0,
  rotate: 0,
  image: new Image(),
};
bird.image.src = './assets/images/flappy.png';

const pipes = [];
const pipeWidth = 50;
const pipeGap = 150;
const pipeSpeed = 1;
let frameCount = 0;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

// Sons
const sounds = {
  jump: new Audio('./assets/sounds/jump.mp3'),
  point: new Audio('./assets/sounds/point.mp3'),
  hit: new Audio('./assets/sounds/hit.mp3'),
};

// Inicia o jogo
function startGame() {
  isGameOver = false;
  gameRunning = true;
  
  startScreen.style.display = 'none';
  gameCanvas.style.display = 'block';
  hud.style.display = 'block';
  gameOverScreen.style.display = 'none';


  console.log('Função startGame chamada');

  score = 0;
  bird.y = 200;
  bird.velocity = 0;
  pipes.length = 0;
  frameCount = 0;

  sounds.jump.currentTime = 0;
  sounds.point.currentTime = 0;
  sounds.hit.currentTime = 0;

  gameLoop();
}

// Atualiza HUD
function updateHUD() {
  scoreDisplay.textContent = `Pontuação: ${score}`;
  highScoreDisplay.textContent = `Recorde: ${highScore}`;
}

// Loop do jogo
function gameLoop() {
  if (!gameRunning) return; // Interrompe o loop se o jogo não estiver rodando
  
  drawBackground();
  
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Atualiza lógica do jogo
function update() {


  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  // Inclinação do pássaro
  if (bird.velocity < 0) {
    bird.rotate = -22; // Inclina para cima quando sobe
  } else if (bird.velocity > 0) {
    bird.rotate = 22; // Inclina para baixo quando cai
  }

  if (bird.y + bird.height > gameCanvas.height || bird.y < 0) {
    endGame();
  }

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;

    if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
      score++;
      pipe.passed = true;
      sounds.point.play();
    }

    if (pipe.x + pipeWidth < 0) {
      pipes.splice(pipes.indexOf(pipe), 1);
    }
  });

  frameCount++;
  if (frameCount % 300 === 0) {
    createPipe();
  }

  updateHUD();
  checkCollision();
}

// Desenha elementos do jogo
function draw() {

  ctx.drawImage(background, backgroundX, 0, gameCanvas.width, gameCanvas.height);
  ctx.drawImage(background, backgroundX + gameCanvas.width, 0, gameCanvas.width, gameCanvas.height);

  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate((bird.rotate * Math.PI) / 180);
  ctx.drawImage(bird.image, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();

  pipes.forEach((pipe) => {
    ctx.fillStyle = 'green';
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
  });

  drawStage();
}

// Pulo do pássaro
function jump() {
  bird.velocity = bird.lift;
  sounds.jump.play();
}

// Escuta o teclado para pular
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    jump();
  }
});

// Função para desenhar o chão
function drawStage() {

}

// Criação de obstáculos
function createPipe() {
  const topHeight = Math.random() * (gameCanvas.height / 2);
  const bottomY = topHeight + pipeGap;

  pipes.push({
    x: gameCanvas.width,
    topHeight: topHeight,
    bottomY: bottomY,
    bottomHeight: gameCanvas.height - bottomY,
    passed: false,
  });
}

// Verifica colisões
function checkCollision() {
  pipes.forEach((pipe) => {
    const birdLeft = bird.x;
    const birdRight = bird.x + bird.width;
    const birdTop = bird.y;
    const birdBottom = bird.y + bird.height;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;
    const pipeTop = pipe.topHeight;
    const pipeBottom = pipe.bottomY;

    if (
      (birdRight > pipeLeft && birdLeft < pipeRight && birdTop < pipeTop) ||
      (birdRight > pipeLeft && birdLeft < pipeRight && birdBottom > pipeBottom)
    ) {
      if (!isGameOver) {
      sounds.hit.play();
      endGame();
      }
    }
  });

  if (bird.y + bird.height >= gameCanvas.height - 100) {
    sounds.hit.play();
    endGame();
  }


  if (bird.y <= 0) {
    sounds.hit.play();
    endGame();
    }
}

// Finaliza o jogo
function endGame() {
  if (isGameOver) return; // Evita que o jogo acabe mais de uma vez
  isGameOver = true;
  gameRunning = false; // Parar o loop do jogo

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }

  document.getElementById('final-score').textContent = score;
  gameOverScreen.style.display = 'flex';
  gameCanvas.style.display = 'none';
}

// Reinicia o jogo ao clicar no botão
document.getElementById('restart-button').addEventListener('click', () => {
  console.log('Botão Reiniciar foi clicado');
  startGame(); // Reiniciar
})