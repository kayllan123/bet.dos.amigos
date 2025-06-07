const players = ['ariel', 'will', 'gustavo', 'Kayllan', 'markin'];
const teams = [
  'flamengo',
  'fluminense',
  'palmeiras',
  'botafogo',
  'campinense',
  'desportiva gba',
  'barcelona cordeiro',
  'azulao rusario',
  'real madrid',
  'vasco',
  'atletico',
  'uniao'
];

const playerSelect = document.getElementById('player-select');
const placeBetBtn = document.getElementById('place-bet');
const currentBetsList = document.getElementById('current-bets');
const roundWinnerSelect = document.getElementById('round-winner');
const declareWinnerBtn = document.getElementById('declare-winner');
const winnerAnnouncement = document.getElementById('winner-announcement');
const pixInfo = document.getElementById('pix-info');
const playerList = document.getElementById('player-list');
const checkboxContainer = document.getElementById('teams-checkboxes');
const rouletteResult = document.getElementById('roulette-result');
const spinButton = document.getElementById('spin-button');

let currentBets = [];

function renderPlayers() {
  playerList.innerHTML = '';
  players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    playerList.appendChild(li);
  });
}

function populatePlayerSelect() {
  players.forEach(player => {
    const option = document.createElement('option');
    option.value = player;
    option.textContent = player;
    playerSelect.appendChild(option);
  });
}

function getSelectedTeams() {
  const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
  return Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
}

function clearCheckboxes() {
  const checkboxes = checkboxContainer.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
}

function renderCurrentBets() {
  currentBetsList.innerHTML = '';
  if (currentBets.length === 0) {
    currentBetsList.innerHTML = '<li>Nenhuma aposta feita ainda.</li>';
    return;
  }
  currentBets.forEach(bet => {
    const li = document.createElement('li');
    li.textContent = `${bet.player} apostou em: ${bet.teams.join(', ')} (R$4)`;
    currentBetsList.appendChild(li);
  });
}

placeBetBtn.addEventListener('click', () => {
  const player = playerSelect.value;
  const selectedTeams = getSelectedTeams();

  if (!player) {
    alert('Selecione um jogador.');
    return;
  }

  if (currentBets.find(bet => bet.player === player)) {
    alert(`${player} já fez uma aposta nesta rodada.`);
    return;
  }

  if (selectedTeams.length === 0 || selectedTeams.length > 3) {
    alert('Você deve escolher de 1 a 3 times.');
    return;
  }

  currentBets.push({ player, teams: selectedTeams });
  renderCurrentBets();
  clearCheckboxes();
});

// Popula o select de múltipla escolha com os times para os vencedores da rodada
function populateRoundWinnerSelect() {
  roundWinnerSelect.innerHTML = '';
  teams.forEach(team => {
    const option = document.createElement('option');
    option.value = team;
    option.textContent = team;
    roundWinnerSelect.appendChild(option);
  });
}

// Limita seleção a 3 times no select de vencedores
roundWinnerSelect.addEventListener('change', () => {
  const selectedOptions = Array.from(roundWinnerSelect.selectedOptions);
  if (selectedOptions.length > 3) {
    // Desmarca a última seleção para não ultrapassar 3
    selectedOptions[selectedOptions.length - 1].selected = false;
    alert('Você só pode selecionar até 3 times.');
  }
});

