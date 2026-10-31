// ---------- Entradas ----------
document.querySelectorAll('.hero .nome span').forEach((letra, i) => letra.style.setProperty('--i', i));
document.querySelectorAll('section').forEach((secao) => {
  secao.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--atraso', `${Math.min(i, 6) * 75}ms`);
  });
});

const alvos = document.querySelectorAll('[data-reveal]');
const mostrar = (el) => el.classList.add('visivel');

if ('IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      mostrar(entrada.target);
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  alvos.forEach((el) => observador.observe(el));
} else {
  alvos.forEach(mostrar);
}

// ---------- Carrosséis de telas ----------
const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SETAS = {
  anterior: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M13 3 6 10l7 7"/></svg>',
  proxima: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m7 3 7 7-7 7"/></svg>',
};

function criarBotao(classe, rotulo, conteudo = '') {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = classe;
  botao.setAttribute('aria-label', rotulo);
  botao.innerHTML = conteudo;
  return botao;
}

function montarCarrossel(carrossel) {
  const trilho = carrossel.querySelector('.trilho');
  const telas = [...trilho.children];
  const nome = carrossel.getAttribute('aria-label').toLowerCase();
  const marcadores = document.createElement('div');
  marcadores.className = 'marcadores';
  let atual = 0;
  let quadroPendente = false;

  const marcar = (indice) => {
    atual = indice;
    [...marcadores.children].forEach((marcador, i) => marcador.setAttribute('aria-current', i === indice));
  };

  const ir = (indice, behavior = reduzMovimento ? 'auto' : 'smooth') => {
    const alvo = (indice + telas.length) % telas.length;
    trilho.scrollTo({ left: alvo * trilho.clientWidth, behavior });
    marcar(alvo);
  };

  const anterior = criarBotao('seta seta-anterior', `Tela anterior: ${nome}`, SETAS.anterior);
  const proxima = criarBotao('seta seta-proxima', `Próxima tela: ${nome}`, SETAS.proxima);
  anterior.addEventListener('click', () => ir(atual - 1));
  proxima.addEventListener('click', () => ir(atual + 1));

  telas.forEach((_, i) => {
    const marcador = criarBotao('', `Mostrar tela ${i + 1} de ${telas.length}`);
    marcador.addEventListener('click', () => ir(i));
    marcadores.append(marcador);
  });

  carrossel.append(anterior, proxima, marcadores);
  marcar(0);

  // Quem desliza com o dedo também atualiza os marcadores.
  trilho.addEventListener('scroll', () => {
    if (quadroPendente) return;
    quadroPendente = true;
    requestAnimationFrame(() => {
      quadroPendente = false;
      const indice = Math.round(trilho.scrollLeft / trilho.clientWidth);
      if (indice !== atual) marcar(indice);
    });
  }, { passive: true });

  return { carrossel, realinhar: () => ir(atual, 'auto') };
}

// ---------- Índice de projetos ----------
const linhas = [...document.querySelectorAll('.indice li')];
const previaFixa = document.querySelector('.previa');
const carrosseis = [...document.querySelectorAll('.carrossel')].map(montarCarrossel);
const telaLarga = matchMedia('(min-width: 961px)');

// Na tela larga os carrosséis ficam na coluna fixa; no celular, cada um no seu projeto.
function posicionarCarrosseis() {
  carrosseis.forEach(({ carrossel, realinhar }, i) => {
    if (telaLarga.matches) previaFixa.append(carrossel);
    else linhas[i].prepend(carrossel);
    realinhar();
  });
}

function ativar(indice) {
  linhas.forEach((linha, i) => linha.classList.toggle('ativa', i === indice));
  carrosseis.forEach(({ carrossel }, i) => carrossel.classList.toggle('ativa', i === indice));
}

linhas.forEach((linha, i) => {
  linha.addEventListener('pointerenter', () => ativar(i));
  linha.addEventListener('focusin', () => ativar(i));
});
posicionarCarrosseis();
telaLarga.addEventListener('change', posicionarCarrosseis);
addEventListener('resize', () => carrosseis.forEach(({ realinhar }) => realinhar()));
ativar(0);

// Quem só rola a página também troca a prévia: vale a linha mais perto do meio da tela.
let rolagemPendente = false;

function acompanharRolagem() {
  rolagemPendente = false;
  if (getComputedStyle(previaFixa).display === 'none') return;
  const meio = innerHeight * 0.45;
  let maisPerto = 0;
  let menorDistancia = Infinity;
  linhas.forEach((linha, i) => {
    const caixa = linha.getBoundingClientRect();
    const distancia = Math.abs(caixa.top + caixa.height / 2 - meio);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      maisPerto = i;
    }
  });
  ativar(maisPerto);
}

addEventListener('scroll', () => {
  if (rolagemPendente) return;
  rolagemPendente = true;
  requestAnimationFrame(acompanharRolagem);
}, { passive: true });