declareWinnerBtn.addEventListener('click', () => {
  const selectedOptions = Array.from(roundWinnerSelect.selectedOptions);
  if (selectedOptions.length !== 3) {
    alert('Selecione exatamente 3 times vencedores.');
    return;
  }

  const winningTeams = selectedOptions.map(opt => opt.value);
  const totalPot = currentBets.length * 5;

  // Filtra jogadores que apostaram em pelo menos um dos times vencedores
  const winners = currentBets.filter(bet => 
    bet.teams.some(team => winningTeams.includes(team))
  );

  if (winners.length === 0) {
    winnerAnnouncement.textContent = `Ninguém acertou os vencedores (${winningTeams.join(', ')}). O prêmio acumula!`;
    pixInfo.style.display = 'none';
  } else if (winners.length === 1) {
    winnerAnnouncement.textContent = `🎉 ${winners[0].player} ganhou R$${totalPot} acertando pelo menos um dos times vencedores: ${winningTeams.join(', ')}!`;
    pixInfo.style.display = 'block';
  } else {
    const names = winners.map(w => w.player).join(', ');
    winnerAnnouncement.textContent = `🎉 ${names} acertaram pelo menos um dos times vencedores (${winningTeams.join(', ')}). Dividam os R$${totalPot} entre vocês.`;
    pixInfo.style.display = 'block';
  }

  currentBets = [];
  renderCurrentBets();
  roundWinnerSelect.selectedIndex = -1; // limpa seleção
});

// -------------------------
// 🎯 Roleta de Times (3 sorteios animados)
// -------------------------

const canvas = document.getElementById('roulette-canvas');
const ctx = canvas.getContext('2d');

const colors = ['#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD', '#16A085', '#C0392B', '#2C3E50', '#E67E22'];

// Função que desenha a roleta com rotação
function drawRouletteWithRotation(angle) {
  const radius = canvas.width / 2;
  const arc = (2 * Math.PI) / teams.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);

  teams.forEach((team, i) => {
    const start = i * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.fill();

    ctx.save();
    ctx.rotate(start + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(team, radius - 10, 5);
    ctx.restore();
  });

  ctx.restore();

  // Indicador fixo
  ctx.beginPath();
  ctx.moveTo(radius - 10, 0);
  ctx.lineTo(radius + 10, 0);
  ctx.lineTo(radius, 20);
  ctx.fillStyle = '#000';
  ctx.fill();
}

let rotation = 0;
let spinning = false;

// Função spinRoulette atualizada para 3 sorteios animados diferentes
function spinRoulette() {
  const player = playerSelect.value;
  if (player !== 'Kayllan') {
    alert('Só Kayllan pode girar a roleta.');
    return;
  }

  if (spinning) return;

  spinning = true;

  const spins = 10; // voltas completas por sorteio
  const arc = (2 * Math.PI) / teams.length;
  const selectedIndices = [];
  const selectedTeams = [];

  // Função para sortear um índice que ainda não foi selecionado
  function getUniqueIndex() {
    let idx;
    do {
      idx = Math.floor(Math.random() * teams.length);
    } while (selectedIndices.includes(idx));
    return idx;
  }

  let currentSpin = 0;

  function spinOnce() {
    if (currentSpin >= 3) {
      // Finalizou os 3 sorteios
      spinning = false;
      rouletteResult.textContent = `Times sorteados: ${selectedTeams.join(', ')}`;

      // Atualiza o select com os times sorteados
      Array.from(roundWinnerSelect.options).forEach(opt => {
        opt.selected = selectedTeams.includes(opt.value);
      });

      return;
    }

    const targetIndex = getUniqueIndex();
    selectedIndices.push(targetIndex);

    const targetAngle = (targetIndex * arc) + (arc / 2);
    const finalAngle = (spins * 2 * Math.PI) + targetAngle;
    const duration = 2500; // duração de cada giro em ms
    const start = performance.now();

    function animate(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out
      rotation = ease * finalAngle;

      drawRouletteWithRotation(rotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const selectedTeam = teams[targetIndex];
        selectedTeams.push(selectedTeam);
        currentSpin++;
        // Pequena pausa antes do próximo giro
        setTimeout(spinOnce, 500);
      }
    }

    requestAnimationFrame(animate);
  }

  spinOnce();
}

spinButton.addEventListener('click', spinRoulette);

// Inicialização
renderPlayers();
populatePlayerSelect();
renderCurrentBets();
drawRouletteWithRotation(0);
populateRoundWinnerSelect();
